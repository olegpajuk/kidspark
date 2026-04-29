"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "@/components/celebrations/Sparkles";
import { useAudio } from "@/hooks/useAudio";
import { HelpCircle, X } from "lucide-react";

type GameStep = 
  | "answering"        // Simple answer selection
  | "correct"          // Brief celebration
  | "show-help";       // Animated learning

interface BridgeToTenPracticeProps {
  num1: number;
  num2: number;
  onComplete: (result: { correct: boolean; hintsUsed: number; timeSpent: number }) => void;
  questionNumber: number;
  totalQuestions: number;
}

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate 3 answer options (correct + 2 distractors)
function generateAnswerOptions(correct: number): number[] {
  const options = new Set<number>([correct]);
  
  // Add nearby numbers as distractors
  const distractors = [correct - 1, correct + 1, correct - 2, correct + 2]
    .filter(n => n > 0 && n !== correct);
  
  while (options.size < 3 && distractors.length > 0) {
    const idx = Math.floor(Math.random() * distractors.length);
    options.add(distractors.splice(idx, 1)[0]);
  }
  
  return shuffleArray([...options]);
}

export function BridgeToTenPractice({
  num1,
  num2,
  onComplete,
  questionNumber,
  totalQuestions,
}: BridgeToTenPracticeProps) {
  const bigger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);
  const answer = num1 + num2;
  const toMakeTen = 10 - bigger;
  const remaining = smaller - toMakeTen;

  const [step, setStep] = useState<GameStep>("answering");
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());

  const { playSound } = useAudio();

  // Generate 3 answer options
  const answerOptions = useMemo(() => generateAnswerOptions(answer), [answer]);

  // Reset on question change
  useEffect(() => {
    setStep("answering");
    setWrongAnswer(null);
  }, [num1, num2]);

  const handlePickAnswer = useCallback((picked: number) => {
    if (picked === answer) {
      playSound("correct");
      setStep("correct");
      
      // Auto-advance after celebration
      setTimeout(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        onComplete({ correct: true, hintsUsed, timeSpent });
      }, 1800);
    } else {
      playSound("wrong");
      setWrongAnswer(picked);
      setTimeout(() => setWrongAnswer(null), 500);
    }
  }, [answer, playSound, startTime, hintsUsed, onComplete]);

  const handleShowHelp = useCallback(() => {
    setStep("show-help");
    setHintsUsed(prev => prev + 1);
    playSound("pop");
  }, [playSound]);

  const handleCloseHelp = useCallback(() => {
    setStep("answering");
  }, []);

  return (
    <div className="flex flex-col h-full p-4 gap-6 relative overflow-auto">
      <Sparkles active={step === "correct"} />

      {/* Question Header */}
      <div className="text-center py-1">
        <p className="text-sm text-gray-500">Question {questionNumber} of {totalQuestions}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* MAIN ANSWERING MODE */}
        {step === "answering" && (
          <motion.div
            key="answering"
            className="flex-1 flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Big Equation */}
            <div className="bg-white rounded-3xl px-8 py-6 shadow-lg">
              <div className="flex items-center justify-center gap-4 text-4xl font-bold">
                <span className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center text-green-700">{bigger}</span>
                <span className="text-gray-300">+</span>
                <span className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-700">{smaller}</span>
                <span className="text-gray-300">=</span>
                <span className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center text-gray-400">?</span>
              </div>
            </div>

            {/* 3 Answer Choices */}
            <div className="flex gap-4">
              {answerOptions.map((num) => {
                const isWrong = wrongAnswer === num;
                
                return (
                  <motion.button
                    key={num}
                    onClick={() => handlePickAnswer(num)}
                    className={`w-20 h-20 rounded-2xl text-3xl font-bold border-4 transition-all shadow-lg ${
                      isWrong
                        ? "bg-red-100 border-red-400 text-red-600"
                        : "bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:scale-110 active:scale-95"
                    }`}
                    animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {num}
                  </motion.button>
                );
              })}
            </div>

            {/* Help Button */}
            <motion.button
              onClick={handleShowHelp}
              className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium
                hover:bg-blue-200 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HelpCircle className="w-5 h-5" />
              Need help?
            </motion.button>
          </motion.div>
        )}

        {/* CORRECT ANSWER CELEBRATION */}
        {step === "correct" && (
          <motion.div
            key="correct"
            className="flex-1 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Big checkmark */}
            <motion.div
              className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-6xl">✓</span>
            </motion.div>

            {/* Equation with answer */}
            <motion.div 
              className="bg-white rounded-3xl px-8 py-6 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-4 text-3xl font-bold">
                <span className="text-green-600">{bigger}</span>
                <span className="text-gray-300">+</span>
                <span className="text-orange-600">{smaller}</span>
                <span className="text-gray-300">=</span>
                <motion.span 
                  className="text-purple-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.5 }}
                >
                  {answer}
                </motion.span>
              </div>
            </motion.div>

            {/* Well done text */}
            <motion.p
              className="text-2xl font-bold text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Well done! 🎉
            </motion.p>
          </motion.div>
        )}

        {/* ANIMATED HELP MODE */}
        {step === "show-help" && (
          <AnimatedHelp
            bigger={bigger}
            smaller={smaller}
            toMakeTen={toMakeTen}
            remaining={remaining}
            answer={answer}
            onClose={handleCloseHelp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Animated Help Component with flying fruits
function AnimatedHelp({
  bigger,
  smaller,
  toMakeTen,
  remaining,
  answer,
  onClose,
}: {
  bigger: number;
  smaller: number;
  toMakeTen: number;
  remaining: number;
  answer: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "flying" | "result">("intro");
  const [flyingIndex, setFlyingIndex] = useState(0);

  // Start animation after intro
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("flying"), 1000);
    return () => clearTimeout(timer1);
  }, []);

  // Animate fruits flying one by one
  useEffect(() => {
    if (phase !== "flying") return;
    
    if (flyingIndex < smaller) {
      const timer = setTimeout(() => {
        setFlyingIndex(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      // All done, show result
      setTimeout(() => setPhase("result"), 500);
    }
  }, [phase, flyingIndex, smaller]);

  const fruitsInBigger = bigger;
  const fruitsMovedToTen = Math.min(flyingIndex, toMakeTen);
  const fruitsMovedAfterTen = Math.max(0, flyingIndex - toMakeTen);
  const fruitsRemainingInSmaller = smaller - flyingIndex;

  return (
    <motion.div
      key="help"
      className="flex-1 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Watch how it works!
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Equation display */}
      <div className="bg-white rounded-2xl p-4 shadow-md text-center">
        <div className="flex items-center justify-center gap-3 text-2xl font-bold">
          <span className="text-green-600">{bigger}</span>
          <span className="text-gray-300">+</span>
          <span className="text-orange-600">{smaller}</span>
          <span className="text-gray-300">=</span>
          <span className={phase === "result" ? "text-purple-600" : "text-gray-300"}>
            {phase === "result" ? answer : "?"}
          </span>
        </div>
      </div>

      {/* Visual Animation Area */}
      <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-4 flex-1 relative min-h-[300px]">
        {/* Number Line / 10 Box */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-medium mb-2 text-center">Making 10</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 10 }, (_, i) => {
              const isFilled = i < fruitsInBigger + fruitsMovedToTen;
              const isFromSmaller = i >= bigger && i < bigger + fruitsMovedToTen;
              const isTenSlot = i === 9;
              
              return (
                <motion.div
                  key={i}
                  className={`w-8 h-10 rounded-lg flex items-center justify-center text-lg border-2 ${
                    isFilled
                      ? isFromSmaller
                        ? "bg-blue-100 border-blue-400"
                        : "bg-green-100 border-green-400"
                      : isTenSlot
                      ? "bg-yellow-50 border-yellow-400 border-dashed"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  initial={isFromSmaller && isFilled ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                >
                  {isFilled ? "🍌" : (isTenSlot ? "10" : "")}
                </motion.div>
              );
            })}
            
            {/* Divider */}
            <div className="w-1 h-10 bg-yellow-400 rounded-full mx-1" />
            
            {/* After 10 slots */}
            {Array.from({ length: Math.max(remaining, 3) }, (_, i) => {
              const isFilled = i < fruitsMovedAfterTen;
              
              return (
                <motion.div
                  key={`after-${i}`}
                  className={`w-8 h-10 rounded-lg flex items-center justify-center text-lg border-2 ${
                    isFilled
                      ? "bg-purple-100 border-purple-400"
                      : "bg-gray-50 border-gray-200 border-dashed"
                  }`}
                  initial={isFilled ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                >
                  {isFilled ? "🍌" : ""}
                </motion.div>
              );
            })}
          </div>
          
          {/* Labels */}
          <div className="flex justify-center gap-1 mt-1">
            <div className="w-[calc(8*2rem+7*0.25rem)] text-center">
              <span className="text-xs text-gray-500">
                {fruitsInBigger + fruitsMovedToTen} / 10
              </span>
            </div>
            <div className="w-1" />
            <div className="w-[calc(3*2rem+2*0.25rem)] text-center">
              <span className="text-xs text-gray-500">+{fruitsMovedAfterTen}</span>
            </div>
          </div>
        </div>

        {/* Source Baskets */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bigger number - already placed */}
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">First: {bigger}</p>
            <div className="flex flex-wrap justify-center gap-0.5 min-h-[40px]">
              {Array.from({ length: bigger }, (_, i) => (
                <span key={i} className="text-xl opacity-30">🍌</span>
              ))}
            </div>
            <p className="text-xs text-green-600 font-medium">✓ Already on line</p>
          </div>

          {/* Smaller number - being moved */}
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Second: {smaller}</p>
            <div className="flex flex-wrap justify-center gap-0.5 min-h-[40px]">
              {Array.from({ length: smaller }, (_, i) => {
                const isMoved = i < flyingIndex;
                return (
                  <motion.span 
                    key={i} 
                    className={`text-xl ${isMoved ? "opacity-20" : ""}`}
                    animate={isMoved ? { opacity: 0.2 } : {}}
                  >
                    🍌
                  </motion.span>
                );
              })}
            </div>
            <p className="text-xs text-orange-600 font-medium">
              {fruitsRemainingInSmaller > 0 ? `${fruitsRemainingInSmaller} left` : "✓ All moved!"}
            </p>
          </div>
        </div>

        {/* Explanation text */}
        <motion.div 
          className="mt-4 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {phase === "intro" && (
            <p>Watch the bananas move...</p>
          )}
          {phase === "flying" && flyingIndex <= toMakeTen && (
            <p>Moving <span className="text-blue-600 font-bold">{toMakeTen}</span> to make <span className="text-yellow-600 font-bold">10</span>...</p>
          )}
          {phase === "flying" && flyingIndex > toMakeTen && (
            <p>Adding remaining <span className="text-purple-600 font-bold">{remaining}</span> after 10...</p>
          )}
          {phase === "result" && (
            <motion.div 
              className="bg-white rounded-xl p-3 shadow-sm"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <p className="font-bold text-lg">
                <span className="text-green-600">{bigger}</span> + 
                <span className="text-blue-600"> {toMakeTen}</span> = 
                <span className="text-yellow-600"> 10</span>, then + 
                <span className="text-purple-600"> {remaining}</span> = 
                <span className="text-pink-600 text-xl"> {answer}</span>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Got it! Let me answer
      </motion.button>
    </motion.div>
  );
}
