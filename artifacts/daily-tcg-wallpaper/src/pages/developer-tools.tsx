import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation } from "wouter";
import { Capacitor } from "@capacitor/core";
import { MobileContainer } from "@/components/layout/mobile-container";
import { LOCAL_WALLPAPERS } from "@/data/local-wallpapers";
import { localDateStore } from "@/lib/local-date-store";
import { getLocalDateKey, selectWallpaperForDate } from "@/lib/wallpaper";
import { getCurrentNotificationContent } from "@/lib/notification-content";
import { hasNotificationPermission, scheduleTestNotification } from "@/lib/notifications";
import { useSettings } from "@/hooks/use-settings";

const fieldClass = "rounded-xl border border-white/10 bg-white/[0.05] p-3 text-sm text-white";
const buttonClass = `${fieldClass} hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed`;

export default function DeveloperTools() {
  const [, navigate] = useLocation();
  const { settings } = useSettings();
  const effectiveKey = useSyncExternalStore(localDateStore.subscribe, localDateStore.getSnapshot);
  const override = useSyncExternalStore(localDateStore.subscribe, localDateStore.getOverride);
  const [customDate, setCustomDate] = useState(override ?? effectiveKey);
  const [permission, setPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const effectiveDate = localDateStore.getEffectiveDate();
  const selected = selectWallpaperForDate(LOCAL_WALLPAPERS, effectiveDate);
  const content = getCurrentNotificationContent(LOCAL_WALLPAPERS, effectiveDate);
  const feedDates = [...new Set(LOCAL_WALLPAPERS.map(w => w.dateAvailable))].sort();
  const eligible = Boolean(selected?.isPublished && selected.dateAvailable <= effectiveKey);
  const reason = !selected
    ? "No eligible published wallpaper. Today shows its empty state; notifications use generic copy."
    : selected.dateAvailable === effectiveKey
      ? "Newest published record on this date; same-date ties use the higher ID."
      : "No exact-date release. Using the newest eligible earlier published record.";

  useEffect(() => {
    const check = () => {
      void hasNotificationPermission().then(setPermission).catch(() => setPermission(false));
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    check();
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function applyDate(value: string | null) {
    try {
      localDateStore.setOverride(value);
      setMessage(value ? `Applied ${value} to the real app selection.` : "Override cleared. Using the real device date.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not apply date.");
    }
  }

  function relativeDay(offset: number) {
    const date = localDateStore.getDeviceDate();
    date.setDate(date.getDate() + offset);
    const key = getLocalDateKey(date);
    setCustomDate(key);
    applyDate(key);
  }

  async function sendTest() {
    if (!settings.notifications || !permission || busy) return;
    setBusy(true);
    try {
      // Recheck system permission immediately before the real native scheduler.
      const granted = await hasNotificationPermission();
      setPermission(granted);
      if (!granted) {
        setMessage("Android notification permission is blocked. Nothing scheduled.");
        return;
      }
      const result = await scheduleTestNotification(LOCAL_WALLPAPERS, 10);
      setMessage(result.scheduled
        ? `Scheduled in 10 seconds: #${result.content.wallpaperId ?? "none"} — ${result.content.title}`
        : "No notification was scheduled. Check Android permission.");
    } catch (error) {
      setMessage(`Scheduling failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto px-4 pt-12 pb-10 space-y-4">
        <button className="text-sm text-white/60" onClick={() => navigate("/today")}>← Back to Today</button>
        <h1 className="text-xl font-bold text-white">Developer date testing</h1>
        <p className="text-xs leading-relaxed text-amber-200/70">
          Developer build only. Foreground selection testing—not WorkManager, background scheduling, or automatic wallpaper application.
          Overrides last for this app session only.
        </p>

        <section className="rounded-2xl bg-[#1c1c20] p-4 space-y-3">
          <h2 className="font-semibold text-white">Use a test date</h2>
          <div className="grid grid-cols-3 gap-2">
            <button className={buttonClass} onClick={() => relativeDay(-1)}>Yesterday</button>
            <button className={buttonClass} onClick={() => relativeDay(0)}>Today</button>
            <button className={buttonClass} onClick={() => relativeDay(1)}>Tomorrow</button>
          </div>
          <p className="text-xs text-white/45">Relative to the real device date. These may select the same final release.</p>
          <label className="block text-sm text-white/70" htmlFor="test-date">Custom local date</label>
          <input
            id="test-date" type="date" value={customDate}
            onChange={event => setCustomDate(event.target.value)}
            className={`${fieldClass} w-full`} style={{ colorScheme: "dark" }}
          />
          <button className={`${buttonClass} w-full`} disabled={!customDate} onClick={() => applyDate(customDate)}>Apply custom date</button>
          <label className="block text-xs text-white/45" htmlFor="feed-date">Existing feed dates ({feedDates[0]}–{feedDates.at(-1)})</label>
          <select
            id="feed-date" className={`${fieldClass} w-full`} value={feedDates.includes(customDate) ? customDate : ""}
            onChange={event => { setCustomDate(event.target.value); applyDate(event.target.value); }}
            style={{ colorScheme: "dark" }}
          >
            <option value="" disabled>Choose an existing release date</option>
            {feedDates.map(date => <option key={date} value={date}>{date}</option>)}
          </select>
          <button className={`${buttonClass} w-full`} onClick={() => applyDate(null)}>Clear Override</button>
          <button className={`${buttonClass} w-full`} onClick={() => navigate("/today")}>View actual Today screen</button>
        </section>

        <section className="rounded-2xl bg-[#1c1c20] p-4 space-y-3">
          <h2 className="font-semibold text-white">Live selection diagnostics</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Actual device date", getLocalDateKey(localDateStore.getDeviceDate())],
              ["Effective date", effectiveKey],
              ["Override", override ?? "None — real device date"],
              ["Selected wallpaper ID", selected?.id ?? "None"],
              ["Title", selected?.title ?? "No eligible wallpaper"],
              ["dateAvailable", selected?.dateAvailable ?? "None"],
              ["Eligible", eligible ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-white/45">{label}</dt>
                <dd className="text-right text-white" data-testid={`diagnostic-${label}`}>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs leading-relaxed text-white/60" data-testid="selection-reason">{reason}</p>
        </section>

        <section className="rounded-2xl bg-[#1c1c20] p-4 space-y-3">
          <h2 className="font-semibold text-white">Actual notification content</h2>
          <p className="text-sm text-white" data-testid="notification-title">{content.title}</p>
          <p className="whitespace-pre-line text-xs text-white/60" data-testid="notification-body">{content.body}</p>
          <button className={`${buttonClass} w-full`} disabled={!settings.notifications || !permission || busy} onClick={() => void sendTest()}>
            {busy ? "Scheduling…" : "Send test notification in 10 seconds"}
          </button>
          <p className="text-xs text-white/40">
            {Capacitor.isNativePlatform()
              ? "Requires Notifications enabled in Settings and Android permission allowed."
              : "Native notification delivery requires Android. Content above uses the actual builder."}
          </p>
          <button className="text-xs text-white/60 underline" onClick={() => navigate("/settings")}>Open notification Settings</button>
        </section>
        {message && <p role="status" className="text-sm text-white/70">{message}</p>}
      </div>
    </MobileContainer>
  );
}
