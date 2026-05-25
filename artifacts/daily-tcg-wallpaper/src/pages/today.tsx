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
import { Layers, Menu } from "lucide-react";
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

  const thisWeek = [...allWallpapers]
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, 7);

  const toggleFavorite = (id: number) => {
    const isFav = favorites.includes(id);
    queryClient.setQueryData(getListFavoritesQueryKey(), (old: number[] = []) =>
      isFav ? old.filter((f) => f !== id) : [...old, id]
    );
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* Header */}
        <div className="pt-12 px-5 pb-0 flex-shrink-0 flex items-center gap-3">
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
        <div className="flex-shrink-0 px-5 mt-4">
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
                className="flex flex-col items-center justify-center pt-32 px-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                  <Layers size={28} className="text-white/30" />
                </div>
                <p className="text-white/60 font-semibold text-lg mb-2">Your collection</p>
                <p className="text-white/30 text-sm leading-relaxed">
                  Save your favourite wallpapers and they will appear here.
                </p>
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
                    subtitle={`by ${w.author}`}
                    isFavorited={favorites.includes(w.id)}
                    onTap={() => {}}
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
