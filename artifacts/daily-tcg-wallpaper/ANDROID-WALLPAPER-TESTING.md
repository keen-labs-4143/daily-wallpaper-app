# Phase 7 — Native manual wallpaper setting

## Build and install

Run `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build` for a normal release-mode web bundle, or `pnpm --filter @workspace/daily-tcg-wallpaper run cap:build:developer` if you need the Phase 6 date controls. Both sync the original wallpaper assets to Android. Then build/run the Android project at `artifacts/daily-tcg-wallpaper/android` on the connected Pixel in Android Studio.

Install a newly compiled APK: a web refresh or Capacitor sync alone cannot install the newly added native plugin. `SET_WALLPAPER` is a normal Android permission declared in the manifest, not a runtime permission prompt. Browser preview cannot change a phone wallpaper and now reports that honestly.

## Physical Android acceptance checklist

These actions replace your current wallpapers. Use a device where you are comfortable making those changes.

1. Open a wallpaper on Today and tap its card to open Preview. Note the title and image; if using a date override, confirm you are viewing the intended actual feed record.
2. Tap **Set wallpaper → Home Screen**. Wait for the success message, leave the app, and visually confirm the Home wallpaper. Check the Lock screen too. Android may migrate a previously shared Home/Lock wallpaper when Home changes; independent Lock wallpaper behavior is controlled by Android.
3. Open a different wallpaper and choose **Lock Screen**. Lock/wake the Pixel and confirm the new image on Lock while Home retains its prior image.
4. Open another wallpaper and choose **Both Screens**. Confirm both Home and Lock show that selected image.
5. Confirm **Applying…** prevents repeated taps during the operation. Success must appear only after the native call completes. Canceling the chooser must not change either wallpaper.
6. Test browser preview: no wallpaper should change and no success message should appear. A restricted/managed Android device should report a blocked change rather than crash.
7. Confirm applying a different Preview record uses that record, not an unrelated current-date record. Existing Favorites, notification content, Settings, and date override behavior should remain unchanged.

The supplied original image is decoded without sampling or resizing. Android and the launcher may crop/scale it to the actual display or add their own wallpaper effects. “Full resolution” means the original bundled source, not an invented higher-resolution image.

## Reusable native architecture

- `src/lib/wallpaper-setting.ts`: typed target values and bridge request/result validation.
- `src/lib/wallpaper-native.ts`: Capacitor `NativeWallpaper` registration and Android availability check.
- `src/pages/preview.tsx`: existing chooser, selected record's `imagePath`, pending state, success/failure messages.
- `android/app/src/main/java/com/dailytcgwallpaper/app/NativeWallpaperPlugin.java`: asynchronous Capacitor adapter and error handling.
- `android/app/src/main/java/com/dailytcgwallpaper/app/WallpaperService.java`: application-context-only native operation. `applyAsset(assetPath, Target)` opens original bundled assets; `apply(InputStream, Target)` can later accept a downloaded file stream owned/closed by its caller. It has no Activity, Capacitor, scheduler, or background-worker dependency.
- `android/app/src/main/java/com/dailytcgwallpaper/app/MainActivity.java`: registers the plugin before the Capacitor bridge loads.

The service serializes changes, checks device support/policy, decodes WebP/PNG/JPEG at full source resolution, maps Home/Lock/Both to Android flags, and requires a positive WallpaperManager ID. Both uses one combined-flags call. Streams/bitmaps are closed/recycled. The plugin runs off the UI thread and rejects I/O, policy, invalid-image, memory, and runtime failures.

No automatic update preference is connected to this service and no WorkManager job or background scheduling is added. A future Phase 10 worker can call the same service without JavaScript.

## Checks and limitations

- `pnpm --filter @workspace/daily-tcg-wallpaper run test:wallpapers` includes bridge-contract tests against paths from real feed records. Those tests do not execute WallpaperManager.
- `pnpm --filter @workspace/daily-tcg-wallpaper run typecheck`
- With JDK 21 and Android SDK 36 configured, run `./gradlew :app:testDebugUnitTest :app:assembleDebug` from the Android directory.
- A physical Pixel must complete the visual checks above. Browser screenshots, adapter tests, and builds cannot prove that a real device's wallpaper changed.

For this implementation, the 25 Node tests, typecheck, normal/developer web builds, and both Capacitor syncs passed. The native Gradle build/unit-test attempt was blocked before compilation by a Gradle distribution download timeout; the alternate distribution URL returned a gateway error. The Android unit tests are added but have not run here. Build/install through Android Studio and perform the physical-device checklist before treating the Phase 7 checkpoint as device-verified.
