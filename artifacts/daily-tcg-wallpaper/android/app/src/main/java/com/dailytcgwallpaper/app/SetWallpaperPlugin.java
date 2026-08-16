package com.dailytcgwallpaper.app;

import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "SetWallpaper")
public class SetWallpaperPlugin extends Plugin {

    @PluginMethod
    public void setWallpaper(PluginCall call) {
        String imageUrl = call.getString("url");
        String target   = call.getString("target", "both");

        if (imageUrl == null || imageUrl.isEmpty()) {
            call.reject("Missing required parameter: url");
            return;
        }

        // Network + WallpaperManager IO must run off the main thread.
        new Thread(() -> {
            try {
                // ── 1. Download the image ────────────────────────────────────
                URL url = new URL(imageUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true);
                conn.setConnectTimeout(15_000);
                conn.setReadTimeout(30_000);
                conn.connect();

                int status = conn.getResponseCode();
                if (status < 200 || status >= 300) {
                    call.reject("Image download failed with HTTP " + status);
                    return;
                }

                InputStream input  = conn.getInputStream();
                Bitmap       bitmap = BitmapFactory.decodeStream(input);
                input.close();
                conn.disconnect();

                if (bitmap == null) {
                    call.reject("Failed to decode image — unsupported format or empty response");
                    return;
                }

                // ── 2. Apply via WallpaperManager ────────────────────────────
                WallpaperManager wm = WallpaperManager.getInstance(getContext());

                switch (target) {
                    case "home":
                        wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
                        break;
                    case "lock":
                        wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
                        break;
                    default: // "both"
                        wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
                        wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
                        break;
                }

                bitmap.recycle();
                call.resolve();

            } catch (Exception e) {
                call.reject("Failed to set wallpaper: " + e.getMessage(), e);
            }
        }).start();
    }
}
