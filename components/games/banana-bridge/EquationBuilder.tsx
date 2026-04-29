"use client";

import { motion, AnimatePresence } from "framer-motion";

interface EquationBuilderProps {
  addends: number[];
  currentValue: number;
  targetValue: number;
  isComplete: boolean;
  bridgeAt: 10 | 20 | null;
}

export function EquationBuilder({
  addends,
  currentValue,
  targetValue,
  isComplete,
  bridgeAt,
}: EquationBuilderProps) {
  const showBridgeHint = bridgeAt !== null && currentValue < bridgeAt && targetValue > bridgeAt;

  return (
    <motion.div
      className="bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-gray-100"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay: 0.1 }}
    >
      <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold">
        {addends.map((addend, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && <span className="text-gray-400">+</span>}
            <motion.span
              className="bg-yellow-100 px-3 py-1 rounded-xl text-yellow-700"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 + i * 0.1 }}
            >
              {addend}
            </motion.span>
          </span>
        ))}

        <span className="text-gray-400">=</span>

        <AnimatePresence mode="wait">
          <motion.span
            key={currentValue}
            className={`min-w-[60px] text-center px-3 py-1 rounded-xl ${
              isComplete
                ? "bg-green-100 text-green-700"
                : currentValue > 0
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-400"
            }`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {currentValue > 0 ? currentValue : "?"}
          </motion.span>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBridgeHint && (
          <motion.p
            className="text-center text-sm text-teal-600 mt-3 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            💡 Try to make {bridgeAt} first!
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <span className="text-2xl">🎉</span>
            <span className="text-green-600 font-bold ml-2">Correct!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
