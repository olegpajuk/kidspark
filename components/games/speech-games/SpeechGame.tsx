"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Volume2, Mic } from "lucide-react";
import { generateSpeechGameQuestions } from "@/lib/games/question-generators/english/speech-game";
import { recognizeSpeech, matchesSpeech, isSpeechRecognitionSupported } from "@/lib/audio/speech-recognition";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { SpeechGameQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 10;
const COLOR = "#16A085";
const BG = "#E8F8F5";

interface Props {
  difficulty: DifficultyTier;
}

type RecordState = "idle" | "listening" | "success" | "fail" | "unsupported";

export function SpeechGame({ difficulty }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<SpeechGameQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const init = useCallback(() => {
    setBrowserSupported(isSpeechRecognitionSupported());
    setQuestions(generateSpeechGameQuestions(difficulty, QUESTIONS_PER_SESSION));
    setCurrentIdx(0);
    setRecordState("idle");
    setTranscript(null);
    setScore(0);
    setIsComplete(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ) {
      setRecordState("idle");
      setTranscript(null);
      // Auto-play TTS for the word
      speak(currentQ.word.word);
    }
  }, [currentIdx, currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleListen = async () => {
    if (!currentQ || isSpeaking) return;
    setRecordState("listening");
    setTranscript(null);

    try {
      const result = await recognizeSpeech();
      const isCorrect = matchesSpeech(result.transcript, currentQ.word.word, currentQ.acceptableVariants);
      setTranscript(result.transcript);

      if (isCorrect) {
        playSound("correct");
        setScore((s) => s + 1);
        setRecordState("success");
      } else {
        playSound("wrong");
        setRecordState("fail");
      }

      timeoutRef.current = setTimeout(() => {
        if (currentIdx + 1 >= QUESTIONS_PER_SESSION) {
          setIsComplete(true);
        } else {
          setCurrentIdx((i) => i + 1);
        }
      }, 2000);
    } catch {
      setRecordState("fail");
      setTranscript("No speech detected");
      timeoutRef.current = setTimeout(() => setRecordState("idle"), 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!currentQ) return null;

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
          <p className="font-bold text-sm">Speech Recognition</p>
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

      {!browserSupported && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-xs text-amber-700 font-medium">
            ⚠️ Speech recognition needs Chrome or Edge. Other browsers may not work.
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
        {/* Word card */}
        <motion.div
          key={currentQ.id}
          className="bg-white rounded-3xl shadow-lg p-8 text-center w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="text-7xl mb-3">{currentQ.word.emoji}</div>
          <p className="text-4xl font-black text-gray-800 mb-4">{currentQ.word.word}</p>
          <button
            onClick={() => speak(currentQ.word.word)}
            disabled={isSpeaking || recordState === "listening"}
            className="flex items-center gap-2 mx-auto text-sm font-medium px-4 py-2 rounded-full"
            style={{ backgroundColor: `${COLOR}22`, color: COLOR }}
          >
            <Volume2 className="w-4 h-4" />
            {isSpeaking ? "Playing…" : "Hear it"}
          </button>
        </motion.div>

        {/* Microphone area */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <motion.button
            onClick={handleListen}
            disabled={recordState === "listening" || isSpeaking}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 text-white font-bold shadow-xl transition-all ${
              recordState === "listening" ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"
            }`}
            style={{
              backgroundColor:
                recordState === "success"
                  ? "#2ECC71"
                  : recordState === "fail"
                  ? "#E74C3C"
                  : recordState === "listening"
                  ? "#E74C3C"
                  : COLOR,
            }}
            animate={recordState === "listening" ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: recordState === "listening" ? Infinity : 0, duration: 0.8 }}
          >
            <Mic className="w-8 h-8" />
            <span className="text-xs">
              {recordState === "listening"
                ? "Listening…"
                : recordState === "success"
                ? "✓ Correct!"
                : recordState === "fail"
                ? "Try again"
                : "Say it!"}
            </span>
          </motion.button>

          {/* Transcript feedback */}
          {transcript && (
            <motion.div
              className={`w-full p-4 rounded-2xl text-center ${
                recordState === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-gray-400 mb-1">I heard:</p>
              <p
                className="text-lg font-bold"
                style={{ color: recordState === "success" ? "#2ECC71" : "#E74C3C" }}
              >
                &ldquo;{transcript}&rdquo;
              </p>
              {recordState === "success" && (
                <p className="text-xs text-green-600 mt-1">Perfect! Moving on…</p>
              )}
              {recordState === "fail" && (
                <p className="text-xs text-red-500 mt-1">
                  Expected: <strong>{currentQ.word.word}</strong>
                </p>
              )}
            </motion.div>
          )}

          {recordState === "idle" && (
            <p className="text-xs text-gray-400 text-center">
              Tap the microphone and say the word clearly
            </p>
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
                {stars === 3 ? "🤖" : stars === 2 ? "🌟" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Speech Star!" : "Keep speaking!"}
              </h2>
              <p className="text-gray-500 mb-6">
                <span className="font-bold" style={{ color: COLOR }}>{score}/{QUESTIONS_PER_SESSION}</span> recognised!
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
