import { getLocalDateKey, isValidWallpaperDate } from "./wallpaper.ts";
import { DEVELOPER_TOOLS_ENABLED } from "./developer-tools.ts";

interface DateStoreEnvironment {
  now: () => Date;
  setTimer: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
  onResume: (callback: () => void) => () => void;
}

// Constructing tomorrow in local time handles 23/25-hour DST days correctly.
export function millisecondsUntilLocalMidnight(now: Date): number {
  return new Date(
    now.getFullYear(), now.getMonth(), now.getDate() + 1,
  ).getTime() - now.getTime();
}

export function createLocalDateStore(
  environment: DateStoreEnvironment,
  allowOverrides = false,
) {
  // Session-only: never restore a testing date from persistent storage.
  let override: string | null = null;
  const getEffectiveDate = () => override
    ? new Date(`${override}T12:00:00`)
    : environment.now();
  let dateKey = getLocalDateKey(environment.now());
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let removeResumeListener: (() => void) | undefined;

  const refresh = () => {
    const next = getLocalDateKey(getEffectiveDate());
    if (next !== dateKey) {
      dateKey = next;
      listeners.forEach((listener) => listener());
    }
  };

  const recheck = () => {
    if (timer !== undefined) environment.clearTimer(timer);
    refresh();
    if (!listeners.size) return;
    // The short clock check also catches manual date/timezone changes.
    timer = environment.setTimer(
      recheck,
      Math.max(1, Math.min(30_000, millisecondsUntilLocalMidnight(environment.now()))),
    );
  };

  return {
    getSnapshot: () => dateKey,
    getEffectiveDate,
    getDeviceDate: () => environment.now(),
    getOverride: () => override,
    setOverride(value: string | null) {
      if (!allowOverrides) throw new Error("Date overrides are disabled in release builds.");
      if (value !== null && !isValidWallpaperDate(value)) {
        throw new Error("Choose a valid calendar date.");
      }
      override = value;
      recheck();
      // Also notify subscribers to the override itself when it equals today.
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        removeResumeListener = environment.onResume(recheck);
        recheck();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size) return;
        if (timer !== undefined) environment.clearTimer(timer);
        timer = undefined;
        removeResumeListener?.();
        removeResumeListener = undefined;
      };
    },
  };
}

export const localDateStore = createLocalDateStore({
  now: () => new Date(),
  setTimer: (callback, delay) => setTimeout(callback, delay),
  clearTimer: (timer) => clearTimeout(timer),
  onResume: (callback) => {
    const onVisible = () => {
      if (document.visibilityState === "visible") callback();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", callback);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", callback);
    };
  },
}, DEVELOPER_TOOLS_ENABLED);
