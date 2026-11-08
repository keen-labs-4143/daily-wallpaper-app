package com.dailytcgwallpaper.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void load() {
        registerPlugin(NativeWallpaperPlugin.class);
        super.load();
    }
}
