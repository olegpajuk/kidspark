"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useChildren } from "@/hooks/useChildren";
import { signOutUser } from "@/lib/firebase/auth";
import { resetChildStats } from "@/lib/firebase/children";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { children, loading: childrenLoading } = useChildren();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resettingChild, setResettingChild] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOutUser();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  }

  async function handleResetStats(childId: string) {
    if (!user?.uid) return;
    
    setResettingChild(childId);
    try {
      await resetChildStats(user.uid, childId, {
        resetStars: true,
        resetXP: true,
        resetLevels: true,
      });
      setShowResetConfirm(null);
    } catch (err) {
      console.error("Failed to reset stats:", err);
    } finally {
      setResettingChild(null);
    }
  }

  const getTotalXP = (levels: Record<string, { xp?: number }>) => {
    return Object.values(levels).reduce((sum, level) => sum + (level.xp ?? 0), 0);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Account Section */}
      <motion.section
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>👤</span> Account
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-gray-800 font-medium">{user?.email ?? "Not signed in"}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Display Name</label>
            <p className="text-gray-800 font-medium">{user?.displayName || "Not set"}</p>
          </div>
        </div>
      </motion.section>

      {/* Children Stats Section */}
      <motion.section
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>👶</span> Children Progress
        </h2>

        {childrenLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : children.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No children added yet.</p>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {AVATAR_EMOJI[child.avatarId] || "🧒"}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">{child.name}</p>
                      <p className="text-xs text-gray-500">
                        {child.starBalance} stars earned
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResetConfirm(child.id)}
                    className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Reset Stats
                  </button>
                </div>

                {/* Subject Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(child.levels || {}).map(([subject, data]) => (
                    <div
                      key={subject}
                      className="bg-white rounded-lg px-3 py-2 border border-gray-100"
                    >
                      <p className="text-gray-500 capitalize">{subject}</p>
                      <p className="font-semibold text-gray-800">
                        Lvl {data.level} · {data.xp} XP
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                  <span>Total XP: {getTotalXP(child.levels || {})}</span>
                  <span>Total Stars: {child.starBalance}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* App Settings */}
      <motion.section
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚙️</span> App Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Sound Effects</p>
              <p className="text-sm text-gray-500">Play sounds in games</p>
            </div>
            <span className="text-sm text-gray-400">Per child setting</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Daily Time Limits</p>
              <p className="text-sm text-gray-500">Restrict play time per day</p>
            </div>
            <span className="text-sm text-gray-400">Per child setting</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Difficulty Adjustment</p>
              <p className="text-sm text-gray-500">Auto-adjusts based on performance</p>
            </div>
            <span className="text-sm text-green-600 font-medium">Enabled</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Child-specific settings can be changed in the Children section.
        </p>
      </motion.section>

      {/* Support */}
      <motion.section
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>💬</span> Support
        </h2>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">Help Center</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">Contact Us</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">Privacy Policy</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section
        className="bg-white rounded-xl shadow-sm border border-red-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <span>⚠️</span> Account Actions
        </h2>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-3 px-4 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </motion.section>

      {/* Version */}
      <p className="text-center text-sm text-gray-400 mt-8">
        KidSpark v0.1.0
      </p>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">Reset Progress?</h3>
              <p className="text-gray-600 text-sm mb-6">
                This will reset all stars, XP, and levels for{" "}
                <strong>
                  {children.find((c) => c.id === showResetConfirm)?.name}
                </strong>
                . This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetStats(showResetConfirm)}
                  disabled={resettingChild === showResetConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {resettingChild === showResetConfirm ? "Resetting..." : "Reset"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
