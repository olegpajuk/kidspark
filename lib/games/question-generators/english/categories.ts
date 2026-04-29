import type { DifficultyTier } from "@/types/game";
import type { CategoryQuestion, WordCategory } from "@/types/english";
import {
  WORDS_BY_CATEGORY,
  getAvailableCategories,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";
import type { Word } from "@/types/english";

/** Words per category bucket per difficulty */
const WORDS_PER_CAT: Record<DifficultyTier, number> = {
  1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 6,
};

/** Number of category buckets per difficulty */
const CAT_COUNT: Record<DifficultyTier, number> = {
  1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 4, 8: 4, 9: 5, 10: 5,
};

export function generateCategoryQuestion(difficulty: DifficultyTier): CategoryQuestion {
  const availableCategories = getAvailableCategories();
  const selectedCategories = shuffleArray(availableCategories).slice(0, CAT_COUNT[difficulty]) as WordCategory[];
  const wordsPerCat = WORDS_PER_CAT[difficulty];

  const allWords: Word[] = [];
  const correctMapping: Record<string, WordCategory> = {};

  for (const cat of selectedCategories) {
    const catWords = shuffleArray(
      WORDS_BY_CATEGORY[cat].filter((w) => w.difficulty <= difficulty)
    ).slice(0, wordsPerCat);

    for (const word of catWords) {
      allWords.push(word);
      correctMapping[word.id] = cat;
    }
  }

  return {
    id: generateEnglishId("cat"),
    words: shuffleArray(allWords),
    categories: selectedCategories,
    correctMapping,
  };
}
