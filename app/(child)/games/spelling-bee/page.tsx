"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SpellingBee } from "@/components/games/spelling-bee/SpellingBee";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { DifficultyTier } from "@/types/game";

function SpellingBeeContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  
  const { saveProgress } = useGameProgress("english", "spelling-bee");

  const handleComplete = useCallback(
    async (result: { correct: number; total: number; stars: 0 | 1 | 2 | 3 }) => {
      await saveProgress(
        { correct: result.correct, total: result.total },
        level
      );
    },
    [saveProgress, level]
  );

  return <SpellingBee difficulty={level} onComplete={handleComplete} />;
}

export default function SpellingBeePage() {
  return (
    <Suspense>
      <SpellingBeeContent />
    </Suspense>
  );
}
