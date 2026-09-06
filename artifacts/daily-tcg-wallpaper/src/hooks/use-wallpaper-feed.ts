import { LOCAL_WALLPAPERS } from "@/data/local-wallpapers";
import {
  getAvailableWallpapers,
  type WallpaperRecord,
} from "@/lib/wallpaper";

export function useWallpaperFeed(): {
  data: WallpaperRecord[];
  isLoading: boolean;
  error: unknown;
} {
  return {
    data: getAvailableWallpapers(LOCAL_WALLPAPERS),
    isLoading: false,
    error: null,
  };
}