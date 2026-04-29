"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { generateVerbTenseQuestions } from "@/lib/games/question-generators/english/verb-tense";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { VerbTenseQuestion, VerbTense } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;
const COLOR = "#8E44AD";
const BG = "#F5EEF8";

const TENSE_INFO: Record<VerbTense, { label: string; emoji: string; color: string }> = {
  past: { label: "PAST", emoji: "⏮️", color: "#E74C3C" },
  present: { label: "PRESENT", emoji: "▶️", color: "#2ECC71" },
  future: { label: "FUTURE", emoji: "⏭️", color: "#3498DB" },
  presentParticiple: { label: "HAPPENING NOW", emoji: "🔄", color: "#F39C12" },
};

interface Props {
  difficulty: DifficultyTier;
}

export function VerbTenseMachine({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<VerbTenseQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const init = useCallback(() => {
    setQuestions(generateVerbTenseQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setIsComplete(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
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
        setSelected(null);
      }
    }, 1300);
  };

  if (!currentQ) return null;

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
  const tenseInfo = TENSE_INFO[currentQ.targetTense];

  // Render sentence with blank highlighted
  const sentenceParts = currentQ.contextSentence.split("_____");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      {/* Header */}
      <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: COLOR }}>
        <button
          onClick={() => router.push("/games/english")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Verb Tense Machine</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-purple-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
        {/* Time machine dial */}
        <motion.div
          key={currentQ.id + "-tense"}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-bold shadow-lg"
          style={{ backgroundColor: tenseInfo.color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <span className="text-2xl">{tenseInfo.emoji}</span>
          <div>
            <p className="text-[10px] opacity-80 uppercase tracking-wide">Time machine set to</p>
            <p className="text-lg font-black">{tenseInfo.label}</p>
          </div>
        </motion.div>

        {/* Context sentence card */}
        <motion.div
          key={currentQ.id}
          className="bg-white rounded-3xl shadow-lg p-6 text-center w-full max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <p className="text-gray-400 text-xs mb-4 uppercase tracking-wide">
            Fill in the blank
          </p>
          <p className="text-lg font-bold text-gray-800 leading-relaxed">
            {sentenceParts[0]}
            <span
              className="inline-block px-3 py-0.5 rounded-lg mx-1 text-white font-black"
              style={{ backgroundColor: tenseInfo.color, minWidth: "60px" }}
            >
              ?
            </span>
            {sentenceParts[1]}
          </p>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Base verb:</p>
            <p className="text-xl font-black text-purple-700">{currentQ.verb.base}</p>
          </div>
        </motion.div>

        {/* Options */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === currentQ.correctAnswer;

              let cls = "bg-white border-2 border-purple-200 text-gray-800";
              if (isSelected && isCorrect) cls = "bg-green-500 border-green-500 text-white";
              else if (isSelected && !isCorrect) cls = "bg-red-400 border-red-400 text-white";
              else if (selected && isCorrect) cls = "bg-green-500 border-green-500 text-white";

              return (
                <motion.button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                  className={`py-4 rounded-2xl font-bold text-base transition-all ${cls} ${
                    !selected ? "hover:border-purple-400 active:scale-[0.97]" : ""
                  }`}
                  whileTap={!selected ? { scale: 0.95 } : {}}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          {selected && selected !== currentQ.correctAnswer && (
            <motion.p
              className="text-center text-xs text-green-700 font-medium bg-green-50 rounded-xl py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ {tenseInfo.label} of <strong>{currentQ.verb.base}</strong> is <strong>{currentQ.correctAnswer}</strong>
            </motion.p>
          )}
        </div>
      </div>

      {/* Completion overlay */}
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
                {stars === 3 ? "⏰" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Time Master!" : "Keep practising!"}
              </h2>
              <p className="text-gray-500 mb-3">
                <span className="font-bold" style={{ color: COLOR }}>{score}/{QUESTIONS_PER_SESSION}</span> correct!
              </p>
              <p className="text-[11px] text-gray-400 mb-3">⭐⭐⭐ = 9+ &nbsp;·&nbsp; ⭐⭐ = 7+ &nbsp;·&nbsp; ⭐ = 5+</p>
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={init}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: BG, color: COLOR }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={() => router.push("/games/english")}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                  style={{ backgroundColor: COLOR }}
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
