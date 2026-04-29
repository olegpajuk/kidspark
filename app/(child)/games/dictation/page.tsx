"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Dictation } from "@/components/games/dictation/Dictation";
import type { DifficultyTier } from "@/types/game";

function DictationContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 3))) as DifficultyTier;
  return <Dictation difficulty={level} />;
}

export default function DictationPage() {
  return (
    <Suspense>
      <DictationContent />
    </Suspense>
  );
}

