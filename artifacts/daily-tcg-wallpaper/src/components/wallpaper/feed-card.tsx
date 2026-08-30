import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { generateGradient } from "@/lib/generateGradient";
import { ShimmerEffect } from "./shimmer-effect";
import { cn } from "@/lib/utils";

interface FeedCardProps {
  id: number;
  title: string;
  mood: string;
  style: string;
  imageUrl?: string | null;
  subtitle?: string;
  shimmer?: boolean;
  isFavorited?: boolean;
  onTap?: () => void;
  onFavorite?: () => void;
  index?: number;
}

export function FeedCard({
  id,
  title,
  mood,
  style,
  imageUrl,
  subtitle,
  shimmer = false,
  isFavorited = false,
  onTap,
  onFavorite,
  index = 0,
}: FeedCardProps) {
  const gradient = generateGradient(mood, style, id);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400);
    onFavorite?.();
  };

  const showImage = !!imageUrl && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="w-full rounded-2xl overflow-hidden border border-white/8 shadow-xl cursor-pointer active:scale-[0.985] transition-transform duration-200"
      onClick={onTap}
    >
      {/* Image area */}
      <div
        className="w-full aspect-[3/4] relative overflow-hidden"
        style={{ background: gradient }}
      >
        {showImage && (
          <img
            src={imageUrl}
            alt={title}
            onError={() => {
              console.warn("[wallpaper] Image failed to load", {
                id,
                url: imageUrl,
                context: "FeedCard",
              });
              setImgError(true);
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <ShimmerEffect active={shimmer && !showImage}>
          <div className="absolute inset-0" />
        </ShimmerEffect>
        {/* subtle vignette at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Caption strip */}
      <div className="flex items-center justify-between gap-3 bg-[#111114] px-4 py-3">
        <div className="min-w-0">
          <p className="text-white font-semibold text-[15px] leading-snug truncate">{title}</p>
          {subtitle && (
            <p className="text-white/40 text-xs mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <button
          onClick={handleFavorite}
          className="flex-shrink-0 p-1.5 rounded-full active:scale-90 transition-transform"
          aria-label="Favorite"
        >
          <Heart
            size={20}
            className={cn(
              "transition-all duration-200",
              isFavorited ? "fill-rose-500 text-rose-500" : "text-white/40",
              heartAnimating && "scale-125"
            )}
          />
        </button>
      </div>
    </motion.div>
  );
}
