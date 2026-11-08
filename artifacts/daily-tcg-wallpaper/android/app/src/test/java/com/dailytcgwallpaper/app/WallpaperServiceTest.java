package com.dailytcgwallpaper.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import android.app.WallpaperManager;
import org.junit.Test;

/** Pure target-contract tests. These do not change device wallpapers. */
public class WallpaperServiceTest {
    @Test
    public void canonicalTargetsMapToAndroidFlags() {
        assertEquals(WallpaperManager.FLAG_SYSTEM, WallpaperService.Target.fromValue("home").flags);
        assertEquals(WallpaperManager.FLAG_LOCK, WallpaperService.Target.fromValue("lock").flags);
        assertEquals(WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK,
            WallpaperService.Target.fromValue("both").flags);
    }

    @Test
    public void rejectsUnknownAndDisplayLabelTargets() {
        assertThrows(IllegalArgumentException.class, () -> WallpaperService.Target.fromValue("Home Screen"));
        assertThrows(IllegalArgumentException.class, () -> WallpaperService.Target.fromValue(""));
        assertThrows(IllegalArgumentException.class, () -> WallpaperService.Target.fromValue(null));
    }
}
