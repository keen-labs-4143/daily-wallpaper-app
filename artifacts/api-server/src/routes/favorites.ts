import { Router } from "express";
import { db, favoritesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  AddFavoriteParams,
  RemoveFavoriteParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/favorites", async (req, res) => {
  try {
    const favs = await db.select().from(favoritesTable);
    const ids = favs.map((f) => f.wallpaperId);
    res.json(ids);
  } catch (err) {
    req.log.error({ err }, "Failed to list favorites");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/favorites/:wallpaperId", async (req, res) => {
  try {
    const parsed = AddFavoriteParams.safeParse({ wallpaperId: Number(req.params.wallpaperId) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid wallpaperId" });
      return;
    }
    const wallpaperId = parsed.data.wallpaperId;
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.wallpaperId, wallpaperId));
    if (!existing.length) {
      await db.insert(favoritesTable).values({ wallpaperId });
    }
    res.json({ wallpaperId, favorited: true });
  } catch (err) {
    req.log.error({ err }, "Failed to add favorite");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/favorites/:wallpaperId", async (req, res) => {
  try {
    const parsed = RemoveFavoriteParams.safeParse({ wallpaperId: Number(req.params.wallpaperId) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid wallpaperId" });
      return;
    }
    const wallpaperId = parsed.data.wallpaperId;
    await db.delete(favoritesTable).where(eq(favoritesTable.wallpaperId, wallpaperId));
    res.json({ wallpaperId, favorited: false });
  } catch (err) {
    req.log.error({ err }, "Failed to remove favorite");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
