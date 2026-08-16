import { registerPlugin, Capacitor } from "@capacitor/core";

// ── Plugin interface ─────────────────────────────────────────────────────────
interface SetWallpaperPluginInterface {
  setWallpaper(options: { url: string; target: "home" | "lock" | "both" }): Promise<void>;
}

/**
 * Capacitor bridge to the native SetWallpaperPlugin.
 * On web, all calls are routed to the WebPlugin fallback which rejects with
 * "SetWallpaper is not implemented on web" — callers should guard with
 * isSetWallpaperSupported() before calling setWallpaper().
 */
const SetWallpaperPlugin = registerPlugin<SetWallpaperPluginInterface>(
  "SetWallpaper"
);

// ── Public API ───────────────────────────────────────────────────────────────

export type WallpaperTarget = "home" | "lock" | "both";

/**
 * Returns true only when running inside the native Android app where
 * SetWallpaperPlugin is available.
 */
export function isSetWallpaperSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/**
 * Set the device wallpaper via the native Android WallpaperManager.
 *
 * @param imageUrl  Fully-qualified HTTPS URL of the wallpaper image.
 * @param target    "home" | "lock" | "both"
 * @throws          If called on web or if the native plugin returns an error.
 */
export async function setWallpaper(
  imageUrl: string,
  target: WallpaperTarget
): Promise<void> {
  await SetWallpaperPlugin.setWallpaper({ url: imageUrl, target });
}
