"use client";

import { useEffect, useState } from "react";
import { subscribeToChildren } from "@/lib/firebase/children";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { ChildSummary } from "@/types";

export function useChildren() {
  const user = useAuthStore((s) => s.user);
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToChildren(user.uid, (kids) => {
      setChildren(kids);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  return { children, loading };
}
