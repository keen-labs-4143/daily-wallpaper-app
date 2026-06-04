import React, { useState } from "react";
import { generateGradient } from "@/lib/generateGradient";
import { ShimmerEffect } from "./shimmer-effect";
import { cn } from "@/lib/utils";

interface WallpaperCardProps {
  id: number;
  title: string;
  mood: string;
  style: string;
  imageUrl?: string;
  shimmer?: boolean;
  className?: string;
}

export function WallpaperCard({ id, title, mood, style, imageUrl, shimmer, className }: WallpaperCardProps) {
  const gradient = generateGradient(mood, style, id);
  const [imgError, setImgError] = useState(false);
  const showImage = !!imageUrl && !imgError;

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden aspect-[9/16] shadow-2xl transition-all duration-300 border border-white/10",
        className
      )}
      style={{ background: gradient }}
    >
      {showImage && (
        <img
          src={imageUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <ShimmerEffect active={shimmer && !showImage}>
        <div className="absolute inset-0 flex flex-col justify-end p-6">
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
      {/* Always show the bottom overlay and labels when image is present */}
      {showImage && (
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-base font-serif font-bold text-white leading-tight drop-shadow-md line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
