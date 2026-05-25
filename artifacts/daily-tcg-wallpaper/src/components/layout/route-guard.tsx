import { useEffect } from "react";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function App() {
  const [location, setLocation] = useLocation();
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    if (location === "/" && hasCompletedOnboarding) {
      setLocation("/today");
    } else if (location !== "/" && !hasCompletedOnboarding) {
      setLocation("/");
    }
  }, [location, hasCompletedOnboarding, setLocation]);

  return null;
}
