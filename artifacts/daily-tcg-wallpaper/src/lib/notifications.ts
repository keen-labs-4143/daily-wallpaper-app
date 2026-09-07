import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  selectWallpaperForDate,
  type WallpaperRecord,
} from "@/lib/wallpaper";

const TEST_NOTIFICATION_ID = 9001;
const LEGACY_DAILY_BASE_ID = 1001;
const LEGACY_DAILY_COUNT = 14;
const GENERIC_TITLE = "Today's wallpaper is ready";
const GENERIC_BODY = "Open Daily TCG Wallpaper to see today's selection.";

export interface NotificationContent {
  title: string;
  body: string;
  wallpaperId: number | null;
}

function formatBody(wallpaper: WallpaperRecord): string {
  return [wallpaper.description, wallpaper.credit]
    .filter((line) => line.trim())
    .join("\n");
}

export function getCurrentNotificationContent(
  wallpapers: WallpaperRecord[],
  date = new Date(),
): NotificationContent {
  const wallpaper = selectWallpaperForDate(wallpapers, date);
  if (!wallpaper) {
    return {
      title: GENERIC_TITLE,
      body: GENERIC_BODY,
      wallpaperId: null,
    };
  }

  return {
    title: wallpaper.title,
    body: formatBody(wallpaper),
    wallpaperId: wallpaper.id,
  };
}

export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  native: boolean;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { granted: false, native: false };
  }

  const { display } = await LocalNotifications.requestPermissions();
  return { granted: display === "granted", native: true };
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { display } = await LocalNotifications.checkPermissions();
  return display === "granted";
}

export async function scheduleTestNotification(
  wallpapers: WallpaperRecord[],
  delaySeconds = 10,
): Promise<{ scheduled: boolean; content: NotificationContent }> {
  const content = getCurrentNotificationContent(wallpapers);
  if (!Capacitor.isNativePlatform()) {
    return { scheduled: false, content };
  }

  if (!(await hasNotificationPermission())) {
    return { scheduled: false, content };
  }

  await LocalNotifications.cancel({
    notifications: [{ id: TEST_NOTIFICATION_ID }],
  }).catch(() => {});

  const at = new Date(Date.now() + delaySeconds * 1000);
  await LocalNotifications.schedule({
    notifications: [
      {
        id: TEST_NOTIFICATION_ID,
        title: content.title,
        body: content.body,
        schedule: { at, allowWhileIdle: true },
        actionTypeId: "",
        extra: {
          route: "/today",
          wallpaperId: content.wallpaperId,
          isTestNotification: true,
        },
      },
    ],
  });

  return { scheduled: true, content };
}

export async function cancelNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const legacyDailyIds = Array.from(
    { length: LEGACY_DAILY_COUNT },
    (_, index) => ({ id: LEGACY_DAILY_BASE_ID + index }),
  );
  await LocalNotifications.cancel({
    notifications: [{ id: TEST_NOTIFICATION_ID }, ...legacyDailyIds],
  }).catch(() => {});
  await LocalNotifications.removeAllDeliveredNotifications().catch(() => {});
}