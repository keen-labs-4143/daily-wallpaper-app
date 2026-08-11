import { useState } from "react";

const STORAGE_KEY = "dtcg:settings";

export type UpdateFrequency = "daily" | "weekly" | "monthly";

export interface AppSettings {
  autoUpdate: boolean;
  setHome: boolean;
  setLock: boolean;
  updateFrequency: UpdateFrequency;
  autoDownload: boolean;
  notifications: boolean;
}

const DEFAULTS: AppSettings = {
  autoUpdate: true,
  setHome: true,
  setLock: true,
  updateFrequency: "daily",
  autoDownload: false,
  notifications: true,
};

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function persist(s: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(load);

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  }

  return { settings, set };
}
