import { COMMUNITY_WALLPAPERS, type CommunityItem } from "@/data/community-wallpapers";
import { normalizeWallpaperRecord, type WallpaperRecord } from "@/lib/wallpaper";

/**
 * Community wallpapers are intentionally bundled local records, not a second
 * API feed. They still pass through the same record normalizer as API data.
 */
export function toCommunityWallpaper(item: CommunityItem): WallpaperRecord {
  return normalizeWallpaperRecord(
    {
      ...item,
      locationOrDescription: item.locationOrDescription ?? `Community wallpaper by ${item.author}`,
      sourceCredit: item.sourceCredit ?? `by ${item.author}`,
      sourceName: item.sourceName ?? "Community",
      artistName: item.artistName ?? item.author,
      releaseDate: item.releaseDate ?? null,
    },
    `local Community/${item.id}`,
    "community",
  )!;
}

export const LOCAL_COMMUNITY_WALLPAPERS = COMMUNITY_WALLPAPERS.map(toCommunityWallpaper);