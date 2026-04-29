"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useChildStore } from "@/lib/stores/child-store";
import { ChevronLeft, Lock } from "lucide-react";

interface Mission {
  id: number;
  title: string;
  subject: string;
  emoji: string;
  color: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
}

const JOURNEY_MISSIONS: Mission[] = [
  { id: 1, title: "First Steps", subject: "maths", emoji: "🔢", color: "#FF6B6B", isCompleted: false, isUnlocked: true, isCurrent: true },
  { id: 2, title: "Word Explorer", subject: "english", emoji: "📖", color: "#9B59B6", isCompleted: false, isUnlocked: false, isCurrent: false },
  { id: 3, title: "Money Basics", subject: "finance", emoji: "💰", color: "#4ECDC4", isCompleted: false, isUnlocked: false, isCurrent: false },
  { id: 4, title: "World Maps", subject: "geography", emoji: "🌍", color: "#3498DB", isCompleted: false, isUnlocked: false, isCurrent: false },
  { id: 5, title: "Number Master", subject: "maths", emoji: "🔢", color: "#FF6B6B", isCompleted: false, isUnlocked: false, isCurrent: false },
  { id: 6, title: "Storyteller", subject: "english", emoji: "📖", color: "#9B59B6", isCompleted: false, isUnlocked: false, isCurrent: false },
  { id: 7, title: "First Code", subject: "computer", emoji: "💻", color: "#2ECC71", isCompleted: false, isUnlocked: false, isCurrent: false },
  { id: 8, title: "Budget Boss", subject: "finance", emoji: "💰", color: "#4ECDC4", isCompleted: false, isUnlocked: false, isCurrent: false },
];

export default function AdventurePage() {
  const router = useRouter();
  const { activeChild } = useChildStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 pb-20">
      {/* Header */}
      <div className="px-4 py-4 text-white">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1 text-white/70 hover:text-white mb-4 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Adventure Mode</h1>
            <p className="text-white/80 text-sm">
              Complete missions from different subjects to earn special rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Journey Map */}
      <div className="max-w-xl mx-auto px-4 mt-6">
        {/* Current progress */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Current Mission</p>
              <p className="font-bold text-lg">1. First Steps</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Progress</p>
              <p className="font-bold text-lg">0 / 8</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 rounded-full" style={{ width: "0%" }} />
          </div>
        </motion.div>

        {/* Mission Trail */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2" />

          {/* Missions */}
          <div className="relative space-y-6">
            {JOURNEY_MISSIONS.map((mission, index) => (
              <motion.div
                key={mission.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Mission node on the line */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-sm ${
                      mission.isCompleted
                        ? "bg-green-400"
                        : mission.isCurrent
                        ? "bg-yellow-400"
                        : "bg-gray-300"
                    }`}
                  >
                    {mission.isCompleted ? "✓" : mission.id}
                  </div>
                </div>

                {/* Mission card */}
                <div
                  className={`w-[45%] ${
                    mission.isUnlocked
                      ? "bg-white"
                      : "bg-white/50"
                  } rounded-xl p-4 shadow-lg ${
                    mission.isCurrent ? "ring-2 ring-yellow-400 ring-offset-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: mission.isUnlocked 
                          ? `${mission.color}20` 
                          : "#f1f1f1"
                      }}
                    >
                      {mission.isUnlocked ? mission.emoji : <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${
                        mission.isUnlocked ? "text-gray-800" : "text-gray-400"
                      }`}>
                        {mission.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {mission.subject}
                      </p>
                    </div>
                  </div>

                  {mission.isCurrent && (
                    <button
                      onClick={() => {
                        if (mission.subject === "maths") {
                          router.push("/games/maths");
                        }
                      }}
                      className="mt-3 w-full py-2 rounded-lg text-white text-sm font-semibold"
                      style={{ backgroundColor: mission.color }}
                    >
                      Start Mission
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coming Soon notice */}
        <motion.div
          className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-4xl mb-3">🚀</p>
          <h3 className="font-bold text-lg mb-2">More Adventures Coming!</h3>
          <p className="text-sm text-white/80">
            Complete missions to unlock new challenges and earn special badges!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
