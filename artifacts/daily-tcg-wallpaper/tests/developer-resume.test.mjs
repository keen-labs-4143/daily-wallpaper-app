import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  createLocalDateStore,
  DEVELOPER_DATE_STORAGE_KEY,
} from "../src/lib/local-date-store.ts";
import {
  createLocalWallpaperFeed,
  getAvailableWallpapers,
  selectWallpaperForDate,
} from "../src/lib/wallpaper.ts";
import { getCurrentNotificationContent } from "../src/lib/notification-content.ts";

const feed = createLocalWallpaperFeed(JSON.parse(readFileSync(
  new URL("../src/data/wallpapers.json", import.meta.url), "utf8",
)), "/");
const date = key => new Date(`${key}T12:00:00`);

function storage(initial = null) {
  const values = new Map(initial === null ? [] : [[DEVELOPER_DATE_STORAGE_KEY, initial]]);
  const calls = { reads: 0, writes: 0, removals: 0 };
  return {
    values, calls,
    getItem(key) { calls.reads++; return values.get(key) ?? null; },
    setItem(key, value) { calls.writes++; values.set(key, value); },
    removeItem(key) { calls.removals++; values.delete(key); },
  };
}

function harness(retained, developer = true, initial = "2026-10-18") {
  let now = date(initial);
  let resume;
  const store = createLocalDateStore({
    now: () => now,
    setTimer: () => 1,
    clearTimer: () => {},
    onResume: fn => { resume = fn; return () => { resume = undefined; }; },
    overrideStorage: retained,
  }, developer);
  return {
    store,
    advance: key => { now = date(key); },
    resume: () => resume?.(),
  };
}

function assertRealSelection(store, expectedId) {
  const effective = store.getEffectiveDate();
  const selected = selectWallpaperForDate(feed, effective);
  assert.equal(selected?.id, expectedId);
  // Same released-feed path used by Today and Preview.
  assert.equal(getAvailableWallpapers(feed, effective)[0]?.id, expectedId);
  const content = getCurrentNotificationContent(feed, effective);
  assert.equal(content.wallpaperId, expectedId);
  assert.equal(content.title, selected.title);
  assert.equal(content.body, `${selected.description}\n${selected.credit}`);
}

test("background → resume retains an active override despite the device date changing", () => {
  const retained = storage();
  const h = harness(retained);
  const stop = h.store.subscribe(() => {});
  h.store.setOverride("2026-09-01");
  h.advance("2026-10-21");
  h.resume();
  assert.equal(h.store.getSnapshot(), "2026-09-01");
  assert.equal(h.store.getOverride(), "2026-09-01");
  assertRealSelection(h.store, 101);
  // A second real record also remains selected across repeat resume events.
  h.store.setOverride("2026-09-06");
  h.resume();
  h.resume();
  assertRealSelection(h.store, 106);
  stop();
});

test("WebView/store recreation restores the developer override before the first snapshot", () => {
  const retained = storage();
  const first = harness(retained);
  first.store.setOverride("2026-09-06");
  assert.equal(retained.values.get(DEVELOPER_DATE_STORAGE_KEY), "2026-09-06");

  const recreated = harness(retained, true, "2026-10-22");
  // No subscription/foreground callback is needed to initialize consumers.
  assert.equal(recreated.store.getSnapshot(), "2026-09-06");
  assert.equal(recreated.store.getOverride(), "2026-09-06");
  assertRealSelection(recreated.store, 106);
  const stop = recreated.store.subscribe(() => {});
  recreated.resume();
  assertRealSelection(recreated.store, 106);
  stop();
});

test("Clear Override removes retained state and restores real-date selection after resume and recreation", () => {
  const retained = storage("2026-09-01");
  const h = harness(retained);
  const stop = h.store.subscribe(() => {});
  h.advance("2026-09-09");
  h.store.setOverride(null);
  assert.equal(retained.values.has(DEVELOPER_DATE_STORAGE_KEY), false);
  assert.equal(h.store.getOverride(), null);
  assert.equal(h.store.getSnapshot(), "2026-09-09");
  assertRealSelection(h.store, 109);
  h.advance("2026-09-10");
  h.resume();
  assertRealSelection(h.store, 110);
  stop();
  const recreated = harness(retained, true, "2026-09-11");
  assert.equal(recreated.store.getOverride(), null);
  assert.equal(recreated.store.getSnapshot(), "2026-09-11");
  assertRealSelection(recreated.store, 111);
});

test("resume without an override refreshes the actual local date using real feed records", () => {
  const h = harness(storage(), true, "2026-09-05");
  const seen = [];
  const stop = h.store.subscribe(() => seen.push(h.store.getSnapshot()));
  assertRealSelection(h.store, 105);
  h.advance("2026-09-09");
  h.resume();
  assert.equal(h.store.getOverride(), null);
  assert.equal(h.store.getSnapshot(), "2026-09-09");
  assertRealSelection(h.store, 109);
  assert.deepEqual(seen, ["2026-09-09"]);
  stop();
});

test("release mode never reads/writes overrides, purges developer residue, and cannot reactivate it later", () => {
  const retained = storage("2026-09-01");
  const release = harness(retained, false);
  assert.equal(retained.calls.reads, 0);
  assert.equal(retained.calls.writes, 0);
  assert.equal(retained.calls.removals, 1);
  assert.equal(retained.values.has(DEVELOPER_DATE_STORAGE_KEY), false);
  assert.equal(release.store.getOverride(), null);
  assertRealSelection(release.store, 114);
  assert.throws(() => release.store.setOverride("2026-09-06"), /disabled in release/);
  assert.throws(() => release.store.setOverride(null), /disabled in release/);
  const stop = release.store.subscribe(() => {});
  release.advance("2026-09-09");
  release.resume();
  assertRealSelection(release.store, 109);
  assert.equal(retained.calls.reads, 0);
  assert.equal(retained.calls.writes, 0);
  stop();
  const developerAgain = harness(retained);
  assert.equal(developerAgain.store.getOverride(), null);
  assertRealSelection(developerAgain.store, 114);
});

test("malformed retained dates are discarded instead of entering the shared selector", () => {
  for (const value of ["2026-02-30", "", "not-a-date", "2026-09-01T12:00:00Z"]) {
    const retained = storage(value);
    const h = harness(retained);
    assert.equal(h.store.getOverride(), null);
    assert.equal(retained.values.has(DEVELOPER_DATE_STORAGE_KEY), false);
    assertRealSelection(h.store, 114);
  }
});

test("failed persistence never falsely applies or clears an override", () => {
  const retained = storage("2026-09-01");
  const h = harness(retained);
  retained.setItem = () => { throw new Error("Storage unavailable"); };
  assert.throws(() => h.store.setOverride("2026-09-06"), /Storage unavailable/);
  assert.equal(h.store.getSnapshot(), "2026-09-01");
  retained.removeItem = () => { throw new Error("Storage unavailable"); };
  assert.throws(() => h.store.setOverride(null), /Storage unavailable/);
  assert.equal(h.store.getOverride(), "2026-09-01");
  assertRealSelection(h.store, 101);
});
