"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Volume2, RotateCcw, CheckCircle2 } from "lucide-react";
import { generateRhymingQuestions } from "@/lib/games/question-generators/english/rhyming";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { RhymingQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 8;

interface Props {
  difficulty: DifficultyTier;
}

export function RhymingWords({ difficulty }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<RhymingQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const init = useCallback(() => {
    setQuestions(generateRhymingQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setSelected(new Set());
    setSubmitted(false);
    setScore(0);
    setIsComplete(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  const toggleSelect = (word: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const handleSubmit = () => {
    if (submitted || selected.size === 0) return;

    const correct = currentQ.correctRhymes;
    const selectedArr = Array.from(selected);

    const allCorrectPicked = correct.every((w) => selectedArr.includes(w));
    const noWrongPicked = selectedArr.every((w) => correct.includes(w));
    const isCorrect = allCorrectPicked && noWrongPicked;

    setSubmitted(true);

    if (isCorrect) {
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
        setSelected(new Set());
        setSubmitted(false);
      }
    }, 1500);
  };

  if (!currentQ) return null;

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
  const correct = new Set(currentQ.correctRhymes);

  return (
    <div className="min-h-screen bg-[#FFF0F9] flex flex-col">
      {/* Header */}
      <div className="bg-[#E91E9E] text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/games/english")} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Rhyming Words 🎵</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-pink-200">
        <motion.div className="h-full bg-[#E91E9E]" animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }} transition={{ type: "spring" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <p className="text-gray-500 text-sm text-center">
          Tap all the words that rhyme with:
        </p>

        {/* Target word */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-7xl">{currentQ.targetWord.emoji}</span>
          <div className="bg-[#E91E9E] text-white px-8 py-3 rounded-2xl">
            <span className="text-3xl font-black tracking-wide">{currentQ.targetWord.word.toUpperCase()}</span>
          </div>
          <button
            onClick={() => speak(currentQ.targetWord.word)}
            className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full px-4 py-2 text-sm transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            {isSpeaking ? "Speaking…" : "Hear it"}
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 text-center">
          Select <strong>{currentQ.correctRhymes.length}</strong> rhyming word{currentQ.correctRhymes.length > 1 ? "s" : ""}, then tap Check!
        </p>

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {currentQ.options.map((word) => {
            const isSelected = selected.has(word);
            const isCorrectWord = correct.has(word);

            let className = "py-4 rounded-2xl font-bold text-lg transition-all border-2 ";
            if (submitted) {
              if (isCorrectWord) {
                className += "bg-green-500 border-green-500 text-white scale-105";
              } else if (isSelected) {
                className += "bg-red-400 border-red-400 text-white";
              } else {
                className += "bg-white border-gray-200 text-gray-400";
              }
            } else {
              className += isSelected
                ? "bg-[#E91E9E] border-[#E91E9E] text-white scale-105 shadow-md"
                : "bg-white border-pink-200 text-gray-700 hover:border-pink-400 hover:scale-[1.02] active:scale-[0.98]";
            }

            return (
              <motion.button
                key={word}
                onClick={() => toggleSelect(word)}
                disabled={submitted}
                className={className}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center gap-2">
                  {submitted && isCorrectWord && <CheckCircle2 className="w-4 h-4" />}
                  {word}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Submit */}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selected.size === 0}
            className="w-full max-w-xs py-4 rounded-2xl bg-[#E91E9E] text-white font-bold text-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            Check!
          </button>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              className={`px-6 py-3 rounded-2xl font-bold text-white text-center ${
                Array.from(selected).every((w) => correct.has(w)) && correct.size === selected.size
                  ? "bg-green-500"
                  : "bg-orange-400"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from(selected).every((w) => correct.has(w)) && correct.size === selected.size
                ? "🎵 Perfect rhyme!"
                : `Rhymes with ${currentQ.targetWord.word}: ${currentQ.correctRhymes.join(", ")}`}
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
              <h2 className="text-2xl font-black text-gray-800 mb-2">{stars >= 2 ? "Rhyme master!" : "Keep rhyming!"}</h2>
              <p className="text-gray-500 mb-6">You got <span className="font-bold text-pink-600">{score}/{QUESTIONS_PER_SESSION}</span> correct</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>)}
              </div>
              <div className="flex gap-3">
                <button onClick={init} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-100 text-pink-700 font-bold hover:bg-pink-200">
                  <RotateCcw className="w-4 h-4" />Play Again
                </button>
                <button onClick={() => router.push("/games/english")} className="flex-1 py-3 rounded-xl bg-[#E91E9E] text-white font-bold hover:opacity-90">
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
