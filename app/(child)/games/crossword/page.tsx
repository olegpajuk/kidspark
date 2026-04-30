"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Crossword } from "@/components/games/crossword/Crossword";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { DifficultyTier } from "@/types/game";

function CrosswordContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(3, Number(params.get("level") ?? 3))) as DifficultyTier;
  
  const { saveProgress } = useGameProgress("english", "crossword");

  const handleComplete = useCallback(
    async (result: { correct: number; total: number; stars: 0 | 1 | 2 | 3 }) => {
      await saveProgress(
        { correct: result.correct, total: result.total },
        level
      );
    },
    [saveProgress, level]
  );

  return <Crossword difficulty={level} onComplete={handleComplete} />;
}

export default function CrosswordPage() {
  return (
    <Suspense>
      <CrosswordContent />
    </Suspense>
  );
}
