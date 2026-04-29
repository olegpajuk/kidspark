"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChildStore } from "@/lib/stores/child-store";
import type { SubjectId } from "@/types";

const SUBJECTS: {
  id: SubjectId;
  label: string;
  emoji: string;
  description: string;
  color: string;
  bg: string;
}[] = [
  {
    id: "maths",
    label: "Maths",
    emoji: "🔢",
    description: "Numbers & puzzles",
    color: "#FF6B6B",
    bg: "#FFF0F0",
  },
  {
    id: "finance",
    label: "Finance",
    emoji: "💰",
    description: "Money & markets",
    color: "#4ECDC4",
    bg: "#F0FFFE",
  },
  {
    id: "english",
    label: "English",
    emoji: "📚",
    description: "Words & stories",
    color: "#9B59B6",
    bg: "#F8F0FF",
  },
  {
    id: "geography",
    label: "Geography",
    emoji: "🌍",
    description: "Maps & places",
    color: "#3498DB",
    bg: "#F0F6FF",
  },
  {
    id: "computer",
    label: "Computer Science",
    emoji: "💻",
    description: "Code & logic",
    color: "#2ECC71",
    bg: "#F0FFF4",
  },
];

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

const GAMES_BY_SUBJECT: Record<SubjectId, { name: string; path: string } | null> = {
  maths: { name: "Maths Games", path: "/games/maths" },
  finance: { name: "Finance Games", path: "/games/finance" },
  english: { name: "English Games", path: "/games/english" },
  geography: null,
  computer: null,
};

const DAILY_TASKS = [
  { subjectId: "maths" as SubjectId, emoji: "🔢", label: "Maths practice", color: "#FF6B6B", bg: "#FFF0F0" },
  { subjectId: "english" as SubjectId, emoji: "📚", label: "English games", color: "#9B59B6", bg: "#F8F0FF" },
  { subjectId: "finance" as SubjectId, emoji: "💰", label: "Finance games", color: "#4ECDC4", bg: "#F0FFFE" },
];

export default function ChildHomePage() {
  const { activeChild } = useChildStore();
  const router = useRouter();

  useEffect(() => {
    if (activeChild === null) {
      router.replace("/dashboard");
    }
  }, [activeChild, router]);

  if (!activeChild) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
      {/* Greeting */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-[#FFD93D]/30">
          {AVATAR_EMOJI[activeChild.avatarId] ?? "🧒"}
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          Hello, {activeChild.name}! 👋
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          What would you like to learn today?
        </p>
        <div className="inline-flex items-center gap-2 mt-4 bg-[#FFD93D]/20 px-5 py-2 rounded-full border border-[#FFD93D]/40">
          <span className="text-base">⭐</span>
          <span className="font-bold text-gray-800 text-lg">
            {activeChild.starBalance}
          </span>
          <span className="text-gray-600 text-sm">stars</span>
        </div>
      </div>

      {/* Performance Widget */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>📈</span> Your Progress
            </h3>
            <span className="text-xs text-gray-400">Keep it up!</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SUBJECTS.map(({ id, emoji, color }) => {
              const level = activeChild.levels[id];
              const lvl = level?.level ?? 1;
              const xpPercent = Math.min(100, (level?.xp ?? 0) % 100);
              
              return (
                <div key={id} className="text-center">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${xpPercent}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color }}>
                    Lv{lvl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Adventure Mode Banner */}
      <section className="mb-6">
        <button
          onClick={() => router.push("/adventure")}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white text-left hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🗺️</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Adventure Mode</h3>
              <p className="text-white/80 text-sm">
                Journey through all subjects! Complete missions to unlock rewards.
              </p>
            </div>
            <span className="text-2xl">→</span>
          </div>
        </button>
      </section>

      {/* Daily tasks */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📋</span> Today&apos;s tasks
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {DAILY_TASKS.map((task, i) => {
            const game = GAMES_BY_SUBJECT[task.subjectId];
            const isAvailable = game !== null;

            return (
              <button
                key={task.label}
                onClick={() => {
                  if (game) {
                    router.push(game.path);
                  }
                }}
                disabled={!isAvailable}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                  i < DAILY_TASKS.length - 1 ? "border-b border-gray-50" : ""
                } ${isAvailable ? "hover:bg-gray-50 cursor-pointer" : "cursor-not-allowed"}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: task.bg }}
                >
                  {task.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {task.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAvailable ? game.name : "Available soon"}
                  </p>
                </div>
                {isAvailable ? (
                  <span
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white shrink-0"
                    style={{ backgroundColor: task.color }}
                  >
                    Play →
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-md font-medium shrink-0">
                    Coming soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Subject tiles */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🎮</span> Pick a subject
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {SUBJECTS.map(({ id, label, emoji, description, color, bg }) => {
            const level = activeChild.levels[id];
            const xp = level?.xp ?? 0;
            const lvl = level?.level ?? 1;
            const xpPercent = Math.min(100, xp % 100);
            const game = GAMES_BY_SUBJECT[id];
            const isAvailable = game !== null;

            return (
              <button
                key={id}
                className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-150 text-left shadow-sm ${
                  isAvailable
                    ? "border-transparent hover:scale-[1.02] active:scale-95 cursor-pointer"
                    : "border-transparent opacity-70 cursor-not-allowed"
                }`}
                style={{ backgroundColor: bg }}
                onClick={() => {
                  if (game) {
                    router.push(game.path);
                  }
                }}
                disabled={!isAvailable}
                aria-label={`Play ${label}`}
              >
                <span className="text-4xl mb-3 leading-none">{emoji}</span>
                <span className="text-base font-bold text-gray-800 mb-0.5">
                  {label}
                </span>
                <span className="text-xs text-gray-500 mb-3">{description}</span>

                {isAvailable ? (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-white mb-3"
                    style={{ backgroundColor: color }}
                  >
                    Play now!
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-200 text-gray-500 mb-3">
                    Coming soon
                  </span>
                )}

                {/* XP progress */}
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold" style={{ color }}>
                      Level {lvl}
                    </span>
                    <span className="text-gray-400">{xp} XP</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${xpPercent}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
