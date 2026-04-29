"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Volume2 } from "lucide-react";
import { generateSentenceBuilderQuestions } from "@/lib/games/question-generators/english/sentence-builder";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { SentenceBuilderQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 8;
const COLOR = "#E74C3C";
const BG = "#FDEDEC";

interface Props {
  difficulty: DifficultyTier;
}

export function SentenceBuilder({ difficulty }: Props) {
  const router = useRouter();
  const { speak } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<SentenceBuilderQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const init = useCallback(() => {
    const qs = generateSentenceBuilderQuestions(difficulty, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setIsComplete(false);
    if (qs[0]) {
      setBuiltWords([]);
      setAvailableWords([...qs[0].scrambledWords]);
      setIsChecked(false);
    }
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ) {
      setBuiltWords([]);
      setAvailableWords([...currentQ.scrambledWords]);
      setIsChecked(false);
    }
  }, [currentIdx, currentQ]);

  const handleWordTap = (word: string, index: number) => {
    if (isChecked) return;
    setBuiltWords((b) => [...b, word]);
    setAvailableWords((a) => a.filter((_, i) => i !== index));
  };

  const handleRemoveBuilt = (index: number) => {
    if (isChecked) return;
    const removed = builtWords[index];
    setBuiltWords((b) => b.filter((_, i) => i !== index));
    setAvailableWords((a) => [...a, removed]);
  };

  const handleCheck = () => {
    if (!currentQ || builtWords.length === 0) return;
    const correct = builtWords.join(" ") === currentQ.correctOrder.join(" ");
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      playSound("correct");
      setScore((s) => s + 1);
      speak(currentQ.correctOrder.join(" "));
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      if (currentIdx + 1 >= QUESTIONS_PER_SESSION) {
        setIsComplete(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 1800);
  };

  const handleSpeakCorrect = () => {
    if (currentQ) speak(currentQ.correctOrder.join(" "));
  };

  if (!currentQ) return null;

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;

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
          <p className="font-bold text-sm">Sentence Builder</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-red-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4 gap-4">
        {/* Instruction */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 font-medium">Tap words to build the sentence</p>
          <button onClick={handleSpeakCorrect} className="text-red-400 hover:text-red-600">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Sentence zone */}
        <div className="w-full max-w-md min-h-[80px] bg-white rounded-2xl shadow-md p-4 flex flex-wrap gap-2 items-start content-start">
          {builtWords.length === 0 ? (
            <p className="text-gray-300 text-sm italic">Tap words below to start…</p>
          ) : (
            builtWords.map((word, i) => (
              <motion.button
                key={`${word}-${i}`}
                onClick={() => handleRemoveBuilt(i)}
                disabled={isChecked}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                  isChecked
                    ? isCorrect
                      ? "bg-green-100 border-green-400 text-green-700"
                      : "bg-red-100 border-red-400 text-red-700"
                    : "bg-red-50 border-red-300 text-red-700 hover:bg-red-100 active:scale-95"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {word}
              </motion.button>
            ))
          )}
        </div>

        {/* Result feedback */}
        {isChecked && !isCorrect && (
          <motion.div
            className="w-full max-w-md bg-white rounded-xl p-3 border-l-4 border-red-400"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-gray-500 mb-1">Correct sentence:</p>
            <p className="text-sm font-bold text-green-700">{currentQ.correctOrder.join(" ")}</p>
          </motion.div>
        )}

        {isChecked && isCorrect && (
          <motion.div
            className="w-full max-w-md bg-green-50 rounded-xl p-3 border-l-4 border-green-400 text-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-bold text-green-700">✓ Perfect sentence!</p>
          </motion.div>
        )}

        {/* Word bank */}
        <div className="w-full max-w-md">
          <p className="text-xs text-gray-400 mb-2 text-center">Word bank</p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
            {availableWords.map((word, i) => (
              <motion.button
                key={`${word}-${i}`}
                onClick={() => handleWordTap(word, i)}
                disabled={isChecked}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white border-2 border-red-200 text-gray-700 hover:border-red-400 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-40"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Check button */}
        {!isChecked && builtWords.length > 0 && (
          <button
            onClick={handleCheck}
            className="px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: COLOR }}
          >
            Check Sentence ✓
          </button>
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
                {stars === 3 ? "📝" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Sentence Pro!" : "Keep building!"}
              </h2>
              <p className="text-gray-500 mb-3">
                Got <span className="font-bold" style={{ color: COLOR }}>{score}/{QUESTIONS_PER_SESSION}</span> correct!
              </p>
              <p className="text-[11px] text-gray-400 mb-3">⭐⭐⭐ = 7+ &nbsp;·&nbsp; ⭐⭐ = 5+ &nbsp;·&nbsp; ⭐ = 3+</p>
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
