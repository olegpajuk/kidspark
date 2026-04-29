"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PiggyBank } from "@/components/games/finance/PiggyBank";
import { useChildStore } from "@/lib/stores/child-store";
import type { DifficultyTier } from "@/types/game";

function PiggyBankContent() {
  const searchParams = useSearchParams();
  const { activeChild } = useChildStore();

  const levelParam = searchParams.get("level");
  const currentLevel = activeChild?.levels?.finance?.level ?? 1;
  const difficulty = (levelParam ? parseInt(levelParam, 10) : currentLevel) as DifficultyTier;

  return <PiggyBank difficulty={difficulty} />;
}

export default function PiggyBankPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <PiggyBankContent />
    </Suspense>
  );
}
