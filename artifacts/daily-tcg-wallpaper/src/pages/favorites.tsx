import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { WallpaperCard } from "@/components/wallpaper/wallpaper-card";
import { useListFavorites, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkMinus, ChevronLeft } from "lucide-react";
import { LOCAL_COMMUNITY_WALLPAPERS } from "@/lib/community-wallpaper";
import { formatWallpaperDate } from "@/lib/wallpaper";
import { useWallpaperFeed } from "@/hooks/use-wallpaper-feed";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { data: allWallpapers = [], isLoading: isLoadingWalls } = useWallpaperFeed();
  const { data: favorites = [], isLoading: isLoadingFavs } = useListFavorites({ query: { queryKey: getListFavoritesQueryKey() }});

  const [communityLikes] = useState<{ id: number; ts: number }[]>(() => {
    try {
      const stored = localStorage.getItem("dtcg:community-likes");
      if (!stored) return [];
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === "number") {
        return (parsed as number[]).map((id) => ({ id, ts: 0 }));
      }
      return parsed as { id: number; ts: number }[];
    } catch {
      return [];
    }
  });

  const [favTimestamps] = useState<Record<number, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("dtcg:fav-timestamps") || "{}") as Record<number, number>;
    } catch {
      return {};
    }
  });

  const isLoading = isLoadingWalls || isLoadingFavs;

  // Build unified card list with timestamps, then sort newest first
  const wallpaperMap = new Map(allWallpapers.map(w => [w.id, w]));
  const communityMap = new Map(LOCAL_COMMUNITY_WALLPAPERS.map(w => [w.id, w]));

  type FavCard = {
    id: number;
    title: string;
    mood: string;
    style: string;
    imageUrl: string | null;
    releaseDate: string | null;
    description: string | null;
    sourceCredit: string | null;
    ts: number;
  };

  const dbCards: FavCard[] = favorites.flatMap((id, index) => {
    const w = wallpaperMap.get(id);
    if (!w) return [];
    // Use tracked timestamp if available, otherwise fall back to API order position
    const ts = favTimestamps[id] ?? (Date.now() - index * 1000 * 60 * 60 * 24);
    return [{ ...w, ts }];
  });

  const communityCards: FavCard[] = communityLikes.flatMap(({ id, ts }) => {
    const w = communityMap.get(id);
    return w ? [{ ...w, ts }] : [];
  });

  const favoriteCards = [...dbCards, ...communityCards].sort((a, b) => b.ts - a.ts);

  return (
    <MobileContainer>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 -ml-1.5">
          <button
            onClick={() => setLocation("/today")}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-4xl font-serif font-bold text-white">Favorites</h1>
        </div>
        <p className="text-white/50 mt-1 font-medium pl-1">{favoriteCards.length} wallpapers</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-6 pt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-[9/16] rounded-2xl bg-white/5" />)}
          </div>
        ) : favoriteCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-32 text-center opacity-50">
            <BookmarkMinus size={48} className="mb-4" />
            <p className="text-lg font-medium">Nothing saved yet</p>
            <p className="text-sm">Tap the heart on any wallpaper to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favoriteCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setLocation(`/preview/${card.id}`)}
                className="cursor-pointer"
              >
                <WallpaperCard
                  id={card.id}
                  title={card.title}
                  mood={card.mood}
                  style={card.style}
                  imageUrl={card.imageUrl}
                   subtitle={`${formatWallpaperDate(card.releaseDate)} · ${card.sourceCredit ?? "Source credit unavailable"}`}
                  className="rounded-2xl shadow-lg border-white/5 hover:border-primary/50 transition-colors"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
