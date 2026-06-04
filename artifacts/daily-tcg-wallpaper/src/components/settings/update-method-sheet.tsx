import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Clock, Layers, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpdateMethodSheetProps {
  open: boolean;
  onClose: () => void;
}

const METHODS = [
  {
    id: "smart",
    icon: Zap,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/15",
    name: "Smart Scheduling",
    tagline: "Set it and forget it",
    description:
      "The app picks the perfect moment to swap your wallpaper each day — waiting for good Wi-Fi and a charged battery so it never interrupts you.",
    pros: [
      "Best for battery life",
      "Won't run on low battery or weak signal",
      "Survives restarts — picks up where it left off",
      "Recommended for most users",
    ],
    cons: ["Update time varies day to day", "Exact timing isn't guaranteed"],
    bestFor: "Anyone who wants a fresh wallpaper daily without thinking about it.",
    recommended: true,
  },
  {
    id: "timer",
    icon: Clock,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/15",
    name: "Timer Based",
    tagline: "Your schedule, your rules",
    description:
      "You pick a time, the app changes the wallpaper at that exact moment every day — no surprises.",
    pros: [
      "Updates at your chosen time, every time",
      "Reliable even with the screen off",
      "Full control over the schedule",
    ],
    cons: [
      "Uses slightly more battery than Smart Scheduling",
      "May interrupt low-battery moments",
    ],
    bestFor: "People who want their wallpaper to change at a specific time each day.",
    recommended: false,
  },
  {
    id: "live",
    icon: Layers,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/15",
    name: "Live Wallpaper",
    tagline: "Always in motion",
    description:
      "Your wallpaper becomes part of the system — updating in the background automatically as a live wallpaper, with no manual steps required.",
    pros: [
      "Deepest integration with your device",
      "No scheduling needed",
      "Changes happen seamlessly",
    ],
    cons: [
      "Higher battery usage",
      "May affect performance on older devices",
      "Not supported on all launchers",
    ],
    bestFor: "Enthusiasts who want the most seamless, automated experience and don't mind slightly higher battery use.",
    recommended: false,
  },
];

const COMPARISON = [
  { label: "Battery usage", smart: "Low", timer: "Medium", live: "High" },
  { label: "Timing control", smart: "Low", timer: "High", live: "Low" },
  { label: "Reliability", smart: "High", timer: "High", live: "Very high" },
];

const cellColor = (val: string) => {
  if (val === "Low") return "text-emerald-400";
  if (val === "High" || val === "Very high") return "text-amber-400";
  return "text-white/70";
};

export function UpdateMethodSheet({ open, onClose }: UpdateMethodSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#17171a] rounded-t-3xl max-h-[92%] flex flex-col"
          >
            {/* Handle + header */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Update Methods</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-white/45 text-sm mt-1">
                Choose how the app refreshes your wallpaper each day.
              </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-4">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-2xl p-4 border",
                      m.recommended
                        ? "bg-emerald-400/5 border-emerald-400/25"
                        : "bg-white/[0.04] border-white/8"
                    )}
                  >
                    {/* Title row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", m.iconBg)}>
                        <Icon size={18} className={m.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-[15px]">{m.name}</p>
                          {m.recommended && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-white/45 text-xs">{m.tagline}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/65 text-sm leading-relaxed mb-4">
                      {m.description}
                    </p>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider mb-2">
                          Pros
                        </p>
                        <ul className="space-y-1.5">
                          {m.pros.map((p) => (
                            <li key={p} className="flex items-start gap-1.5 text-xs text-white/65">
                              <Check size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider mb-2">
                          Cons
                        </p>
                        <ul className="space-y-1.5">
                          {m.cons.map((c) => (
                            <li key={c} className="flex items-start gap-1.5 text-xs text-white/65">
                              <AlertCircle size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Best for */}
                    <div className="rounded-xl bg-white/[0.05] px-3 py-2.5">
                      <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1">
                        Best for
                      </p>
                      <p className="text-white/60 text-xs leading-relaxed">{m.bestFor}</p>
                    </div>
                  </div>
                );
              })}

              {/* Comparison table */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-white font-semibold text-[15px]">Quick comparison</p>
                </div>
                <div className="p-4">
                  {/* Header row */}
                  <div className="grid grid-cols-4 mb-3">
                    <div />
                    {["Smart", "Timer", "Live"].map((h) => (
                      <p key={h} className="text-center text-[11px] font-bold text-white/40 uppercase tracking-wide">
                        {h}
                      </p>
                    ))}
                  </div>
                  {/* Data rows */}
                  <div className="space-y-3">
                    {COMPARISON.map((row, i) => (
                      <div
                        key={row.label}
                        className={cn(
                          "grid grid-cols-4 py-2",
                          i < COMPARISON.length - 1 && "border-b border-white/[0.06]"
                        )}
                      >
                        <p className="text-white/55 text-xs self-center">{row.label}</p>
                        {[row.smart, row.timer, row.live].map((val, j) => (
                          <p key={j} className={cn("text-center text-xs font-semibold", cellColor(val))}>
                            {val}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations note */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/8 px-4 py-4">
                <p className="text-white font-semibold text-[13px] mb-2">Our recommendation</p>
                <p className="text-white/55 text-xs leading-relaxed">
                  <span className="text-white font-medium">For most users:</span> Smart Scheduling — lowest battery impact, fully automatic.
                </p>
                <p className="text-white/55 text-xs leading-relaxed mt-1.5">
                  <span className="text-white font-medium">If you have a routine:</span> Timer Based — choose the exact minute your wallpaper switches.
                </p>
                <p className="text-white/55 text-xs leading-relaxed mt-1.5">
                  <span className="text-white font-medium">For enthusiasts:</span> Live Wallpaper — deepest integration, slightly more battery use.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
