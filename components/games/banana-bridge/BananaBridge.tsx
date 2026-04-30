"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "@/components/celebrations/Sparkles";
import { useAudio } from "@/hooks/useAudio";
import { BridgeToTen } from "./BridgeToTen";
import { BridgeToTenPractice } from "./BridgeToTenPractice";
import type { BananaBridgeQuestion } from "@/lib/games/question-generators/banana-bridge";

// Game mode types
export type BridgeGameMode = "practice" | "learn" | "visual";

interface BananaBridgeProps {
  question: BananaBridgeQuestion;
  onComplete: (result: { correct: boolean; hintsUsed: number; timeSpent: number }) => void;
  questionNumber: number;
  totalQuestions: number;
  gameMode?: BridgeGameMode; // New: mode selection
}

export function BananaBridge({
  question,
  onComplete,
  questionNumber,
  totalQuestions,
  gameMode = "practice", // Default to practice mode
}: BananaBridgeProps) {
  // Use BridgeToTen for problems that require bridging (difficulty 4+)
  const needsBridging = question.bridgesThrough !== null;

  if (needsBridging && question.addends.length === 2) {
    // Choose component based on game mode
    if (gameMode === "learn") {
      // Learn mode: Visual step-by-step with drag/tap
      return (
        <BridgeToTen
          num1={question.addends[0]}
          num2={question.addends[1]}
          onComplete={onComplete}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />
      );
    }
    
    // Practice mode: Pick numbers, answer first
    return (
      <BridgeToTenPractice
        num1={question.addends[0]}
        num2={question.addends[1]}
        onComplete={onComplete}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
    );
  }

  // For simpler questions, use the basic counting game
  return (
    <SimpleCountingGame
      question={question}
      onComplete={onComplete}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
    />
  );
}

// Simple counting game for basic addition (no bridging needed)
function SimpleCountingGame({
  question,
  onComplete,
  questionNumber,
  totalQuestions,
}: BananaBridgeProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [fruitsPlaced, setFruitsPlaced] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const { playSound } = useAudio();

  const totalFruits = question.addends.reduce((a, b) => a + b, 0);

  // Reset when question changes
  useEffect(() => {
    setCurrentValue(0);
    setFruitsPlaced(0);
    setHintsUsed(0);
    setShowHint(false);
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, [question.id]);

  const handleAddFruit = useCallback(() => {
    if (fruitsPlaced >= totalFruits || isComplete) return;

    const newValue = currentValue + 1;
    const newFruitsPlaced = fruitsPlaced + 1;

    playSound("snap");
    setCurrentValue(newValue);
    setFruitsPlaced(newFruitsPlaced);

    // Check if we reached the target
    if (newValue === question.correctAnswer) {
      setIsComplete(true);
      playSound("correct");

      setTimeout(() => {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onComplete({ correct: true, hintsUsed, timeSpent });
      }, 1500);
    }
  }, [currentValue, fruitsPlaced, totalFruits, isComplete, question.correctAnswer, hintsUsed, onComplete, playSound]);

  const handleShowHint = useCallback(() => {
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
    playSound("pop");
    setTimeout(() => setShowHint(false), 4000);
  }, [playSound]);

  const progressPercent = Math.min(100, (currentValue / question.correctAnswer) * 100);
  const fruitEmojis = ["🍌", "🍎", "🍊", "🍇", "🍓", "🥝", "🍑", "🍐", "🍒", "🥭"];

  return (
    <div className="flex flex-col h-full p-3 gap-3 relative overflow-auto">
      {/* Celebration sparkles */}
      <Sparkles active={isComplete} />

      {/* Question Header - more compact */}
      <motion.div 
        className="text-center py-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-gray-500 mb-0.5">Question {questionNumber} of {totalQuestions}</p>
        <p className="text-2xl font-bold text-gray-800">
          {question.addends.join(" + ")} = <span className="text-red-400">?</span>
        </p>
      </motion.div>

      {/* Number Line Progress - more compact */}
      <motion.div 
        className="bg-white rounded-xl p-3 shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">Count</span>
          <span className="text-xs font-bold text-gray-800">{currentValue} / {question.correctAnswer}</span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", damping: 15 }}
          />
          
          {/* Current position indicator */}
          {currentValue > 0 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow border-2 border-green-500 flex items-center justify-center text-[10px] font-bold"
              style={{ left: `calc(${progressPercent}% - 10px)` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {currentValue}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Result Display - more compact */}
      <motion.div
        className="bg-white rounded-xl px-4 py-3 shadow-sm text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 text-xl font-bold">
          {question.addends.map((addend, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">+</span>}
              <span className="bg-yellow-100 px-3 py-1.5 rounded-lg text-yellow-700">
                {addend}
              </span>
            </span>
          ))}
          <span className="text-gray-300">=</span>
          <motion.span
            key={currentValue}
            className={`min-w-[44px] px-3 py-1.5 rounded-lg ${
              isComplete
                ? "bg-green-100 text-green-700"
                : currentValue > 0
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-400"
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {currentValue > 0 ? currentValue : "?"}
          </motion.span>
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-3xl">🎉</span>
              <p className="text-green-600 font-bold text-sm mt-0.5">Correct! Well done!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fruit Basket - Tap to Add - more compact */}
      <motion.div 
        className="bg-white rounded-xl p-3 shadow-sm flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center mb-2">
          <span className="text-base">🧺</span>
          <p className="text-xs font-semibold text-gray-700">
            Tap each fruit to count!
          </p>
          <p className="text-[10px] text-gray-500">
            {totalFruits - fruitsPlaced} fruits remaining
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalFruits }, (_, i) => {
            const isUsed = i < fruitsPlaced;
            
            return (
              <motion.button
                key={i}
                onClick={handleAddFruit}
                disabled={isUsed || isComplete}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl
                  transition-all select-none ${
                    isUsed
                      ? "bg-gray-100 opacity-40 cursor-not-allowed scale-90"
                      : "bg-white shadow border-2 border-yellow-300 cursor-pointer active:scale-90"
                  }`}
                whileTap={!isUsed && !isComplete ? { scale: 0.9 } : {}}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: isUsed ? 0.9 : 1, 
                  rotate: 0,
                  opacity: isUsed ? 0.4 : 1
                }}
                transition={{ delay: i * 0.03, type: "spring" }}
              >
                {fruitEmojis[i % fruitEmojis.length]}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Hint Button - more compact */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {!isComplete && (
          <motion.button
            onClick={handleShowHint}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium text-xs
              active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
            whileTap={{ scale: 0.95 }}
          >
            💡 Need a hint?
            {hintsUsed > 0 && (
              <span className="bg-yellow-200 px-1.5 py-0.5 rounded-full text-[10px]">
                {hintsUsed}
              </span>
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Hint Display */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="fixed bottom-20 left-3 right-3 bg-yellow-50 border-2 border-yellow-300 
              rounded-xl p-3 shadow-lg z-50 max-w-md mx-auto"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <p className="text-center text-yellow-800 font-medium text-sm">
              💡 {question.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
