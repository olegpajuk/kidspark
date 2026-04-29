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
  isNew?: boolean;
  comingSoon?: boolean;
  tier: 1 | 2 | 3;
}

const ENGLISH_GAMES: GameCard[] = [
  // Tier 1 – Simple
  {
    id: "flashcard-flip",
    name: "Flashcard Flip",
    emoji: "🃏",
    description: "Tap to flip and hear the word aloud",
    minLevel: 1,
    maxLevel: 10,
    color: "#6C63FF",
    bgColor: "#F0EEFF",
    basePath: "/games/flashcard-flip",
    tier: 1,
    isNew: true,
  },
  {
    id: "missing-letter",
    name: "Missing Letter",
    emoji: "🔤",
    description: "Find the missing letters to complete the word",
    minLevel: 1,
    maxLevel: 10,
    color: "#FF6B6B",
    bgColor: "#FFF0F0",
    basePath: "/games/missing-letter",
    tier: 1,
    isNew: true,
  },
  {
    id: "spelling-bee",
    name: "Spelling Bee",
    emoji: "🐝",
    description: "Drag scrambled letters into the right order",
    minLevel: 1,
    maxLevel: 10,
    color: "#FFB800",
    bgColor: "#FFFBEB",
    basePath: "/games/spelling-bee",
    tier: 1,
    isNew: true,
  },
  {
    id: "word-match",
    name: "Word Match Memory",
    emoji: "🃏",
    description: "Match emoji cards to word cards",
    minLevel: 1,
    maxLevel: 10,
    color: "#4ECDC4",
    bgColor: "#F0FFFE",
    basePath: "/games/word-match",
    tier: 1,
    isNew: true,
  },
  {
    id: "word-categories",
    name: "Word Categories",
    emoji: "📦",
    description: "Sort words into the right category buckets",
    minLevel: 1,
    maxLevel: 10,
    color: "#FF8C42",
    bgColor: "#FFF5EE",
    basePath: "/games/word-categories",
    tier: 1,
    isNew: true,
  },
  {
    id: "rhyming-words",
    name: "Rhyming Words",
    emoji: "🎵",
    description: "Pick all words that rhyme with the target",
    minLevel: 1,
    maxLevel: 10,
    color: "#E91E9E",
    bgColor: "#FFF0F9",
    basePath: "/games/rhyming-words",
    tier: 1,
    isNew: true,
  },
  {
    id: "letter-chain",
    name: "Letter Chain",
    emoji: "🔗",
    description: "Pick words where the first letter matches the last",
    minLevel: 2,
    maxLevel: 10,
    color: "#2ECC71",
    bgColor: "#F0FFF4",
    basePath: "/games/letter-chain",
    tier: 1,
    isNew: true,
  },
  // Tier 2 – Medium
  {
    id: "crossword",
    name: "Crossword",
    emoji: "✏️",
    description: "Fill in emoji-clue crossword grids",
    minLevel: 3,
    maxLevel: 10,
    color: "#9B59B6",
    bgColor: "#F8F0FF",
    basePath: "/games/crossword",
    tier: 2,
    isNew: true,
  },
  {
    id: "word-search",
    name: "Word Search",
    emoji: "🔍",
    description: "Swipe to find hidden words in the grid",
    minLevel: 3,
    maxLevel: 10,
    color: "#3498DB",
    bgColor: "#EBF5FF",
    basePath: "/games/word-search",
    tier: 2,
    isNew: true,
  },
  {
    id: "sentence-builder",
    name: "Sentence Builder",
    emoji: "📝",
    description: "Rearrange scrambled words into a sentence",
    minLevel: 3,
    maxLevel: 10,
    color: "#E74C3C",
    bgColor: "#FDEDEC",
    basePath: "/games/sentence-builder",
    tier: 2,
    isNew: true,
  },
  {
    id: "synonym-match",
    name: "Synonym & Antonym",
    emoji: "🔄",
    description: "Match synonyms and opposites",
    minLevel: 4,
    maxLevel: 10,
    color: "#1ABC9C",
    bgColor: "#E8FDF5",
    basePath: "/games/synonym-match",
    tier: 2,
    isNew: true,
  },
  {
    id: "plural-practice",
    name: "Plural Practice",
    emoji: "📊",
    description: "Turn singular words into their plural form",
    minLevel: 2,
    maxLevel: 10,
    color: "#F39C12",
    bgColor: "#FFF8E7",
    basePath: "/games/plural-practice",
    tier: 2,
    isNew: true,
  },
  {
    id: "verb-tense",
    name: "Verb Tense Machine",
    emoji: "⏰",
    description: "Dial through past, present, and future tenses",
    minLevel: 4,
    maxLevel: 10,
    color: "#8E44AD",
    bgColor: "#F5EEF8",
    basePath: "/games/verb-tense",
    tier: 2,
    isNew: true,
  },
  // Tier 3 – Audio
  {
    id: "dictation",
    name: "Dictation Practice",
    emoji: "🎙️",
    description: "Listen and type what you hear",
    minLevel: 3,
    maxLevel: 10,
    color: "#E67E22",
    bgColor: "#FEF5E7",
    basePath: "/games/dictation",
    tier: 3,
    isNew: true,
  },
  {
    id: "listen-tap",
    name: "Listen and Tap",
    emoji: "👂",
    description: "Hear the word and tap the matching picture",
    minLevel: 1,
    maxLevel: 10,
    color: "#2980B9",
    bgColor: "#EBF5FB",
    basePath: "/games/listen-tap",
    tier: 3,
    isNew: true,
  },
  {
    id: "pronunciation",
    name: "Pronunciation",
    emoji: "🗣️",
    description: "Hear and record yourself saying each word",
    minLevel: 2,
    maxLevel: 10,
    color: "#27AE60",
    bgColor: "#EAFAF1",
    basePath: "/games/pronunciation",
    tier: 3,
    isNew: true,
  },
  {
    id: "speech-games",
    name: "Speech Recognition",
    emoji: "🤖",
    description: "Say the word aloud and the AI checks it",
    minLevel: 3,
    maxLevel: 10,
    color: "#16A085",
    bgColor: "#E8F8F5",
    basePath: "/games/speech-games",
    tier: 3,
    isNew: true,
  },
];

const TIER_LABELS = { 1: "Starter Games", 2: "Challenge Games", 3: "Audio & Speech" };

export default function EnglishGamesPage() {
  const router = useRouter();
  const { activeChild } = useChildStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const currentLevel = activeChild?.levels?.english?.level ?? 1;
  const childId = activeChild?.id ?? "guest";

  const tiers = [1, 2, 3] as const;

  const sortedGamesByTier = useMemo(() => {
    const result: Record<number, GameCard[]> = { 1: [], 2: [], 3: [] };
    for (const tier of tiers) {
      const tierGames = ENGLISH_GAMES.filter((g) => g.tier === tier);
      result[tier] = tierGames.sort((a, b) => {
        const aFav = isFavorite(childId, a.id);
        const bFav = isFavorite(childId, b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
    }
    return result;
  }, [childId, isFavorite]);

  return (
    <div className="min-h-screen bg-[#F0EEFF] pb-8">
      {/* Header */}
      <div className="bg-[#6C63FF] text-white px-4 py-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-4xl">📖</span>
            <div>
              <h1 className="text-2xl font-bold">English Games</h1>
              <p className="text-white/80 text-sm">Choose a game to play!</p>
            </div>
          </div>

          {/* Current level indicator */}
          <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-sm">Your level:</span>
            <span className="font-bold text-lg">{currentLevel}</span>
            <span className="text-xs text-white/70">
              ({activeChild?.levels?.english?.xp ?? 0} XP)
            </span>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {tiers.map((tier) => (
          <div key={tier} className="mb-6">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 mt-4">
              {TIER_LABELS[tier]}
            </h2>
            <div className="grid gap-3">
              {sortedGamesByTier[tier].map((game, index) => {
                const isGameFavorite = isFavorite(childId, game.id);
                return (
                  <motion.div
                    key={game.id}
                    className={`relative bg-white rounded-2xl p-4 shadow-sm text-left transition-all ${
                      game.comingSoon
                        ? "opacity-60"
                        : "hover:shadow-md"
                    }`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
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
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                          style={{ backgroundColor: game.bgColor }}
                        >
                          {game.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-gray-800 text-sm">{game.name}</h3>
                            {game.isNew && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                NEW
                              </span>
                            )}
                            {game.comingSoon && (
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{game.description}</p>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Levels:</span>
                            <div className="flex gap-1">
                              {Array.from(
                                { length: Math.min(game.maxLevel - game.minLevel + 1, 10) },
                                (_, i) => {
                                  const level = game.minLevel + i;
                                  const isUnlocked = level <= currentLevel + 2;
                                  const isCurrent = level === currentLevel;
                                  return (
                                    <div
                                      key={level}
                                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                        isCurrent
                                          ? "bg-yellow-400 text-yellow-900"
                                          : isUnlocked
                                          ? "bg-gray-200 text-gray-600"
                                          : "bg-gray-100 text-gray-300"
                                      }`}
                                    >
                                      {level}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>

                        {!game.comingSoon && (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 self-center"
                            style={{ backgroundColor: game.color }}
                          >
                            <span className="text-white text-base">▶</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Level Selection Modal */}
        <AnimatePresence>
          {selectedGame && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSelectedGame(null)}
              />

              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
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

                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">Choose a difficulty level:</p>

                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {Array.from(
                      { length: selectedGame.maxLevel - selectedGame.minLevel + 1 },
                      (_, i) => {
                        const level = selectedGame.minLevel + i;
                        const isUnlocked = level <= currentLevel + 2;
                        const isCurrent = level === currentLevel;
                        const isSelected = selectedLevel === level;

                        return (
                          <button
                            key={level}
                            onClick={() => isUnlocked && setSelectedLevel(level)}
                            disabled={!isUnlocked}
                            className={`aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                              isSelected ? "ring-2 ring-offset-1 scale-105" : ""
                            } ${
                              !isUnlocked
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                : isCurrent
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <span>{level}</span>
                            {isCurrent && <span className="text-[9px]">Now</span>}
                            {!isUnlocked && <span className="text-[10px]">🔒</span>}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("level", (selectedLevel ?? currentLevel).toString());
                      router.push(`${selectedGame.basePath}?${params.toString()}`);
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

        <motion.div
          className="mt-2 bg-purple-50 border border-purple-200 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-purple-800">
            <span className="font-semibold">💡 Tip:</span> Start with Starter Games and work
            your way up. Complete games to earn XP and unlock harder levels!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
