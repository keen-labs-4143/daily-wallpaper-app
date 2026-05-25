import React from "react";
import { cn } from "@/lib/utils";

export function ShimmerEffect({ active = true, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full rounded-[inherit] overflow-hidden group">
      {children}
      {active && (
        <>
          <div className="absolute inset-0 pointer-events-none holo-overlay opacity-30 mix-blend-color-dodge transition-opacity duration-500" />
          <div className="absolute inset-0 pointer-events-none shimmer-mask bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_0_40px_rgba(255,255,255,0.1)]" />
        </>
      )}
    </div>
  );
}
