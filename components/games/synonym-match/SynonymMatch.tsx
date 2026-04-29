"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { generateSynonymQuestions } from "@/lib/games/question-generators/english/synonym";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { SynonymQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;
const COLOR = "#1ABC9C";
const BG = "#E8FDF5";

interface Props {
  difficulty: DifficultyTier;
}

type GameMode = "synonym" | "antonym" | "mixed";

export function SynonymMatch({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [mode, setMode] = useState<GameMode>("mixed");
  const [questions, setQuestions] = useState<SynonymQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const init = useCallback((m: GameMode = mode) => {
    const qs = generateSynonymQuestions(difficulty, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setIsComplete(false);
  }, [difficulty, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { init(); }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

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
    }, 1200);
  };

  if (!currentQ) return null;

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
  const isSynonym = currentQ.mode === "synonym";
  const modeLabel = isSynonym ? "SYNONYM" : "ANTONYM";
  const modeColor = isSynonym ? "#1ABC9C" : "#E74C3C";
  const modeEmoji = isSynonym ? "🔵" : "🔴";
  const modeHint = isSynonym ? "Find a word with the SAME meaning" : "Find a word with the OPPOSITE meaning";

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
          <p className="font-bold text-sm">Synonym &amp; Antonym</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-teal-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
        {/* Mode badge */}
        <motion.div
          key={currentQ.id}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-white font-bold text-sm shadow-lg"
          style={{ backgroundColor: modeColor }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{modeEmoji}</span>
          <span>{modeLabel}</span>
        </motion.div>

        {/* Question card */}
        <motion.div
          key={currentQ.id + "-q"}
          className="bg-white rounded-3xl shadow-lg p-8 text-center w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <p className="text-gray-400 text-xs mb-2">{modeHint}</p>
          <p className="text-4xl font-black text-gray-800 uppercase tracking-wide">
            {currentQ.targetWord}
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {currentQ.options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = opt === currentQ.correctAnswer;

            let cls = "bg-white border-2 border-teal-200 text-gray-800";
            if (isSelected && isCorrect) cls = "bg-green-500 border-green-500 text-white";
            else if (isSelected && !isCorrect) cls = "bg-red-400 border-red-400 text-white";
            else if (selected && isCorrect) cls = "bg-green-500 border-green-500 text-white";

            return (
              <motion.button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`py-4 rounded-2xl font-bold text-base uppercase tracking-wide transition-all ${cls} ${
                  !selected ? "hover:border-teal-400 active:scale-[0.97]" : ""
                }`}
                whileTap={!selected ? { scale: 0.95 } : {}}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Hint on wrong answer */}
        {selected && selected !== currentQ.correctAnswer && (
          <motion.div
            className="w-full max-w-sm bg-white rounded-xl p-3 border-l-4 border-green-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-gray-500">
              The {isSynonym ? "synonym" : "antonym"} of <strong>{currentQ.targetWord}</strong> is{" "}
              <strong className="text-green-600">{currentQ.correctAnswer}</strong>
            </span>
          </motion.div>
        )}
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
                {stars === 3 ? "🔄" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Word Master!" : "Keep matching!"}
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
                  onClick={() => init()}
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
