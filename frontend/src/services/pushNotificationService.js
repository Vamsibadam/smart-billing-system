import api from "../api/axios";


// ============================================================
// CONVERT VAPID KEY
// ============================================================

function urlBase64ToUint8Array(base64String) {

  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) => char.charCodeAt(0)
    )
  );
}


// ============================================================
// REGISTER PUSH NOTIFICATIONS
// ============================================================

export const registerPushNotifications =
  async () => {

    try {

      if (
        !("serviceWorker" in navigator)
      ) {
        console.log(
          "Service workers are not supported."
        );

        return;
      }

      if (
        !("PushManager" in window)
      ) {
        console.log(
          "Push notifications are not supported."
        );

        return;
      }

      // ------------------------------------------------------
      // Notification permission
      // ------------------------------------------------------

      let permission =
        Notification.permission;

      if (permission === "default") {

        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {

        console.log(
          "Notification permission denied."
        );

        return;
      }

      // ------------------------------------------------------
      // Existing PWA service worker
      // ------------------------------------------------------

      const registration =
        await navigator.serviceWorker.ready;

      // ------------------------------------------------------
      // Get VAPID public key
      // ------------------------------------------------------

      const response =
        await api.get(
          "/notifications/vapid-public-key/"
        );

      const publicKey =
        response.data.public_key;

      if (!publicKey) {

        console.error(
          "VAPID public key missing."
        );

        return;
      }

      // ------------------------------------------------------
      // Existing subscription
      // ------------------------------------------------------

      let subscription =
        await registration.pushManager.getSubscription();

      // ------------------------------------------------------
      // Create subscription
      // ------------------------------------------------------

      if (!subscription) {

        subscription =
          await registration.pushManager.subscribe({

            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToUint8Array(
                publicKey
              ),

          });
      }

      // ------------------------------------------------------
      // Send subscription to Django
      // ------------------------------------------------------

      await api.post(
        "/notifications/subscribe/",
        {
          subscription:
            subscription.toJSON(),
        }
      );

      console.log(
        "Push notifications registered."
      );

    } catch (error) {

      console.error(
        "Push registration failed:",
        error
      );
    }
  };


// ============================================================
// UNSUBSCRIBE
// ============================================================

export const unregisterPushNotifications =
  async () => {

    try {

      const registration =
        await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager
          .getSubscription();

      if (!subscription) {
        return;
      }

      await api.delete(
        "/notifications/subscribe/",
        {
          data: {
            endpoint:
              subscription.endpoint,
          },
        }
      );

      await subscription.unsubscribe();

    } catch (error) {

      console.error(
        "Push unsubscribe failed:",
        error
      );
    }
  };