"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VerbTenseMachine } from "@/components/games/verb-tense/VerbTenseMachine";
import type { DifficultyTier } from "@/types/game";

function VerbTenseContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 4))) as DifficultyTier;
  return <VerbTenseMachine difficulty={level} />;
}

export default function VerbTensePage() {
  return (
    <Suspense>
      <VerbTenseContent />
    </Suspense>
  );
}

