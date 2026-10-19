import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLocalDateStore,
  millisecondsUntilLocalMidnight,
} from "../src/lib/local-date-store.ts";
import { selectWallpaperForDate } from "../src/lib/wallpaper.ts";

function harness(initial) {
  let now = initial;
  let callback;
  let resume;
  let delay;
  let removed = false;
  const store = createLocalDateStore({
    now: () => now,
    setTimer: (fn, ms) => { callback = fn; delay = ms; return 1; },
    clearTimer: () => { callback = undefined; },
    onResume: (fn) => { resume = fn; return () => { removed = true; }; },
  });
  return {
    store, setDate: value => { now = value; },
    tick: () => callback?.(), resume: () => resume?.(),
    get delay() { return delay; },
    get removed() { return removed; },
    get hasTimer() { return callback !== undefined; },
  };
}

test("midnight refreshes every subscriber and selects the newly eligible release", () => {
  const h = harness(new Date(2026, 8, 1, 23, 59, 59));
  const feed = [
    { id: 1, dateAvailable: "2026-09-01", isPublished: true },
    { id: 2, dateAvailable: "2026-09-02", isPublished: true },
  ];
  const seen = [];
  let updates = 0;
  const stop = h.store.subscribe(() => {
    seen.push(selectWallpaperForDate(feed, new Date(`${h.store.getSnapshot()}T12:00:00`))?.id);
  });
  const stopOther = h.store.subscribe(() => { updates++; });
  assert.equal(h.delay, 1000);
  h.setDate(new Date(2026, 8, 2));
  h.tick();
  assert.equal(h.store.getSnapshot(), "2026-09-02");
  assert.deepEqual(seen, [2]);
  assert.equal(updates, 1);
  h.tick();
  assert.equal(updates, 1);
  stop();
  assert.equal(h.hasTimer, true);
  stopOther();
  assert.equal(h.hasTimer, false);
  assert.equal(h.removed, true);
});

test("resume catches skipped days, backward clock changes, and reopening after inactivity", () => {
  const h = harness(new Date(2026, 8, 1));
  let updates = 0;
  const stop = h.store.subscribe(() => { updates++; });
  h.setDate(new Date(2026, 8, 5));
  h.resume();
  assert.equal(h.store.getSnapshot(), "2026-09-05");
  h.setDate(new Date(2026, 8, 3));
  h.tick();
  assert.equal(h.store.getSnapshot(), "2026-09-03");
  assert.equal(updates, 2);
  stop();
  h.setDate(new Date(2026, 8, 8));
  const stopAgain = h.store.subscribe(() => {});
  assert.equal(h.store.getSnapshot(), "2026-09-08");
  stopAgain();
});

test("local midnight timer respects DST and checks clock changes within 30 seconds", () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = "America/Los_Angeles";
    assert.equal(millisecondsUntilLocalMidnight(new Date(2026, 2, 8)), 23 * 3600000);
    assert.equal(millisecondsUntilLocalMidnight(new Date(2026, 10, 1)), 25 * 3600000);
    const h = harness(new Date(2026, 8, 1, 12));
    const stop = h.store.subscribe(() => {});
    assert.equal(h.delay, 30_000);
    process.env.TZ = "Asia/Tokyo";
    h.tick();
    assert.equal(h.store.getSnapshot(), "2026-09-02");
    stop();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
