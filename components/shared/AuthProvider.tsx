"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { ParentUser } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setUser(snap.data() as ParentUser);
        } else {
          // Fallback: construct from firebase user if Firestore doc missing
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? "",
            photoURL: firebaseUser.photoURL,
            createdAt: firebaseUser.metadata.creationTime ?? "",
            updatedAt: new Date().toISOString(),
          });
        }
      } catch {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
      setLoading(true);
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}
