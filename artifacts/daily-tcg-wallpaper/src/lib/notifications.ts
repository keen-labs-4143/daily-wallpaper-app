import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const NOTIF_ID = 1001;

/**
 * Request permission and schedule a daily 9 AM notification.
 * Returns { granted: false } silently on web — the preference is still
 * persisted so it takes effect when the user opens the Android build.
 */
export async function requestAndScheduleNotification(): Promise<{ granted: boolean }> {
  if (!Capacitor.isNativePlatform()) return { granted: false };

  const { display } = await LocalNotifications.requestPermissions();
  if (display !== "granted") return { granted: false };

  // Clear any existing schedule before re-scheduling
  await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] }).catch(() => {});

  // First trigger: 9 AM today, or 9 AM tomorrow if we're already past that
  const trigger = new Date();
  trigger.setHours(9, 0, 0, 0);
  if (trigger <= new Date()) trigger.setDate(trigger.getDate() + 1);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: NOTIF_ID,
        title: "Daily TCG Wallpaper",
        body: "Today's wallpaper is here.",
        schedule: { at: trigger, every: "day", repeats: true },
        actionTypeId: "",
        extra: null,
      },
    ],
  });

  return { granted: true };
}

/**
 * Cancel the scheduled daily notification.
 * No-op on web.
 */
export async function cancelNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] }).catch(() => {});
}
