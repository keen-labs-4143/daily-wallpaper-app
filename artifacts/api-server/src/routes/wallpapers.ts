import { Router } from "express";
import { db, wallpapersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetWallpaperParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/wallpapers", async (req, res) => {
  try {
    const wallpapers = await db.select().from(wallpapersTable).orderBy(wallpapersTable.id);
    const mapped = wallpapers.map((w) => ({
      id: w.id,
      title: w.title,
      mood: w.mood,
      style: w.style,
      imageUrl: w.imageUrl,
      isPremium: w.isPremium,
      releaseDate: w.releaseDate,
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Failed to list wallpapers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallpapers/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const wallpapers = await db.select().from(wallpapersTable).orderBy(wallpapersTable.id);
    if (!wallpapers.length) {
      res.status(404).json({ error: "No wallpapers found" });
      return;
    }
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const picked = wallpapers[dayOfYear % wallpapers.length];
    res.json({
      id: picked.id,
      title: picked.title,
      mood: picked.mood,
      style: picked.style,
      imageUrl: picked.imageUrl,
      isPremium: picked.isPremium,
      releaseDate: today,
    });
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
    res.json({
      id: wallpaper.id,
      title: wallpaper.title,
      mood: wallpaper.mood,
      style: wallpaper.style,
      imageUrl: wallpaper.imageUrl,
      isPremium: wallpaper.isPremium,
      releaseDate: wallpaper.releaseDate,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get wallpaper");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
