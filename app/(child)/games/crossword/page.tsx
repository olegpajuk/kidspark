"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Crossword } from "@/components/games/crossword/Crossword";
import type { DifficultyTier } from "@/types/game";

function CrosswordContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(3, Number(params.get("level") ?? 3))) as DifficultyTier;
  return <Crossword difficulty={level} />;
}

export default function CrosswordPage() {
  return (
    <Suspense>
      <CrosswordContent />
    </Suspense>
  );
}

