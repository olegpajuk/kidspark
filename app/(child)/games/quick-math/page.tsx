"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { QuickMath } from "@/components/games/quick-math";
import { useChildStore } from "@/lib/stores/child-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useGameProgress } from "@/hooks/useGameProgress";

export default function QuickMathPage() {
  const router = useRouter();
  const { activeChild } = useChildStore();
  const { user } = useAuthStore();
  const { saveProgress, isReady } = useGameProgress("maths", "quick-math");
  const [isSaving, setIsSaving] = useState(false);

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
    console.log("[QuickMathPage] handleComplete called", {
      result,
      isReady,
      userId: user?.uid,
      childId: activeChild?.id,
    });

    if (isSaving) {
      console.log("[QuickMathPage] Already saving, skipping");
      return;
    }
    
    if (!isReady) {
      console.error("[QuickMathPage] Not ready to save - missing user or child");
      router.push("/games/maths");
      return;
    }

    setIsSaving(true);
    
    try {
      // Save progress and wait for it to complete
      const saveResult = await saveProgress(
        { correct: result.correct, total: result.totalQuestions },
        1
      );
      console.log("[QuickMathPage] Progress saved:", saveResult);
      
      // Small delay to ensure Zustand persist has time to save
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error("[QuickMathPage] Failed to save progress:", err);
    } finally {
      setIsSaving(false);
      router.push("/games/maths");
    }
  }, [saveProgress, router, isSaving, isReady, user, activeChild]);

  if (!activeChild) {
    router.push("/home");
    return null;
  }

  // Show saving overlay if saving
  if (isSaving) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Saving your progress...</p>
        </div>
      </div>
    );
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
