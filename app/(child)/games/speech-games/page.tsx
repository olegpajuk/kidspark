"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SpeechGame } from "@/components/games/speech-games/SpeechGame";
import type { DifficultyTier } from "@/types/game";

function SpeechGameContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 3))) as DifficultyTier;
  return <SpeechGame difficulty={level} />;
}

export default function SpeechGamesPage() {
  return (
    <Suspense>
      <SpeechGameContent />
    </Suspense>
  );
}

