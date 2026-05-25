import React from "react";
import { Link, useLocation } from "wouter";
import { Calendar, Heart, Crown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { name: "Today", path: "/today", icon: Calendar },
    { name: "Favorites", path: "/favorites", icon: Heart },
    { name: "Premium", path: "/premium", icon: Crown },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <nav className="flex w-full max-w-[430px] items-center justify-around bg-background/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 pb-6">
        {tabs.map((tab) => {
          const isActive = location === tab.path || (tab.path === "/today" && location.startsWith("/preview"));
          const Icon = tab.icon;
          return (
            <Link key={tab.name} href={tab.path} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
