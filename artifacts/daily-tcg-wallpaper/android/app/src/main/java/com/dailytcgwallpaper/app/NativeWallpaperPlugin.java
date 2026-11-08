package com.dailytcgwallpaper.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;

@CapacitorPlugin(name = "NativeWallpaper")
public class NativeWallpaperPlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void setWallpaper(PluginCall call) {
        final String assetPath = call.getString("assetPath");
        final WallpaperService.Target target;
        try {
            target = WallpaperService.Target.fromValue(call.getString("target"));
        } catch (IllegalArgumentException error) {
            call.reject(error.getMessage(), "INVALID_TARGET", error);
            return;
        }
        try {
            executor.execute(() -> {
                try {
                    int wallpaperId = new WallpaperService(getContext()).applyAsset(assetPath, target);
                    JSObject result = new JSObject();
                    result.put("applied", true);
                    result.put("target", target.value);
                    result.put("wallpaperId", wallpaperId);
                    call.resolve(result);
                } catch (SecurityException error) {
                    call.reject("Android blocked the wallpaper change. Check device or administrator restrictions.",
                        "WALLPAPER_BLOCKED", error);
                } catch (UnsupportedOperationException error) {
                    call.reject("This device does not support wallpaper changes.", "UNSUPPORTED_DEVICE", error);
                } catch (IllegalArgumentException error) {
                    call.reject("The selected wallpaper image is invalid.", "INVALID_IMAGE", error);
                } catch (IOException error) {
                    call.reject("The wallpaper image could not be opened or applied. Please try again.",
                        "WALLPAPER_IO_ERROR", error);
                } catch (OutOfMemoryError error) {
                    // Do not downsample silently or crash on a full-resolution decode.
                    call.reject("Not enough memory to apply the full-resolution image. Close other apps and try again.",
                        "WALLPAPER_MEMORY_ERROR");
                } catch (RuntimeException error) {
                    call.reject("Android could not apply the wallpaper. Please try again.", "WALLPAPER_FAILED", error);
                }
            });
        } catch (RejectedExecutionException error) {
            call.reject("The wallpaper service is closing. Reopen the app and try again.",
                "WALLPAPER_SERVICE_CLOSED", error);
        }
    }

    @Override
    protected void handleOnDestroy() {
        // Let an already-running manual operation finish; no work is scheduled.
        executor.shutdown();
    }
}
