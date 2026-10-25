/**
 * Build and synchronize the offline-first Capacitor bundle.
 *
 * The Phase 3 wallpaper feed and images are bundled with the app, so this
 * build intentionally does not require a remote API origin.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dirname;
const buildEnv = {
  ...process.env,
  PORT: process.env.PORT ?? "8081",
  BASE_PATH: "/",
};

function verifyDeveloperBundle(publicDirectory, developer) {
  const assetsDirectory = resolve(publicDirectory, "assets");
  const files = readdirSync(assetsDirectory).filter((name) => name.endsWith(".js"));
  const hasPanel = files.some((name) => name.startsWith("developer-tools-"));
  const hasSettingsEntry = files.some((name) =>
    readFileSync(resolve(assetsDirectory, name), "utf8")
      .includes("open-developer-tools"),
  );
  if (hasPanel !== developer || hasSettingsEntry !== developer) {
    throw new Error(
      `Developer bundle verification failed in ${publicDirectory}. ` +
      `Expected developer controls ${developer ? "included" : "excluded"}; ` +
      `panel=${hasPanel}, Settings entry=${hasSettingsEntry}.`,
    );
  }
  console.log(
    `[cap:build] Verified developer panel and Settings entry ` +
    `${developer ? "INCLUDED" : "EXCLUDED"} in ${publicDirectory}.`,
  );
}

try {
  const developer = process.argv.includes("--developer");
  console.log(developer
    ? "[cap:build] DEVELOPER BUNDLE — date overrides enabled; do not publish."
    : "[cap:build] Release bundle — developer controls and overrides disabled.");
  execSync(developer ? "pnpm run build:developer" : "pnpm run build", {
    cwd: root, env: buildEnv, stdio: "inherit",
  });
  verifyDeveloperBundle(resolve(root, "dist/public"), developer);
  execSync("cap sync android", { cwd: root, env: buildEnv, stdio: "inherit" });
  verifyDeveloperBundle(resolve(root, "android/app/src/main/assets/public"), developer);

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