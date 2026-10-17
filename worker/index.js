self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL("/feed", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        if ("navigate" in existing) existing.navigate(url);
        return;
      }
      return self.clients.openWindow(url);
    }),
  );
});
