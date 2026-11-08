import { Capacitor, registerPlugin } from "@capacitor/core";
import { createWallpaperSetter, type NativeWallpaperBridge } from "./wallpaper-setting";

export type { WallpaperTarget } from "./wallpaper-setting";

const NativeWallpaper = registerPlugin<NativeWallpaperBridge>("NativeWallpaper");

export function isSetWallpaperSupported(): boolean {
  return Capacitor.getPlatform() === "android" &&
    Capacitor.isPluginAvailable("NativeWallpaper");
}

export const setWallpaper = createWallpaperSetter(NativeWallpaper, isSetWallpaperSupported);
