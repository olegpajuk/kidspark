"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useChildStore } from "@/lib/stores/child-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { ChevronLeft, X, Heart } from "lucide-react";

interface GameCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  bgColor: string;
  basePath: string;
  mode?: string;
  isNew?: boolean;
  comingSoon?: boolean;
}

const MATHS_GAMES: GameCard[] = [
  {
    id: "counting",
    name: "Fruit Counting",
    emoji: "🍎",
    description: "Tap fruits to learn basic addition",
    minLevel: 1,
    maxLevel: 3,
    color: "#FF6B6B",
    bgColor: "#FFF0F0",
    basePath: "/games/banana-bridge",
    mode: "counting",
  },
  {
    id: "bridge-practice",
    name: "Bridge to 10 - Practice",
    emoji: "🎯",
    description: "Test your skills! Pick the right numbers",
    minLevel: 4,
    maxLevel: 7,
    color: "#9B59B6",
    bgColor: "#F8F0FF",
    basePath: "/games/banana-bridge",
    mode: "bridge-practice",
    isNew: true,
  },
  {
    id: "bridge-learn",
    name: "Bridge to 10 - Learn",
    emoji: "🌉",
    description: "Visual step-by-step learning with drag & tap",
    minLevel: 4,
    maxLevel: 7,
    color: "#4ECDC4",
    bgColor: "#F0FFFE",
    basePath: "/games/banana-bridge",
    mode: "bridge-learn",
  },
  {
    id: "quick-math",
    name: "Quick Math",
    emoji: "⚡",
    description: "Race against the snake! +−×÷ speed training",
    minLevel: 1,
    maxLevel: 10,
    color: "#E74C3C",
    bgColor: "#FDEDEC",
    basePath: "/games/quick-math",
    isNew: true,
  },
  {
    id: "number-bonds",
    name: "Number Bonds",
    emoji: "🎈",
    description: "Match pairs that make 10, 20, or 100",
    minLevel: 1,
    maxLevel: 5,
    color: "#9B59B6",
    bgColor: "#F8F0FF",
    basePath: "/games/number-bonds",
    comingSoon: true,
  },
  {
    id: "frog-jump",
    name: "Frog Jump",
    emoji: "🐸",
    description: "Jump forward and backward on the number line",
    minLevel: 2,
    maxLevel: 6,
    color: "#2ECC71",
    bgColor: "#F0FFF4",
    basePath: "/games/frog-jump",
    comingSoon: true,
  },
  {
    id: "array-garden",
    name: "Array Garden",
    emoji: "🌻",
    description: "Plant flowers in rows to learn multiplication",
    minLevel: 3,
    maxLevel: 8,
    color: "#F39C12",
    bgColor: "#FFF8E7",
    basePath: "/games/array-garden",
    comingSoon: true,
  },
  {
    id: "fair-share",
    name: "Fair Share Bakery",
    emoji: "🧁",
    description: "Divide treats equally to learn division",
    minLevel: 4,
    maxLevel: 8,
    color: "#E91E63",
    bgColor: "#FFF0F5",
    basePath: "/games/fair-share",
    comingSoon: true,
  },
];

export default function MathsGamesPage() {
  const router = useRouter();
  const { activeChild } = useChildStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const currentLevel = activeChild?.levels?.maths?.level ?? 1;
  const childId = activeChild?.id ?? "guest";

  const sortedGames = useMemo(() => {
    return [...MATHS_GAMES].sort((a, b) => {
      const aFav = isFavorite(childId, a.id);
      const bFav = isFavorite(childId, b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [childId, isFavorite]);

  return (
    <div className="min-h-screen bg-[#FFF8E7] pb-8">
      {/* Header */}
      <div className="bg-[#FF6B6B] text-white px-4 py-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔢</span>
            <div>
              <h1 className="text-2xl font-bold">Maths Games</h1>
              <p className="text-white/80 text-sm">Choose a game to play!</p>
            </div>
          </div>

          {/* Current level indicator */}
          <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-sm">Your level:</span>
            <span className="font-bold text-lg">{currentLevel}</span>
            <span className="text-xs text-white/70">
              ({activeChild?.levels?.maths?.xp ?? 0} XP)
            </span>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="grid gap-4">
          {sortedGames.map((game, index) => {
            const isGameFavorite = isFavorite(childId, game.id);
            return (
              <motion.div
                key={game.id}
                className={`relative bg-white rounded-2xl p-4 shadow-md text-left transition-all ${
                  game.comingSoon
                    ? "opacity-60"
                    : "hover:shadow-lg"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(childId, game.id);
                  }}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={isGameFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isGameFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-300 hover:text-red-400"
                    }`}
                  />
                </button>

                <button
                  onClick={() => {
                    if (!game.comingSoon) {
                      setSelectedGame(game);
                      setSelectedLevel(null);
                    }
                  }}
                  disabled={game.comingSoon}
                  className={`w-full text-left ${
                    game.comingSoon ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                      style={{ backgroundColor: game.bgColor }}
                    >
                      {game.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{game.name}</h3>
                        {game.isNew && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            NEW
                          </span>
                        )}
                        {game.comingSoon && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{game.description}</p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Levels:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: game.maxLevel - game.minLevel + 1 }, (_, i) => {
                            const level = game.minLevel + i;
                            const isUnlocked = level <= currentLevel + 2;
                            const isCurrent = level === currentLevel;
                            
                            return (
                              <div
                                key={level}
                                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                  isCurrent
                                    ? "bg-yellow-400 text-yellow-900"
                                    : isUnlocked
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-gray-100 text-gray-300"
                                }`}
                                title={`Level ${level}`}
                              >
                                {level}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {!game.comingSoon && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 self-center"
                        style={{ backgroundColor: game.color }}
                      >
                        <span className="text-white text-lg">▶</span>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Level Selection Modal */}
        <AnimatePresence>
          {selectedGame && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSelectedGame(null)}
              />

              {/* Modal */}
              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                {/* Header */}
                <div
                  className="p-6 text-white"
                  style={{ backgroundColor: selectedGame.color }}
                >
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
                      {selectedGame.emoji}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedGame.name}</h2>
                      <p className="text-white/80 text-sm">{selectedGame.description}</p>
                    </div>
                  </div>
                </div>

                {/* Level Selection */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">Choose a difficulty level:</p>
                  
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {Array.from({ length: selectedGame.maxLevel - selectedGame.minLevel + 1 }, (_, i) => {
                      const level = selectedGame.minLevel + i;
                      const isUnlocked = level <= currentLevel + 2;
                      const isCurrent = level === currentLevel;
                      const isSelected = selectedLevel === level;
                      
                      return (
                        <button
                          key={level}
                          onClick={() => isUnlocked && setSelectedLevel(level)}
                          disabled={!isUnlocked}
                          className={`aspect-square rounded-xl text-lg font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                            isSelected
                              ? "ring-2 ring-offset-2 scale-105"
                              : ""
                          } ${
                            !isUnlocked
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                              : isCurrent
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          style={{}}
                        >
                          <span>{level}</span>
                          {isCurrent && <span className="text-[10px]">Current</span>}
                          {!isUnlocked && <span className="text-[10px]">🔒</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => {
                      if (selectedLevel !== null) {
                        const params = new URLSearchParams();
                        if (selectedGame.mode) params.set("mode", selectedGame.mode);
                        params.set("level", selectedLevel.toString());
                        router.push(`${selectedGame.basePath}?${params.toString()}`);
                      } else {
                        // Use auto mode with default level
                        const params = new URLSearchParams();
                        if (selectedGame.mode) params.set("mode", selectedGame.mode);
                        router.push(`${selectedGame.basePath}?${params.toString()}`);
                      }
                    }}
                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: selectedGame.color }}
                  >
                    {selectedLevel !== null
                      ? `Play Level ${selectedLevel}`
                      : "Quick Play (Auto Level)"}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Quick play uses your current level. Choose a specific level to override.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info box */}
        <motion.div
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Start with games at your level. 
            Complete games to earn XP and unlock higher levels!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
