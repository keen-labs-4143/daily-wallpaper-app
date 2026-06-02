import React from "react";
import { useLocation } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Bell, Palette, Clock, Info, Star, ChevronRight, Tag, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLink = () => {
    toast({ description: "Opening link..." });
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">{title}</h3>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
        {children}
      </div>
    </div>
  );

  const Item = ({ icon: Icon, title, right }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 active:bg-white/10 transition-colors">
      <div className="flex items-center gap-3 text-white">
        <Icon size={18} className="text-white/60" />
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-white/50">{right}</div>
    </div>
  );

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-12">
        <div className="flex items-center gap-3 mb-8 px-2">
          <button
            onClick={() => setLocation("/today")}
            className="p-1.5 -ml-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-serif font-bold text-white">Settings</h1>
        </div>

        <Section title="Preferences">
          <Item 
            icon={Bell} 
            title="Daily Drop Notifications" 
            right={<Switch defaultChecked id="notifs" />} 
          />
          <Item 
            icon={Clock} 
            title="Notification Time" 
            right={<span className="text-sm">9:00 AM</span>} 
          />
          <Item 
            icon={Palette} 
            title="App Theme" 
            right={<span className="text-sm">Midnight (Dark)</span>} 
          />
        </Section>

        <Section title="About">
          <div onClick={handleLink} className="cursor-pointer">
            <Item icon={Star} title="Rate the App" right={<ChevronRight size={18} />} />
          </div>
          <div onClick={handleLink} className="cursor-pointer">
            <Item icon={Info} title="Privacy Policy" right={<ChevronRight size={18} />} />
          </div>
          <Item icon={Tag} title="Version" right={<span className="text-sm font-mono">1.0.0</span>} />
        </Section>
        
        <div className="text-center mt-12 mb-8">
          <p className="text-xs text-white/30">Crafted with care in San Francisco.</p>
        </div>
      </div>
    </MobileContainer>
  );
}