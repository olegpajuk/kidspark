"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { QuickMath } from "@/components/games/quick-math";
import { useChildStore } from "@/lib/stores/child-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { updateChildXPAndLevel } from "@/lib/firebase/progress";

export default function QuickMathPage() {
  const router = useRouter();
  const { activeChild, setActiveChild } = useChildStore();
  const { user } = useAuthStore();

  const handleExit = useCallback(() => {
    router.push("/games/maths");
  }, [router]);

  const handleComplete = useCallback(async (result: {
    correct: number;
    wrong: number;
    timeouts: number;
    totalQuestions: number;
    starsEarned: number;
  }) => {
    // Calculate XP: 5 per correct, bonus for stars
    const xp = result.correct * 5 + result.starsEarned * 2;
    
    // Determine stars (0-3) based on performance
    const accuracy = result.totalQuestions > 0 
      ? result.correct / result.totalQuestions 
      : 0;
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;

    // Save to Firebase if user and child exist
    if (user?.uid && activeChild?.id) {
      try {
        const { newLevel } = await updateChildXPAndLevel(
          user.uid, 
          activeChild.id, 
          "maths", 
          xp, 
          stars
        );

        // Update local state
        setActiveChild({
          ...activeChild,
          starBalance: activeChild.starBalance + stars,
          levels: {
            ...activeChild.levels,
            maths: {
              ...activeChild.levels.maths,
              xp: activeChild.levels.maths.xp + xp,
              level: newLevel,
            },
          },
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }

    // Navigate back to maths games
    router.push("/games/maths");
  }, [user, activeChild, setActiveChild, router]);

  if (!activeChild) {
    router.push("/home");
    return null;
  }

  return (
    <div className="h-screen">
      <QuickMath 
        onComplete={handleComplete}
        onExit={handleExit}
        initialLives={3}
        initialSpeedSeconds={10}
        enabledOperations={["add"]}
      />
    </div>
  );
}
