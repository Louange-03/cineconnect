import { buildApiUrl } from "./apiUrl"
import { getToken } from "./auth"

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i)
  return output
}

async function getServerPublicKey(token: string): Promise<string | null> {
  try {
    const res = await fetch(buildApiUrl("/api/push/public-key"), {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { publicKey?: string }
    return typeof data.publicKey === "string" && data.publicKey.trim() ? data.publicKey.trim() : null
  } catch {
    return null
  }
}

async function saveSubscription(token: string, sub: PushSubscription) {
  const json = sub.toJSON()
  await fetch(buildApiUrl("/api/push/subscriptions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(json),
  })
}

export async function initPushNotifications(): Promise<void> {
  if (typeof window === "undefined") return
  const token = getToken()
  if (!token) return
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

  const sw = await navigator.serviceWorker.register("/push-sw.js")
  const permission = Notification.permission
  if (permission === "denied") return

  let finalPermission: NotificationPermission = permission
  if (permission === "default") {
    finalPermission = await Notification.requestPermission()
  }
  if (finalPermission !== "granted") return

  const publicKey = await getServerPublicKey(token)
  if (!publicKey) return

  const sub = await sw.pushManager.getSubscription()
  const subscription =
    sub ??
    (await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey) as BufferSource,
    }))
  await saveSubscription(token, subscription)
}

export function bootstrapPushNotifications() {
  if (typeof window === "undefined") return
  void initPushNotifications()
  const retry = () => void initPushNotifications()
  window.addEventListener("auth-changed", retry)
  window.addEventListener("focus", retry)
}

