import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import {
  useListWallpapers,
  getListWallpapersQueryKey,
  useListFavorites,
  useAddFavorite,
  useRemoveFavorite,
  getListFavoritesQueryKey,
} from "@workspace/api-client-react";
import { generateGradient } from "@/lib/generateGradient";
import { ChevronLeft, Share2, Plus, Heart, Smartphone, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Share } from "@capacitor/share";

const slideVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.55, 0, 1, 0.45] as const },
  }),
};

export default function Preview() {
  const [match, params] = useRoute("/preview/:id");
  const [, setLocation] = useLocation();
  const urlId = match && params?.id ? parseInt(params.id, 10) : 0;

  const { data: allWallpapers = [], isLoading } = useListWallpapers({
    query: { queryKey: getListWallpapersQueryKey() },
  });
  const { data: favorites = [] } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() },
  });
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [direction, setDirection] = useState(0);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [setWallpaperOpen, setSetWallpaperOpen] = useState(false);

  // Sync index from URL once wallpapers are loaded
  useEffect(() => {
    if (allWallpapers.length && urlId) {
      const idx = allWallpapers.findIndex((w) => w.id === urlId);
      if (idx >= 0 && currentIndex === -1) setCurrentIndex(idx);
    }
  }, [allWallpapers, urlId, currentIndex]);

  const wallpaper = currentIndex >= 0 ? allWallpapers[currentIndex] : undefined;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allWallpapers.length - 1;

  const navigate = (dir: number) => {
    const next = currentIndex + dir;
    if (next < 0 || next >= allWallpapers.length) return;
    setDirection(dir);
    setCurrentIndex(next);
    setLocation(`/preview/${allWallpapers[next].id}`, { replace: true } as never);
  };

  const isFavorited = wallpaper ? favorites.includes(wallpaper.id) : false;

  const toggleFavorite = () => {
    if (!wallpaper) return;
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400);
    queryClient.setQueryData(getListFavoritesQueryKey(), (old: number[] = []) =>
      isFavorited ? old.filter((fid) => fid !== wallpaper.id) : [...old, wallpaper.id]
    );
    if (isFavorited) {
      removeFav.mutate({ wallpaperId: wallpaper.id });
    } else {
      addFav.mutate({ wallpaperId: wallpaper.id });
    }
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Wallpaper added to your downloads." });
  };

  const handleSet = () => setSetWallpaperOpen(true);

  const handleSetTarget = (target: string) => {
    setSetWallpaperOpen(false);
    toast({ title: "Wallpaper set", description: `Applied to ${target}.` });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: wallpaper?.title ?? "Daily TCG Wallpaper",
        text: `Check out "${wallpaper?.title ?? "this wallpaper"}" on Daily TCG Wallpaper`,
        url: wallpaper?.imageUrl ?? window.location.href,
        dialogTitle: "Share wallpaper",
      });
    } catch {
      toast({ title: "Share", description: "Sharing is not available on this device." });
    }
  };

  if (!match || (!isLoading && allWallpapers.length && currentIndex < 0)) {
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
        onPanEnd={(_, info) => {
          if (setWallpaperOpen) return;
          const { offset, velocity } = info;
          const swipe = Math.abs(offset.x) > 60 || Math.abs(velocity.x) > 400;
          if (!swipe) return;
          if (offset.x < 0) navigate(1);
          else navigate(-1);
        }}
      >
        {/* Sliding wallpaper image layer */}
        <AnimatePresence custom={direction} mode="sync">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 z-0"
            style={{ background: gradient }}
          >
            {wallpaper?.imageUrl && (
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.title}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Scrims — always on top of image, below chrome */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          onClick={() => window.history.back()}
          className="absolute top-12 left-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/15 active:scale-90 transition-transform"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </motion.button>

        {/* Dot indicator */}
        {allWallpapers.length > 1 && (
          <div className="absolute top-14 inset-x-0 z-20 flex justify-center gap-1.5 pointer-events-none">
            {allWallpapers.slice(
              Math.max(0, currentIndex - 3),
              Math.min(allWallpapers.length, currentIndex + 4)
            ).map((_, relI) => {
              const absI = Math.max(0, currentIndex - 3) + relI;
              return (
                <div
                  key={absI}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    absI === currentIndex
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/35"
                  )}
                />
              );
            })}
          </div>
        )}

        {/* Right-side FABs */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="absolute right-4 z-20 flex flex-col items-center gap-3"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px) + 20px)" }}
        >
          <FabButton onClick={handleShare} aria-label="Share">
            <Share2 size={18} />
          </FabButton>
          <FabButton
            onClick={() => toast({ title: "Quality", description: "This wallpaper is rendered at 4K resolution." })}
            aria-label="4K quality"
          >
            <span className="text-[11px] font-extrabold tracking-tight leading-none">4K</span>
          </FabButton>
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
          <FabButton
            onClick={() => toast({ title: "Added to collection", description: "Saved to your collection." })}
            aria-label="Add to collection"
            large
          >
            <Plus size={22} />
          </FabButton>
        </motion.div>

        {/* Wallpaper title — fades when wallpaper changes */}
        <div
          className="absolute left-4 z-20 right-20"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px) + 22px)" }}
        >
          <AnimatePresence mode="wait">
            {wallpaper && (
              <motion.div
                key={wallpaper.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-white font-serif font-bold text-2xl drop-shadow-lg leading-tight">
                  {wallpaper.title}
                </p>
                <p className="text-white/60 text-xs mt-1 font-medium uppercase tracking-wider">
                  {wallpaper.mood} · {wallpaper.style}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

        {/* Set wallpaper dialog */}
        <AnimatePresence>
          {setWallpaperOpen && (
            <>
              <motion.div
                key="swbdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-30 bg-black/40"
                onClick={() => setSetWallpaperOpen(false)}
              />
              <motion.div
                key="swcard"
                initial={{ opacity: 0, scale: 0.93, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 16 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute z-40 inset-x-6 rounded-2xl bg-[#3a3a3e]/90 backdrop-blur-2xl p-5 shadow-2xl"
                style={{ top: "38%" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="text-white font-semibold text-[17px]">Set wallpaper</p>
                  <button
                    onClick={() => setSetWallpaperOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Home Screen",  value: "Home Screen" },
                    { label: "Lock Screen",  value: "Lock Screen" },
                    { label: "Both Screens", value: "Home Screen and Lock Screen" },
                  ].map(({ label, value }) => (
                    <button
                      key={label}
                      onClick={() => handleSetTarget(value)}
                      className="w-full py-3.5 rounded-full bg-[#1c1c22] text-white font-semibold text-[15px] hover:bg-[#26262e] active:scale-[0.97] transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
