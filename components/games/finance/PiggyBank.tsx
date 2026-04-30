"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, PiggyBank as PiggyIcon } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import {
  generatePiggyBankGame,
  type SavingsGoal,
  type PiggyBankRound,
} from "@/lib/data/finance/piggy-bank";
import { formatMoneyShort } from "@/lib/data/finance/coins";
import type { DifficultyTier } from "@/types/game";

interface GameResult {
  correct: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
}

interface Props {
  difficulty: DifficultyTier;
  onComplete?: (result: GameResult) => void;
}

type GamePhase = "intro" | "earning" | "decision" | "result" | "complete";

export function PiggyBank({ difficulty, onComplete }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [rounds, setRounds] = useState<PiggyBankRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [savings, setSavings] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [lastChoice, setLastChoice] = useState<"save" | "spend" | null>(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [goalReached, setGoalReached] = useState(false);

  const initGame = useCallback(() => {
    const game = generatePiggyBankGame(difficulty);
    setGoal(game.goal);
    setRounds(game.rounds);
    setCurrentRound(0);
    setSavings(0);
    setPhase("intro");
    setLastChoice(null);
    setTotalSaved(0);
    setTotalSpent(0);
    setGoalReached(false);
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleStartGame = () => {
    setPhase("earning");
    playSound("pop");
  };

  const handleEarningComplete = () => {
    const round = rounds[currentRound];
    if (round.temptation) {
      setPhase("decision");
    } else {
      handleSave();
    }
  };

  const handleSave = () => {
    const round = rounds[currentRound];
    const newSavings = savings + round.earnedAmount;
    setSavings(newSavings);
    setTotalSaved((t) => t + round.earnedAmount);
    setLastChoice("save");
    setPhase("result");
    playSound("correct");

    if (goal && newSavings >= goal.targetAmount) {
      setGoalReached(true);
    }
  };

  const handleSpend = () => {
    const round = rounds[currentRound];
    if (!round.temptation) return;

    const leftover = round.earnedAmount - (round.temptation?.cost ?? 0);
    if (leftover > 0) {
      setSavings((s) => s + leftover);
      setTotalSaved((t) => t + leftover);
    }
    setTotalSpent((t) => t + (round.temptation?.cost ?? 0));
    setLastChoice("spend");
    setPhase("result");
    playSound("pop");
  };

  const handleNextRound = () => {
    if (goalReached || currentRound + 1 >= rounds.length) {
      setPhase("complete");
      if (goalReached) {
        playSound("fanfare");
      }
      const saveRatio = totalSaved / (totalSaved + totalSpent + 0.01);
      const stars = goalReached ? 3 : saveRatio >= 0.7 ? 2 : saveRatio >= 0.5 ? 1 : 0;
      onComplete?.({
        correct: goalReached ? rounds.length : Math.floor(saveRatio * rounds.length),
        total: rounds.length,
        stars: stars as 0 | 1 | 2 | 3,
      });
    } else {
      setCurrentRound((r) => r + 1);
      setPhase("earning");
      setLastChoice(null);
    }
  };

  if (!goal || rounds.length === 0) return null;

  const round = rounds[currentRound];
  const progressPercent = Math.min(100, (savings / goal.targetAmount) * 100);
  const stars = goalReached ? 3 : progressPercent >= 75 ? 2 : progressPercent >= 50 ? 1 : 0;

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col">
      {/* Header */}
      <div className="bg-[#FF6B9D] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/games/finance")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Piggy Bank Goals</p>
          <p className="text-white/70 text-xs">
            Level {difficulty} · Round {currentRound + 1}/{rounds.length}
          </p>
        </div>
        <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          £{savings}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-pink-200">
        <motion.div
          className="h-full bg-[#FF6B9D]"
          animate={{ width: `${(currentRound / rounds.length) * 100}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Goal Display */}
        <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border-2 border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-3xl">{goal.emoji}</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{goal.name}</p>
                <p className="text-xs text-gray-500">Goal: £{goal.targetAmount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-pink-500">£{savings}</p>
              <p className="text-[10px] text-gray-400">saved</p>
            </div>
          </div>

          {/* Progress to goal */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-700">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>

          {goalReached && (
            <motion.div
              className="mt-2 text-center text-green-600 font-bold text-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              🎉 Goal Reached! 🎉
            </motion.div>
          )}
        </div>

        {/* Game Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Intro Phase */}
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="intro"
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-6xl mb-3">🐷</div>
                <h2 className="text-xl font-black text-gray-800 mb-1">
                  Save for your {goal.name}!
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  You need £{goal.targetAmount}. Earn money and choose wisely!
                </p>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-3 bg-[#FF6B9D] text-white font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Start Saving! 🚀
                </button>
              </motion.div>
            )}

            {/* Earning Phase */}
            {phase === "earning" && (
              <motion.div
                key="earning"
                className="text-center w-full max-w-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  className="text-5xl mb-3"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  💰
                </motion.div>
                <p className="text-gray-500 text-xs mb-2">{round.scenario}</p>
                <motion.p
                  className="text-3xl font-black text-green-500 mb-4"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  +£{round.earnedAmount}
                </motion.p>
                <button
                  onClick={handleEarningComplete}
                  className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Continue →
                </button>
              </motion.div>
            )}

            {/* Decision Phase */}
            {phase === "decision" && round.temptation && (
              <motion.div
                key="decision"
                className="text-center w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-4xl mb-1">🤔</div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  You have £{round.earnedAmount}. What will you do?
                </h3>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 mb-4">
                  <div className="text-3xl mb-1">{round.temptation.emoji}</div>
                  <p className="font-bold text-gray-800 text-sm">{round.temptation.name}</p>
                  <p className="text-orange-600 font-bold text-sm">£{round.temptation.cost}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {round.earnedAmount - round.temptation.cost > 0
                      ? `(Save £${round.earnedAmount - round.temptation.cost} after)`
                      : "(Nothing left to save)"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSpend}
                    className="flex-1 py-3 bg-orange-400 text-white font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <span className="text-base">🛒</span>
                    <br />
                    Buy It!
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-pink-500 text-white font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <span className="text-base">🐷</span>
                    <br />
                    Save All!
                  </button>
                </div>
              </motion.div>
            )}

            {/* Result Phase */}
            {phase === "result" && (
              <motion.div
                key="result"
                className="text-center w-full max-w-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {lastChoice === "save" ? (
                  <>
                    <motion.div
                      className="text-5xl mb-3"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      🐷✨
                    </motion.div>
                    <h3 className="text-lg font-bold text-green-600 mb-1">Great Choice!</h3>
                    <p className="text-gray-500 text-sm">
                      You saved £{round.earnedAmount}!
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div className="text-5xl mb-3">
                      {round.temptation?.emoji}
                    </motion.div>
                    <h3 className="text-lg font-bold text-orange-500 mb-1">
                      You bought {round.temptation?.name}!
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {round.earnedAmount - (round.temptation?.cost || 0) > 0
                        ? `Saved £${round.earnedAmount - (round.temptation?.cost || 0)}`
                        : "No savings this round"}
                    </p>
                  </>
                )}

                <button
                  onClick={handleNextRound}
                  className="mt-4 px-6 py-3 bg-[#FF6B9D] text-white font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  {goalReached ? "See Results! 🎉" : "Next Round →"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Complete Overlay */}
      <AnimatePresence>
        {phase === "complete" && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-4 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-5xl mb-2">
                {goalReached ? "🏆" : progressPercent >= 50 ? "💪" : "📚"}
              </div>
              <h2 className="text-lg font-black text-gray-800 mb-2">
                {goalReached
                  ? `You got your ${goal.name}!`
                  : "Keep Saving!"}
              </h2>

              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs">
                <div className="flex justify-between mb-1.5">
                  <span className="text-gray-500">Total Saved:</span>
                  <span className="font-bold text-green-600">£{totalSaved}</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-gray-500">Total Spent:</span>
                  <span className="font-bold text-orange-500">£{totalSpent}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="text-gray-500">Final Savings:</span>
                  <span className="font-bold text-pink-600">£{savings}</span>
                </div>
              </div>

              {goalReached && (
                <p className="text-xs text-gray-500 mb-3">
                  🌟 Amazing! Patience pays off!
                </p>
              )}

              <div className="flex justify-center gap-1.5 mb-3">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={initGame}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-pink-100 text-pink-700 font-bold text-sm hover:bg-pink-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-2.5 rounded-lg bg-[#FF6B9D] text-white font-bold text-sm hover:opacity-90"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
