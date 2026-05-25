import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { WallpaperCard } from "@/components/wallpaper/wallpaper-card";
import { LockScreenMockup } from "@/components/wallpaper/lock-screen-mockup";
import { Button } from "@/components/ui/button";
import { useGetTodayWallpaper, getGetTodayWallpaperQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Today() {
  const { data: wallpaper, isLoading } = useGetTodayWallpaper({ query: { queryKey: getGetTodayWallpaperQueryKey() } });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Downloading...",
      description: "Saving high-res wallpaper to your device.",
    });
    setTimeout(() => {
      toast({
        title: "Saved successfully",
        description: "Check your photos gallery.",
      });
    }, 1500);
  };

  const handleSetWallpaper = () => {
    toast({
      title: "Feature coming soon",
      description: "Native wallpaper setting requires an app update.",
    });
  };

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="pt-12 px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-serif font-bold text-white mb-1">Daily Drop</h1>
            <p className="text-white/60 mb-8 font-medium tracking-wide uppercase text-sm">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            {isLoading || !wallpaper ? (
              <Skeleton className="w-full aspect-[9/16] rounded-3xl bg-white/5" />
            ) : (
              <div
                className="cursor-pointer active:scale-[0.98] transition-transform duration-300"
                onClick={() => setLocation(`/preview/${wallpaper.id}`)}
              >
                <WallpaperCard
                  id={wallpaper.id}
                  title={wallpaper.title}
                  mood={wallpaper.mood}
                  style={wallpaper.style}
                  shimmer={true}
                />
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <Download className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button
                onClick={handleSetWallpaper}
                className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                <Smartphone className="mr-2 h-4 w-4" /> Set
              </Button>
            </div>
          </motion.div>

          {wallpaper && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16 pt-8 border-t border-white/10"
            >
              <h2 className="text-center text-sm font-medium text-white/50 uppercase tracking-widest mb-8">
                Lock Screen Preview
              </h2>
              <LockScreenMockup mood={wallpaper.mood} style={wallpaper.style} id={wallpaper.id} />
            </motion.div>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
