"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MissingLetter } from "@/components/games/missing-letter/MissingLetter";
import type { DifficultyTier } from "@/types/game";

function MissingLetterContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <MissingLetter difficulty={level} />;
}

export default function MissingLetterPage() {
  return (
    <Suspense>
      <MissingLetterContent />
    </Suspense>
  );
}

