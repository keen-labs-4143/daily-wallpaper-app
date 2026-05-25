import React from "react";

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex justify-center overflow-hidden">
      <div className="w-full max-w-[430px] bg-background relative flex flex-col min-h-[100dvh] desktop:border-x desktop:border-white/10 desktop:shadow-2xl desktop:shadow-primary/10">
        {children}
      </div>
    </div>
  );
}
