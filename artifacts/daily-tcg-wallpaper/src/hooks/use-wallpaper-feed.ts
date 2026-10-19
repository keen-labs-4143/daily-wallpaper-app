import { useSyncExternalStore } from "react";
import { localDateStore } from "@/lib/local-date-store";
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
  useSyncExternalStore(localDateStore.subscribe, localDateStore.getSnapshot);
  return {
    data: getAvailableWallpapers(LOCAL_WALLPAPERS, localDateStore.getEffectiveDate()),
    isLoading: false,
    error: null,
  };
}