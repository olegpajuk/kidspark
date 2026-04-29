"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LottiePlayer } from "./LottiePlayer";

interface AnimatedFeedbackProps {
  type: "correct" | "wrong" | "timeout" | "levelUp" | "star";
  show: boolean;
  onComplete?: () => void;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: 80,
  md: 120,
  lg: 180,
};

export function AnimatedFeedback({
  type,
  show,
  onComplete,
  message,
  size = "md",
}: AnimatedFeedbackProps) {
  const animationSize = SIZE_MAP[size];

  const getAnimation = () => {
    switch (type) {
      case "correct":
        return "correct";
      case "wrong":
        return "wrong";
      case "timeout":
        return "wrong";
      case "levelUp":
        return "trophy";
      case "star":
        return "star";
      default:
        return "correct";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "correct":
        return "bg-green-500/90";
      case "wrong":
      case "timeout":
        return "bg-red-500/90";
      case "levelUp":
        return "bg-purple-500/90";
      case "star":
        return "bg-yellow-500/90";
      default:
        return "bg-gray-500/90";
    }
  };

  const getMessage = () => {
    if (message) return message;
    switch (type) {
      case "correct":
        return "Great job!";
      case "wrong":
        return "Try again!";
      case "timeout":
        return "Time's up!";
      case "levelUp":
        return "Level Up!";
      case "star":
        return "You earned a star!";
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${getBackgroundColor()} rounded-3xl p-6 flex flex-col items-center gap-2 shadow-2xl`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <LottiePlayer
              animation={getAnimation() as "correct" | "wrong" | "trophy" | "star"}
              size={animationSize}
              loop={false}
              onComplete={onComplete}
            />
            <motion.p
              className="text-white font-bold text-xl text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getMessage()}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
