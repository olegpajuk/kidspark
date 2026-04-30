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
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 pb-24 overflow-y-auto">
      {/* Header - more compact */}
      <div className="px-3 py-3 text-white">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1 text-white/70 mb-2 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">Adventure Mode</h1>
            <p className="text-white/80 text-xs">
              Complete missions to earn special rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Journey Map */}
      <div className="max-w-xl mx-auto px-3 mt-3">
        {/* Current progress - more compact */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-5 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/80">Current Mission</p>
              <p className="font-bold text-sm">1. First Steps</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/80">Progress</p>
              <p className="font-bold text-sm">0 / 8</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 rounded-full" style={{ width: "0%" }} />
          </div>
        </motion.div>

        {/* Mission Trail - more compact */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 -translate-x-1/2" />

          {/* Missions */}
          <div className="relative space-y-4">
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
                    className={`w-6 h-6 rounded-full border-3 border-white flex items-center justify-center text-xs font-bold ${
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

                {/* Mission card - more compact */}
                <div
                  className={`w-[44%] ${
                    mission.isUnlocked
                      ? "bg-white"
                      : "bg-white/50"
                  } rounded-lg p-2.5 shadow-md ${
                    mission.isCurrent ? "ring-2 ring-yellow-400 ring-offset-1" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ 
                        backgroundColor: mission.isUnlocked 
                          ? `${mission.color}20` 
                          : "#f1f1f1"
                      }}
                    >
                      {mission.isUnlocked ? mission.emoji : <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-xs truncate ${
                        mission.isUnlocked ? "text-gray-800" : "text-gray-400"
                      }`}>
                        {mission.title}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize">
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
                      className="mt-2 w-full py-1.5 rounded-md text-white text-xs font-semibold"
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

        {/* Coming Soon notice - more compact */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-3xl mb-2">🚀</p>
          <h3 className="font-bold text-sm mb-1">More Adventures Coming!</h3>
          <p className="text-xs text-white/80">
            Complete missions to unlock new challenges!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
