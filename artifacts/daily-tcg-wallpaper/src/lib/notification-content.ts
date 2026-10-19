import { selectWallpaperForDate, type WallpaperRecord } from "./wallpaper.ts";
import { localDateStore } from "./local-date-store.ts";

export interface NotificationContent {
  title: string;
  body: string;
  wallpaperId: number | null;
}

// Used by both native delivery and diagnostics; there is no mock builder.
export function getCurrentNotificationContent(
  wallpapers: WallpaperRecord[],
  date = localDateStore.getEffectiveDate(),
): NotificationContent {
  const wallpaper = selectWallpaperForDate(wallpapers, date);
  if (!wallpaper) {
    return {
      title: "Today's wallpaper is ready",
      body: "Open Daily TCG Wallpaper to see today's selection.",
      wallpaperId: null,
    };
  }
  return {
    title: wallpaper.title,
    body: [wallpaper.description, wallpaper.credit]
      .filter((line) => line.trim())
      .join("\n"),
    wallpaperId: wallpaper.id,
  };
}
