"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import {
  COINS,
  BILLS,
  formatMoneyShort,
  generateCoinCounterQuestion,
  type Coin,
  type Bill,
  type CoinCounterQuestion,
} from "@/lib/data/finance/coins";
import type { DifficultyTier } from "@/types/game";

const QUESTIONS_PER_ROUND = 8;

interface GameResult {
  correct: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
}

interface Props {
  difficulty: DifficultyTier;
  onComplete?: (result: GameResult) => void;
}

interface SelectedItem {
  id: string;
  type: "coin" | "bill";
  value: number;
  instanceId: string;
}

export function CoinCounter({ difficulty, onComplete }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<CoinCounterQuestion | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentTotal = selectedItems.reduce((sum, item) => sum + item.value, 0);
  const roundedTotal = Math.round(currentTotal * 100) / 100;

  const nextQuestion = useCallback(() => {
    setQuestion(generateCoinCounterQuestion(difficulty));
    setSelectedItems([]);
    setIsCorrect(null);
    setShowHint(false);
  }, [difficulty]);

  useEffect(() => {
    nextQuestion();
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
  }, [difficulty, nextQuestion]);

  const handleAddCoin = (coin: Coin) => {
    if (isCorrect !== null) return;
    
    const newItem: SelectedItem = {
      id: coin.id,
      type: "coin",
      value: coin.value,
      instanceId: `${coin.id}-${Date.now()}-${Math.random()}`,
    };
    
    setSelectedItems((prev) => [...prev, newItem]);
    playSound("pop");
  };

  const handleAddBill = (bill: Bill) => {
    if (isCorrect !== null) return;
    
    const newItem: SelectedItem = {
      id: bill.id,
      type: "bill",
      value: bill.value,
      instanceId: `${bill.id}-${Date.now()}-${Math.random()}`,
    };
    
    setSelectedItems((prev) => [...prev, newItem]);
    playSound("pop");
  };

  const handleRemoveItem = (instanceId: string) => {
    if (isCorrect !== null) return;
    setSelectedItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
    playSound("pop");
  };

  const handleClear = () => {
    if (isCorrect !== null) return;
    setSelectedItems([]);
    playSound("whoosh");
  };

  const handleCheck = () => {
    if (!question) return;
    
    const isMatch = Math.abs(roundedTotal - question.targetAmount) < 0.001;
    setIsCorrect(isMatch);
    
    if (isMatch) {
      playSound("correct");
      setTotalCorrect((t) => t + 1);
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      if (round + 1 >= QUESTIONS_PER_ROUND) {
        const finalCorrect = isMatch ? totalCorrect + 1 : totalCorrect;
        const finalStars = finalCorrect >= QUESTIONS_PER_ROUND * 0.9 ? 3 : finalCorrect >= QUESTIONS_PER_ROUND * 0.6 ? 2 : 1;
        setIsComplete(true);
        onComplete?.({
          correct: finalCorrect,
          total: QUESTIONS_PER_ROUND,
          stars: finalStars as 0 | 1 | 2 | 3,
        });
      } else {
        setRound((r) => r + 1);
        nextQuestion();
      }
    }, 1500);
  };

  const initGame = () => {
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
    nextQuestion();
  };

  if (!question) return null;

  const stars = totalCorrect >= QUESTIONS_PER_ROUND * 0.9 ? 3 : totalCorrect >= QUESTIONS_PER_ROUND * 0.6 ? 2 : 1;
  const isOverTarget = roundedTotal > question.targetAmount;
  const isExactMatch = Math.abs(roundedTotal - question.targetAmount) < 0.001;

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex flex-col">
      {/* Header */}
      <div className="bg-[#FFB800] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/games/finance")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Coin Counter</p>
          <p className="text-white/70 text-xs">
            Level {difficulty} · Round {round + 1}/{QUESTIONS_PER_ROUND}
          </p>
        </div>
        <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          {totalCorrect} ✓
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-yellow-200">
        <motion.div
          className="h-full bg-[#FFB800]"
          animate={{ width: `${(round / QUESTIONS_PER_ROUND) * 100}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        {/* Target Amount - more compact */}
        <div className="text-center mb-3">
          <p className="text-gray-500 text-xs mb-0.5">Make this amount:</p>
          <motion.div
            className="text-4xl font-black text-gray-800"
            key={question.targetAmount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {formatMoneyShort(question.targetAmount)}
          </motion.div>
        </div>

        {/* Current Total Display - more compact */}
        <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-500 text-xs">Your total:</span>
            <button
              onClick={handleClear}
              disabled={selectedItems.length === 0 || isCorrect !== null}
              className="text-[10px] text-gray-400 disabled:opacity-30 flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Clear
            </button>
          </div>
          <motion.div
            className={`text-2xl font-bold text-center ${
              isExactMatch
                ? "text-green-500"
                : isOverTarget
                ? "text-red-500"
                : "text-gray-800"
            }`}
            animate={{ scale: isCorrect !== null ? [1, 1.1, 1] : 1 }}
          >
            {formatMoneyShort(roundedTotal)}
          </motion.div>
          
          {/* Selected items visual - smaller */}
          <div className="flex flex-wrap gap-0.5 mt-2 min-h-[32px] justify-center">
            <AnimatePresence mode="popLayout">
              {selectedItems.map((item) => {
                const coinData = COINS.find((c) => c.id === item.id);
                const billData = BILLS.find((b) => b.id === item.id);
                const data = coinData || billData;
                
                return (
                  <motion.button
                    key={item.instanceId}
                    onClick={() => handleRemoveItem(item.instanceId)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm active:scale-90 transition-transform"
                    style={{
                      backgroundColor: data?.bgColor || "#EEE",
                      color: data?.color || "#333",
                      border: `1.5px solid ${data?.color || "#CCC"}`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    layout
                  >
                    {item.type === "bill" ? "💵" : formatMoneyShort(item.value)}
                  </motion.button>
                );
              })}
            </AnimatePresence>
            {selectedItems.length === 0 && (
              <p className="text-gray-300 text-[10px]">Tap coins below to add</p>
            )}
          </div>
        </div>

        {/* Hint */}
        {showHint && (
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-blue-700">
              💡 Tip: Start with the largest coins/bills first!
            </p>
          </motion.div>
        )}

        {/* Coins & Bills Selection - more compact */}
        <div className="space-y-3">
          {/* Bills */}
          {question.availableBills.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                Notes
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {question.availableBills.map((bill) => (
                  <motion.button
                    key={bill.id}
                    onClick={() => handleAddBill(bill)}
                    disabled={isCorrect !== null}
                    className="px-3 py-2 rounded-lg font-bold text-white shadow-sm disabled:opacity-50 active:scale-95 transition-transform text-xs"
                    style={{ backgroundColor: bill.color }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm">{bill.emoji}</span>
                    <span className="ml-1">{bill.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Coins - smaller but still touchable */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              Coins
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {question.availableCoins.map((coin) => (
                <motion.button
                  key={coin.id}
                  onClick={() => handleAddCoin(coin)}
                  disabled={isCorrect !== null}
                  className={`rounded-full font-bold shadow-sm disabled:opacity-50 active:scale-90 transition-transform flex items-center justify-center ${
                    coin.size === "small"
                      ? "w-10 h-10 text-[10px]"
                      : coin.size === "medium"
                      ? "w-11 h-11 text-[11px]"
                      : "w-12 h-12 text-xs"
                  }`}
                  style={{
                    backgroundColor: coin.bgColor,
                    color: coin.color,
                    border: `2px solid ${coin.color}`,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {coin.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-3 space-y-2">
          {!showHint && isCorrect === null && (
            <button
              onClick={() => setShowHint(true)}
              className="w-full py-1.5 text-xs text-gray-400"
            >
              Need a hint?
            </button>
          )}

          {isCorrect === null && (
            <button
              onClick={handleCheck}
              disabled={selectedItems.length === 0}
              className="w-full py-3 rounded-xl bg-[#FFB800] text-white font-bold text-sm disabled:opacity-40 active:scale-[0.98]"
            >
              Check Answer
            </button>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                className={`py-3 rounded-xl font-bold text-white text-center text-sm ${
                  isCorrect ? "bg-green-500" : "bg-red-400"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                {isCorrect ? "🎉 Perfect!" : `❌ It was ${formatMoneyShort(question.targetAmount)}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Complete Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">
                {stars === 3 ? "🏆" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Money Master!" : "Keep practising!"}
              </h2>
              <p className="text-gray-500 mb-6">
                You got{" "}
                <span className="font-bold text-yellow-600">{totalCorrect}</span> out
                of {QUESTIONS_PER_ROUND} correct
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={initGame}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-100 text-yellow-700 font-bold hover:bg-yellow-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-3 rounded-xl bg-[#FFB800] text-white font-bold hover:opacity-90"
                >
                  Back to Hub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
