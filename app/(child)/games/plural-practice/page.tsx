"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PluralPractice } from "@/components/games/plural-practice/PluralPractice";
import type { DifficultyTier } from "@/types/game";

function PluralPracticeContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 2))) as DifficultyTier;
  return <PluralPractice difficulty={level} />;
}

export default function PluralPracticePage() {
  return (
    <Suspense>
      <PluralPracticeContent />
    </Suspense>
  );
}

