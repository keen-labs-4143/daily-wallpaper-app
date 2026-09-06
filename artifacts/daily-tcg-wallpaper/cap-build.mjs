/**
 * Build and synchronize the offline-first Capacitor bundle.
 *
 * The Phase 3 wallpaper feed and images are bundled with the app, so this
 * build intentionally does not require a remote API origin.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dirname;
const buildEnv = {
  ...process.env,
  PORT: process.env.PORT ?? "8081",
  BASE_PATH: "/",
};

try {
  execSync("pnpm run build", { cwd: root, env: buildEnv, stdio: "inherit" });
  execSync("cap sync android", { cwd: root, env: buildEnv, stdio: "inherit" });

  const feed = JSON.parse(
    readFileSync(resolve(root, "src/data/wallpapers.json"), "utf8"),
  );
  const missing = feed
    .map((wallpaper) => wallpaper.imagePath)
    .filter(
      (imagePath) =>
        !existsSync(
          resolve(
            root,
            "android/app/src/main/assets/public",
            imagePath,
          ),
        ),
    );

  if (missing.length) {
    throw new Error(
      `Capacitor sync is missing wallpaper assets:\n${missing.join("\n")}`,
    );
  }

  console.log(
    `[cap:build] Verified ${feed.length} wallpaper images in Android assets.`,
  );
} catch (error) {
  console.error(
    `[cap:build] Failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}