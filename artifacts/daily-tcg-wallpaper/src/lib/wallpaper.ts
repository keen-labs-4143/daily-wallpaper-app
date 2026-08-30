import type { Wallpaper as ApiWallpaper } from "@workspace/api-client-react";

/**
 * Stable client-facing wallpaper record.
 *
 * API records and intentionally local Community records are normalized into
 * this shape before they reach a screen or notification. Optional metadata is
 * represented as null instead of being fabricated, and an invalid image URL
 * becomes null so the existing gradient fallback can render.
 */
export interface WallpaperRecord {
  id: number;
  title: string;
  mood: string;
  style: string;
  imageUrl: string | null;
  releaseDate: string | null;
  description: string | null;
  sourceCredit: string | null;
  sourceName: string | null;
  artistName: string | null;
  origin: "api" | "community";
}

export const DATE_UNAVAILABLE_COPY = "Date unavailable";
export const DESCRIPTION_UNAVAILABLE_COPY = "Description unavailable";
export const SOURCE_UNAVAILABLE_COPY = "Source credit unavailable";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

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

function validImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function logInvalidRecord(context: string, input: unknown, reason: string) {
  console.warn("[wallpaper] Ignoring malformed record", {
    context,
    reason,
    record: input,
  });
}

export function normalizeWallpaperRecord(
  input: unknown,
  context: string,
  origin: WallpaperRecord["origin"] = "api",
): WallpaperRecord | null {
  if (!input || typeof input !== "object") {
    logInvalidRecord(context, input, "record is not an object");
    return null;
  }

  const record = input as Partial<ApiWallpaper> & {
    description?: unknown;
    origin?: unknown;
  };
  if (
    typeof record.id !== "number" ||
    !Number.isInteger(record.id) ||
    record.id < 1 ||
    !cleanText(record.title) ||
    !cleanText(record.mood) ||
    !cleanText(record.style)
  ) {
    logInvalidRecord(context, input, "missing id, title, mood, or style");
    return null;
  }

  const imageUrl = validImageUrl(record.imageUrl);
  if (record.imageUrl != null && imageUrl == null) {
    console.warn("[wallpaper] Invalid image URL; using gradient fallback", {
      context,
      id: record.id,
      url: record.imageUrl,
    });
  }

  let releaseDate: string | null = null;
  if (record.releaseDate != null && record.releaseDate !== "") {
    if (isValidWallpaperDate(record.releaseDate)) {
      releaseDate = record.releaseDate;
    } else {
      console.warn("[wallpaper] Invalid release date; using safe fallback copy", {
        context,
        id: record.id,
        releaseDate: record.releaseDate,
      });
    }
  }

  return {
    id: record.id,
    title: cleanText(record.title)!,
    mood: cleanText(record.mood)!,
    style: cleanText(record.style)!,
    imageUrl,
    releaseDate,
    description: cleanText(record.locationOrDescription ?? record.description),
    sourceCredit: cleanText(record.sourceCredit),
    sourceName: cleanText(record.sourceName),
    artistName: cleanText(record.artistName),
    origin,
  };
}

export function normalizeWallpaperFeed(
  input: unknown,
  context = "GET /api/wallpapers",
): WallpaperRecord[] {
  if (!Array.isArray(input)) {
    console.error("[wallpaper] Feed response was not an array", { context, response: input });
    return [];
  }
  return input.flatMap((record, index) => {
    const normalized = normalizeWallpaperRecord(record, `${context}[${index}]`);
    return normalized ? [normalized] : [];
  });
}

export function formatWallpaperDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" },
): string {
  if (!isValidWallpaperDate(value)) return DATE_UNAVAILABLE_COPY;
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}

export function formatWallpaperMonth(value: string | null | undefined): string {
  return formatWallpaperDate(value, { month: "long", year: "numeric" });
}

export function compareWallpaperDates(a: WallpaperRecord, b: WallpaperRecord): number {
  if (a.releaseDate == null && b.releaseDate == null) return a.id - b.id;
  if (a.releaseDate == null) return 1;
  if (b.releaseDate == null) return -1;
  return b.releaseDate.localeCompare(a.releaseDate) || b.id - a.id;
}

export function toNotificationDescription(wallpaper: WallpaperRecord): string {
  return wallpaper.description ?? DESCRIPTION_UNAVAILABLE_COPY;
}