"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WordSearch } from "@/components/games/word-search/WordSearch";
import type { DifficultyTier } from "@/types/game";

function WordSearchContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 3))) as DifficultyTier;
  return <WordSearch difficulty={level} />;
}

export default function WordSearchPage() {
  return (
    <Suspense>
      <WordSearchContent />
    </Suspense>
  );
}

