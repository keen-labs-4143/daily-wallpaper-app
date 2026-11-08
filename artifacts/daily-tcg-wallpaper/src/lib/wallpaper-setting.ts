export type WallpaperTarget = "home" | "lock" | "both";

export const WALLPAPER_TARGETS: { value: WallpaperTarget; label: string; success: string }[] = [
  { value: "home", label: "Home Screen", success: "Applied to your Home Screen." },
  { value: "lock", label: "Lock Screen", success: "Applied to your Lock Screen." },
  { value: "both", label: "Both Screens", success: "Applied to your Home and Lock Screens." },
];

export interface WallpaperSetResult {
  applied: boolean;
  target: WallpaperTarget;
  wallpaperId: number;
}

export interface NativeWallpaperBridge {
  setWallpaper(options: { assetPath: string; target: WallpaperTarget }): Promise<WallpaperSetResult>;
}

// Shared JS entry point. The native service reads the original bundled asset;
// no thumbnail, canvas resize, base64 conversion, or remote fetch is involved.
export function createWallpaperSetter(
  bridge: NativeWallpaperBridge,
  isSupported: () => boolean,
) {
  return async (assetPath: string, target: WallpaperTarget): Promise<WallpaperSetResult> => {
    if (!isSupported()) {
      throw new Error("Wallpaper setting requires the Android app with the native wallpaper plugin installed.");
    }
    if (!WALLPAPER_TARGETS.some(option => option.value === target)) {
      throw new Error("Choose Home Screen, Lock Screen, or Both Screens.");
    }
    if (!/^wallpapers\/[a-z0-9][a-z0-9-]*\.(webp|jpg|jpeg|png)$/.test(assetPath)) {
      throw new Error("The selected wallpaper does not have a valid bundled image.");
    }
    const result = await bridge.setWallpaper({ assetPath, target });
    if (result.applied !== true || result.target !== target ||
        !Number.isInteger(result.wallpaperId) || result.wallpaperId <= 0) {
      throw new Error("Android did not confirm that the wallpaper was applied.");
    }
    return result;
  };
}
