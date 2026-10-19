import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLocalWallpaperFeed,
  formatWallpaperDate,
  getAvailableWallpapers,
  getLocalDateKey,
  selectWallpaperForDate,
} from "../src/lib/wallpaper.ts";

const record = (id, dateAvailable, extra = {}) => ({
  id, dateAvailable, isPublished: true, title: `Wallpaper ${id}`,
  description: "Caption", imagePath: "wallpapers/test.webp",
  imageUrl: "/wallpapers/test.webp", artist: "Studio", source: "Local",
  credit: "Studio credit", collection: "Test", mood: "Calm", style: "Art",
  ...extra,
});
const localDate = (day) => new Date(2026, 8, day, 12);

test("exact date wins; missing exact date retains newest earlier wallpaper", () => {
  const feed = [record(1, "2026-09-01"), record(2, "2026-09-03")];
  assert.equal(selectWallpaperForDate(feed, localDate(3))?.id, 2);
  assert.equal(selectWallpaperForDate(feed, localDate(2))?.id, 1);
  assert.equal(selectWallpaperForDate(feed, localDate(30))?.id, 2);
});

test("future and unpublished records never appear in released collections", () => {
  const feed = [
    record(1, "2026-09-01"),
    record(2, "2026-09-04"),
    record(3, "2026-09-02", { isPublished: false }),
    record(4, "2026-09-02", { isPublished: "true" }),
  ];
  assert.deepEqual(getAvailableWallpapers(feed, localDate(3)).map(w => w.id), [1]);
  assert.equal(selectWallpaperForDate(feed, localDate(0)), null);
  assert.equal(selectWallpaperForDate([], localDate(3)), null);
});

test("invalid, impossible, and missing dates are excluded and format safely", () => {
  const invalid = [undefined, null, "", "invalid", "2026-02-30", "2026-9-01"];
  for (const value of invalid) {
    assert.equal(selectWallpaperForDate([record(1, value)], localDate(3)), null);
    assert.equal(formatWallpaperDate(value), "Date unavailable");
  }
  assert.deepEqual(createLocalWallpaperFeed([record(1, undefined)], "/"), []);
});

test("same-date ties always use higher ID regardless of input order", () => {
  const feed = [record(2, "2026-09-01"), record(9, "2026-09-01")];
  assert.equal(selectWallpaperForDate(feed, localDate(1))?.id, 9);
  assert.equal(selectWallpaperForDate(feed.reverse(), localDate(1))?.id, 9);
});

test("local calendar date, not UTC, controls eligibility in western/eastern timezones", () => {
  const previous = process.env.TZ;
  try {
    const feed = [record(1, "2026-08-31"), record(2, "2026-09-01")];
    process.env.TZ = "America/Los_Angeles";
    const west = new Date("2026-09-01T01:00:00Z");
    assert.equal(getLocalDateKey(west), "2026-08-31");
    assert.equal(selectWallpaperForDate(feed, west)?.id, 1);
    process.env.TZ = "Asia/Tokyo";
    const east = new Date("2026-08-31T16:00:00Z");
    assert.equal(getLocalDateKey(east), "2026-09-01");
    assert.equal(selectWallpaperForDate(feed, east)?.id, 2);
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
