export interface WallpaperRecord {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  imageUrl: string;
  dateAvailable: string;
  artist: string;
  source: string;
  credit: string;
  collection: string;
  mood: string;
  style: string;
  isPublished: boolean;
}

export const DATE_UNAVAILABLE_COPY = "Date unavailable";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const IMAGE_PATH = /^wallpapers\/[a-z0-9][a-z0-9-]*\.(webp|jpg|jpeg|png)$/;

function cleanText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function isValidWallpaperDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day)
  );
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function resolveWallpaperAssetPath(
  imagePath: string,
  baseUrl: string,
): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${imagePath.replace(/^\/+/, "")}`;
}

function normalizeLocalWallpaper(
  input: unknown,
  index: number,
  baseUrl: string,
): WallpaperRecord | null {
  if (!input || typeof input !== "object") {
    console.warn("[wallpaper] Ignoring malformed local record", { index, input });
    return null;
  }

  const record = input as Record<string, unknown>;
  const requiredText = [
    "title",
    "description",
    "imagePath",
    "dateAvailable",
    "artist",
    "source",
    "credit",
    "collection",
    "mood",
    "style",
  ] as const;

  const missing = requiredText.filter((key) => !cleanText(record[key]));
  if (
    !Number.isInteger(record.id) ||
    Number(record.id) < 1 ||
    missing.length > 0 ||
    typeof record.isPublished !== "boolean"
  ) {
    console.warn("[wallpaper] Ignoring malformed local record", {
      index,
      id: record.id,
      missing,
    });
    return null;
  }

  if (!isValidWallpaperDate(record.dateAvailable)) {
    console.warn("[wallpaper] Ignoring record with invalid date", {
      index,
      id: record.id,
      dateAvailable: record.dateAvailable,
    });
    return null;
  }

  const imagePath = cleanText(record.imagePath)!;
  if (!IMAGE_PATH.test(imagePath)) {
    console.warn("[wallpaper] Ignoring record with unsafe image path", {
      index,
      id: record.id,
      imagePath,
    });
    return null;
  }

  return {
    id: Number(record.id),
    title: cleanText(record.title)!,
    description: cleanText(record.description)!,
    imagePath,
    imageUrl: resolveWallpaperAssetPath(imagePath, baseUrl),
    dateAvailable: record.dateAvailable,
    artist: cleanText(record.artist)!,
    source: cleanText(record.source)!,
    credit: cleanText(record.credit)!,
    collection: cleanText(record.collection)!,
    mood: cleanText(record.mood)!,
    style: cleanText(record.style)!,
    isPublished: record.isPublished,
  };
}

export function createLocalWallpaperFeed(
  input: unknown,
  baseUrl: string,
): WallpaperRecord[] {
  if (!Array.isArray(input)) {
    console.error("[wallpaper] Local feed is not an array", { input });
    return [];
  }

  const ids = new Set<number>();
  return input.flatMap((record, index) => {
    const normalized = normalizeLocalWallpaper(record, index, baseUrl);
    if (!normalized) return [];
    if (ids.has(normalized.id)) {
      console.warn("[wallpaper] Ignoring duplicate local wallpaper ID", {
        id: normalized.id,
      });
      return [];
    }
    ids.add(normalized.id);
    return [normalized];
  });
}

export function compareWallpaperDates(
  a: WallpaperRecord,
  b: WallpaperRecord,
): number {
  return (
    b.dateAvailable.localeCompare(a.dateAvailable) ||
    b.id - a.id
  );
}

export function getAvailableWallpapers(
  wallpapers: WallpaperRecord[],
  date = new Date(),
): WallpaperRecord[] {
  const localDate = getLocalDateKey(date);
  return wallpapers
    .filter(
      (wallpaper) =>
        wallpaper.isPublished && wallpaper.dateAvailable <= localDate,
    )
    .sort(compareWallpaperDates);
}

export function selectWallpaperForDate(
  wallpapers: WallpaperRecord[],
  date = new Date(),
): WallpaperRecord | null {
  return getAvailableWallpapers(wallpapers, date)[0] ?? null;
}

export function formatWallpaperDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  },
): string {
  if (!isValidWallpaperDate(value)) return DATE_UNAVAILABLE_COPY;
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}

export function formatWallpaperMonth(
  value: string | null | undefined,
): string {
  return formatWallpaperDate(value, { month: "long", year: "numeric" });
}