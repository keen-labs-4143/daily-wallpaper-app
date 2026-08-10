import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, Download } from "lucide-react";

const slides = [
  {
    title: "A Daily Ritual",
    description: "Every midnight, unwrap a completely unique, trading-card-inspired wallpaper.",
    icon: Sparkles,
  },
  {
    title: "Collect & Keep",
    description: "Build your personal gallery of rare, high-definition digital artifacts.",
    icon: ImageIcon,
  },
  {
    title: "Yours Forever",
    description: "Download in full resolution, ad-free. Let your lock screen shine.",
    icon: Download,
  },
];

const SWIPE_THRESHOLD = 40;
const SWIPE_ANGLE_LOCK = 30; // degrees — ignore swipes that are mostly vertical

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [, setLocation] = useLocation();
  const { completeOnboarding } = useOnboarding();

  // Pointer tracking refs
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = (next: number, dir: number) => {
    if (next < 0 || next >= slides.length) return;
    setDirection(dir);
    setStep(next);
  };

  const finish = () => {
    completeOnboarding();
    setLocation("/today");
  };

  const nextStep = () => {
    if (step < slides.length - 1) goTo(step + 1, 1);
    else finish();
  };

  // Pointer-event swipe handling
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;

    // Ignore if the gesture is more vertical than horizontal
    const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
    const isHorizontal = angle < SWIPE_ANGLE_LOCK || angle > 180 - SWIPE_ANGLE_LOCK;

    if (isHorizontal && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) goTo(step + 1, 1);   // swipe left → next
      else goTo(step - 1, -1);           // swipe right → prev
    }
  };

  const handlePointerCancel = () => {
    pointerStart.current = null;
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-secondary/20 opacity-50" />
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

        {/* Swipe area */}
        <div
          className="relative z-10 w-full flex-1 flex flex-col justify-center overflow-hidden"
          // Allow browser to handle vertical scroll; JS captures horizontal swipes
          style={{ touchAction: "pan-y" }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center space-y-6 select-none"
              // Prevent the motion element itself from triggering pointer-captured drags
              style={{ touchAction: "pan-y" }}
            >
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl">
                {React.createElement(slides[step].icon, { className: "w-12 h-12 text-primary" })}
              </div>
              <h1 className="text-3xl font-serif font-bold tracking-tight text-white drop-shadow-lg">
                {slides[step].title}
              </h1>
              <p className="text-lg text-white/70 max-w-[280px] leading-relaxed">
                {slides[step].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots + CTA */}
        <div className="relative z-10 w-full space-y-8 pb-12">
          {/* Page indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className="w-full h-14 rounded-2xl text-lg font-medium bg-primary hover:bg-primary/90 text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all active:scale-95"
          >
            {step === slides.length - 1 ? "Explore Wallpapers" : "Continue"}
          </Button>

          {step < slides.length - 1 && (
            <button
              onClick={finish}
              className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
