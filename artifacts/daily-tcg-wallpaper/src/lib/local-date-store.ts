import { getLocalDateKey, isValidWallpaperDate } from "./wallpaper.ts";
import { DEVELOPER_TOOLS_ENABLED } from "./developer-tools.ts";

export const DEVELOPER_DATE_STORAGE_KEY = "daily-tcg:developer-date-override";

interface DateStoreEnvironment {
  now: () => Date;
  setTimer: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
  onResume: (callback: () => void) => () => void;
  overrideStorage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
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
  // Android can recreate the WebView while backgrounded. Restore only in
  // developer builds, before the first snapshot or notification is read.
  let override: string | null = null;
  try {
    const retained = allowOverrides
      ? environment.overrideStorage?.getItem(DEVELOPER_DATE_STORAGE_KEY)
      : null;
    if (allowOverrides && isValidWallpaperDate(retained)) {
      override = retained;
    } else {
      // Release mode never reads a stored date and purges any developer residue.
      environment.overrideStorage?.removeItem(DEVELOPER_DATE_STORAGE_KEY);
    }
  } catch (error) {
    // Unavailable storage must not prevent normal real-date app startup.
    console.warn("[date-store] Could not restore/remove developer date", error);
  }
  const getEffectiveDate = () => override
    ? new Date(`${override}T12:00:00`)
    : environment.now();
  let dateKey = getLocalDateKey(getEffectiveDate());
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
      // Persist before changing state: report storage failure to the developer
      // rather than claiming an override will survive resume when it cannot.
      if (value === null) {
        environment.overrideStorage?.removeItem(DEVELOPER_DATE_STORAGE_KEY);
      } else {
        environment.overrideStorage?.setItem(DEVELOPER_DATE_STORAGE_KEY, value);
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
  overrideStorage: {
    // Defer access so denied/unavailable browser storage is handled above.
    getItem: (key) => typeof window === "undefined" ? null : window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    },
  },
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
