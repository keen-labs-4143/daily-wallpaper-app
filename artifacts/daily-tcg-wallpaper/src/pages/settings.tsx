import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { BellRing, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSettings, UpdateFrequency } from "@/hooks/use-settings";
import { Capacitor } from "@capacitor/core";
import {
  cancelNotifications,
  hasNotificationPermission,
  requestNotificationPermission,
  scheduleTestNotification,
} from "@/lib/notifications";
import { useWallpaperFeed } from "@/hooks/use-wallpaper-feed";

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

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function computeNextUpdate(frequency: UpdateFrequency, timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const t = new Date();

  if (frequency === "daily") {
    t.setHours(h, m, 0, 0);
    if (t <= now) t.setDate(t.getDate() + 1);
  } else if (frequency === "weekly") {
    t.setDate(t.getDate() + 7);
    t.setHours(h, m, 0, 0);
  } else {
    // monthly: 1st of next month
    t.setMonth(t.getMonth() + 1, 1);
    t.setHours(h, m, 0, 0);
  }

  const date = t.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const time = t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { settings, set } = useSettings();
  const { data: allWallpapers = [] } = useWallpaperFeed();
  const [notificationBusy, setNotificationBusy] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !settings.notifications) return;
    void hasNotificationPermission()
      .then(async (granted) => {
        if (granted) return;
        await cancelNotifications();
        set("notifications", false);
      })
      .catch((error) => {
        console.error("[notifications] Could not reconcile notification permission", {
          error,
        });
        set("notifications", false);
      });
  }, []);

  const handleNotificationsChange = (checked: boolean) => {
    void (async () => {
      setNotificationBusy(true);
      try {
        if (checked) {
          const { granted, native } = await requestNotificationPermission();
          if (!native) {
            toast({
              title: "Android notification setting",
              description: "Notification permission is requested in the Android app.",
            });
            return;
          }
          if (!granted) {
            await cancelNotifications();
            set("notifications", false);
            toast({
              title: "Notifications remain off",
              description: "Permission was denied. You can enable it in Android settings.",
            });
            return;
          }
          set("notifications", true);
          toast({
            title: "Notifications enabled",
            description: "Permission granted. Use the dev test below to check the content.",
          });
        } else {
          await cancelNotifications();
          set("notifications", false);
          toast({
            title: "Notifications off",
            description: "Pending test notifications were canceled.",
          });
        }
      } catch (error) {
        console.error("[notifications] Could not update notification setting", { error });
        await cancelNotifications().catch(() => {});
        set("notifications", false);
        toast({
          title: "Notification setting failed",
          description: "Nothing was scheduled. Please try again.",
        });
      } finally {
        setNotificationBusy(false);
      }
    })();
  };

  const handleTestNotification = () => {
    void (async () => {
      setNotificationBusy(true);
      try {
        if (!settings.notifications) {
          toast({
            title: "Turn Notifications on first",
            description: "The test respects the Notifications setting.",
          });
          return;
        }

        const { scheduled, content } = await scheduleTestNotification(
          allWallpapers,
          10,
        );
        if (!scheduled) {
          set("notifications", false);
          toast({
            title: "Test notification not scheduled",
            description: Capacitor.isNativePlatform()
              ? "Notification permission is not granted."
              : "This dev test runs in the Android app.",
          });
          return;
        }

        toast({
          title: "Test notification scheduled",
          description: `In 10 seconds: “${content.title}”`,
        });
      } catch (error) {
        console.error("[notifications] Test notification failed", { error });
        toast({
          title: "Test notification failed",
          description: "Nothing was scheduled. Please try again.",
        });
      } finally {
        setNotificationBusy(false);
      }
    })();
  };

  return (
    <MobileContainer>
      <div className="flex-1 relative flex flex-col overflow-hidden">
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
            {/* Automatic wallpaper update toggle */}
            {/*
              TODO (Android): Wire this toggle to a WorkManager PeriodicWorkRequest
              so wallpapers update in the background without the app being open.
              The preference is persisted here; the WorkManager job should read it
              at schedule time and cancel/reschedule accordingly.
            */}
            <Row
              label="Automatic wallpaper update"
              right={
                <Switch
                  checked={settings.autoUpdate}
                  onCheckedChange={(v) => set("autoUpdate", v)}
                />
              }
            />

            {/* Apply-to targets + frequency — grayed out when auto-update is off */}
            <div className={cn("transition-opacity duration-200", !settings.autoUpdate && "opacity-40 pointer-events-none")}>
            <div className="mx-4 mb-3 rounded-xl bg-white/[0.05] overflow-hidden border border-white/[0.06]">
              <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                Apply automatic updates to
              </p>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <p className="text-white font-medium text-[14px]">Home Screen</p>
                <Checkbox
                  checked={settings.setHome}
                  onCheckedChange={(v) => set("setHome", !!v)}
                  className="w-5 h-5 rounded border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-white font-medium text-[14px]">Lock Screen</p>
                <Checkbox
                  checked={settings.setLock}
                  onCheckedChange={(v) => set("setLock", !!v)}
                  className="w-5 h-5 rounded border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
            </div>

            {/* Update Frequency */}
            <div className="px-4 pb-4">
              <div className="mb-2.5">
                <p className="text-white font-medium text-[15px]">Update frequency</p>
                <p className="text-white/40 text-xs mt-0.5">How often your wallpaper changes automatically.</p>
              </div>
              {/* Segmented selector */}
              <div className="flex gap-2">
                {(["daily", "weekly", "monthly"] as UpdateFrequency[]).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => set("updateFrequency", freq)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200",
                      settings.updateFrequency === freq
                        ? "bg-primary text-white shadow-[0_2px_12px_rgba(139,92,246,0.35)]"
                        : "bg-white/[0.07] text-white/50 hover:bg-white/[0.12] hover:text-white/80"
                    )}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
              {/* Contextual hint */}
              {settings.updateFrequency === "weekly" && (
                <p className="text-white/35 text-xs mt-2.5 leading-snug">
                  Your wallpaper will change once per week.
                </p>
              )}
              {settings.updateFrequency === "monthly" && (
                <p className="text-white/35 text-xs mt-2.5 leading-snug">
                  Your wallpaper will change once per month.
                </p>
              )}
            </div>

            {/* Update Time */}
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/[0.06]">
              <div>
                <p className="text-white font-medium text-[15px]">Update time</p>
                <p className="text-white/40 text-xs mt-0.5">When the automatic update runs.</p>
              </div>
              <input
                type="time"
                value={settings.updateTime}
                onChange={(e) => e.target.value && set("updateTime", e.target.value)}
                className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold border-0 outline-none cursor-pointer"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Next update */}
            <div className="flex items-center justify-between px-4 py-3 mx-0 mb-3 border-t border-white/[0.06]">
              <p className="text-white/40 text-[13px]">Next update</p>
              <p className="text-white/40 text-[13px]">
                {computeNextUpdate(settings.updateFrequency, settings.updateTime)}
              </p>
            </div>

            </div>{/* end auto-update dependent section */}
          </Card>

          {/* Card 2 — Automatic wallpaper download */}
          {/*
            TODO (Android): Wire this to a WorkManager PeriodicWorkRequest that
            calls the download logic (see lib/notifications.ts for the pattern).
            The preference is persisted; WorkManager should read it and skip
            the download job if autoDownload is false.
          */}
          <Card>
            <Row
              label="Save updated wallpapers"
              sublabel="Automatically save each new wallpaper to your device."
              noBorder
              right={
                <Switch
                  checked={settings.autoDownload}
                  onCheckedChange={(v) => set("autoDownload", v)}
                />
              }
            />
          </Card>

          {/* Card 3 — Notifications */}
          <Card>
            <Row
              label="Notifications"
              sublabel="Alert me when today's wallpaper drops"
              right={
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={handleNotificationsChange}
                  disabled={notificationBusy}
                />
              }
            />
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/70">
                Dev test control
              </p>
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={notificationBusy || !settings.notifications}
                className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {notificationBusy ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <BellRing size={17} />
                )}
                Send test notification in 10 seconds
              </button>
              <p className="mt-2 text-xs leading-relaxed text-white/35">
                Uses the current Today wallpaper. This is not the final daily scheduler.
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
