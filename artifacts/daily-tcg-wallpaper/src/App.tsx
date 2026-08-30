import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Onboarding from "@/pages/onboarding";
import Today from "@/pages/today";
import Preview from "@/pages/preview";
import Favorites from "@/pages/favorites";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import RouteGuard from "@/components/layout/route-guard";
import { useSettings } from "@/hooks/use-settings";
import { listWallpapers, setBaseUrl } from "@workspace/api-client-react";
import { requestAndScheduleNotification } from "@/lib/notifications";
import { normalizeWallpaperFeed } from "@/lib/wallpaper";

// On a native Capacitor build the web bundle is served from https://localhost,
// so relative /api/... URLs would hit the device loopback instead of the
// production server. VITE_API_BASE_URL is set at build time for Android builds
// (e.g. "https://<repl-domain>") and absent for web/Replit builds. Generated
// requests already contain /api, so this value must be the root origin.
if (Capacitor.isNativePlatform()) {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!apiBase) {
    console.error("[wallpaper] Native API origin is missing", {
      requestPath: "/api/wallpapers",
    });
  }
  setBaseUrl(apiBase ?? null);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function NotificationBridge() {
  const [, setLocation] = useLocation();
  const { settings } = useSettings();

  // Tapping a notification opens Today's Wallpaper.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        const route = (action.notification.extra as { route?: string } | null)?.route;
        setLocation(route ?? "/today");
      }
    );
    return () => {
      void listenerPromise.then((l) => l.remove());
    };
  }, [setLocation]);

  // Keep the rolling notification schedule fresh with real wallpaper content
  // whenever the app is opened and notifications are enabled.
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !settings.notifications) return;
    void listWallpapers()
      .then((wallpapers) =>
        requestAndScheduleNotification(
          normalizeWallpaperFeed(wallpapers, "notification refresh GET /api/wallpapers"),
        ),
      )
      .catch((error) => {
        console.error("[wallpaper] Notification feed refresh failed", {
          request: "GET /api/wallpapers",
          error,
        });
      });
  }, [settings.notifications]);

  return null;
}

function Router() {
  return (
    <>
      <RouteGuard />
      <NotificationBridge />
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/today" component={Today} />
        <Route path="/preview/:id" component={Preview} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
