import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wallpapersTable = pgTable("wallpapers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  mood: text("mood").notNull(),
  style: text("style").notNull(),
  imageUrl: text("image_url").notNull(),
  releaseDate: text("release_date").notNull(),
  locationOrDescription: text("location_or_description"),
  sourceCredit: text("source_credit"),
  sourceName: text("source_name"),
  artistName: text("artist_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWallpaperSchema = createInsertSchema(wallpapersTable).omit({ id: true, createdAt: true });
export type InsertWallpaper = z.infer<typeof insertWallpaperSchema>;
export type Wallpaper = typeof wallpapersTable.$inferSelect;
