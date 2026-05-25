import React from "react";
import { motion } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Crown, Sparkles, Image as ImageIcon, SlidersHorizontal, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Premium() {
  const { toast } = useToast();

  const features = [
    { icon: RefreshCcw, title: "Auto-update Daily", desc: "Wake up to a new lock screen automatically." },
    { icon: ImageIcon, title: "Browse Archive", desc: "Unlock every past drop since day one." },
    { icon: SlidersHorizontal, title: "Aesthetic Preferences", desc: "Tune the generator to your exact vibe." },
    { icon: Sparkles, title: "Exclusive Drops", desc: "Weekly premium-only animated holographic cards." },
  ];

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-black to-black opacity-50" />
        
        <div className="relative z-10 pt-12 px-6 pb-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,183,0,0.2)]">
            <Crown size={32} className="text-accent" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-white text-center mb-3">Collector's Edition</h1>
          <p className="text-white/60 text-center mb-10 max-w-[260px]">
            Unlock the full potential of your digital artifact collection.
          </p>

          <div className="w-full space-y-4 mb-10">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="p-2 rounded-xl bg-white/5 text-accent">
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-snug">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="w-full glass-card p-6 rounded-3xl text-center border-accent/20">
            <h2 className="text-2xl font-bold text-white mb-2">$4.99 <span className="text-sm font-normal text-white/50">/ month</span></h2>
            <p className="text-sm text-white/50 mb-6">Cancel anytime. 7-day free trial.</p>
            <Button 
              onClick={() => toast({ title: "In-app purchases coming soon." })}
              className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-black font-bold text-lg shadow-[0_0_20px_rgba(255,183,0,0.3)]"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
