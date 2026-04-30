"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MissingLetter } from "@/components/games/missing-letter/MissingLetter";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { DifficultyTier } from "@/types/game";

function MissingLetterContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  
  const { saveProgress } = useGameProgress("english", "missing-letter");

  const handleComplete = useCallback(
    async (result: { correct: number; total: number; stars: 0 | 1 | 2 | 3 }) => {
      await saveProgress(
        { correct: result.correct, total: result.total },
        level
      );
    },
    [saveProgress, level]
  );

  return <MissingLetter difficulty={level} onComplete={handleComplete} />;
}

export default function MissingLetterPage() {
  return (
    <Suspense>
      <MissingLetterContent />
    </Suspense>
  );
}
