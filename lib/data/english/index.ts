/**
 * Barrel export for the English data layer.
 * Import everything from here rather than from individual files.
 */

export { WORDS_BY_LEVEL } from "./words-by-level";
export {
  WORDS_BY_CATEGORY,
  getWordsByCategory,
  getAvailableCategories,
} from "./words-by-category";
export {
  SIGHT_WORDS,
  getSightWordsByGrade,
  getDolchWords,
  getFryWords,
} from "./sight-words";
export {
  WORD_RELATIONSHIPS,
  RHYME_GROUPS,
  getSynonyms,
  getAntonyms,
  getRhymes,
} from "./word-relationships";
export {
  SENTENCES,
  getSentencesByDifficulty,
} from "./sentences";
export {
  PHONICS_PATTERNS,
  PLURAL_FORMS,
  VERB_FORMS,
} from "./phonics-patterns";

// ── Utility functions ─────────────────────────────────────────────────────────

import { WORDS_BY_LEVEL } from "./words-by-level";
import type { Word } from "@/types/english";
import type { DifficultyTier } from "@/types/game";

/** Get all words available at or below a given difficulty */
export function getWordsByDifficulty(maxDifficulty: DifficultyTier): Word[] {
  return WORDS_BY_LEVEL.filter((w) => w.difficulty <= maxDifficulty);
}

/** Get exactly `count` random words for a given difficulty level */
export function getRandomWords(difficulty: DifficultyTier, count: number): Word[] {
  const pool = getWordsByDifficulty(difficulty);
  return shuffleArray(pool).slice(0, count);
}

/** Shuffle and return `count` distractors that are NOT the correct word */
export function getDistractors(
  correctWordId: string,
  allWords: Word[],
  count: number
): Word[] {
  const pool = allWords.filter((w) => w.id !== correctWordId);
  return shuffleArray(pool).slice(0, count);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Generate a unique question id */
export function generateEnglishId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
