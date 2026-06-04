import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import {
  useGetWallpaper,
  getGetWallpaperQueryKey,
  useListFavorites,
  useAddFavorite,
  useRemoveFavorite,
  getListFavoritesQueryKey,
} from "@workspace/api-client-react";
import { generateGradient } from "@/lib/generateGradient";
import { ShimmerEffect } from "@/components/wallpaper/shimmer-effect";
import { ChevronLeft, Share2, Plus, Heart, Smartphone, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Preview() {
  const [match, params] = useRoute("/preview/:id");
  const [, setLocation] = useLocation();
  const id = match && params?.id ? parseInt(params.id, 10) : 0;

  const { data: wallpaper, isLoading } = useGetWallpaper(id, {
    query: { enabled: !!id, queryKey: getGetWallpaperQueryKey(id) },
  });
  const { data: favorites = [] } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() },
  });
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [heartAnimating, setHeartAnimating] = useState(false);

  const isFavorited = favorites.includes(id);

  const toggleFavorite = () => {
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400);
    queryClient.setQueryData(getListFavoritesQueryKey(), (old: number[] = []) =>
      isFavorited ? old.filter((fid) => fid !== id) : [...old, id]
    );
    if (isFavorited) {
      removeFav.mutate({ wallpaperId: id });
    } else {
      addFav.mutate({ wallpaperId: id });
    }
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Wallpaper added to your downloads." });
  };

  const handleSet = () => {
    toast({ title: "Coming soon", description: "Native wallpaper setting requires an app update." });
  };

  const handleShare = () => {
    toast({ title: "Share", description: "Sharing link copied to clipboard." });
  };

  if (!match || (!isLoading && !wallpaper)) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center text-white/50">
          Wallpaper not found.
        </div>
      </MobileContainer>
    );
  }

  const gradient = wallpaper
    ? generateGradient(wallpaper.mood, wallpaper.style, wallpaper.id)
    : "linear-gradient(135deg, #111 0%, #000 100%)";

  return (
    <MobileContainer>
      <motion.div
        className="flex-1 relative overflow-hidden bg-black"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Full-screen wallpaper */}
        <div className="absolute inset-0 z-0" style={{ background: gradient }}>
          {wallpaper?.imageUrl && (
            <img
              src={wallpaper.imageUrl}
              alt={wallpaper.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <ShimmerEffect active={isLoading}>
            <div className="absolute inset-0" />
          </ShimmerEffect>
        </div>

        {/* Subtle top scrim for button legibility */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/40 to-transparent z-10 pointer-events-none" />

        {/* Subtle bottom scrim for button legibility */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />

        {/* Back button — top left */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          onClick={() => setLocation("/today")}
          className="absolute top-12 left-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/15 active:scale-90 transition-transform"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </motion.button>

        {/* Right-side FABs */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="absolute right-4 z-20 flex flex-col items-center gap-3"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px) + 20px)" }}
        >
          {/* Share */}
          <FabButton onClick={handleShare} aria-label="Share">
            <Share2 size={18} />
          </FabButton>

          {/* 4K quality badge */}
          <FabButton onClick={() => toast({ title: "Quality", description: "This wallpaper is rendered at 4K resolution." })} aria-label="4K quality">
            <span className="text-[11px] font-extrabold tracking-tight leading-none">4K</span>
          </FabButton>

          {/* Favorite */}
          <FabButton onClick={toggleFavorite} aria-label="Favourite">
            <Heart
              size={18}
              className={cn(
                "transition-all duration-200",
                isFavorited ? "fill-rose-500 text-rose-500" : "",
                heartAnimating && "scale-125"
              )}
            />
          </FabButton>

          {/* Plus / add */}
          <FabButton onClick={() => toast({ title: "Added to collection", description: "Saved to your collection." })} aria-label="Add to collection" large>
            <Plus size={22} />
          </FabButton>
        </motion.div>

        {/* Wallpaper title chip — just above bottom bar */}
        {wallpaper && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="absolute left-4 z-20 right-20"
            style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px) + 22px)" }}
          >
            <p className="text-white font-serif font-bold text-2xl drop-shadow-lg leading-tight">
              {wallpaper.title}
            </p>
            <p className="text-white/60 text-xs mt-1 font-medium uppercase tracking-wider">
              {wallpaper.mood} · {wallpaper.style}
            </p>
          </motion.div>
        )}

        {/* Bottom action bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="absolute bottom-0 inset-x-0 z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
        >
          <div className="flex border-t border-white/10 bg-black/70 backdrop-blur-2xl">
            <button
              onClick={handleSet}
              className="flex-1 flex items-center justify-center gap-2 py-5 text-white/90 font-semibold text-[15px] hover:bg-white/5 transition-colors active:bg-white/10 border-r border-white/10"
            >
              <Smartphone size={17} />
              Set wallpaper
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-5 text-white/90 font-semibold text-[15px] hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <Download size={17} />
              Save wallpaper
            </button>
          </div>
        </motion.div>
      </motion.div>
    </MobileContainer>
  );
}

function FabButton({
  children,
  onClick,
  "aria-label": ariaLabel,
  large = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
  large?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white border border-white/15 active:scale-90 transition-transform shadow-lg",
        large ? "w-12 h-12" : "w-10 h-10"
      )}
    >
      {children}
    </button>
  );
}
