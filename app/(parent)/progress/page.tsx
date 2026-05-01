"use client";

import { useChildren } from "@/hooks/useChildren";
import { useChildStore } from "@/lib/stores/child-store";
import { motion } from "framer-motion";

const SUBJECT_COLORS: Record<string, { bg: string; text: string; emoji: string }> = {
  maths: { bg: "bg-red-50", text: "text-red-600", emoji: "🔢" },
  finance: { bg: "bg-green-50", text: "text-green-600", emoji: "💰" },
  english: { bg: "bg-blue-50", text: "text-blue-600", emoji: "📖" },
  geography: { bg: "bg-purple-50", text: "text-purple-600", emoji: "🌍" },
  computer: { bg: "bg-orange-50", text: "text-orange-600", emoji: "💻" },
};

const SUBJECT_PROGRESS_COLORS: Record<string, string> = {
  maths: "#EF4444",
  finance: "#22C55E",
  english: "#3B82F6",
  geography: "#A855F7",
  computer: "#F97316",
};

export default function ProgressPage() {
  const { children } = useChildren();
  const { activeChild } = useChildStore();

  const child = activeChild ?? children[0];

  if (!child) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Progress</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800">No child profiles yet. Add a child to see progress.</p>
        </div>
      </div>
    );
  }

  const levels = child.levels ?? {};
  const totalStars = child.starBalance ?? 0;
  const totalXP = Object.values(levels).reduce((sum, level) => sum + (level.xp ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Progress</h1>
        <div className="flex gap-3">
          <div className="bg-amber-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-amber-500 text-xl">⭐</span>
            <span className="font-bold text-amber-800">{totalStars} Stars</span>
          </div>
          <div className="bg-purple-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-purple-500 text-xl">✨</span>
            <span className="font-bold text-purple-800">{totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Child info header */}
      <motion.div
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            {child.avatarId === "fox" && "🦊"}
            {child.avatarId === "rabbit" && "🐰"}
            {child.avatarId === "bear" && "🐻"}
            {child.avatarId === "owl" && "🦉"}
            {child.avatarId === "lion" && "🦁"}
            {child.avatarId === "penguin" && "🐧"}
            {child.avatarId === "cat" && "🐱"}
            {child.avatarId === "dog" && "🐶"}
            {!["fox", "rabbit", "bear", "owl", "lion", "penguin", "cat", "dog"].includes(child.avatarId ?? "") && "🧒"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{child.name}</h2>
            <p className="text-white/80">
              {child.age ? `Age ${child.age}` : ""} 
              {child.age && child.createdAt ? " • " : ""}
              {child.createdAt ? `Learning since ${new Date(child.createdAt).toLocaleDateString()}` : ""}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Subject breakdown */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Subjects</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(SUBJECT_COLORS).map(([subject, style], index) => {
          const subjectData = levels[subject as keyof typeof levels] ?? {};
          const level = subjectData.level ?? 1;
          const xp = subjectData.xp ?? 0;
          const xpToNext = 100; // XP_PER_LEVEL constant
          const xpInCurrentLevel = xp % xpToNext;
          const progress = Math.min((xpInCurrentLevel / xpToNext) * 100, 100);
          const hasProgress = xp > 0;

          return (
            <motion.div
              key={subject}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center text-2xl`}>
                  {style.emoji}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 capitalize">{subject}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Level {level}</span>
                    <span>•</span>
                    <span>{xp} XP total</span>
                  </div>
                </div>
              </div>

              {/* XP Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{xpInCurrentLevel} / {xpToNext} XP</span>
                  <span>Level {level + 1}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    style={{ 
                      backgroundColor: SUBJECT_PROGRESS_COLORS[subject] || "#6B7280"
                    }}
                  />
                </div>
              </div>

              {/* Status indicator */}
              <p className="text-xs text-gray-400 mt-2">
                {hasProgress ? (
                  <>
                    <span className="text-green-500 mr-1">●</span>
                    Active - {Math.floor(xp / 100)} games completed
                  </>
                ) : (
                  <>
                    <span className="text-gray-300 mr-1">○</span>
                    Not started yet
                  </>
                )}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <motion.div
        className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold mb-4">Overall Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{totalStars}</p>
            <p className="text-white/70 text-sm">Stars Earned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{totalXP}</p>
            <p className="text-white/70 text-sm">Total XP</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {Object.values(levels).filter(l => (l.xp ?? 0) > 0).length}
            </p>
            <p className="text-white/70 text-sm">Subjects Active</p>
          </div>
        </div>
      </motion.div>

      {/* Recent activity placeholder */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
          <p className="text-gray-500">
            Activity history will appear here as {child.name} completes more games.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
