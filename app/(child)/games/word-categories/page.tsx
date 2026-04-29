"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WordCategories } from "@/components/games/word-categories/WordCategories";
import type { DifficultyTier } from "@/types/game";

function WordCategoriesContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <WordCategories difficulty={level} />;
}

export default function WordCategoriesPage() {
  return (
    <Suspense>
      <WordCategoriesContent />
    </Suspense>
  );
}

