"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BridgeHighlightProps {
  bridgeValue: 10 | 20;
  isVisible: boolean;
  hasReached: boolean;
}

export function BridgeHighlight({ bridgeValue, isVisible, hasReached }: BridgeHighlightProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`
              px-6 py-3 rounded-2xl text-white font-bold text-xl
              ${hasReached ? "bg-green-500" : "bg-teal-500"}
            `}
            initial={{ scale: 0, y: 50 }}
            animate={{
              scale: hasReached ? [1, 1.2, 1] : 1,
              y: 0,
            }}
            exit={{ scale: 0, y: -50 }}
            transition={{
              type: "spring",
              damping: 15,
              scale: hasReached ? { repeat: 0, duration: 0.5 } : undefined,
            }}
          >
            {hasReached ? (
              <>
                <span className="mr-2">✨</span>
                Bridge to {bridgeValue}!
                <span className="ml-2">✨</span>
              </>
            ) : (
              <>
                Make {bridgeValue} first! 🌉
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
