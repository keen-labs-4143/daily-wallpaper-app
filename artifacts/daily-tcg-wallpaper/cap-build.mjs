/**
 * Cross-platform Capacitor build script (replaces Unix-only shell expansion).
 *
 * Resolves VITE_API_BASE_URL in priority order:
 *   1. VITE_API_BASE_URL env var already set by the caller
 *   2. REPLIT_DEV_DOMAIN env var (available automatically in the Replit terminal)
 *   3. Exits with a helpful error so the caller knows exactly what to set
 *
 * Usage:
 *   PowerShell:  $env:VITE_API_BASE_URL = "https://your-app.replit.app"; pnpm run cap:build
 *   bash/zsh:    VITE_API_BASE_URL=https://your-app.replit.app pnpm run cap:build
 *   Replit:      pnpm run cap:build   (auto-uses $REPLIT_DEV_DOMAIN)
 *
 * The URL must be the root origin WITHOUT a trailing /api — the generated
 * API hooks already include /api/ in their paths.
 */

import { execSync } from "node:child_process";

let apiBaseUrl = process.env.VITE_API_BASE_URL;

if (!apiBaseUrl && process.env.REPLIT_DEV_DOMAIN) {
  apiBaseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  console.log(`[cap:build] Auto-detected Replit dev URL: ${apiBaseUrl}`);
}

if (!apiBaseUrl) {
  console.error(
    "\n[cap:build] ERROR: VITE_API_BASE_URL is not set.\n" +
    "Set it to your backend root URL (no trailing /api), then re-run cap:build:\n\n" +
    "  PowerShell:  $env:VITE_API_BASE_URL = 'https://your-app.replit.app'\n" +
    "  bash/zsh:    export VITE_API_BASE_URL=https://your-app.replit.app\n"
  );
  process.exit(1);
}

// Require a root HTTP(S) origin. Generated API requests already include /api,
// so accepting an /api path here would silently create /api/api requests.
try {
  const parsed = new URL(apiBaseUrl);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("only http and https origins are supported");
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("the URL must not include a path, query, or hash");
  }
  apiBaseUrl = parsed.origin;
} catch (error) {
  console.error(
    `\n[cap:build] ERROR: Invalid VITE_API_BASE_URL "${apiBaseUrl}".\n` +
    "Set it to the backend root origin only (for example https://example.replit.app).\n" +
    `Reason: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
}
console.log(`[cap:build] VITE_API_BASE_URL=${apiBaseUrl}`);

const buildEnv = {
  ...process.env,
  PORT: process.env.PORT ?? "8081",
  BASE_PATH: process.env.BASE_PATH ?? "/",
  VITE_API_BASE_URL: apiBaseUrl,
};

try {
  execSync("pnpm run build", { env: buildEnv, stdio: "inherit" });
  execSync("cap sync android", { env: buildEnv, stdio: "inherit" });
} catch {
  process.exit(1);
}
