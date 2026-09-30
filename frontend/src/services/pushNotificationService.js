import api from "../api/axios";


// ============================================================
// BASE64URL → UINT8ARRAY
// ============================================================

function urlBase64ToUint8Array(base64String) {

  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (
      base64String + padding
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
// REGISTER / SYNC PUSH SUBSCRIPTION
// ============================================================

export const registerPushNotifications = async (
  requestPermission = false
) => {

  try {

    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return {
        success: false,
        reason: "unsupported",
      };
    }


    // --------------------------------------------------------
    // Permission
    // --------------------------------------------------------

    let permission =
      Notification.permission;

    if (
      permission === "default" &&
      requestPermission
    ) {

      permission =
        await Notification.requestPermission();
    }

    if (permission !== "granted") {

      return {
        success: false,
        reason: permission,
      };
    }


    // --------------------------------------------------------
    // Service worker
    // --------------------------------------------------------

    const registration =
      await navigator.serviceWorker.ready;


    // --------------------------------------------------------
    // VAPID public key
    // --------------------------------------------------------

    const response =
      await api.get(
        "/notifications/vapid-public-key/"
      );

    const publicKey =
      response.data.public_key;

    if (!publicKey) {

      console.error(
        "VAPID public key is missing."
      );

      return {
        success: false,
        reason: "missing-vapid-key",
      };
    }


    // --------------------------------------------------------
    // Existing subscription
    // --------------------------------------------------------

    let subscription =
      await registration.pushManager
        .getSubscription();


    // --------------------------------------------------------
    // Create subscription if required
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // ALWAYS sync subscription with Django
    // --------------------------------------------------------

    const result =
      await api.post(
        "/notifications/subscribe/",
        {
          subscription:
            subscription.toJSON(),
        }
      );


    console.log(
      "Push subscription synced:",
      result.data
    );


    return {
      success: true,
      subscription,
    };

  } catch (error) {

    console.error(
      "Push registration failed:",
      error
    );

    return {
      success: false,
      reason: "error",
      error,
    };
  }
};


// ============================================================
// REMOVE PUSH SUBSCRIPTION
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

      console.log(
        "Push subscription removed."
      );

    } catch (error) {

      console.error(
        "Push unsubscribe failed:",
        error
      );
    }
  };