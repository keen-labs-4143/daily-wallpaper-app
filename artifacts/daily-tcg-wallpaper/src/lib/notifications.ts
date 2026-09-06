import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  selectWallpaperForDate,
  type WallpaperRecord,
} from "@/lib/wallpaper";

const NOTIF_BASE_ID = 1001;
const DAYS_AHEAD = 14;

function formatBody(wallpaper: WallpaperRecord): string {
  const lines = [wallpaper.description, wallpaper.credit].filter(
    (line): line is string => Boolean(line && line.trim())
  );
  return lines.length ? lines.join("\n") : "Today's wallpaper is here.";
}

function allNotificationIds(): { id: number }[] {
  return Array.from({ length: DAYS_AHEAD }, (_, i) => ({ id: NOTIF_BASE_ID + i }));
}

/**
 * Request permission and schedule daily 9 AM notifications for the next
 * `DAYS_AHEAD` days, each with that day's actual wallpaper title/description/
 * credit. Tapping a notification opens Today's Wallpaper.
 * Returns { granted: false } silently on web — the preference is still
 * persisted so it takes effect when the user opens the Android build.
 */
export async function requestAndScheduleNotification(
  wallpapers: WallpaperRecord[]
): Promise<{ granted: boolean }> {
  if (!Capacitor.isNativePlatform()) return { granted: false };

  const { display } = await LocalNotifications.requestPermissions();
  if (display !== "granted") return { granted: false };

  // Clear any existing schedule before re-scheduling
  await LocalNotifications.cancel({ notifications: allNotificationIds() }).catch(() => {});

  if (!wallpapers.length) {
    console.warn("[wallpaper] Notification schedule skipped because the local feed is empty");
    return { granted: true };
  }

  const notifications = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + i);
    trigger.setHours(9, 0, 0, 0);
    if (trigger <= new Date()) continue;

    const wallpaper = selectWallpaperForDate(wallpapers, trigger);
    if (!wallpaper) continue;
    notifications.push({
      id: NOTIF_BASE_ID + i,
      title: wallpaper.title,
      body: formatBody(wallpaper),
      schedule: { at: trigger },
      actionTypeId: "",
      extra: { route: "/today" },
    });
  }

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }

  return { granted: true };
}

/**
 * Cancel all scheduled daily notifications.
 * No-op on web.
 */
export async function cancelNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: allNotificationIds() }).catch(() => {});
}
