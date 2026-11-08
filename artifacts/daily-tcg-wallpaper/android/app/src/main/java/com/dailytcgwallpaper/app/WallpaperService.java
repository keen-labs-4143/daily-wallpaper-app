package com.dailytcgwallpaper.app;

import android.app.WallpaperManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import java.io.IOException;
import java.io.InputStream;

/**
 * Reusable native operation, independent of Capacitor, Activity, and scheduling.
 * A future worker can construct this with an application Context and call
 * apply(InputStream, Target) for a downloaded file or applyAsset for bundled art.
 * Call off the UI thread. The caller owns/closes streams passed to apply().
 */
public final class WallpaperService {
    private static final Object APPLY_LOCK = new Object();
    private final Context context;

    public enum Target {
        HOME("home", WallpaperManager.FLAG_SYSTEM),
        LOCK("lock", WallpaperManager.FLAG_LOCK),
        BOTH("both", WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK);

        public final String value;
        public final int flags;

        Target(String value, int flags) {
            this.value = value;
            this.flags = flags;
        }

        public static Target fromValue(String value) {
            for (Target target : values()) {
                if (target.value.equals(value)) return target;
            }
            throw new IllegalArgumentException("Choose home, lock, or both.");
        }
    }

    public WallpaperService(Context context) {
        this.context = context.getApplicationContext();
    }

    public int applyAsset(String assetPath, Target target) throws IOException {
        if (assetPath == null ||
            !assetPath.matches("wallpapers/[a-z0-9][a-z0-9-]*\\.(webp|jpg|jpeg|png)")) {
            throw new IllegalArgumentException("Invalid bundled wallpaper image path.");
        }
        // Capacitor sync copies the original feed assets under assets/public.
        try (InputStream stream = context.getAssets().open("public/" + assetPath)) {
            return apply(stream, target);
        }
    }

    public int apply(InputStream image, Target target) throws IOException {
        if (image == null || target == null) {
            throw new IllegalArgumentException("A wallpaper image and target are required.");
        }
        // Also serializes future native callers, not just the Capacitor plugin.
        synchronized (APPLY_LOCK) {
            WallpaperManager manager = WallpaperManager.getInstance(context);
            if (!manager.isWallpaperSupported()) {
                throw new UnsupportedOperationException("This device does not support wallpapers.");
            }
            if (!manager.isSetWallpaperAllowed()) {
                throw new SecurityException("Wallpaper changes are blocked by your device administrator.");
            }
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inScaled = false;
            options.inSampleSize = 1;
            // Full-resolution decode also supports the feed's WebP originals.
            Bitmap bitmap = BitmapFactory.decodeStream(image, null, options);
            if (bitmap == null) throw new IOException("The wallpaper image could not be decoded.");
            try {
                // One Android operation for BOTH, not two partially-successful calls.
                // Android/launcher chooses the final device crop; source is not resized.
                int wallpaperId = manager.setBitmap(bitmap, null, false, target.flags);
                if (wallpaperId <= 0) throw new IOException("Android did not apply the wallpaper.");
                return wallpaperId;
            } finally {
                bitmap.recycle();
            }
        }
    }
}
