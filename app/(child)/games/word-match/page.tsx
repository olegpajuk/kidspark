"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WordMatchMemory } from "@/components/games/word-match/WordMatchMemory";
import type { DifficultyTier } from "@/types/game";

function WordMatchContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <WordMatchMemory difficulty={level} />;
}

export default function WordMatchPage() {
  return (
    <Suspense>
      <WordMatchContent />
    </Suspense>
  );
}

