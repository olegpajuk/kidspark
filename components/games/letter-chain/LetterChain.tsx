"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Volume2 } from "lucide-react";
import { generateLetterChainQuestions } from "@/lib/games/question-generators/english/letter-chain";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { LetterChainQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;
const COLOR = "#2ECC71";
const BG = "#F0FFF4";

interface Props {
  difficulty: DifficultyTier;
}

export function LetterChain({ difficulty }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<LetterChainQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [chainWords, setChainWords] = useState<string[]>([]);

  const init = useCallback(() => {
    const qs = generateLetterChainQuestions(difficulty, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setIsComplete(false);
    setChainWords([]);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ) speak(currentQ.startWord.word);
  }, [currentIdx, currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (wordId: string) => {
    if (selected) return;
    setSelected(wordId);
    const correct = wordId === currentQ.correctAnswerId;

    if (correct) {
      playSound("correct");
      setScore((s) => s + 1);
      setChainWords((c) => [...c, currentQ.startWord.word]);
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

  const lastLetter = currentQ.startWord.word.slice(-1).toUpperCase();
  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;

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
          <p className="font-bold text-sm">Letter Chain</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-green-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4 gap-4">
        {/* Chain so far */}
        {chainWords.length > 0 && (
          <div className="w-full max-w-md overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max px-2">
              {chainWords.map((w, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xs font-bold bg-white rounded-full px-2 py-1 shadow-sm text-green-700 border border-green-200">
                    {w}
                  </span>
                  {i < chainWords.length - 1 && (
                    <span className="text-green-400 text-xs">→</span>
                  )}
                </div>
              ))}
              <span className="text-green-400 text-xs">→</span>
              <span className="text-xs font-bold bg-green-500 text-white rounded-full px-2 py-1">?</span>
            </div>
          </div>
        )}

        {/* Current word card */}
        <motion.div
          key={currentQ.id}
          className="bg-white rounded-3xl shadow-lg p-8 text-center w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="text-7xl mb-3">{currentQ.startWord.emoji}</div>
          <div className="text-3xl font-black text-gray-800 mb-1 tracking-wide">
            {currentQ.startWord.word.slice(0, -1).toUpperCase()}
            <span
              className="text-white px-1 rounded"
              style={{ backgroundColor: COLOR }}
            >
              {lastLetter}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Pick a word that starts with <strong>{lastLetter}</strong>
          </p>
          <button
            onClick={() => speak(currentQ.startWord.word)}
            disabled={isSpeaking}
            className="mt-3 flex items-center gap-1 mx-auto text-xs text-green-600 hover:text-green-800"
          >
            <Volume2 className="w-3 h-3" />
            {isSpeaking ? "Speaking…" : "Hear it"}
          </button>
        </motion.div>

        {/* Options */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = opt.id === currentQ.correctAnswerId;

              let cls = "bg-white border-2 border-green-200 text-gray-800";
              if (isSelected && isCorrect) cls = "bg-green-500 border-green-500 text-white";
              else if (isSelected && !isCorrect) cls = "bg-red-400 border-red-400 text-white";
              else if (selected && isCorrect) cls = "bg-green-500 border-green-500 text-white";

              return (
                <motion.button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={!!selected}
                  className={`py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 transition-all ${cls} ${
                    !selected ? "hover:border-green-400 active:scale-[0.97]" : ""
                  }`}
                  whileTap={!selected ? { scale: 0.95 } : {}}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span>{opt.word.toUpperCase()}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Wrong answer feedback */}
          {selected && selected !== currentQ.correctAnswerId && (
            <motion.p
              className="text-center text-xs text-green-700 font-medium bg-green-50 rounded-xl py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ Correct: <strong>{currentQ.options.find(o => o.id === currentQ.correctAnswerId)?.word.toUpperCase()}</strong> starts with <strong>{currentQ.startWord.word.slice(-1).toUpperCase()}</strong>
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
                {stars === 3 ? "🏆" : stars === 2 ? "🌟" : stars === 1 ? "✨" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Chain Master!" : stars === 1 ? "Good links!" : "Keep linking!"}
              </h2>
              <p className="text-gray-500 mb-3">
                You chained <span className="font-bold text-green-600">{score}/{QUESTIONS_PER_SESSION}</span> words!
              </p>
              <p className="text-[11px] text-gray-400 mb-3">⭐⭐⭐ = 9+ &nbsp;·&nbsp; ⭐⭐ = 7+ &nbsp;·&nbsp; ⭐ = 5+</p>

              {chainWords.length > 0 && (
                <div className="bg-green-50 rounded-xl p-3 mb-4 text-xs text-green-700 font-medium">
                  {chainWords.join(" → ")}
                </div>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={init}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: "#F0FFF4", color: COLOR }}
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
