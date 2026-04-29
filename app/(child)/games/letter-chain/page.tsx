"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LetterChain } from "@/components/games/letter-chain/LetterChain";
import type { DifficultyTier } from "@/types/game";

function LetterChainContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 2))) as DifficultyTier;
  return <LetterChain difficulty={level} />;
}

export default function LetterChainPage() {
  return (
    <Suspense>
      <LetterChainContent />
    </Suspense>
  );
}

