import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dtcg:favorites";
const LEGACY_COMMUNITY_KEY = "dtcg:community-likes";
const CHANGE_EVENT = "dtcg:favorites-changed";

interface StoredFavorite {
  id: number;
  savedAt: number;
}

function parseStoredFavorites(value: string | null): StoredFavorite[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item === "number" && Number.isInteger(item)) {
        return [{ id: item, savedAt: 0 }];
      }
      if (
        item &&
        typeof item === "object" &&
        typeof (item as StoredFavorite).id === "number"
      ) {
        const favorite = item as StoredFavorite;
        return [{
          id: favorite.id,
          savedAt: Number.isFinite(favorite.savedAt) ? favorite.savedAt : 0,
        }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function readFavorites(): StoredFavorite[] {
  const current = parseStoredFavorites(localStorage.getItem(STORAGE_KEY));
  if (current.length) return current;

  const legacy = parseStoredFavorites(localStorage.getItem(LEGACY_COMMUNITY_KEY));
  if (legacy.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  }
  return legacy;
}

function writeFavorites(favorites: StoredFavorite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<StoredFavorite[]>(readFavorites);

  useEffect(() => {
    const refresh = () => setFavorites(readFavorites());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const current = readFavorites();
    const exists = current.some((favorite) => favorite.id === id);
    const next = exists
      ? current.filter((favorite) => favorite.id !== id)
      : [{ id, savedAt: Date.now() }, ...current];
    writeFavorites(next);
  }, []);

  return {
    favorites,
    favoriteIds: favorites.map((favorite) => favorite.id),
    isFavorite: (id: number) => favorites.some((favorite) => favorite.id === id),
    toggleFavorite,
  };
}