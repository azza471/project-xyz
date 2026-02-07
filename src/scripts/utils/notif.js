import CONFIG from "../config.js";
import { getToken } from "../auth.js";

export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function initNotifToggle() {
  const toggle = document.getElementById("notifToggle");
  if (!toggle) return;

  const registration = await navigator.serviceWorker.ready;
  const token = getToken();
  const subscription = await registration.pushManager.getSubscription();
  toggle.checked = !!subscription;

  toggle.onchange = async () => {
    if (toggle.checked) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toggle.checked = false;
        return;
      }

      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
      });

      const res = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: newSub.endpoint,
          keys: newSub.toJSON().keys,
        }),
      });

      const data = await res.json();
      if (data.error) await newSub.unsubscribe();
      toggle.checked = !data.error;
    } else {
      const currentSub = await registration.pushManager.getSubscription();
      if (!currentSub) return;

      const res = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: currentSub.endpoint }),
      });

      const data = await res.json();
      if (!data.error) await currentSub.unsubscribe();
      toggle.checked = data.error;
    }
  };
}
