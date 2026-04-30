"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Volume2, RotateCcw } from "lucide-react";
import { generateMissingLetterQuestions } from "@/lib/games/question-generators/english/missing-letter";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { MissingLetterQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;

interface GameResult {
  correct: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
}

interface Props {
  difficulty: DifficultyTier;
  onComplete?: (result: GameResult) => void;
}

export function MissingLetter({ difficulty, onComplete }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<MissingLetterQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [filledLetters, setFilledLetters] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const init = useCallback(() => {
    setQuestions(generateMissingLetterQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setFilledLetters({});
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setIsComplete(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  const handleLetterPick = (letter: string) => {
    if (submitted) return;

    const missing = currentQ.missingIndices;
    const nextUnfilled = missing.find((idx) => !(idx in filledLetters));
    if (nextUnfilled === undefined) return;

    const updated = { ...filledLetters, [nextUnfilled]: letter };
    setFilledLetters(updated);

    // Auto-submit when all blanks are filled
    if (Object.keys(updated).length === missing.length) {
      const allCorrect = missing.every((idx) => updated[idx] === currentQ.correctAnswers[missing.indexOf(idx)]);
      setSubmitted(true);
      setIsCorrect(allCorrect);

      if (allCorrect) {
        playSound("correct");
        setScore((s) => s + 1);
      } else {
        playSound("wrong");
      }

      setTimeout(() => {
        if (currentIdx + 1 >= QUESTIONS_PER_SESSION) {
          const finalScore = allCorrect ? score + 1 : score;
          const finalStars = finalScore >= 9 ? 3 : finalScore >= 7 ? 2 : finalScore >= 5 ? 1 : 0;
          setIsComplete(true);
          onComplete?.({
            correct: finalScore,
            total: QUESTIONS_PER_SESSION,
            stars: finalStars as 0 | 1 | 2 | 3,
          });
        } else {
          setCurrentIdx((i) => i + 1);
          setFilledLetters({});
          setSubmitted(false);
          setIsCorrect(false);
        }
      }, 1400);
    }
  };

  const handleClear = () => {
    if (submitted) return;
    setFilledLetters({});
  };

  if (!currentQ) return null;

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;

  // Build display characters
  const wordChars = currentQ.word.word.split("");

  return (
    <div className="min-h-screen bg-[#FFF0F0] flex flex-col">
      {/* Header */}
      <div className="bg-[#FF6B6B] text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/games/english")} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Missing Letter</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-red-200">
        <motion.div className="h-full bg-[#FF6B6B]" animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }} transition={{ type: "spring" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-3 py-4 gap-4">
        {/* Emoji + word display - more compact */}
        <div className="text-center">
          <div className="text-5xl mb-3">{currentQ.word.emoji}</div>
          <button
            onClick={() => speak(currentQ.word.word)}
            className="flex items-center gap-1.5 mx-auto mb-3 bg-red-100 text-red-700 rounded-full px-3 py-1.5 text-xs transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isSpeaking ? "Speaking…" : "Hear hint"}
          </button>

          {/* Word tiles - smaller */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {wordChars.map((char, idx) => {
              const isMissing = currentQ.missingIndices.includes(idx);
              const filled = filledLetters[idx];
              const missingIdx = currentQ.missingIndices.indexOf(idx);
              let bg = "bg-white border-2 border-gray-300";
              if (isMissing && filled) {
                if (submitted) {
                  bg = isCorrect
                    ? "bg-green-500 border-green-500 text-white"
                    : filled === currentQ.correctAnswers[missingIdx]
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-red-400 border-red-400 text-white";
                } else {
                  bg = "bg-[#FF6B6B] border-[#FF6B6B] text-white";
                }
              } else if (isMissing) {
                bg = "bg-white border-2 border-dashed border-red-300";
              }

              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black uppercase ${bg} ${isMissing && !filled ? "animate-pulse" : ""}`}
                >
                  {isMissing ? (filled ?? "") : char}
                </div>
              );
            })}
          </div>

          {Object.keys(filledLetters).length > 0 && !submitted && (
            <button onClick={handleClear} className="mt-2 text-[10px] text-red-400 underline">
              Clear
            </button>
          )}
        </div>

        {/* Letter options - smaller but touchable */}
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {currentQ.options.map((letter) => {
            const isCorrectAnswer = submitted && !isCorrect &&
              currentQ.correctAnswers.includes(letter) &&
              !Object.values(filledLetters).includes(letter);
            const isWrongPicked = submitted && !isCorrect &&
              Object.values(filledLetters).includes(letter) &&
              !currentQ.correctAnswers.includes(letter);
            let cls = "bg-white border-2 border-red-200 text-red-700 active:bg-red-50";
            if (submitted && isCorrectAnswer)
              cls = "bg-green-100 border-2 border-green-400 text-green-700 scale-105";
            else if (submitted && isWrongPicked)
              cls = "bg-red-100 border-2 border-red-300 text-red-400 opacity-60";
            else if (submitted)
              cls = "bg-white border-2 border-red-200 text-red-700 opacity-40";
            return (
            <motion.button
              key={letter}
              onClick={() => handleLetterPick(letter)}
              disabled={submitted}
              className={`w-10 h-10 rounded-lg font-black text-lg uppercase active:scale-95 transition-all ${cls}`}
              whileTap={{ scale: 0.92 }}
            >
              {letter}
            </motion.button>
            );
          })}
        </div>

        {/* Feedback - more compact */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              className={`px-4 py-2 rounded-xl font-bold text-white text-center text-sm ${isCorrect ? "bg-green-500" : "bg-red-400"}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {isCorrect ? "🎉 Correct!" : `The word was: ${currentQ.word.word.toUpperCase()}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}>
              <div className="text-6xl mb-4">{stars === 3 ? "🌟" : stars === 2 ? "⭐" : "💪"}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{stars >= 2 ? "Amazing!" : "Keep practising!"}</h2>
              <p className="text-gray-500 mb-6">You got <span className="font-bold text-red-500">{score}/{QUESTIONS_PER_SESSION}</span> correct</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>)}
              </div>
              <div className="flex gap-3">
                <button onClick={init} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200">
                  <RotateCcw className="w-4 h-4" />Play Again
                </button>
                <button onClick={() => router.push("/games/english")} className="flex-1 py-3 rounded-xl bg-[#FF6B6B] text-white font-bold hover:opacity-90">
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
