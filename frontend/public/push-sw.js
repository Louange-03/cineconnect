self.addEventListener("push", (event) => {
  if (!event.data) return
  let payload = { title: "Nouveau message", body: "", url: "/discussion" }
  try {
    payload = { ...payload, ...(event.data.json() || {}) }
  } catch {
    // ignore malformed payload
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Nouveau message", {
      body: payload.body || "",
      icon: "/cineconnect-logo.svg",
      badge: "/cineconnect-logo.svg",
      data: { url: payload.url || "/discussion" },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = event.notification?.data?.url || "/discussion"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.postMessage({ type: "OPEN_URL", url: targetUrl })
          return client.focus()
        }
      }
      return self.clients.openWindow(targetUrl)
    }),
  )
})

