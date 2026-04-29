"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Play, Volume2 } from "lucide-react";
import { generateDictationQuestions } from "@/lib/games/question-generators/english/dictation";
import { speakWord, speakSentence } from "@/lib/audio/tts";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { DictationQuestion } from "@/types/english";
import type { TTSRate } from "@/lib/audio/tts";

const QUESTIONS_PER_SESSION = 8;
const COLOR = "#E67E22";
const BG = "#FEF5E7";

const SPEEDS: Array<{ rate: TTSRate; label: string; emoji: string }> = [
  { rate: "normal", label: "Normal", emoji: "▶️" },
  { rate: "slow", label: "Slow", emoji: "🐢" },
  { rate: "very-slow", label: "Very Slow", emoji: "🐌" },
];

interface Props {
  difficulty: DifficultyTier;
}

export function Dictation({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<DictationQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const init = useCallback(() => {
    setQuestions(generateDictationQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setInput("");
    setSubmitted(false);
    setScore(0);
    setIsComplete(false);
    setPlayCount(0);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ) {
      setInput("");
      setSubmitted(false);
      setPlayCount(0);
      // Auto-play on new question
      handleSpeak("normal");
    }
  }, [currentIdx, currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSpeak = async (rate: TTSRate) => {
    if (!currentQ || isSpeaking) return;
    setIsSpeaking(true);
    setPlayCount((c) => c + 1);
    try {
      if (currentQ.type === "sentence") {
        await speakSentence(currentQ.text, rate);
      } else {
        await speakWord(currentQ.text, rate);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSubmit = () => {
    if (!currentQ || !input.trim()) return;
    const correct = input.trim().toLowerCase() === currentQ.text.toLowerCase();
    setSubmitted(true);
    setIsCorrect(correct);

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
    }, 2000);
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
          <p className="font-bold text-sm">Dictation Practice</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-orange-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
        {/* Type indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Volume2 className="w-4 h-4" style={{ color: COLOR }} />
          <span>
            {currentQ.type === "word" ? "Listen and type the word" : "Listen and type the sentence"}
          </span>
        </div>

        {/* Play buttons */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium">Play the audio:</p>
            <span className="text-xs text-gray-400">Played {playCount} times</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SPEEDS.map(({ rate, label, emoji }) => (
              <button
                key={rate}
                onClick={() => handleSpeak(rate)}
                disabled={isSpeaking || submitted}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                  isSpeaking ? "animate-pulse" : "hover:opacity-90 active:scale-95"
                }`}
                style={{ backgroundColor: `${COLOR}22`, color: COLOR }}
              >
                <span className="text-xl">{isSpeaking ? "🔊" : emoji}</span>
                <span>{isSpeaking ? "…" : label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-5">
          <p className="text-xs text-gray-400 mb-3">Type what you heard:</p>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
            disabled={submitted}
            placeholder="Type here…"
            className={`w-full border-2 rounded-xl px-4 py-3 text-base font-medium focus:outline-none transition-colors ${
              submitted
                ? isCorrect
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-red-400 bg-red-50 text-red-700"
                : "border-orange-200 focus:border-orange-400"
            }`}
          />

          {submitted && !isCorrect && (
            <motion.div
              className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-gray-400 mb-1">Correct answer:</p>
              <p className="text-sm font-bold text-green-700">{currentQ.text}</p>
            </motion.div>
          )}

          {submitted && isCorrect && (
            <motion.p
              className="mt-3 text-center text-sm font-bold text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✓ Correct!
            </motion.p>
          )}
        </div>

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: COLOR }}
          >
            Submit Answer
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
                {stars === 3 ? "🎙️" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Great listener!" : "Keep listening!"}
              </h2>
              <p className="text-gray-500 mb-3">
                <span className="font-bold" style={{ color: COLOR }}>{score}/{QUESTIONS_PER_SESSION}</span> correct!
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
