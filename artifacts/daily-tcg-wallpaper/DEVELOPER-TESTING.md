# Developer date testing

## Availability and build safety

- The Vite dev server exposes the panel at `/dev-tools`, linked as **Dev tools** on Today and **Developer tools** at the top of Settings.
- For Android developer testing run `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build:developer`, then build/install that bundle in Android Studio. This explicitly labeled developer bundle is not for publishing.
- `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build` rebuilds and syncs the normal release bundle. Its developer panel, route, and Today link are excluded; setting a date override is rejected.

### Exact Pixel access / troubleshooting

1. In the project terminal run `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build:developer`.
2. Confirm the final output says developer panel and Settings entry **INCLUDED** in `android/app/src/main/assets/public`. The script now fails if the built or synced assets do not match the requested mode.
3. Build/install from the Android project at `artifacts/daily-tcg-wallpaper/android` in Android Studio (Run on the connected Pixel, or rebuild the APK and install that newly built file).
4. Open the app, finish onboarding if shown, then open the Today menu → **Settings** → **Developer tools**, the first card. Alternatively, tap **Dev tools** to the right of the Today tabs.
5. The screen heading is **Developer date testing**. The Phase 4 notification test button is not the entry to this panel.

An Android Studio **debug** APK does not automatically enable these web controls: the Vite bundle must have been built with `cap:build:developer`. `build:developer` alone builds web assets but does not sync them to Android. Do not run normal `cap:build` or normal `build` + `cap:sync` between creating the developer bundle and building/installing the APK; that replaces it with release web assets. Avoid building/syncing during a browser acceptance test because development-page reloads interrupt the flow.

If neither developer entry appears, the installed app does not show the expected developer bundle. Check the command output, Android project path, and that you installed the newly rebuilt APK, not an older APK. No uninstall or clearing app data is required.
- Developer overrides are retained in local storage until **Clear Override**, including background/resume, page reload, WebView recreation, and app restart. Dates are validated before restoration; malformed values are removed. A normal release build never reads or activates a retained override and removes the developer storage key on startup.
- Applying or clearing a date reports a storage error rather than falsely claiming success if storage is unavailable. Startup still falls back safely to the real date if retained state cannot be read.
- The simplified Settings UI and its permission flow are unchanged.

## Actual code paths

- `src/lib/local-date-store.ts`: `setOverride`, `getEffectiveDate`, and the existing local-midnight/foreground-resume observer.
- `src/hooks/use-wallpaper-feed.ts`: subscribes to the date store and filters the real bundled feed using its effective date. Today, Preview, Favorites, and Settings use this hook.
- `src/lib/wallpaper.ts`: `getAvailableWallpapers` and `selectWallpaperForDate` are the Phase 5 release selection logic, used with real records.
- `src/lib/notification-content.ts`: `getCurrentNotificationContent` builds both the panel's diagnostic content and the actual notification payload from the same effective date.
- `src/lib/notifications.ts`: `scheduleTestNotification` uses that builder; delivery remains 10 real seconds later, not simulated clock seconds.
- `src/pages/developer-tools.tsx`: controls and diagnostics. Eligibility, reason, ID, title, date, and notification content come from the real store/feed/builder, not fabricated results.

## Acceptance checks

1. In a developer build, finish onboarding, open **Settings → Developer tools** (or Today → **Dev tools**), and note the device date and current selection.
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

## Resume regression and focused Pixel retest

The old store initialized its override to `null` every time JavaScript started. Normal visibility/focus resume callbacks already used the effective date and did not clear an active override, but a recreated WebView/store lost it. Automated tests reproduce this recreation boundary; they do not establish whether the original Pixel run recreated its WebView.

The store now restores a validated developer-only date before its initial snapshot, persists each applied override, and deletes it on Clear Override. The selector, notification builder, permission flow, and Android activity are unchanged.

1. Install the newly built developer bundle. Open **Settings → Developer tools**, select **2026-09-01**, and verify actual Today shows **101 — Void Between Stars**.
2. Put the app in the background, open another app, and return. Confirm Today, Preview, and developer diagnostics still use September 1 / ID 101. Repeat with **2026-09-06 / ID 106**.
3. With Notifications enabled and Android permission granted, schedule the real test notification after returning. Compare title, caption, and credit with the selected record.
4. Close/reopen the app as an additional recreation check: the override should still be active.
5. Select **Clear Override**. Confirm the effective date equals the current local device date and the real eligible selection returns. Background/resume and reopen again; the override must remain cleared.
6. With no override, repeat the real-device date-change/resume check above. Normal release builds must expose no developer controls and must ignore/remove any date previously retained by a developer build.

Node regression tests cover active-override resume, changed real dates, store recreation, Clear Override followed by recreation, malformed dates, and developer → release → developer storage isolation using the unchanged real feed. Native Android lifecycle and notification delivery still require the Pixel checks.
