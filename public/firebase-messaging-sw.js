// file: public/firebase-messaging-sw.js

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  var notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = { 
        notification: { 
          title: 'New Order Received! 🎉', 
          body: event.data.text() || 'A new booking has been placed.' 
        } 
      };
    }
  }

  var title = notificationData.notification ? notificationData.notification.title : 'New Order Received! 🎉';
  var body = notificationData.notification ? notificationData.notification.body : 'A new booking has been placed.';
  
  var options = {
    body: body,
    // Removed the icon and badge lines since you don't have a favicon.ico
    tag: 'new-order',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin/orders');
      }
    })
  );
});
