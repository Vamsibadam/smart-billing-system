import {
  precacheAndRoute,
} from "workbox-precaching";


// ============================================================
// PWA PRECACHE
// ============================================================

precacheAndRoute(
  self.__WB_MANIFEST
);


// ============================================================
// PUSH NOTIFICATION
// ============================================================

self.addEventListener(
  "push",
  (event) => {

    if (!event.data) {
      return;
    }

    let payload;

    try {

      payload =
        event.data.json();

    } catch {

      payload = {
        title: "NexBill",
        body: event.data.text(),
        url: "/dashboard",
        data: {},
      };
    }

    const title =
      payload.title ||
      "NexBill";

    const options = {

      body:
        payload.body ||
        "New activity",

      icon: "/mklogo.png",

      badge: "/mklogo.png",

      data: {

        url:
          payload.url ||
          "/dashboard",

        ...(payload.data || {}),

      },

      vibrate: [
        200,
        100,
        200,
      ],

      tag:
        payload.data?.bill_id
          ? `bill-${payload.data.bill_id}`
          : `notification-${Date.now()}`,

      renotify: true,

    };

    event.waitUntil(

      self.registration
        .showNotification(
          title,
          options
        )

    );

  }
);


// ============================================================
// NOTIFICATION CLICK
// ============================================================

self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/dashboard";

    event.waitUntil(

      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(
          (clientList) => {

            for (
              const client
              of clientList
            ) {

              if (
                "focus" in client
              ) {

                client.navigate(
                  url
                );

                return client.focus();
              }
            }

            if (
              clients.openWindow
            ) {

              return clients.openWindow(
                url
              );
            }

          }
        )

    );

  }
);