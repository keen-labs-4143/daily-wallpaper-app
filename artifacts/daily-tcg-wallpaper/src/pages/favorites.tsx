import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { WallpaperCard } from "@/components/wallpaper/wallpaper-card";
import { useListWallpapers, useListFavorites, getListWallpapersQueryKey, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkMinus, ChevronLeft } from "lucide-react";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { data: allWallpapers = [], isLoading: isLoadingWalls } = useListWallpapers({ query: { queryKey: getListWallpapersQueryKey() }});
  const { data: favorites = [], isLoading: isLoadingFavs } = useListFavorites({ query: { queryKey: getListFavoritesQueryKey() }});

  const isLoading = isLoadingWalls || isLoadingFavs;
  const wallpaperMap = new Map(allWallpapers.map(w => [w.id, w]));
  const favoriteCards = favorites.flatMap(id => {
    const w = wallpaperMap.get(id);
    return w ? [w] : [];
  });

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-6 pt-12">
        <div className="flex items-center gap-3 mb-2 -ml-1.5">
          <button
            onClick={() => setLocation("/today")}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-4xl font-serif font-bold text-white">Favorites</h1>
        </div>
        <p className="text-white/50 mb-8 font-medium pl-1">{favoriteCards.length} wallpapers</p>

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
