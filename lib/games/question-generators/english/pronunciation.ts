import type { DifficultyTier } from "@/types/game";
import type { PronunciationQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";
import { PHONICS_PATTERNS } from "@/lib/data/english";

function buildPhonetic(word: string): string {
  let phonetic = word;

  // Apply basic pattern substitutions (simplified IPA hints)
  for (const p of PHONICS_PATTERNS) {
    if (p.examples.includes(word)) {
      phonetic = `/${word}/`;
      break;
    }
  }

  return phonetic !== word ? phonetic : `/${word}/`;
}

export function generatePronunciationQuestion(
  difficulty: DifficultyTier
): PronunciationQuestion {
  const pool = shuffleArray(getWordsByDifficulty(difficulty));
  const word = pool[0];

  return {
    id: generateEnglishId("pron"),
    word,
    phonetic: buildPhonetic(word.word),
  };
}

export function generatePronunciationQuestions(
  difficulty: DifficultyTier,
  count: number
): PronunciationQuestion[] {
  const pool = shuffleArray(getWordsByDifficulty(difficulty));
  const seen = new Set<string>();
  const questions: PronunciationQuestion[] = [];

  for (const word of pool) {
    if (seen.has(word.id)) continue;
    seen.add(word.id);
    questions.push({
      id: generateEnglishId("pron"),
      word,
      phonetic: buildPhonetic(word.word),
    });
    if (questions.length >= count) break;
  }

  return questions;
}
