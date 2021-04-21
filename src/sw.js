self.addEventListener('push', function(event) {
  const body = event.data.text();

  event.waitUntil(
    self.registration.showNotification("It's Bin Night!", {
      requireInteraction: true,
      body,
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    if (clients.openWindow) {
      return clients.openWindow(self.location.host)
        .catch(err => console.log("open error!", err))
    };
  }));
});
