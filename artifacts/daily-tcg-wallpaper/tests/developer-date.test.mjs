import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createLocalWallpaperFeed, getAvailableWallpapers, selectWallpaperForDate } from "../src/lib/wallpaper.ts";
import { createLocalDateStore, localDateStore } from "../src/lib/local-date-store.ts";
import { getCurrentNotificationContent } from "../src/lib/notification-content.ts";

const raw = JSON.parse(readFileSync(new URL("../src/data/wallpapers.json", import.meta.url), "utf8"));
const feed = createLocalWallpaperFeed(raw, "/");
const date = key => new Date(`${key}T12:00:00`);

test("actual feed selects known IDs and actual notification title/caption/credit on two different release dates", () => {
  for (const [key, expectedId] of [["2026-09-01", 101], ["2026-09-06", 106], ["2026-09-14", 114]]) {
    const selected = selectWallpaperForDate(feed, date(key));
    assert.equal(selected?.id, expectedId);
    const content = getCurrentNotificationContent(feed, date(key));
    assert.equal(content.wallpaperId, expectedId);
    assert.equal(content.title, selected.title);
    assert.equal(content.body, `${selected.description}\n${selected.credit}`);
    assert.equal(getAvailableWallpapers(feed, date(key))[0]?.id, expectedId);
  }
  assert.notEqual(
    selectWallpaperForDate(feed, date("2026-09-01"))?.id,
    selectWallpaperForDate(feed, date("2026-09-06"))?.id,
  );
});

test("actual exhausted feed correctly retains ID 114, while dates before feed start use real empty/generic fallback", () => {
  assert.equal(selectWallpaperForDate(feed, date("2026-10-18"))?.id, 114);
  assert.equal(selectWallpaperForDate(feed, date("2026-10-19"))?.id, 114);
  assert.equal(selectWallpaperForDate(feed, date("2026-08-31")), null);
  assert.deepEqual(getAvailableWallpapers(feed, date("2026-08-31")), []);
  const content = getCurrentNotificationContent(feed, date("2026-08-31"));
  assert.equal(content.wallpaperId, null);
  assert.equal(content.title, "Today's wallpaper is ready");
  assert.equal(content.body, "Open Daily TCG Wallpaper to see today's selection.");
});

test("shared developer override changes real selection, survives subscribers navigating away, and clears to the device date", () => {
  const store = createLocalDateStore({
    now: () => date("2026-10-18"),
    setTimer: () => 1, clearTimer: () => {},
    onResume: () => () => {},
  }, true);
  const unsubscribe = store.subscribe(() => {});
  assert.equal(selectWallpaperForDate(feed, store.getEffectiveDate())?.id, 114);
  store.setOverride("2026-09-01");
  assert.equal(store.getSnapshot(), "2026-09-01");
  assert.equal(selectWallpaperForDate(feed, store.getEffectiveDate())?.id, 101);
  assert.equal(getCurrentNotificationContent(feed, store.getEffectiveDate()).wallpaperId, 101);
  unsubscribe();
  const unsubscribeAgain = store.subscribe(() => {});
  assert.equal(store.getOverride(), "2026-09-01");
  store.setOverride("2026-09-06");
  assert.equal(selectWallpaperForDate(feed, store.getEffectiveDate())?.id, 106);
  store.setOverride(null);
  assert.equal(store.getOverride(), null);
  assert.equal(store.getSnapshot(), "2026-10-18");
  assert.equal(selectWallpaperForDate(feed, store.getEffectiveDate())?.id, 114);
  assert.throws(() => store.setOverride("2026-02-30"), /valid calendar date/);
  unsubscribeAgain();
});

test("normal/non-developer runtime rejects overrides and does not read a persisted testing date", () => {
  assert.equal(localDateStore.getOverride(), null);
  assert.throws(() => localDateStore.setOverride("2026-09-01"), /disabled in release/);
});

test("real feed on foreground midnight and resume uses the same selection and notification builder", () => {
  let now = new Date(2026, 8, 5, 23, 59, 59);
  let tick;
  let resume;
  const store = createLocalDateStore({
    now: () => now,
    setTimer: fn => { tick = fn; return 1; },
    clearTimer: () => {},
    onResume: fn => { resume = fn; return () => {}; },
  });
  const results = [];
  const unsubscribe = store.subscribe(() => {
    const selected = selectWallpaperForDate(feed, store.getEffectiveDate());
    const notification = getCurrentNotificationContent(feed, store.getEffectiveDate());
    results.push([selected?.id, notification.wallpaperId]);
  });
  assert.equal(selectWallpaperForDate(feed, now)?.id, 105);
  now = new Date(2026, 8, 6);
  tick();
  now = date("2026-09-09");
  resume();
  assert.deepEqual(results, [[106, 106], [109, 109]]);
  unsubscribe();
});
