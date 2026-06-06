# Daily TCG Wallpaper

A mobile-first dark/premium web app giving users one trading-card-inspired wallpaper per day, with Capacitor Android support.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/daily-tcg-wallpaper run dev` — run the web app (port 8081)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-wallpapers` — reseed the wallpapers table
- Required env: `DATABASE_URL` — Postgres connection string

## Android (Capacitor)

Commands run from `artifacts/daily-tcg-wallpaper/`:

- `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build` — build web app and sync to Android project
- `pnpm --filter @workspace/daily-tcg-wallpaper run cap:sync` — sync already-built web assets to Android
- `pnpm --filter @workspace/daily-tcg-wallpaper run cap:open` — open Android project in Android Studio

**To build the APK:**
1. Clone the repo on a machine with Android Studio installed
2. Run `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build`
3. Run `pnpm --filter @workspace/daily-tcg-wallpaper run cap:open`
4. Build / run from Android Studio

App ID: `com.dailytcgwallpaper.app`
Android project: `artifacts/daily-tcg-wallpaper/android/`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web app: React + Vite (port 8081)
- Native: Capacitor 8 (Android)
- API: Express 5 (port 8080, path `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/daily-tcg-wallpaper/` — React + Vite web app + Capacitor Android project
- `artifacts/daily-tcg-wallpaper/android/` — generated Android project (commit this)
- `artifacts/daily-tcg-wallpaper/capacitor.config.ts` — Capacitor config (appId, webDir, plugins)
- `artifacts/api-server/` — Express API server
- `lib/db/src/schema/` — Drizzle schema (source of truth)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `scripts/src/seed-wallpapers.ts` — wallpaper seed data with picsum image URLs

## Architecture decisions

- Capacitor wraps the Vite-built web app; `webDir: "dist/public"` matches the Vite build output
- `@capacitor/share` opens the native Android share sheet; falls back to a toast on unsupported platforms
- The web preview runs at `BASE_PATH=/` so Capacitor and the proxy both work correctly
- Wallpaper images use `picsum.photos` seeds (1080×1920) for consistent placeholder photos
- All state is local; favorites persist via the API/DB

## User preferences

- No emojis in UI
- No "Premium" labels anywhere in the app

## Gotchas

- After any web code change, run `cap:build` (not just `cap:sync`) so the Android project gets the latest built assets
- `cap:sync` alone skips the Vite build step — only use it if you've already built
- The Vite build requires `PORT` and `BASE_PATH` env vars; `cap:build` script sets them automatically
- Android Studio is required to build the APK; Gradle cannot run in this Replit environment

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
