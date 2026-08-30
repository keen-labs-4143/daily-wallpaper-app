import { Router } from "express";
import { db, wallpapersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetWallpaperParams,
  GetTodayWallpaperResponse,
  GetWallpaperResponse,
  ListWallpapersResponse,
} from "@workspace/api-zod";

const router = Router();

/**
 * API wallpaper contract: every response is a wallpaper record with stable
 * identity, display metadata, an ISO calendar date (or null when
 * source data is malformed), and optional description/credit fields.
 * Runtime parsing keeps bad database rows from silently becoming UI metadata.
 */
function mapWallpaper(w: typeof wallpapersTable.$inferSelect) {
  return {
    id: w.id,
    title: w.title,
    mood: w.mood,
    style: w.style,
    imageUrl: w.imageUrl,
    releaseDate: isValidDate(w.releaseDate) ? w.releaseDate : null,
    locationOrDescription: w.locationOrDescription ?? undefined,
    sourceCredit: w.sourceCredit ?? undefined,
    sourceName: w.sourceName ?? undefined,
    artistName: w.artistName ?? undefined,
  };
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

router.get("/wallpapers", async (req, res) => {
  try {
    const wallpapers = await db.select().from(wallpapersTable).orderBy(wallpapersTable.id);
    const mapped = wallpapers.map(mapWallpaper);
    const parsed = ListWallpapersResponse.safeParse(mapped);
    if (!parsed.success) {
      req.log.error({ issues: parsed.error.issues }, "Wallpaper feed violated response contract");
      res.status(500).json({ error: "Wallpaper feed is unavailable" });
      return;
    }
    // Send the original ISO date string; the generated response validator
    // coerces date-formatted strings to Date objects while parsing.
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list wallpapers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallpapers/today", async (req, res) => {
  try {
    const wallpapers = await db.select().from(wallpapersTable).orderBy(wallpapersTable.id);
    if (!wallpapers.length) {
      res.status(404).json({ error: "No wallpapers found" });
      return;
    }
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const picked = wallpapers[dayOfYear % wallpapers.length];
    const mapped = mapWallpaper(picked);
    const response = GetTodayWallpaperResponse.safeParse(mapped);
    if (!response.success) {
      req.log.error({ id: picked.id, issues: response.error.issues }, "Today wallpaper violated response contract");
      res.status(500).json({ error: "Today's wallpaper is unavailable" });
      return;
    }
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to get today wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallpapers/:id", async (req, res) => {
  try {
    const parsed = GetWallpaperParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [wallpaper] = await db
      .select()
      .from(wallpapersTable)
      .where(eq(wallpapersTable.id, parsed.data.id));
    if (!wallpaper) {
      res.status(404).json({ error: "Wallpaper not found" });
      return;
    }
    const mapped = mapWallpaper(wallpaper);
    const response = GetWallpaperResponse.safeParse(mapped);
    if (!response.success) {
      req.log.error({ id: wallpaper.id, issues: response.error.issues }, "Wallpaper violated response contract");
      res.status(500).json({ error: "Wallpaper is unavailable" });
      return;
    }
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to get wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
