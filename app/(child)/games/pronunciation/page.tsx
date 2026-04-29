"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Pronunciation } from "@/components/games/pronunciation/Pronunciation";
import type { DifficultyTier } from "@/types/game";

function PronunciationContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 2))) as DifficultyTier;
  return <Pronunciation difficulty={level} />;
}

export default function PronunciationPage() {
  return (
    <Suspense>
      <PronunciationContent />
    </Suspense>
  );
}

