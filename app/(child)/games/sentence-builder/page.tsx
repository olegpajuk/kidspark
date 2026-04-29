"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SentenceBuilder } from "@/components/games/sentence-builder/SentenceBuilder";
import type { DifficultyTier } from "@/types/game";

function SentenceBuilderContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 3))) as DifficultyTier;
  return <SentenceBuilder difficulty={level} />;
}

export default function SentenceBuilderPage() {
  return (
    <Suspense>
      <SentenceBuilderContent />
    </Suspense>
  );
}

