"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Plus, Minus } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import {
  BUDGET_CATEGORIES,
  initializeBudgetGame,
  checkEventAffordable,
  type BudgetGameState,
  type BudgetEvent,
} from "@/lib/data/finance/budget-boss";
import type { DifficultyTier } from "@/types/game";

interface Props {
  difficulty: DifficultyTier;
}

export function BudgetBoss({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [game, setGame] = useState<BudgetGameState | null>(null);
  const [showEventResult, setShowEventResult] = useState(false);
  const [lastEventSuccess, setLastEventSuccess] = useState(false);

  const initGame = useCallback(() => {
    const newGame = initializeBudgetGame(difficulty);
    setGame(newGame);
    setShowEventResult(false);
    setLastEventSuccess(false);
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getTotalAllocated = () => {
    if (!game) return 0;
    return Object.values(game.allocations).reduce((sum, val) => sum + val, 0);
  };

  const getRemaining = () => {
    if (!game) return 0;
    return game.weeklyBudget - getTotalAllocated();
  };

  const handleAdjustAllocation = (categoryId: string, delta: number) => {
    if (!game) return;

    const newValue = Math.max(0, (game.allocations[categoryId] || 0) + delta);
    const otherTotal = Object.entries(game.allocations)
      .filter(([id]) => id !== categoryId)
      .reduce((sum, [, val]) => sum + val, 0);

    if (otherTotal + newValue <= game.weeklyBudget) {
      setGame({
        ...game,
        allocations: {
          ...game.allocations,
          [categoryId]: newValue,
        },
      });
      playSound("pop");
    }
  };

  const handleConfirmBudget = () => {
    if (!game) return;
    setGame({ ...game, phase: "events" });
    playSound("correct");
  };

  const handleEventChoice = (proceed: boolean) => {
    if (!game) return;

    const event = game.events[game.currentEvent];
    const canAfford = checkEventAffordable(game.allocations, event);
    const success = proceed && canAfford;

    const newAllocations = { ...game.allocations };
    if (success && event.cost > 0) {
      newAllocations[event.category] -= event.cost;
    }

    setGame({
      ...game,
      allocations: newAllocations,
      results: [...game.results, { event, success, spent: success ? event.cost : 0 }],
    });

    setLastEventSuccess(success);
    setShowEventResult(true);

    if (success) {
      playSound("correct");
    } else if (proceed && !canAfford) {
      playSound("wrong");
    }
  };

  const handleNextEvent = () => {
    if (!game) return;

    setShowEventResult(false);

    if (game.currentEvent + 1 >= game.events.length) {
      setGame({ ...game, phase: "complete" });
      playSound("fanfare");
    } else {
      setGame({ ...game, currentEvent: game.currentEvent + 1 });
    }
  };

  if (!game) return null;

  const currentEvent = game.events[game.currentEvent];
  const canAffordCurrentEvent = currentEvent
    ? checkEventAffordable(game.allocations, currentEvent)
    : false;

  const successCount = game.results.filter((r) => r.success).length;
  const totalEvents = game.events.length;
  const stars = successCount >= totalEvents * 0.9 ? 3 : successCount >= totalEvents * 0.6 ? 2 : 1;

  return (
    <div className="min-h-screen bg-[#F0FFF4] flex flex-col">
      {/* Header */}
      <div className="bg-[#2ECC71] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/games/finance")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">📊 Budget Boss</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          £{game.weeklyBudget}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Allocation Phase */}
          {game.phase === "allocate" && (
            <motion.div
              key="allocate"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Plan Your Week!
                </h3>
                <p className="text-sm text-gray-500">
                  Divide £{game.weeklyBudget} between categories
                </p>
              </div>

              {/* Remaining indicator */}
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Left to allocate:</span>
                  <span
                    className={`text-2xl font-black ${
                      getRemaining() === 0
                        ? "text-green-500"
                        : getRemaining() < 0
                        ? "text-red-500"
                        : "text-gray-800"
                    }`}
                  >
                    £{getRemaining()}
                  </span>
                </div>
                <div className="mt-2 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    animate={{
                      width: `${Math.min(100, (getTotalAllocated() / game.weeklyBudget) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3 mb-4">
                {BUDGET_CATEGORIES.map((category) => {
                  const allocated = game.allocations[category.id] || 0;
                  const percent =
                    game.weeklyBudget > 0
                      ? Math.round((allocated / game.weeklyBudget) * 100)
                      : 0;

                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-xl p-4 shadow-sm"
                      style={{ borderLeft: `4px solid ${category.color}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.emoji}</span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xl font-black"
                            style={{ color: category.color }}
                          >
                            £{allocated}
                          </p>
                          <p className="text-xs text-gray-400">{percent}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAdjustAllocation(category.id, -5)}
                          disabled={allocated < 5}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30 hover:bg-gray-200"
                        >
                          <Minus className="w-5 h-5" />
                        </button>

                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: category.color }}
                            animate={{ width: `${percent}%` }}
                          />
                        </div>

                        <button
                          onClick={() => handleAdjustAllocation(category.id, 5)}
                          disabled={getRemaining() < 5}
                          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 hover:opacity-80"
                          style={{ backgroundColor: category.bgColor }}
                        >
                          <Plus className="w-5 h-5" style={{ color: category.color }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleConfirmBudget}
                disabled={getRemaining() !== 0}
                className="w-full py-4 bg-[#2ECC71] text-white font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                {getRemaining() === 0
                  ? "Start the Week! →"
                  : `Allocate £${getRemaining()} more`}
              </button>
            </motion.div>
          )}

          {/* Events Phase */}
          {game.phase === "events" && currentEvent && !showEventResult && (
            <motion.div
              key={`event-${game.currentEvent}`}
              className="flex-1 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  Event {game.currentEvent + 1} of {game.events.length}
                </p>
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {currentEvent.emoji}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {currentEvent.title}
                </h3>
                <p className="text-gray-500">{currentEvent.description}</p>
              </div>

              <div className="bg-white rounded-xl p-4 mb-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-bold text-lg">
                    £{currentEvent.cost}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {BUDGET_CATEGORIES.find((c) => c.id === currentEvent.category)
                      ?.name || "Category"}{" "}
                    Budget:
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      canAffordCurrentEvent ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    £{game.allocations[currentEvent.category] || 0}
                  </span>
                </div>
                {!canAffordCurrentEvent && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠️ Not enough in this category!
                  </p>
                )}
              </div>

              {currentEvent.isOptional ? (
                <div className="flex gap-3 w-full max-w-sm">
                  <button
                    onClick={() => handleEventChoice(false)}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleEventChoice(true)}
                    disabled={!canAffordCurrentEvent}
                    className="flex-1 py-4 bg-[#2ECC71] text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-40"
                  >
                    {canAffordCurrentEvent ? "Pay £" + currentEvent.cost : "Can't Afford"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEventChoice(true)}
                  className={`w-full max-w-sm py-4 font-bold rounded-2xl ${
                    canAffordCurrentEvent
                      ? "bg-[#2ECC71] text-white hover:opacity-90"
                      : "bg-red-400 text-white"
                  }`}
                >
                  {canAffordCurrentEvent
                    ? `Pay £${currentEvent.cost}`
                    : "Can't Afford! 😟"}
                </button>
              )}
            </motion.div>
          )}

          {/* Event Result */}
          {game.phase === "events" && showEventResult && currentEvent && (
            <motion.div
              key="result"
              className="flex-1 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">
                {lastEventSuccess ? "✅" : "❌"}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {lastEventSuccess
                  ? currentEvent.positiveOutcome
                  : currentEvent.negativeOutcome}
              </h3>

              {lastEventSuccess && currentEvent.cost > 0 && (
                <p className="text-gray-500 mb-4">
                  Spent £{currentEvent.cost} from{" "}
                  {BUDGET_CATEGORIES.find((c) => c.id === currentEvent.category)
                    ?.name}
                </p>
              )}

              <button
                onClick={handleNextEvent}
                className="px-8 py-4 bg-[#2ECC71] text-white font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95"
              >
                {game.currentEvent + 1 >= game.events.length
                  ? "See Results"
                  : "Next Event →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Overlay */}
      <AnimatePresence>
        {game.phase === "complete" && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-6xl mb-3">
                {stars === 3 ? "🏆" : stars === 2 ? "📊" : "📚"}
              </div>
              <h2 className="text-xl font-black text-gray-800 mb-2">
                Week Complete!
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Events Handled:</span>
                  <span className="font-bold">
                    {successCount}/{totalEvents}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-500 mb-2">Money Left:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGET_CATEGORIES.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-1">
                        <span>{cat.emoji}</span>
                        <span className="text-xs font-bold">
                          £{game.allocations[cat.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {stars === 3
                  ? "Amazing budgeting! You handled everything!"
                  : stars === 2
                  ? "Good job! A few unexpected expenses!"
                  : "Keep practicing! Planning ahead helps!"}
              </p>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-2xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={initGame}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-3 rounded-xl bg-[#2ECC71] text-white font-bold hover:opacity-90"
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
