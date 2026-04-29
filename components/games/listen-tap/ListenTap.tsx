"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Volume2 } from "lucide-react";
import { generateListenTapQuestions } from "@/lib/games/question-generators/english/listen-tap";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { ListenTapQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;
const COLOR = "#2980B9";
const BG = "#EBF5FB";

interface Props {
  difficulty: DifficultyTier;
}

export function ListenTap({ difficulty }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<ListenTapQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const init = useCallback(() => {
    setQuestions(generateListenTapQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setIsComplete(false);
    setHasListened(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  const playWord = useCallback(async () => {
    if (!currentQ) return;
    setHasListened(true);
    await speak(currentQ.targetWord.word);
  }, [currentQ, speak]);

  // Auto-play when question loads
  useEffect(() => {
    if (currentQ) {
      setSelected(null);
      setHasListened(false);
      const t = setTimeout(() => playWord(), 300);
      return () => clearTimeout(t);
    }
  }, [currentIdx, currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (wordId: string) => {
    if (selected || !hasListened) return;
    setSelected(wordId);
    const correct = wordId === currentQ.correctId;
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
      }
    }, 1200);
  };

  if (!currentQ) return null;

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
  const optionCount = currentQ.options.length;
  const cols = optionCount <= 4 ? 2 : optionCount <= 6 ? 3 : 3;

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
          <p className="font-bold text-sm">Listen and Tap</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-blue-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
        {/* Listen button */}
        <motion.button
          key={currentQ.id}
          onClick={playWord}
          disabled={isSpeaking}
          className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-lg p-8 w-full max-w-xs transition-all hover:shadow-xl active:scale-95"
          style={{ border: `3px solid ${isSpeaking ? COLOR : "#e5e7eb"}` }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={isSpeaking ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.6 }}
          >
            <Volume2
              className="w-12 h-12"
              style={{ color: isSpeaking ? COLOR : "#d1d5db" }}
            />
          </motion.div>
          <div className="text-center">
            <p className="font-bold text-gray-700">
              {isSpeaking ? "Listening…" : hasListened ? "Hear again" : "Tap to listen!"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {hasListened ? "Then tap the correct picture below" : "Listen carefully!"}
            </p>
          </div>
        </motion.button>

        {!hasListened && (
          <p className="text-xs text-gray-400 animate-pulse">Getting ready…</p>
        )}

        {/* Options grid */}
        {hasListened && (
          <AnimatePresence>
            <motion.div
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              >
                {currentQ.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  const isCorrect = opt.id === currentQ.correctId;

                  let ring = "border-2 border-blue-100 bg-white";
                  if (isSelected && isCorrect) ring = "border-4 border-green-400 bg-green-50";
                  else if (isSelected && !isCorrect) ring = "border-4 border-red-400 bg-red-50";
                  else if (selected && isCorrect) ring = "border-4 border-green-400 bg-green-50";

                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      disabled={!!selected}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${ring} ${
                        !selected ? "hover:border-blue-300 hover:shadow-md active:scale-95" : ""
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-xs font-bold text-gray-600">{opt.word}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
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
                {stars === 3 ? "👂" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Sharp Ears!" : "Keep listening!"}
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
