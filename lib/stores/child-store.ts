import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChildSummary } from "@/types";

interface ChildStore {
  activeChild: ChildSummary | null;
  setActiveChild: (child: ChildSummary | null) => void;
}

export const useChildStore = create<ChildStore>()(
  persist(
    (set) => ({
      activeChild: null,
      setActiveChild: (child) => set({ activeChild: child }),
    }),
    { name: "active-child" }
  )
);
