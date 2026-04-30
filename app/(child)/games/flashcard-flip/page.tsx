"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FlashcardFlip } from "@/components/games/flashcard-flip/FlashcardFlip";
import { useGameProgress } from "@/hooks/useGameProgress";
import type { DifficultyTier } from "@/types/game";

function FlashcardFlipContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  
  const { saveProgress } = useGameProgress("english", "flashcard-flip");

  const handleComplete = useCallback(
    async (result: { correct: number; total: number; stars: 0 | 1 | 2 | 3 }) => {
      await saveProgress(
        { correct: result.correct, total: result.total },
        level
      );
    },
    [saveProgress, level]
  );

  return <FlashcardFlip difficulty={level} onComplete={handleComplete} />;
}

export default function FlashcardFlipPage() {
  return (
    <Suspense>
      <FlashcardFlipContent />
    </Suspense>
  );
}
