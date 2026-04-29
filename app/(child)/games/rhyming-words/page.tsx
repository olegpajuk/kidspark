"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RhymingWords } from "@/components/games/rhyming-words/RhymingWords";
import type { DifficultyTier } from "@/types/game";

function RhymingWordsContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <RhymingWords difficulty={level} />;
}

export default function RhymingWordsPage() {
  return (
    <Suspense>
      <RhymingWordsContent />
    </Suspense>
  );
}

