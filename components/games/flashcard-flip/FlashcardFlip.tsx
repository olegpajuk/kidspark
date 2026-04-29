"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Volume2, RotateCcw } from "lucide-react";
import { generateFlashcardQuestions } from "@/lib/games/question-generators/english/flashcard";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { FlashcardQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;

interface Props {
  difficulty: DifficultyTier;
}

export function FlashcardFlip({ difficulty }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<FlashcardQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const init = useCallback(() => {
    setQuestions(generateFlashcardQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsComplete(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  const handleOptionSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);

    const correct = option === currentQ.correctAnswer;
    if (correct) {
      playSound("correct");
      setScore((s) => s + 1);
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      if (currentIdx + 1 >= QUESTIONS_PER_SESSION) {
        setIsComplete(true);
      } else {
        setCurrentIdx((i) => i + 1);
        setSelectedAnswer(null);
      }
    }, 1600);
  };

  if (!currentQ) return null;

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
  const isImageToWord = currentQ.mode === "image-to-word";

  return (
    <div className="min-h-screen bg-[#F0EEFF] flex flex-col">
      {/* Header */}
      <div className="bg-[#6C63FF] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/games/english")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Flashcard Flip</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">
          {currentIdx + 1}/{QUESTIONS_PER_SESSION}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-purple-200">
        <motion.div
          className="h-full bg-[#6C63FF]"
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {/* Prompt label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIdx}
            className="text-gray-500 text-sm font-medium"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {isImageToWord ? "What word matches this picture?" : "Which picture matches this word?"}
          </motion.p>
        </AnimatePresence>

        {/* Main stimulus card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${currentIdx}`}
            className="w-56 h-56 rounded-3xl bg-white shadow-xl flex flex-col items-center justify-center gap-3 select-none"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            {isImageToWord ? (
              <>
                <span className="text-8xl">{currentQ.word.emoji}</span>
                <button
                  onClick={() => speak(currentQ.word.word)}
                  className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isSpeaking ? "Speaking…" : "Hear it"}
                </button>
              </>
            ) : (
              <>
                <span className="text-4xl font-black text-[#6C63FF] tracking-wide uppercase text-center px-4">
                  {currentQ.word.word}
                </span>
                <button
                  onClick={() => speak(currentQ.word.word)}
                  className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isSpeaking ? "Speaking…" : "Hear it"}
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Answer options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`opts-${currentIdx}`}
            className="w-full max-w-xs"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let bg =
                  "bg-white border-2 border-purple-200 text-gray-800 hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98]";
                if (selectedAnswer) {
                  if (isCorrect)
                    bg = "bg-green-500 border-green-500 text-white scale-[1.03]";
                  else if (isSelected)
                    bg = "bg-red-400 border-red-400 text-white";
                  else
                    bg = "bg-white border-2 border-gray-200 text-gray-400 opacity-60";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={!!selectedAnswer}
                    className={`py-4 rounded-2xl font-bold text-sm transition-all ${bg}`}
                  >
                    {isImageToWord ? (
                      opt
                    ) : (
                      // word-to-image: options are still the word text (correct = matching word)
                      // but displayed as emoji if we can find it
                      opt
                    )}
                  </button>
                );
              })}
            </div>

            {/* Wrong answer hint */}
            {selectedAnswer && selectedAnswer !== currentQ.correctAnswer && (
              <motion.p
                className="mt-3 text-center text-xs text-green-700 font-medium bg-green-50 border border-green-200 rounded-xl py-2 px-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✓ The answer is: <strong>{currentQ.correctAnswer}</strong>
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Session Complete Overlay */}
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
                {stars === 3 ? "🌟" : stars === 2 ? "⭐" : stars === 1 ? "✨" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Amazing!" : stars === 1 ? "Good try!" : "Keep practising!"}
              </h2>
              <p className="text-gray-500 mb-4">
                You got <span className="font-bold text-purple-600">{score}/{QUESTIONS_PER_SESSION}</span> correct
              </p>

              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mb-5">⭐⭐⭐ = 9+ &nbsp;·&nbsp; ⭐⭐ = 7+ &nbsp;·&nbsp; ⭐ = 5+</p>

              <div className="flex gap-3">
                <button
                  onClick={init}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-100 text-purple-700 font-bold hover:bg-purple-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={() => router.push("/games/english")}
                  className="flex-1 py-3 rounded-xl bg-[#6C63FF] text-white font-bold hover:opacity-90 transition-opacity"
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
