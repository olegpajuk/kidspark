import { create } from "zustand";
import type { ParentUser } from "@/types";

interface AuthStore {
  user: ParentUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: ParentUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
