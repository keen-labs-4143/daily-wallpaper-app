import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createWallpaperSetter, WALLPAPER_TARGETS } from "../src/lib/wallpaper-setting.ts";

const feed = JSON.parse(readFileSync(new URL("../src/data/wallpapers.json", import.meta.url), "utf8"));

// Adapter unit tests, not a claim of native WallpaperManager/device execution.
test("each chooser option sends its canonical target and the selected original feed image", async () => {
  assert.deepEqual(WALLPAPER_TARGETS.map(option => option.value), ["home", "lock", "both"]);
  const calls = [];
  const set = createWallpaperSetter({
    setWallpaper: async options => {
      calls.push(options);
      return { applied: true, target: options.target, wallpaperId: 17 };
    },
  }, () => true);
  for (const wallpaper of [feed[0], feed[5], feed[13]]) {
    for (const { value } of WALLPAPER_TARGETS) {
      await set(wallpaper.imagePath, value);
      assert.deepEqual(calls.at(-1), { assetPath: wallpaper.imagePath, target: value });
      assert.equal("base64" in calls.at(-1), false);
      assert.equal("imageUrl" in calls.at(-1), false);
    }
  }
  assert.equal(calls.length, 9);
});

test("browser/missing plugin fails honestly without invoking the native bridge", async () => {
  let called = false;
  const set = createWallpaperSetter({
    setWallpaper: async () => { called = true; },
  }, () => false);
  await assert.rejects(set(feed[0].imagePath, "home"), /requires the Android app/);
  assert.equal(called, false);
});

test("invalid targets and non-feed asset paths are rejected before native execution", async () => {
  let called = false;
  const set = createWallpaperSetter({
    setWallpaper: async () => { called = true; },
  }, () => true);
  await assert.rejects(set(feed[0].imagePath, "Home Screen"), /Choose Home Screen/);
  for (const path of ["", "../secret", "wallpapers/../secret.webp", "https://example.com/image.webp", "/wallpapers/image.webp"]) {
    await assert.rejects(set(path, "both"), /valid bundled image/);
  }
  assert.equal(called, false);
});

test("a native rejection reaches the caller so the UI can show failure", async () => {
  const nativeError = new Error("Wallpaper changes are blocked.");
  const set = createWallpaperSetter({
    setWallpaper: async () => { throw nativeError; },
  }, () => true);
  await assert.rejects(set(feed[0].imagePath, "lock"), error => error === nativeError);
});

test("unconfirmed, wrong-target, or invalid Android results never count as success", async () => {
  for (const result of [
    { applied: false, target: "home", wallpaperId: 17 },
    { applied: true, target: "lock", wallpaperId: 17 },
    { applied: true, target: "home", wallpaperId: 0 },
    { applied: true, target: "home", wallpaperId: -1 },
    { applied: true, target: "home", wallpaperId: 0.5 },
  ]) {
    const set = createWallpaperSetter({ setWallpaper: async () => result }, () => true);
    await assert.rejects(set(feed[0].imagePath, "home"), /did not confirm/);
  }
});
