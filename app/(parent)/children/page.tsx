"use client";

import Link from "next/link";
import { useChildren } from "@/hooks/useChildren";
import { useChildStore } from "@/lib/stores/child-store";

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊",
  rabbit: "🐰",
  bear: "🐻",
  owl: "🦉",
  lion: "🦁",
  penguin: "🐧",
  cat: "🐱",
  dog: "🐶",
};

export default function ChildrenPage() {
  const { children, loading } = useChildren();
  const { activeChild, setActiveChild } = useChildStore();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-gray-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Children</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your children&apos;s profiles
          </p>
        </div>
        <Link
          href="/onboarding"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 text-sm font-semibold transition-colors shadow-sm"
        >
          ➕ Add child
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No children yet
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Add your first child to start tracking their learning journey.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-semibold text-sm transition-colors"
          >
            ➕ Add your first child
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => {
            const isActive = activeChild?.id === child.id;
            const levels = Object.values(child.levels);
            const totalXp = levels.reduce((sum, l) => sum + l.xp, 0);
            const avgLevel =
              Math.round(levels.reduce((s, l) => s + l.level, 0) / levels.length) || 1;

            return (
              <div
                key={child.id}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-5 transition-all ${
                  isActive ? "border-[#FFD93D]" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="w-14 h-14 bg-[#FFF8E7] rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  {AVATAR_EMOJI[child.avatarId] ?? "🧒"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{child.name}</h3>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-[#FFD93D]/20 text-amber-700 text-xs font-semibold rounded-md">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Level {avgLevel} · ⭐ {child.starBalance} stars · {totalXp} XP
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => setActiveChild(child)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Select
                    </button>
                  )}
                  <Link
                    href="/home"
                    onClick={() => setActiveChild(child)}
                    className="px-4 py-2 rounded-lg bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 text-sm font-semibold transition-colors"
                  >
                    Play →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
