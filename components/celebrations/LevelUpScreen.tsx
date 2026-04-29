"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "./Confetti";
import { useAudio } from "@/hooks/useAudio";

interface LevelUpScreenProps {
  /** Whether the screen is visible */
  visible: boolean;
  /** Child's name */
  childName: string;
  /** The new level number */
  newLevel: number;
  /** Subject or "overall" for global level-up */
  subject?: string;
  /** Subject colour for theming */
  colorHex?: string;
  /** Called when the child taps "Awesome!" to dismiss */
  onDismiss: () => void;
}

const DEFAULT_COLOR = "#FFD93D";

const LEVEL_EMOJIS: Record<number, string> = {
  2: "🌱",
  3: "🌿",
  4: "🌳",
  5: "⭐",
  6: "🌟",
  7: "💫",
  8: "🏆",
  9: "👑",
  10: "🚀",
};

function getLevelEmoji(level: number): string {
  return LEVEL_EMOJIS[level] ?? "✨";
}

/**
 * Full-screen level-up celebration displayed when a child gains a new level.
 * Should be rendered at the layout level so it overlays everything.
 *
 * ```tsx
 * <LevelUpScreen
 *   visible={showLevelUp}
 *   childName="Emma"
 *   newLevel={5}
 *   subject="Maths"
 *   colorHex="#FF6B6B"
 *   onDismiss={() => setShowLevelUp(false)}
 * />
 * ```
 */
export function LevelUpScreen({
  visible,
  childName,
  newLevel,
  subject,
  colorHex = DEFAULT_COLOR,
  onDismiss,
}: LevelUpScreenProps) {
  const { playSound } = useAudio();

  useEffect(() => {
    if (visible) {
      playSound("level-up");
    }
  }, [visible, playSound]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="level-up-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={onDismiss}
        >
          <Confetti autoFire />

          {/* Radial glow behind card */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2.5, opacity: 0.35 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              backgroundColor: colorHex,
              filter: "blur(60px)",
            }}
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 16, stiffness: 200, delay: 0.05 }}
            className="relative bg-white rounded-4xl shadow-2xl px-8 py-10 mx-6 max-w-sm w-full flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated badge */}
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
              style={{ backgroundColor: colorHex }}
            >
              {getLevelEmoji(newLevel)}
            </motion.div>

            {/* "LEVEL UP!" label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <span
                className="text-xs font-bold tracking-[0.25em] uppercase"
                style={{ color: colorHex }}
              >
                {subject ? `${subject} ` : ""}Level Up!
              </span>
              <h1 className="text-5xl font-black text-gray-900 leading-none mt-1">
                Level {newLevel}
              </h1>
            </motion.div>

            {/* Personalised message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-gray-500 text-center text-base leading-snug"
            >
              Amazing work,{" "}
              <span className="font-bold text-gray-700">{childName}</span>!
              <br />
              You&apos;ve reached level {newLevel} 🎉
            </motion.p>

            {/* Floating stars row */}
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    delay: 0.7 + i * 0.08,
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                  className="text-2xl"
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>

            {/* Dismiss button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onDismiss}
              className="w-full py-4 rounded-2xl text-white font-bold text-xl mt-1 hover:brightness-105 active:scale-95 transition-all"
              style={{ backgroundColor: colorHex }}
            >
              Awesome! 🙌
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
