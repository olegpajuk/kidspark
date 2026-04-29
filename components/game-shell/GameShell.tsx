"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { StarRating } from "@/components/celebrations/StarRating";
import { Confetti } from "@/components/celebrations/Confetti";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface SessionResult {
  starsEarned: 0 | 1 | 2 | 3;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
}

export interface GameShellProps {
  /** Display name shown in the header */
  gameName: string;
  /** Accent colour for the progress bar and header (subject colour) */
  colorHex: string;
  /** 1-based index of the current question */
  currentQuestion: number;
  totalQuestions: number;
  /** Stars accumulated so far this session (shown in header) */
  starsEarned: 0 | 1 | 2 | 3;
  /** Seconds remaining — omit for untimed games */
  timeLeft?: number;
  /** When true the session-complete overlay is shown */
  isSessionComplete: boolean;
  /** Populated once the session completes */
  sessionResult?: SessionResult;
  /** Called when user taps the exit button (both during game and from overlay) */
  onExit: () => void;
  /** Called when user taps "Play Again" on the overlay */
  onPlayAgain?: () => void;
  /** Called when user taps "Keep Going" / "Next" on the overlay */
  onContinue: () => void;
  children: React.ReactNode;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-6 h-6 transition-all duration-300 ${
        filled ? "fill-[#FFD93D] drop-shadow-sm" : "fill-white/30"
      }`}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TimerDisplay({ timeLeft, colorHex }: { timeLeft: number; colorHex: string }) {
  const isUrgent = timeLeft <= 10;

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.8 }}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
        isUrgent ? "bg-red-500 text-white" : "bg-white/20 text-white"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
      </svg>
      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
    </motion.div>
  );
}

/* ─── Pause Overlay ──────────────────────────────────────────────────────── */

function PauseOverlay({
  onResume,
  onExit,
}: {
  onResume: () => void;
  onExit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl mx-4 max-w-xs w-full"
      >
        <div className="text-5xl">⏸️</div>
        <h2 className="text-2xl font-bold text-gray-800">Game Paused</h2>
        <p className="text-gray-500 text-center text-sm">Take a breath — your progress is saved!</p>

        <button
          onClick={onResume}
          className="w-full py-3 rounded-2xl bg-[#6BCB77] text-white font-bold text-lg flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all"
        >
          <Play className="w-5 h-5" />
          Resume
        </button>

        <button
          onClick={onExit}
          className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-base hover:bg-gray-200 active:scale-95 transition-all"
        >
          Exit Game
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Session Complete Overlay ───────────────────────────────────────────── */

function SessionCompleteOverlay({
  result,
  gameName,
  colorHex,
  onPlayAgain,
  onContinue,
  onExit,
}: {
  result: SessionResult;
  gameName: string;
  colorHex: string;
  onPlayAgain?: () => void;
  onContinue: () => void;
  onExit: () => void;
}) {
  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);

  const headline =
    result.starsEarned === 3
      ? "Incredible! 🎉"
      : result.starsEarned === 2
      ? "Great job! 🌟"
      : result.starsEarned === 1
      ? "Nice try! 💪"
      : "Keep practising! 🌱";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl"
    >
      {result.starsEarned >= 2 && <Confetti autoFire />}

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 18, delay: 0.1 }}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-5 shadow-2xl mx-4 max-w-sm w-full"
      >
        {/* Header bar in subject colour */}
        <div
          className="w-full -mt-8 -mx-8 px-8 pt-6 pb-4 rounded-t-3xl text-center"
          style={{ backgroundColor: colorHex }}
        >
          <p className="text-white/80 text-sm font-medium mb-1">{gameName}</p>
          <h2 className="text-white text-2xl font-bold">{headline}</h2>
        </div>

        {/* Stars */}
        <StarRating stars={result.starsEarned} animate />

        {/* Stats row */}
        <div className="flex gap-4 w-full">
          <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{accuracy}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Accuracy</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {result.correctCount}/{result.totalQuestions}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Correct</p>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">+{result.xpEarned}</p>
            <p className="text-xs text-gray-500 mt-0.5">XP</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-lg hover:brightness-105 active:scale-95 transition-all"
            style={{ backgroundColor: colorHex }}
          >
            Keep Going! →
          </button>

          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-base hover:bg-gray-200 active:scale-95 transition-all"
            >
              Play Again
            </button>
          )}

          <button
            onClick={onExit}
            className="text-gray-400 text-sm py-1 hover:text-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main GameShell ─────────────────────────────────────────────────────── */

export function GameShell({
  gameName,
  colorHex,
  currentQuestion,
  totalQuestions,
  starsEarned,
  timeLeft,
  isSessionComplete,
  sessionResult,
  onExit,
  onPlayAgain,
  onContinue,
  children,
}: GameShellProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { isMuted, toggleMute, playSound } = useAudio();

  const progressPct = Math.min(
    100,
    ((currentQuestion - 1) / totalQuestions) * 100
  );

  const handlePause = useCallback(() => {
    playSound("pop");
    setIsPaused(true);
  }, [playSound]);

  const handleResume = useCallback(() => {
    playSound("pop");
    setIsPaused(false);
  }, [playSound]);

  const handleExit = useCallback(() => {
    setIsPaused(false);
    onExit();
  }, [onExit]);

  // Play fanfare when session completes
  useEffect(() => {
    if (isSessionComplete && sessionResult && sessionResult.starsEarned >= 2) {
      playSound("fanfare");
    }
  }, [isSessionComplete, sessionResult, playSound]);

  return (
    <div className="relative flex flex-col h-full min-h-screen bg-[#FFF8E7] rounded-2xl overflow-hidden select-none">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 pt-safe-top py-3 text-white"
        style={{ backgroundColor: colorHex }}
      >
        {/* Left: pause + exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePause}
            aria-label="Pause game"
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>

        {/* Centre: game name + question counter */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium opacity-80 leading-none">{gameName}</span>
          <span className="text-sm font-bold leading-tight">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>

        {/* Right: stars, timer, mute */}
        <div className="flex items-center gap-2">
          {/* Collected stars */}
          <div className="flex gap-0.5">
            {[1, 2, 3].map((n) => (
              <StarIcon key={n} filled={starsEarned >= n} />
            ))}
          </div>

          {timeLeft !== undefined && (
            <TimerDisplay timeLeft={timeLeft} colorHex={colorHex} />
          )}

          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="h-2 bg-black/10 relative" style={{ backgroundColor: `${colorHex}33` }}>
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: colorHex }}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
        {/* Question tick marks */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalQuestions - 1 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-white/40 last:border-0"
            />
          ))}
        </div>
      </div>

      {/* ── Game content ── */}
      <main className="flex-1 relative overflow-hidden">{children}</main>

      {/* ── Pause overlay ── */}
      <AnimatePresence>
        {isPaused && !isSessionComplete && (
          <PauseOverlay onResume={handleResume} onExit={handleExit} />
        )}
      </AnimatePresence>

      {/* ── Session complete overlay ── */}
      <AnimatePresence>
        {isSessionComplete && sessionResult && (
          <SessionCompleteOverlay
            result={sessionResult}
            gameName={gameName}
            colorHex={colorHex}
            onPlayAgain={onPlayAgain}
            onContinue={onContinue}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
