"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SpellingBee } from "@/components/games/spelling-bee/SpellingBee";
import type { DifficultyTier } from "@/types/game";

function SpellingBeeContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <SpellingBee difficulty={level} />;
}

export default function SpellingBeePage() {
  return (
    <Suspense>
      <SpellingBeeContent />
    </Suspense>
  );
}

