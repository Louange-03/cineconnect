import webpush from "web-push"

type PushPayload = {
  title: string
  body: string
  url?: string
}

let configured = false

function setupIfNeeded(): boolean {
  if (configured) return true
  const publicKey = (process.env.VAPID_PUBLIC_KEY ?? "").trim()
  const privateKey = (process.env.VAPID_PRIVATE_KEY ?? "").trim()
  if (!publicKey || !privateKey) return false

  const subject = (process.env.VAPID_SUBJECT ?? "mailto:noreply@cineconnect.local").trim()
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  return true
}

export function isPushConfigured(): boolean {
  return setupIfNeeded()
}

export function getPushPublicKey(): string {
  return (process.env.VAPID_PUBLIC_KEY ?? "").trim()
}

export async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<void> {
  if (!setupIfNeeded()) return
  const data = JSON.stringify(payload)
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    data,
    {
      TTL: 60,
      urgency: "high",
    },
  )
}

