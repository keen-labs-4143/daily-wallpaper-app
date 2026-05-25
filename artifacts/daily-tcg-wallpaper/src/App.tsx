import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Onboarding from "@/pages/onboarding";
import Today from "@/pages/today";
import Preview from "@/pages/preview";
import Favorites from "@/pages/favorites";
import Premium from "@/pages/premium";
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

function Router() {
  return (
    <>
      <RouteGuard />
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/today" component={Today} />
        <Route path="/preview/:id" component={Preview} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/premium" component={Premium} />
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
