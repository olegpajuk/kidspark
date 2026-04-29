import type { DifficultyTier } from "@/types/game";
import type { MemoryCard, MemoryQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/** Number of pairs per difficulty */
const PAIRS_COUNT: Record<DifficultyTier, number> = {
  1: 6, 2: 6, 3: 6, 4: 8, 5: 8, 6: 8, 7: 10, 8: 10, 9: 10, 10: 12,
};

export function generateMemoryQuestion(difficulty: DifficultyTier): MemoryQuestion {
  const pairCount = PAIRS_COUNT[difficulty];
  const words = shuffleArray(getWordsByDifficulty(difficulty)).slice(0, pairCount);

  const cards: MemoryCard[] = [];

  for (const word of words) {
    const pairId = word.id;
    cards.push({ id: generateEnglishId("mc-w"), type: "word", content: word.word, pairId });
    cards.push({ id: generateEnglishId("mc-e"), type: "emoji", content: word.emoji, pairId });
  }

  return {
    id: generateEnglishId("mem"),
    cards: shuffleArray(cards),
    pairs: pairCount,
  };
}
