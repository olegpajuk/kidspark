import type { Word, WordCategory } from "@/types/english";
import { WORDS_BY_LEVEL } from "./words-by-level";

/**
 * Words grouped by category. Derived from WORDS_BY_LEVEL at module load time
 * to avoid duplication and keep a single source of truth.
 */
export const WORDS_BY_CATEGORY: Record<WordCategory, Word[]> = {
  animals: [],
  food: [],
  colors: [],
  numbers: [],
  body: [],
  family: [],
  nature: [],
  transport: [],
  clothes: [],
  home: [],
  school: [],
  actions: [],
};

for (const word of WORDS_BY_LEVEL) {
  WORDS_BY_CATEGORY[word.category].push(word);
}

/** Get all words for a given category, optionally filtered by max difficulty */
export function getWordsByCategory(
  category: WordCategory,
  maxDifficulty?: number
): Word[] {
  const words = WORDS_BY_CATEGORY[category];
  if (maxDifficulty === undefined) return words;
  return words.filter((w) => w.difficulty <= maxDifficulty);
}

/** Get all available categories (non-empty) */
export function getAvailableCategories(): WordCategory[] {
  return (Object.keys(WORDS_BY_CATEGORY) as WordCategory[]).filter(
    (cat) => WORDS_BY_CATEGORY[cat].length > 0
  );
}
