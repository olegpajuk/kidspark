import type { DifficultyTier } from "@/types/game";
import type { SpeechGameQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/**
 * Build acceptable speech variants for a word.
 * Includes common mis-hearings and alternate pronunciations.
 */
function buildVariants(word: string): string[] {
  const variants = [word];

  // Plural
  if (!word.endsWith("s")) variants.push(word + "s");

  // Common suffix swaps
  if (word.endsWith("tion")) variants.push(word.replace(/tion$/, "shun"));
  if (word.endsWith("ght")) variants.push(word.replace(/ght$/, "t"));

  return variants;
}

export function generateSpeechGameQuestion(
  difficulty: DifficultyTier
): SpeechGameQuestion {
  const pool = shuffleArray(getWordsByDifficulty(difficulty));
  const word = pool[0];

  return {
    id: generateEnglishId("sg"),
    word,
    acceptableVariants: buildVariants(word.word),
  };
}

export function generateSpeechGameQuestions(
  difficulty: DifficultyTier,
  count: number
): SpeechGameQuestion[] {
  const seen = new Set<string>();
  const questions: SpeechGameQuestion[] = [];
  const pool = shuffleArray(getWordsByDifficulty(difficulty));

  for (const word of pool) {
    if (seen.has(word.id)) continue;
    seen.add(word.id);
    questions.push({
      id: generateEnglishId("sg"),
      word,
      acceptableVariants: buildVariants(word.word),
    });
    if (questions.length >= count) break;
  }

  return questions;
}
