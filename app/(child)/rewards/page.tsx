"use client";

import { motion } from "framer-motion";
import { useChildStore } from "@/lib/stores/child-store";
import { Lock } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  category: "avatar" | "badge" | "theme";
}

const REWARDS: Reward[] = [
  { id: "ninja-fox", name: "Ninja Fox", emoji: "🦊", cost: 50, description: "A stealthy fox avatar", category: "avatar" },
  { id: "super-owl", name: "Super Owl", emoji: "🦉", cost: 50, description: "A wise owl avatar", category: "avatar" },
  { id: "cosmic-cat", name: "Cosmic Cat", emoji: "😺", cost: 75, description: "A space-traveling cat", category: "avatar" },
  { id: "math-master", name: "Math Master", emoji: "🧮", cost: 100, description: "Complete 50 maths questions", category: "badge" },
  { id: "first-star", name: "First Star", emoji: "⭐", cost: 0, description: "Earn your first star", category: "badge" },
  { id: "streak-7", name: "Week Warrior", emoji: "🔥", cost: 0, description: "7 day learning streak", category: "badge" },
  { id: "theme-ocean", name: "Ocean Theme", emoji: "🌊", cost: 100, description: "Blue ocean background", category: "theme" },
  { id: "theme-space", name: "Space Theme", emoji: "🚀", cost: 150, description: "Galaxy background", category: "theme" },
  { id: "theme-forest", name: "Forest Theme", emoji: "🌲", cost: 100, description: "Green forest background", category: "theme" },
];

export default function RewardsPage() {
  const { activeChild } = useChildStore();
  const starBalance = activeChild?.starBalance ?? 0;

  const avatars = REWARDS.filter((r) => r.category === "avatar");
  const badges = REWARDS.filter((r) => r.category === "badge");
  const themes = REWARDS.filter((r) => r.category === "theme");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header with balance */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rewards Shop</h1>
        <div className="inline-flex items-center gap-2 bg-amber-100 px-5 py-2 rounded-full border border-amber-200">
          <span className="text-xl">⭐</span>
          <span className="font-bold text-amber-800 text-xl">{starBalance}</span>
          <span className="text-amber-700 text-sm">stars to spend</span>
        </div>
      </div>

      {/* Badges Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏅</span> Badges
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((reward, index) => {
            const isOwned = reward.cost === 0 && starBalance > 0; // Simplified for demo
            
            return (
              <motion.div
                key={reward.id}
                className={`bg-white rounded-xl p-4 text-center border-2 ${
                  isOwned ? "border-green-300" : "border-gray-100"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="text-3xl mb-2">{reward.emoji}</div>
                <p className="text-xs font-semibold text-gray-800 mb-1">{reward.name}</p>
                {isOwned ? (
                  <span className="text-xs text-green-600 font-medium">Earned!</span>
                ) : (
                  <span className="text-xs text-gray-400">{reward.description}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Avatars Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🦸</span> Avatars
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {avatars.map((reward, index) => {
            const canAfford = starBalance >= reward.cost;
            
            return (
              <motion.button
                key={reward.id}
                className={`bg-white rounded-xl p-4 text-left border-2 transition-all ${
                  canAfford
                    ? "border-amber-200 hover:border-amber-400"
                    : "border-gray-100 opacity-70"
                }`}
                disabled={!canAfford}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-3xl">
                    {reward.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{reward.name}</p>
                    <p className="text-xs text-gray-500">{reward.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">⭐</span>
                    <span className="font-bold text-gray-800">{reward.cost}</span>
                  </div>
                  {canAfford ? (
                    <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
                      Unlock
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Need {reward.cost - starBalance} more
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Themes Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🎨</span> Themes
        </h2>
        <div className="space-y-3">
          {themes.map((reward, index) => {
            const canAfford = starBalance >= reward.cost;
            
            return (
              <motion.button
                key={reward.id}
                className={`w-full bg-white rounded-xl p-4 flex items-center gap-4 border-2 transition-all ${
                  canAfford
                    ? "border-amber-200 hover:border-amber-400"
                    : "border-gray-100 opacity-70"
                }`}
                disabled={!canAfford}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {reward.emoji}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">{reward.name}</p>
                  <p className="text-xs text-gray-500">{reward.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">⭐</span>
                    <span className="font-bold text-gray-800">{reward.cost}</span>
                  </div>
                  {!canAfford && (
                    <p className="text-xs text-gray-400">Need {reward.cost - starBalance} more</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Info */}
      <motion.div
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Complete games to earn stars!
          The better you do, the more stars you earn.
        </p>
      </motion.div>
    </div>
  );
}
