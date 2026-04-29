"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ListenTap } from "@/components/games/listen-tap/ListenTap";
import type { DifficultyTier } from "@/types/game";

function ListenTapContent() {
  const params = useSearchParams();
  const level = Math.min(10, Math.max(1, Number(params.get("level") ?? 1))) as DifficultyTier;
  return <ListenTap difficulty={level} />;
}

export default function ListenTapPage() {
  return (
    <Suspense>
      <ListenTapContent />
    </Suspense>
  );
}

