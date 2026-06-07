import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MobileContainer } from "@/components/layout/mobile-container";
import { UpdateMethodSheet } from "@/components/settings/update-method-sheet";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronDown, ExternalLink, Search, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-[#1c1c20] overflow-hidden", className)}>
      {children}
    </div>
  );
}

function Row({
  label,
  sublabel,
  right,
  noBorder = false,
}: {
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3.5 gap-4",
        !noBorder && "border-b border-white/[0.06]"
      )}
    >
      <div className="min-w-0">
        <p className="text-white font-medium text-[15px] leading-snug">{label}</p>
        {sublabel && (
          <p className="text-white/45 text-xs mt-0.5">{sublabel}</p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [autoUpdate, setAutoUpdate] = useState(true);
  const [setHome, setSetHome] = useState(true);
  const [setLock, setSetLock] = useState(true);
  const [landscape, setLandscape] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const comingSoon = (label: string) =>
    toast({ title: label, description: "This feature is coming soon." });

  return (
    <MobileContainer>
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <UpdateMethodSheet open={learnMoreOpen} onClose={() => setLearnMoreOpen(false)} />
        <div className="flex-1 overflow-y-auto pb-16 no-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-5">
          <button
            onClick={() => setLocation("/today")}
            className="p-1.5 -ml-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>

        <div className="px-4 space-y-3">

          {/* Card 1 — Wallpaper update settings */}
          <Card>
            {/* Automatic wallpaper update */}
            <Row
              label="Automatic wallpaper update"
              right={
                <Switch
                  checked={autoUpdate}
                  onCheckedChange={setAutoUpdate}
                />
              }
            />

            {/* Update Method */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <p className="text-white font-medium text-[15px]">Update Method</p>
              <button
                onClick={() => setLearnMoreOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold hover:bg-white/15 transition-colors"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center text-[9px] font-bold">i</span>
                Learn More
              </button>
            </div>

            {/* Smart Scheduling dropdown */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <button
                onClick={() => setScheduleOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.07] hover:bg-white/10 transition-colors"
              >
                <div className="text-left">
                  <p className="text-white font-medium text-[15px]">Smart scheduling</p>
                  <p className="text-white/45 text-xs mt-0.5">Use default scheduling</p>
                </div>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-white/50 transition-transform duration-200",
                    scheduleOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {scheduleOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-xl bg-white/[0.05] divide-y divide-white/[0.06] text-sm text-white/70 px-4 py-2">
                      <p className="py-2.5 text-white/40 text-xs uppercase tracking-wider font-semibold">
                        Schedule options (coming soon)
                      </p>
                      {["Smart scheduling", "Every hour", "Every 3 hours", "Every 6 hours", "Daily"].map(
                        (opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setScheduleOpen(false);
                              comingSoon("Schedule: " + opt);
                            }}
                            className="w-full text-left py-2.5 hover:text-white transition-colors"
                          >
                            {opt}
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Set on Home screen */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <p className="text-white font-medium text-[15px]">Set on Home screen</p>
              <Checkbox
                checked={setHome}
                onCheckedChange={(v) => setSetHome(!!v)}
                className="w-5 h-5 rounded border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            {/* Set on Lock screen */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <p className="text-white font-medium text-[15px]">Set on Lock screen</p>
              <Checkbox
                checked={setLock}
                onCheckedChange={(v) => setSetLock(!!v)}
                className="w-5 h-5 rounded border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            {/* Landscape wallpaper */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <p className="text-white font-medium text-[15px]">Landscape wallpaper</p>
              <Checkbox
                checked={landscape}
                onCheckedChange={(v) => setLandscape(!!v)}
                className="w-5 h-5 rounded border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            {/* Auto-start */}
            <div className="px-4 py-3.5">
              <p className="text-white/50 text-[13px] mb-3 leading-snug">
                Allow app to auto start from device settings
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => comingSoon("Open settings")}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.08] text-white/80 text-sm font-medium hover:bg-white/[0.13] transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  Open settings
                </button>
                <button
                  onClick={() => comingSoon("Search on Web")}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.08] text-white/80 text-sm font-medium hover:bg-white/[0.13] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search size={13} />
                  Search on Web
                </button>
              </div>
            </div>
          </Card>

          {/* Card 2 — Automatic wallpaper download */}
          <Card>
            <Row
              label="Automatic wallpaper download"
              sublabel="Save new wallpapers to your device daily"
              noBorder
              right={
                <Switch
                  checked={autoDownload}
                  onCheckedChange={setAutoDownload}
                />
              }
            />
          </Card>

          {/* Card 4 — Notifications */}
          <Card>
            <Row
              label="Notifications"
              sublabel="Alert me when today's wallpaper drops"
              noBorder
              right={
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              }
            />
          </Card>

          {/* Card 5 — Widget */}
          <Card>
            <div className="px-4 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid size={16} className="text-white/50" />
                <p className="text-white font-semibold text-[15px]">Widget</p>
              </div>
              <button
                onClick={() => comingSoon("Widget")}
                className="w-full py-3 rounded-xl bg-white/[0.08] text-white font-semibold text-[15px] hover:bg-white/[0.13] transition-colors mb-3"
              >
                Add Widget to Home Screen
              </button>
              <p className="text-white/40 text-xs leading-relaxed">
                Adds a widget that shows the information of the current wallpaper.
              </p>
            </div>
          </Card>

          {/* Footer */}
          <p className="text-center text-white/25 text-xs pb-6 pt-2">
            Daily TCG Wallpaper · v1.0.0
          </p>

        </div>
        </div>{/* end scrollable */}
      </div>{/* end relative wrapper */}
    </MobileContainer>
  );
}
