"use client";

import { motion } from "framer-motion";
import { DraggableFruit } from "./DraggableFruit";

interface FruitBasketProps {
  fruitCounts: number[];
  usedFruits: Set<string>;
}

export function FruitBasket({ fruitCounts, usedFruits }: FruitBasketProps) {
  const allFruits: { id: string; groupIndex: number; fruitIndex: number }[] = [];

  fruitCounts.forEach((count, groupIndex) => {
    for (let i = 0; i < count; i++) {
      allFruits.push({
        id: `fruit-${groupIndex}-${i}`,
        groupIndex,
        fruitIndex: allFruits.length,
      });
    }
  });

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-lg border-2 border-yellow-200"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="flex items-center justify-center gap-1 mb-3">
        <span className="text-lg">🧺</span>
        <span className="text-sm font-semibold text-gray-600">Drag fruits to the number line</span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {allFruits.map((fruit) => (
          <DraggableFruit
            key={fruit.id}
            id={fruit.id}
            index={fruit.fruitIndex}
            isUsed={usedFruits.has(fruit.id)}
          />
        ))}
      </div>

      {usedFruits.size > 0 && usedFruits.size < allFruits.length && (
        <motion.p
          className="text-center text-xs text-gray-400 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {allFruits.length - usedFruits.size} fruits left
        </motion.p>
      )}
    </motion.div>
  );
}
