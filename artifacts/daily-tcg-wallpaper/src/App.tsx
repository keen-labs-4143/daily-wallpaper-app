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
