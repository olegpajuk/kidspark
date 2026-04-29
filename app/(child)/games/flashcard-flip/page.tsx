"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FlashcardFlip } from "@/components/games/flashcard-flip/FlashcardFlip";
import type { DifficultyTier } from "@/types/game";

function FlashcardFlipContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <FlashcardFlip difficulty={level} />;
}

export default function FlashcardFlipPage() {
  return (
    <Suspense>
      <FlashcardFlipContent />
    </Suspense>
  );
}

