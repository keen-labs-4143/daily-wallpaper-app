# Developer date testing

## Availability and build safety

- The Vite dev server exposes the panel at `/dev-tools`, also linked as **Dev tools** on Today.
- For Android developer testing run `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build:developer`, then build/install that bundle in Android Studio. This explicitly labeled developer bundle is not for publishing.
- `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build` rebuilds and syncs the normal release bundle. Its developer panel, route, and Today link are excluded; setting a date override is rejected.
- Overrides exist only in memory. Navigating within the app preserves them; reloading or restarting the app clears them. No stored override can affect a release build.
- The simplified Settings UI and its permission flow are unchanged.

## Actual code paths

- `src/lib/local-date-store.ts`: `setOverride`, `getEffectiveDate`, and the existing local-midnight/foreground-resume observer.
- `src/hooks/use-wallpaper-feed.ts`: subscribes to the date store and filters the real bundled feed using its effective date. Today, Preview, Favorites, and Settings use this hook.
- `src/lib/wallpaper.ts`: `getAvailableWallpapers` and `selectWallpaperForDate` are the Phase 5 release selection logic, used with real records.
- `src/lib/notification-content.ts`: `getCurrentNotificationContent` builds both the panel's diagnostic content and the actual notification payload from the same effective date.
- `src/lib/notifications.ts`: `scheduleTestNotification` uses that builder; delivery remains 10 real seconds later, not simulated clock seconds.
- `src/pages/developer-tools.tsx`: controls and diagnostics. Eligibility, reason, ID, title, date, and notification content come from the real store/feed/builder, not fabricated results.

## Acceptance checks

1. In a developer build, finish onboarding, open **Dev tools**, and note the device date and current selection.
2. Choose existing feed date **2026-09-01**. Expect real record **101 — Void Between Stars**. View actual Today, open its Preview, and confirm metadata. Return using the Today **Dev tools** link.
3. Choose **2026-09-06**. Expect **106 — Deep Current** on the panel, notification content, and actual Today screen.
4. Choose **Tomorrow**, navigate to Today, then return and **Clear Override**. If both dates are after September 14, both correctly select record **114**. The diagnostic reason explains the earlier-release fallback.
5. Choose custom date **2026-08-31**. Expect no eligible wallpaper, the actual Today empty state, and generic notification content. No future release should leak into Today or the collections.
6. On Android enable Notifications in Settings and grant permission, return to Dev tools, select a covered date, and send the test notification. Compare its title, caption, and credit to the displayed content. This uses the real notification scheduler; web does not pretend to deliver it.
7. Clear Override. Confirm the selection returns to the real device date.

## What still requires Android verification

Automated Node tests invoke the real selector with the unchanged feed, and drive the same date-store timer/resume callbacks using a controlled clock. Browser tests can verify panel-to-Today navigation, Preview IDs, fallback, and clearing.

They do not prove Android WebView lifecycle delivery or native notification delivery. With overrides cleared, use a test device clock near midnight on September 5, 2026 and verify the foreground transition from ID 105 to ID 106. Separately background the app, advance to September 9, and resume: expect ID 109. Restore automatic date/time afterward.

No WorkManager job, background scheduler, or automatic wallpaper application is implemented or verified here.
