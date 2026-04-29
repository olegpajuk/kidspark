"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

interface DraggableFruitProps {
  id: string;
  index: number;
  isUsed: boolean;
}

const FRUIT_EMOJIS = ["🍌", "🍎", "🍊", "🍇", "🍓", "🥝", "🍑", "🍐", "🍒", "🥭"];

export function DraggableFruit({ id, index, isUsed }: DraggableFruitProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isUsed,
  });

  const emoji = FRUIT_EMOJIS[index % FRUIT_EMOJIS.length];

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (isUsed) {
    return null;
  }

  return (
    <motion.button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
        bg-white shadow-lg border-2 border-yellow-300
        select-none touch-none cursor-grab active:cursor-grabbing
        transition-shadow
        ${isDragging ? "shadow-2xl scale-110 z-50" : "hover:shadow-xl hover:scale-105"}
        ${isUsed ? "opacity-30 cursor-not-allowed" : ""}
      `}
      whileHover={{ scale: isUsed ? 1 : 1.1 }}
      whileTap={{ scale: isUsed ? 1 : 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: isDragging ? 1.15 : 1,
        rotate: 0,
        opacity: isUsed ? 0.3 : 1,
      }}
      transition={{
        type: "spring",
        damping: 15,
        delay: index * 0.05,
      }}
      aria-label={`Fruit ${index + 1}`}
      disabled={isUsed}
    >
      {emoji}
    </motion.button>
  );
}
