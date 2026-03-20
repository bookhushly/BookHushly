// Push notification service worker handlers
// Imported by the generated service worker via workboxOptions.importScripts

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "BookHushly", body: event.data.text() };
  }

  const { title = "BookHushly", body = "", url = "/", tag, icon, badge } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  icon  || "/logo.png",
      badge: badge || "/logo.png",
      tag:   tag   || "bh-notification",
      data:  { url },
      requireInteraction: false,
      vibrate: [200, 100, 200],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing tab on the same origin if possible
        const match = clientList.find(
          (c) => c.url.startsWith(self.location.origin) && "focus" in c,
        );
        if (match) {
          match.focus();
          return match.navigate(url);
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
