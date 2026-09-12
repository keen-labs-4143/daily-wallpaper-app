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
import {
  cancelNotifications,
  hasNotificationPermission,
} from "@/lib/notifications";

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
  const { settings, set } = useSettings();

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

  // If Android permission is revoked outside the app, reconcile the app's
  // preference and pending notifications when the WebView becomes active.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const reconcilePermission = async () => {
      if (!settings.notifications) return;
      try {
        if (await hasNotificationPermission()) return;
        await cancelNotifications();
        set("notifications", false);
      } catch (error) {
        console.error("[notifications] Resume permission check failed", { error });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void reconcilePermission();
      }
    };

    void reconcilePermission();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", reconcilePermission);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", reconcilePermission);
    };
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
