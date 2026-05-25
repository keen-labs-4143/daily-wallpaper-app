import React from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { useGetWallpaper, getGetWallpaperQueryKey, useListFavorites, useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { generateGradient } from "@/lib/generateGradient";
import { ChevronLeft, Heart, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShimmerEffect } from "@/components/wallpaper/shimmer-effect";
import { useQueryClient } from "@tanstack/react-query";

export default function Preview() {
  const [match, params] = useRoute("/preview/:id");
  const [, setLocation] = useLocation();
  const id = match && params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: wallpaper, isLoading } = useGetWallpaper(id, { 
    query: { enabled: !!id, queryKey: getGetWallpaperQueryKey(id) } 
  });
  
  const { data: favorites = [] } = useListFavorites();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isFavorited = favorites.includes(id);

  const toggleFavorite = () => {
    const onMutate = () => {
      // Optimistic update
      queryClient.setQueryData(['/api/favorites'], (old: number[] = []) => 
        isFavorited ? old.filter(fid => fid !== id) : [...old, id]
      );
    };

    if (isFavorited) {
      removeFav.mutate({ wallpaperId: id }, { onMutate });
    } else {
      addFav.mutate({ wallpaperId: id }, { onMutate });
      // Heart pulse effect could be added here via state
    }
  };

  const handleDownload = () => {
    toast({ title: "Downloading...", description: "Saving to your device." });
  };

  const handleSetWallpaper = () => {
    toast({ title: "Feature coming soon", description: "Native wallpaper setting requires an app update." });
  };

  if (!match || (!isLoading && !wallpaper)) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center text-white/50">Card not found.</div>
      </MobileContainer>
    );
  }

  const gradient = wallpaper ? generateGradient(wallpaper.mood, wallpaper.style, wallpaper.id) : "#000";

  return (
    <MobileContainer>
      <div className="flex-1 relative flex flex-col bg-black">
        {/* Full screen background */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0" style={{ background: gradient }} />
          <ShimmerEffect active={true}>
            <div className="absolute inset-0 bg-black/20" />
          </ShimmerEffect>
        </motion.div>

        {/* Top Bar */}
        <div className="relative z-10 pt-safe-top pt-12 px-4 flex justify-between items-center">
          <button 
            onClick={() => setLocation("/today")}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={toggleFavorite}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
          >
            <Heart size={20} className={isFavorited ? "fill-primary text-primary" : ""} />
          </button>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 mt-auto p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-safe-bottom pb-8">
          {wallpaper && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold uppercase tracking-wider border border-white/10">
                  {wallpaper.mood}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold uppercase tracking-wider border border-white/10">
                  {wallpaper.style}
                </span>
              </div>
              <h1 className="text-4xl font-serif font-bold text-white mb-6 drop-shadow-lg leading-tight">
                {wallpaper.title}
              </h1>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleDownload}
                  variant="outline" 
                  className="h-14 rounded-2xl border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 text-white font-medium text-lg"
                >
                  <Download className="mr-2 w-5 h-5" /> Download
                </Button>
                <Button 
                  onClick={handleSetWallpaper}
                  className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  <Smartphone className="mr-2 w-5 h-5" /> Set Wall
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
