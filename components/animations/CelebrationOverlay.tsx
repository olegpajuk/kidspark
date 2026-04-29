"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LottiePlayer } from "./LottiePlayer";
import { useEffect, useState } from "react";

interface CelebrationOverlayProps {
  show: boolean;
  type?: "levelUp" | "gameComplete" | "newRecord" | "achievement" | "allStars";
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  autoClose?: number;
}

export function CelebrationOverlay({
  show,
  type = "gameComplete",
  title,
  subtitle,
  onComplete,
  autoClose = 3000,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show && autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onComplete]);

  const getConfig = () => {
    switch (type) {
      case "levelUp":
        return {
          animation: "rocket" as const,
          title: title || "Level Up!",
          subtitle: subtitle || "You're getting better!",
          gradient: "from-purple-600 via-pink-500 to-orange-400",
          emoji: "🚀",
        };
      case "newRecord":
        return {
          animation: "trophy" as const,
          title: title || "New Record!",
          subtitle: subtitle || "You beat your best score!",
          gradient: "from-yellow-500 via-orange-500 to-red-500",
          emoji: "🏆",
        };
      case "achievement":
        return {
          animation: "star" as const,
          title: title || "Achievement Unlocked!",
          subtitle: subtitle || "Keep up the great work!",
          gradient: "from-blue-500 via-purple-500 to-pink-500",
          emoji: "🎖️",
        };
      case "allStars":
        return {
          animation: "star" as const,
          title: title || "Perfect!",
          subtitle: subtitle || "You got all stars!",
          gradient: "from-yellow-400 via-yellow-500 to-amber-600",
          emoji: "⭐",
        };
      case "gameComplete":
      default:
        return {
          animation: "celebration" as const,
          title: title || "Amazing!",
          subtitle: subtitle || "You completed the game!",
          gradient: "from-green-500 via-emerald-500 to-teal-500",
          emoji: "🎉",
        };
    }
  };

  const config = getConfig();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setVisible(false);
            onComplete?.();
          }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <LottiePlayer
              animation="celebration"
              size={400}
              loop
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 opacity-60"
            />
          </div>

          {/* Main content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 p-8"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {/* Animated icon */}
            <motion.div
              className={`bg-gradient-to-br ${config.gradient} rounded-full p-6 shadow-2xl`}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <LottiePlayer
                animation={config.animation}
                size={120}
                loop
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl font-black text-white text-center drop-shadow-lg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {config.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-white/90 text-center drop-shadow"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {config.subtitle}
            </motion.p>

            {/* Floating emojis */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-4xl"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: "100%",
                  }}
                  animate={{
                    y: [-100, -500],
                    x: [0, (Math.random() - 0.5) * 100],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                >
                  {config.emoji}
                </motion.span>
              ))}
            </div>

            {/* Tap to continue */}
            <motion.p
              className="text-white/60 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
