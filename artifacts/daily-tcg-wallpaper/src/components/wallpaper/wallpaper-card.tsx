import React from "react";
import { generateGradient } from "@/lib/generateGradient";
import { ShimmerEffect } from "./shimmer-effect";
import { Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WallpaperCardProps {
  id: number;
  title: string;
  mood: string;
  style: string;
  isPremium?: boolean;
  shimmer?: boolean;
  className?: string;
  locked?: boolean;
}

export function WallpaperCard({ id, title, mood, style, isPremium, shimmer, className, locked }: WallpaperCardProps) {
  const gradient = generateGradient(mood, style, id);

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden aspect-[9/16] shadow-2xl transition-all duration-300 border border-white/10",
        className
      )}
      style={{ background: gradient }}
    >
      <ShimmerEffect active={shimmer}>
        <div className={cn("absolute inset-0 flex flex-col justify-end p-6", locked && "blur-md scale-105")}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-md">
              {title}
            </h3>
            <div className="flex gap-2 text-xs font-medium uppercase tracking-wider">
              <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 border border-white/10">
                {mood}
              </span>
              <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 border border-white/10">
                {style}
              </span>
            </div>
          </div>
        </div>
      </ShimmerEffect>

      {isPremium && locked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 border border-accent/30 shadow-[0_0_30px_rgba(255,183,0,0.3)]">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <p className="text-white font-serif font-bold text-lg flex items-center gap-2">
            Premium Drop <Crown className="w-4 h-4 text-accent" />
          </p>
        </div>
      )}
    </div>
  );
}
