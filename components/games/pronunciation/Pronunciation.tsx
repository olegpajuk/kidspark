"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Volume2, Mic, Play, ChevronRight } from "lucide-react";
import { generatePronunciationQuestions } from "@/lib/games/question-generators/english/pronunciation";
import { useTTS } from "@/hooks/useTTS";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { DifficultyTier } from "@/types/game";
import type { PronunciationQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 8;
const COLOR = "#27AE60";
const BG = "#EAFAF1";

interface Props {
  difficulty: DifficultyTier;
}

export function Pronunciation({ difficulty }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { status, audioUrl, startRecording, stopRecording, playback, clearRecording, isSupported, error } =
    useAudioRecorder();

  const [questions, setQuestions] = useState<PronunciationQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selfRated, setSelfRated] = useState<"good" | "ok" | "retry" | null>(null);

  const init = useCallback(() => {
    setQuestions(generatePronunciationQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setScore(0);
    setIsComplete(false);
    setSelfRated(null);
    clearRecording();
  }, [difficulty, clearRecording]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ) {
      setSelfRated(null);
      clearRecording();
      // Auto-play word
      speak(currentQ.word.word);
    }
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleRecord = async () => {
    if (status === "recording") {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleRate = (rating: "good" | "ok" | "retry") => {
    setSelfRated(rating);
    if (rating !== "retry") {
      if (rating === "good") setScore((s) => s + 1);

      setTimeout(() => {
        if (currentIdx + 1 >= QUESTIONS_PER_SESSION) {
          setIsComplete(true);
        } else {
          setCurrentIdx((i) => i + 1);
        }
      }, 800);
    } else {
      clearRecording();
      setSelfRated(null);
    }
  };

  if (!currentQ) return null;

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
  const isRecording = status === "recording";
  const hasRecording = status === "stopped" && !!audioUrl;

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
          <p className="font-bold text-sm">Pronunciation</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-green-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
        {/* Word card */}
        <motion.div
          key={currentQ.id}
          className="bg-white rounded-3xl shadow-lg p-8 text-center w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="text-7xl mb-3">{currentQ.word.emoji}</div>
          <p className="text-4xl font-black text-gray-800 mb-2">{currentQ.word.word}</p>
          <p className="text-sm text-gray-400 font-mono">{currentQ.phonetic}</p>

          <button
            onClick={() => speak(currentQ.word.word)}
            disabled={isSpeaking}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{ backgroundColor: `${COLOR}22`, color: COLOR }}
          >
            <Volume2 className="w-4 h-4" />
            {isSpeaking ? "Playing…" : "Hear it again"}
          </button>
        </motion.div>

        {/* Recording controls */}
        {!isSupported ? (
          <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-amber-700 font-medium">
              🎤 Microphone not available in this browser.
            </p>
            <p className="text-xs text-amber-500 mt-1">
              Try Chrome or Edge for recording support.
            </p>
            <button
              onClick={() => handleRate("good")}
              className="mt-3 px-5 py-2 rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: COLOR }}
            >
              Skip to next word
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-5 text-center">
            <p className="text-xs text-gray-400 mb-4">
              {hasRecording ? "Listen back — how did you do?" : "Now try saying the word!"}
            </p>

            {!hasRecording ? (
              <button
                onClick={handleToggleRecord}
                className={`mx-auto flex flex-col items-center gap-2 w-24 h-24 rounded-full text-white font-bold transition-all shadow-lg ${
                  isRecording ? "animate-pulse" : "hover:opacity-90 active:scale-95"
                }`}
                style={{ backgroundColor: isRecording ? "#E74C3C" : COLOR }}
              >
                <Mic className="w-8 h-8 mt-4" />
                <span className="text-xs">{isRecording ? "Stop" : "Record"}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={playback}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: `${COLOR}22`, color: COLOR }}
                >
                  <Play className="w-4 h-4" />
                  Play my recording
                </button>

                {!selfRated && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">How did it sound?</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRate("good")}
                        className="py-2.5 rounded-xl text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 active:scale-95"
                      >
                        😊 Great!
                      </button>
                      <button
                        onClick={() => handleRate("ok")}
                        className="py-2.5 rounded-xl text-xs font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:scale-95"
                      >
                        😐 OK
                      </button>
                      <button
                        onClick={() => handleRate("retry")}
                        className="py-2.5 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 active:scale-95"
                      >
                        🔄 Retry
                      </button>
                    </div>
                  </div>
                )}

                {selfRated && selfRated !== "retry" && (
                  <motion.p
                    className="text-sm font-bold text-center"
                    style={{ color: selfRated === "good" ? COLOR : "#F39C12" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {selfRated === "good" ? "✓ Moving on…" : "Next word →"}
                  </motion.p>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>
        )}

        {/* Skip button */}
        {!hasRecording && !isRecording && isSupported && (
          <button
            onClick={() => handleRate("ok")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            Skip this word <ChevronRight className="w-3 h-3" />
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
                {stars === 3 ? "🗣️" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Brilliant pronunciation!" : "Keep practising!"}
              </h2>
              <p className="text-gray-500 mb-2">Practised {QUESTIONS_PER_SESSION} words!</p>
              <p className="text-sm text-gray-400 mb-6">
                Self-rated <span className="font-bold" style={{ color: COLOR }}>{score}</span> as great!
              </p>
              <div className="flex justify-center gap-2 mb-6">
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
