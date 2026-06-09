/**
 * Android WallpaperManager integration — stub pending a custom Capacitor plugin.
 *
 * HOW TO IMPLEMENT (native side):
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Create the plugin class in Android:
 *    artifacts/daily-tcg-wallpaper/android/app/src/main/java/com/dailytcgwallpaper/app/
 *    └── SetWallpaperPlugin.java
 *
 *    Key implementation:
 *      - Accept { base64: string, target: "home" | "lock" | "both" }
 *      - Decode base64 → Bitmap
 *      - WallpaperManager wm = WallpaperManager.getInstance(context)
 *      - target "home":  wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM)
 *      - target "lock":  wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK)
 *      - target "both":  call both flags
 *      - SET_WALLPAPER is a normal permission (no runtime dialog needed)
 *
 * 2. Register in MainActivity.java:
 *    add(SetWallpaperPlugin.class)  inside the init() block
 *
 * 3. Add to AndroidManifest.xml:
 *    <uses-permission android:name="android.permission.SET_WALLPAPER" />
 *
 * 4. Set PLUGIN_INSTALLED = true below and implement callPlugin().
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type WallpaperTarget = "home" | "lock" | "both";

// Flip to true once the native plugin is registered in MainActivity.java
const PLUGIN_INSTALLED = false;

export function isSetWallpaperSupported(): boolean {
  return PLUGIN_INSTALLED;
}

/**
 * Set the device wallpaper.
 * Throws until SetWallpaperPlugin is installed — callers should guard with
 * isSetWallpaperSupported() first.
 */
export async function setWallpaper(
  _imageUrl: string,
  _target: WallpaperTarget
): Promise<void> {
  // TODO: Replace with Capacitor.registerPlugin("SetWallpaperPlugin") call
  // once the native plugin is wired up (see instructions above).
  throw new Error("SetWallpaperPlugin is not yet installed.");
}
