import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  CalendarDays,
  Heart,
  Settings,
  Info,
  Star,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

export function SideDrawer({ open, onClose }: SideDrawerProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const navigate = (path: string) => {
    onClose();
    setLocation(path);
  };

  const comingSoon = (label: string) => {
    onClose();
    toast({ title: label, description: "Coming soon." });
  };

  const primaryItems: MenuItem[] = [
    {
      icon: <CalendarDays size={20} />,
      label: "Wallpaper Archive",
      action: () => comingSoon("Wallpaper Archive"),
    },
    {
      icon: <Heart size={20} />,
      label: "Favorites",
      action: () => navigate("/favorites"),
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      action: () => navigate("/settings"),
    },
  ];

  const secondaryItems: MenuItem[] = [
    {
      icon: <Info size={20} />,
      label: "Privacy policy",
      action: () => comingSoon("Privacy policy"),
    },
    {
      icon: <Star size={20} />,
      label: "Rate the app",
      action: () => comingSoon("Rate the app"),
    },
    {
      icon: <Share2 size={20} />,
      label: "Share",
      action: () => comingSoon("Share"),
    },
  ];

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
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute top-0 left-0 bottom-0 z-50 w-[78%] max-w-[300px] bg-[#17171a] flex flex-col shadow-2xl"
          >
            {/* App logo */}
            <div className="px-6 pt-14 pb-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(260,80%,22%) 0%, hsl(290,70%,12%) 100%)",
                  boxShadow: "0 0 32px rgba(139,92,246,0.25)",
                }}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="22" cy="22" r="22" fill="transparent" />
                  {/* Mountain silhouette */}
                  <path
                    d="M6 34 L16 16 L22 24 L28 12 L38 34Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  {/* Sun/moon */}
                  <circle cx="30" cy="18" r="4" fill="white" fillOpacity="0.6" />
                </svg>
              </div>
            </div>

            {/* Primary nav */}
            <nav className="flex-1 px-4 overflow-y-auto">
              <ul className="space-y-1">
                {primaryItems.map((item) => (
                  <DrawerItem key={item.label} item={item} />
                ))}
              </ul>

              <div className="my-5 border-t border-white/8" />

              <ul className="space-y-1">
                {secondaryItems.map((item) => (
                  <DrawerItem key={item.label} item={item} secondary />
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="px-6 pb-10 pt-4">
              <p className="text-white/20 text-xs">Daily TCG Wallpaper</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({
  item,
  secondary = false,
}: {
  item: MenuItem;
  secondary?: boolean;
}) {
  return (
    <li>
      <button
        onClick={item.action}
        className={cn(
          "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-colors duration-150",
          secondary
            ? "text-white/50 hover:text-white/80 hover:bg-white/5"
            : "text-white/80 hover:text-white hover:bg-white/8"
        )}
      >
        <span className={cn(secondary ? "text-white/40" : "text-white/60")}>
          {item.icon}
        </span>
        <span className={cn("font-medium text-[15px]")}>{item.label}</span>
      </button>
    </li>
  );
}
