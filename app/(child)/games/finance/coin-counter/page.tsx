"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CoinCounter } from "@/components/games/finance/CoinCounter";
import { useChildStore } from "@/lib/stores/child-store";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { DifficultyTier } from "@/types/game";

function CoinCounterContent() {
  const searchParams = useSearchParams();
  const { activeChild } = useChildStore();
  const { saveProgress } = useGameProgress("finance", "coin-counter");

  const levelParam = searchParams.get("level");
  const currentLevel = activeChild?.levels?.finance?.level ?? 1;
  const difficulty = (levelParam ? parseInt(levelParam, 10) : currentLevel) as DifficultyTier;

  const handleComplete = useCallback(
    async (result: { correct: number; total: number; stars: 0 | 1 | 2 | 3 }) => {
      await saveProgress(
        { correct: result.correct, total: result.total },
        difficulty
      );
    },
    [saveProgress, difficulty]
  );

  return <CoinCounter difficulty={difficulty} onComplete={handleComplete} />;
}

export default function CoinCounterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <CoinCounterContent />
    </Suspense>
  );
}
