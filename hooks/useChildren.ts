"use client";

import { useEffect, useState, useRef } from "react";
import { subscribeToChildren } from "@/lib/firebase/children";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useChildStore } from "@/lib/stores/child-store";
import type { ChildSummary } from "@/types";

export function useChildren() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const activeChild = useChildStore((s) => s.activeChild);
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use ref to track activeChild ID without causing re-subscriptions
  const activeChildIdRef = useRef<string | null>(null);
  activeChildIdRef.current = activeChild?.id ?? null;

  useEffect(() => {
    // Keep loading while Firebase auth is still initialising
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToChildren(user.uid, (kids) => {
      setChildren(kids);
      setLoading(false);

      // Sync activeChild with Firebase data if it exists
      const currentActiveId = activeChildIdRef.current;
      if (currentActiveId) {
        const updatedChild = kids.find((k) => k.id === currentActiveId);
        if (updatedChild) {
          setActiveChild(updatedChild);
        }
      }
    });

    return unsub;
  }, [user, authLoading, setActiveChild]);

  return { children, loading };
}
