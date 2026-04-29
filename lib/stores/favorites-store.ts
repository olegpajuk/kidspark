import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favorites: Record<string, string[]>;
  toggleFavorite: (childId: string, gameId: string) => void;
  isFavorite: (childId: string, gameId: string) => boolean;
  getFavorites: (childId: string) => string[];
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggleFavorite: (childId, gameId) => {
        set((state) => {
          const childFavorites = state.favorites[childId] || [];
          const isFav = childFavorites.includes(gameId);
          return {
            favorites: {
              ...state.favorites,
              [childId]: isFav
                ? childFavorites.filter((id) => id !== gameId)
                : [...childFavorites, gameId],
            },
          };
        });
      },
      isFavorite: (childId, gameId) => {
        const state = get();
        return (state.favorites[childId] || []).includes(gameId);
      },
      getFavorites: (childId) => {
        const state = get();
        return state.favorites[childId] || [];
      },
    }),
    { name: "game-favorites" }
  )
);
