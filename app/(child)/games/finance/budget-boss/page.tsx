"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BudgetBoss } from "@/components/games/finance/BudgetBoss";
import { useChildStore } from "@/lib/stores/child-store";
import type { DifficultyTier } from "@/types/game";

function BudgetBossContent() {
  const searchParams = useSearchParams();
  const { activeChild } = useChildStore();

  const levelParam = searchParams.get("level");
  const currentLevel = activeChild?.levels?.finance?.level ?? 1;
  const difficulty = (levelParam ? parseInt(levelParam, 10) : currentLevel) as DifficultyTier;

  return <BudgetBoss difficulty={difficulty} />;
}

export default function BudgetBossPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <BudgetBossContent />
    </Suspense>
  );
}
