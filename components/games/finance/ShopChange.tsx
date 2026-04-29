"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import {
  COINS,
  BILLS,
  formatMoneyShort,
  type Coin,
  type Bill,
} from "@/lib/data/finance/coins";
import {
  generateShopChangeQuestion,
  type ShopChangeQuestion,
} from "@/lib/data/finance/shop-change";
import type { DifficultyTier } from "@/types/game";

const QUESTIONS_PER_ROUND = 8;

interface Props {
  difficulty: DifficultyTier;
}

interface SelectedItem {
  id: string;
  type: "coin" | "bill";
  value: number;
  instanceId: string;
}

export function ShopChange({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<ShopChangeQuestion | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState<"order" | "change">("order");

  const currentTotal = selectedItems.reduce((sum, item) => sum + item.value, 0);
  const roundedTotal = Math.round(currentTotal * 100) / 100;

  const nextQuestion = useCallback(() => {
    setQuestion(generateShopChangeQuestion(difficulty));
    setSelectedItems([]);
    setIsCorrect(null);
    setPhase("order");
  }, [difficulty]);

  useEffect(() => {
    nextQuestion();
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
  }, [difficulty, nextQuestion]);

  const handleShowChange = () => {
    setPhase("change");
    playSound("pop");
  };

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
    setSelectedItems((prev) =>
      prev.filter((item) => item.instanceId !== instanceId)
    );
    playSound("pop");
  };

  const handleClear = () => {
    if (isCorrect !== null) return;
    setSelectedItems([]);
  };

  const handleCheck = () => {
    if (!question) return;

    const isMatch = Math.abs(roundedTotal - question.changeRequired) < 0.001;
    setIsCorrect(isMatch);

    if (isMatch) {
      playSound("correct");
      setTotalCorrect((t) => t + 1);
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      if (round + 1 >= QUESTIONS_PER_ROUND) {
        setIsComplete(true);
      } else {
        setRound((r) => r + 1);
        nextQuestion();
      }
    }, 2000);
  };

  const initGame = () => {
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
    nextQuestion();
  };

  if (!question) return null;

  const stars =
    totalCorrect >= QUESTIONS_PER_ROUND * 0.9
      ? 3
      : totalCorrect >= QUESTIONS_PER_ROUND * 0.6
      ? 2
      : 1;
  const isOverChange = roundedTotal > question.changeRequired;
  const isExactMatch = Math.abs(roundedTotal - question.changeRequired) < 0.001;

  const availableCoins = difficulty <= 3 
    ? COINS.filter(c => c.value <= 0.50) 
    : COINS;
  const availableBills = difficulty <= 4 
    ? [] 
    : difficulty <= 6 
    ? BILLS.filter(b => b.value <= 5)
    : BILLS;

  return (
    <div className="min-h-screen bg-[#F0EEFF] flex flex-col">
      {/* Header */}
      <div className="bg-[#6C63FF] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/games/finance")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Shop & Change</p>
          <p className="text-white/70 text-xs">
            Level {difficulty} · Round {round + 1}/{QUESTIONS_PER_ROUND}
          </p>
        </div>
        <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          {totalCorrect} ✓
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-purple-200">
        <motion.div
          className="h-full bg-[#6C63FF]"
          animate={{ width: `${(round / QUESTIONS_PER_ROUND) * 100}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Customer & Order */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border-2 border-purple-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-4xl">{question.customer.emoji}</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{question.customer.name}</p>
              <p className="text-sm text-gray-500">
                {phase === "order" ? "wants to buy:" : "paid with:"}
              </p>
            </div>
          </div>

          {/* Items ordered */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            {question.items.map((orderItem, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1 text-sm"
              >
                <span>
                  {orderItem.item.emoji} {orderItem.item.name}
                  {orderItem.quantity > 1 && ` x${orderItem.quantity}`}
                </span>
                <span className="font-bold">
                  £{(orderItem.price * orderItem.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-purple-600">
                £{question.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {phase === "change" && (
            <motion.div
              className="bg-green-50 border-2 border-green-200 rounded-xl p-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {question.customer.name} pays:
                </span>
                <span className="text-xl font-black text-green-600">
                  💵 £{question.customerPayment}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Change needed:</span>
                <span className="text-lg font-bold text-purple-600">
                  £{question.changeRequired.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Phase */}
        {phase === "order" && (
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={handleShowChange}
              className="px-8 py-4 bg-[#6C63FF] text-white font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Customer Pays £{question.customerPayment} 💵
            </button>
          </motion.div>
        )}

        {/* Change Phase */}
        {phase === "change" && (
          <>
            {/* Change Display */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Your change:</span>
                <button
                  onClick={handleClear}
                  disabled={selectedItems.length === 0 || isCorrect !== null}
                  className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <motion.div
                className={`text-3xl font-bold text-center ${
                  isExactMatch
                    ? "text-green-500"
                    : isOverChange
                    ? "text-red-500"
                    : "text-gray-800"
                }`}
                animate={{ scale: isCorrect !== null ? [1, 1.1, 1] : 1 }}
              >
                {formatMoneyShort(roundedTotal)}
              </motion.div>

              {/* Selected coins/bills */}
              <div className="flex flex-wrap gap-1 mt-3 min-h-[40px] justify-center">
                <AnimatePresence mode="popLayout">
                  {selectedItems.map((item) => {
                    const coinData = COINS.find((c) => c.id === item.id);
                    const billData = BILLS.find((b) => b.id === item.id);
                    const data = coinData || billData;

                    return (
                      <motion.button
                        key={item.instanceId}
                        onClick={() => handleRemoveItem(item.instanceId)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: data?.bgColor || "#EEE",
                          color: data?.color || "#333",
                          border: `2px solid ${data?.color || "#CCC"}`,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        layout
                      >
                        {item.type === "bill"
                          ? "💵"
                          : formatMoneyShort(item.value)}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                {selectedItems.length === 0 && (
                  <p className="text-gray-300 text-xs">
                    Tap coins/notes below to give change
                  </p>
                )}
              </div>
            </div>

            {/* Coins & Bills Selection */}
            <div className="space-y-4">
              {availableBills.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Notes
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {availableBills.map((bill) => (
                      <motion.button
                        key={bill.id}
                        onClick={() => handleAddBill(bill)}
                        disabled={isCorrect !== null}
                        className="px-4 py-3 rounded-xl font-bold text-white shadow-md disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"
                        style={{ backgroundColor: bill.color }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-lg">{bill.emoji}</span>
                        <span className="ml-2">{bill.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Coins
                </p>
                <div className="flex gap-2 flex-wrap">
                  {availableCoins.map((coin) => (
                    <motion.button
                      key={coin.id}
                      onClick={() => handleAddCoin(coin)}
                      disabled={isCorrect !== null}
                      className={`rounded-full font-bold shadow-md disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center ${
                        coin.size === "small"
                          ? "w-12 h-12 text-xs"
                          : coin.size === "medium"
                          ? "w-14 h-14 text-sm"
                          : "w-16 h-16 text-base"
                      }`}
                      style={{
                        backgroundColor: coin.bgColor,
                        color: coin.color,
                        border: `3px solid ${coin.color}`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {coin.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-4">
              {isCorrect === null && (
                <button
                  onClick={handleCheck}
                  disabled={selectedItems.length === 0}
                  className="w-full py-4 rounded-2xl bg-[#6C63FF] text-white font-bold text-lg disabled:opacity-40 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Give Change
                </button>
              )}

              <AnimatePresence>
                {isCorrect !== null && (
                  <motion.div
                    className={`py-4 rounded-2xl font-bold text-white text-center text-lg ${
                      isCorrect ? "bg-green-500" : "bg-red-400"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {isCorrect
                      ? "🎉 Correct change!"
                      : `❌ Should be £${question.changeRequired.toFixed(2)}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
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
                {stars === 3 ? "🏪" : stars === 2 ? "⭐" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Super Shopkeeper!" : "Keep practising!"}
              </h2>
              <p className="text-gray-500 mb-6">
                You gave correct change{" "}
                <span className="font-bold text-purple-600">{totalCorrect}</span>{" "}
                times out of {QUESTIONS_PER_ROUND}
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-100 text-purple-700 font-bold hover:bg-purple-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-3 rounded-xl bg-[#6C63FF] text-white font-bold hover:opacity-90"
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
