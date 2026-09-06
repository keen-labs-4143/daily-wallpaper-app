import rawWallpapers from "@/data/wallpapers.json";
import { createLocalWallpaperFeed } from "@/lib/wallpaper";

export const LOCAL_WALLPAPERS = createLocalWallpaperFeed(
  rawWallpapers,
  import.meta.env.BASE_URL,
);