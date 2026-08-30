import { useEffect, useMemo } from "react";
import {
  getListWallpapersQueryKey,
  useListWallpapers,
} from "@workspace/api-client-react";
import {
  normalizeWallpaperFeed,
  type WallpaperRecord,
} from "@/lib/wallpaper";

export function useWallpaperFeed(): {
  data: WallpaperRecord[];
  isLoading: boolean;
  error: unknown;
} {
  const query = useListWallpapers({
    query: { queryKey: getListWallpapersQueryKey() },
  });
  const wallpapers = useMemo(
    () => query.data ? normalizeWallpaperFeed(query.data, "GET /api/wallpapers") : [],
    [query.data],
  );

  useEffect(() => {
    if (query.error) {
      console.error("[wallpaper] Feed request failed", {
        request: "GET /api/wallpapers",
        error: query.error,
      });
    }
  }, [query.error]);

  return {
    data: wallpapers,
    isLoading: query.isLoading,
    error: query.error,
  };
}