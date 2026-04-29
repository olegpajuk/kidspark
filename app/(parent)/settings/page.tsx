"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signOutUser } from "@/lib/firebase/auth";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    </div>
  );
}
