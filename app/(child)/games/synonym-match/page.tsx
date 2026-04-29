"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SynonymMatch } from "@/components/games/synonym-match/SynonymMatch";
import type { DifficultyTier } from "@/types/game";

function SynonymMatchContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 4))) as DifficultyTier;
  return <SynonymMatch difficulty={level} />;
}

export default function SynonymMatchPage() {
  return (
    <Suspense>
      <SynonymMatchContent />
    </Suspense>
  );
}

