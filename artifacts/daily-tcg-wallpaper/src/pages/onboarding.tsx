import React, { useState } from "react";
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

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { completeOnboarding } = useOnboarding();

  const nextStep = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      setLocation("/today");
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-secondary/20 opacity-50" />
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

        <div className="relative z-10 w-full flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center space-y-6"
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

        <div className="relative z-10 w-full space-y-8 pb-12">
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className="w-full h-14 rounded-2xl text-lg font-medium bg-primary hover:bg-primary/90 text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all active:scale-95"
          >
            {step === slides.length - 1 ? "Start Collecting" : "Continue"}
          </Button>
          
          {step < slides.length - 1 && (
            <button
              onClick={() => {
                completeOnboarding();
                setLocation("/today");
              }}
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
