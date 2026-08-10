import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { SideDrawer } from "@/components/layout/side-drawer";
import { FeedCard } from "@/components/wallpaper/feed-card";
import {
  useListWallpapers,
  useListFavorites,
  useAddFavorite,
  useRemoveFavorite,
  getListFavoritesQueryKey,
  getListWallpapersQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { COMMUNITY_WALLPAPERS } from "@/data/community-wallpapers";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "week" | "collection" | "community";

export default function Today() {
  const [activeTab, setActiveTab] = useState<Tab>("week");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: allWallpapers = [], isLoading } = useListWallpapers({
    query: { queryKey: getListWallpapersQueryKey() },
  });
  const { data: favorites = [] } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() },
  });
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const sorted = [...allWallpapers].sort(
    (a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "")
  );

  const thisWeek = sorted.slice(0, 7);

  // Full archive grouped by "Month YYYY"
  const archiveGroups = sorted.reduce<Record<string, typeof sorted>>((acc, w) => {
    const label = w.releaseDate
      ? new Date(w.releaseDate + "T00:00:00").toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown";
    (acc[label] ??= []).push(w);
    return acc;
  }, {});

  const toggleFavorite = (id: number) => {
    const isFav = favorites.includes(id);
    queryClient.setQueryData(getListFavoritesQueryKey(), (old: number[] = []) =>
      isFav ? old.filter((f) => f !== id) : [id, ...old]
    );
    try {
      const ts = JSON.parse(localStorage.getItem("dtcg:fav-timestamps") || "{}") as Record<number, number>;
      if (isFav) { delete ts[id]; } else { ts[id] = Date.now(); }
      localStorage.setItem("dtcg:fav-timestamps", JSON.stringify(ts));
    } catch { /* ignore */ }
    if (isFav) {
      removeFav.mutate({ wallpaperId: id });
    } else {
      addFav.mutate({ wallpaperId: id });
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "week", label: "This week" },
    { key: "collection", label: "Our collection" },
    { key: "community", label: "Community" },
  ];

  return (
    <MobileContainer>
      <div className="h-[100dvh] flex flex-col overflow-hidden relative">
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* Header + Tab bar — sticky */}
        <div className="sticky top-0 z-20 flex-shrink-0 bg-background/90 backdrop-blur-xl border-b border-white/5">
          <div className="pt-12 px-5 pb-0 flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 -ml-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-serif font-bold text-white tracking-tight">
              Daily TCG Wallpaper
            </h1>
          </div>

          {/* Tab bar */}
          <div className="px-5 mt-4">
            <div className="flex gap-0 border-b border-white/8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative pb-3 pr-5 text-sm font-semibold transition-colors duration-200 whitespace-nowrap",
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-5 h-[2px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Feed content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
          <AnimatePresence mode="wait">
            {activeTab === "week" && (
              <motion.div
                key="week"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pt-4 space-y-4"
              >
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="w-full aspect-[3/4] rounded-2xl bg-white/5" />
                    ))
                  : thisWeek.map((w, i) => (
                      <FeedCard
                        key={w.id}
                        id={w.id}
                        title={w.title}
                        mood={w.mood}
                        style={w.style}
                        imageUrl={w.imageUrl}
                        subtitle={new Date(w.releaseDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                        shimmer={i === 0}
                        isFavorited={favorites.includes(w.id)}
                        onTap={() => setLocation(`/preview/${w.id}`)}
                        onFavorite={() => toggleFavorite(w.id)}
                        index={i}
                      />
                    ))}
              </motion.div>
            )}

            {activeTab === "collection" && (
              <motion.div
                key="collection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pt-4 pb-4 space-y-6"
              >
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="w-full aspect-[3/4] rounded-2xl bg-white/5" />
                    ))
                  : Object.entries(archiveGroups).map(([month, group]) => (
                      <div key={month}>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
                          {month}
                        </p>
                        <div className="space-y-4">
                          {group.map((w, i) => (
                            <FeedCard
                              key={w.id}
                              id={w.id}
                              title={w.title}
                              mood={w.mood}
                              style={w.style}
                              imageUrl={w.imageUrl}
                              subtitle={`${w.mood} · ${w.style}`}
                              isFavorited={favorites.includes(w.id)}
                              onTap={() => setLocation(`/preview/${w.id}`)}
                              onFavorite={() => toggleFavorite(w.id)}
                              index={i}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
              </motion.div>
            )}

            {activeTab === "community" && (
              <motion.div
                key="community"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pt-4 space-y-4"
              >
                {COMMUNITY_WALLPAPERS.map((w, i) => (
                  <FeedCard
                    key={w.id}
                    id={w.id}
                    title={w.title}
                    mood={w.mood}
                    style={w.style}
                    imageUrl={w.imageUrl}
                    subtitle={`by ${w.author}`}
                    isFavorited={favorites.includes(w.id)}
                    onTap={() => setLocation(`/preview/${w.id}`)}
                    onFavorite={() => toggleFavorite(w.id)}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </MobileContainer>
  );
}
