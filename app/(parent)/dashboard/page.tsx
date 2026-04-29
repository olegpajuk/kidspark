"use client";

import Link from "next/link";
import { useChildren } from "@/hooks/useChildren";
import { useChildStore } from "@/lib/stores/child-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { motion } from "framer-motion";
import type { ChildSummary } from "@/types";

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

const SUBJECT_INFO: Record<string, { color: string; bg: string; emoji: string }> = {
  maths: { color: "#FF6B6B", bg: "#FFF0F0", emoji: "🔢" },
  finance: { color: "#4ECDC4", bg: "#F0FFFE", emoji: "💰" },
  english: { color: "#9B59B6", bg: "#F8F0FF", emoji: "📚" },
  geography: { color: "#3498DB", bg: "#F0F6FF", emoji: "🌍" },
  computer: { color: "#2ECC71", bg: "#F0FFF4", emoji: "💻" },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { children, loading } = useChildren();
  const { activeChild, setActiveChild } = useChildStore();

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
        <motion.div
          className="max-w-lg mx-auto text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-5xl mx-auto mb-6">
            👶
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome, {firstName}! 👋
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Let&apos;s set up your child&apos;s profile to get started on their learning adventure!
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span className="text-2xl">➕</span>
            Add your first child
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              Welcome back, {firstName}!
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 0.5, repeat: 3, repeatDelay: 2 }}
              >
                👋
              </motion.span>
            </h1>
            <p className="text-gray-500 mt-1">
              {children.length === 1
                ? "Here's how your child is doing today."
                : `Managing ${children.length} amazing learners.`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/home"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <span className="text-xl">🎮</span>
              Play with {activeChild?.name || "Child"}
            </Link>
            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-all border border-gray-200"
            >
              <span>➕</span>
              Add child
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { label: "Total Stars", value: children.reduce((sum, c) => sum + c.starBalance, 0), emoji: "⭐", bg: "from-yellow-400 to-amber-400" },
            { label: "Active Learners", value: children.length, emoji: "👧", bg: "from-pink-400 to-rose-400" },
            { label: "Subjects", value: 5, emoji: "📚", bg: "from-blue-400 to-indigo-400" },
            { label: "Games Played", value: "∞", emoji: "🎮", bg: "from-green-400 to-emerald-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                {stat.emoji}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Children Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👨‍👩‍👧‍👦</span> Your Children
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child, i) => (
              <ChildCard
                key={child.id}
                child={child}
                isActive={activeChild?.id === child.id}
                onSelect={() => setActiveChild(child)}
                delay={0.25 + i * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "View Progress", href: "/progress", emoji: "📈", color: "from-blue-500 to-cyan-500" },
              { label: "Detailed Stats", href: "/progress", emoji: "📊", color: "from-purple-500 to-pink-500" },
              { label: "Settings", href: "/settings", emoji: "⚙️", color: "from-gray-500 to-gray-600" },
              { label: "Add Child", href: "/onboarding", emoji: "➕", color: "from-green-500 to-emerald-500" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:scale-105 transition-all text-center group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  {action.emoji}
                </div>
                <p className="font-medium text-gray-700">{action.label}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ChildCard({
  child,
  isActive,
  onSelect,
  delay,
}: {
  child: ChildSummary;
  isActive: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const subjectEntries = Object.entries(child.levels);
  const avgLevel =
    Math.round(
      subjectEntries.reduce((sum, [, l]) => sum + l.level, 0) /
        subjectEntries.length
    ) || 1;
  const totalXP = subjectEntries.reduce((sum, [, l]) => sum + l.xp, 0);

  return (
    <motion.div
      className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition-all ${
        isActive
          ? "border-amber-400 shadow-lg shadow-amber-100"
          : "border-gray-100 hover:border-gray-200 hover:shadow-md"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-sm">
          {AVATAR_EMOJI[child.avatarId] ?? "🧒"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-800 truncate">
              {child.name}
            </h3>
            {isActive && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold text-gray-700">{child.starBalance}</span>
              <span className="text-gray-400">stars</span>
            </span>
            <span className="flex items-center gap-1 text-sm">
              <span className="text-purple-500">🏆</span>
              <span className="font-semibold text-gray-700">Level {avgLevel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="space-y-3 mb-5">
        {subjectEntries.map(([subject, level]) => {
          const info = SUBJECT_INFO[subject] || { color: "#999", bg: "#f5f5f5", emoji: "📖" };
          const xpPercent = Math.min(100, level.xp % 100);
          
          return (
            <div key={subject} className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: info.bg }}
              >
                {info.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {subject}
                  </span>
                  <span className="text-xs text-gray-400">
                    Lv {level.level}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: info.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ delay: delay + 0.2, duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total XP Badge */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 mb-5 flex items-center justify-between">
        <span className="text-sm text-gray-600">Total XP earned</span>
        <span className="font-bold text-purple-600">{totalXP} XP</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!isActive && (
          <button
            onClick={onSelect}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Select
          </button>
        )}
        <Link
          href="/home"
          onClick={onSelect}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-center transition-all shadow-sm hover:shadow-md"
        >
          Play →
        </Link>
      </div>
    </motion.div>
  );
}
