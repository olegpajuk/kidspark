import type { DifficultyTier } from "@/types/game";
import type { MissingLetterQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/** How many letters to blank per difficulty tier */
const MISSING_COUNT: Record<DifficultyTier, number> = {
  1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 3,
};

function buildDisplay(word: string, missingIndices: number[]): string {
  return word
    .split("")
    .map((ch, i) => (missingIndices.includes(i) ? "_" : ch))
    .join("");
}

function pickMissingIndices(word: string, count: number): number[] {
  const indices = word.split("").map((_, i) => i);
  return shuffleArray(indices).slice(0, count).sort((a, b) => a - b);
}

function buildOptions(word: string, missingIndices: number[]): string[] {
  const correct = missingIndices.map((i) => word[i]);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const distractors = shuffleArray(
    alphabet.filter((l) => !correct.includes(l))
  ).slice(0, 5);
  return shuffleArray([...correct, ...distractors]).slice(0, 6);
}

export function generateMissingLetterQuestion(
  difficulty: DifficultyTier
): MissingLetterQuestion {
  const pool = shuffleArray(getWordsByDifficulty(difficulty));
  const word = pool.find((w) => w.word.length >= 3) ?? pool[0];
  const missingCount = Math.min(MISSING_COUNT[difficulty], word.word.length - 1);
  const missingIndices = pickMissingIndices(word.word, missingCount);

  return {
    id: generateEnglishId("ml"),
    word,
    displayWord: buildDisplay(word.word, missingIndices),
    missingIndices,
    options: buildOptions(word.word, missingIndices),
    correctAnswers: missingIndices.map((i) => word.word[i]),
  };
}

export function generateMissingLetterQuestions(
  difficulty: DifficultyTier,
  count: number
): MissingLetterQuestion[] {
  const seen = new Set<string>();
  const questions: MissingLetterQuestion[] = [];
  const pool = shuffleArray(getWordsByDifficulty(difficulty));

  for (const w of pool) {
    if (seen.has(w.id)) continue;
    seen.add(w.id);
    const missingCount = Math.min(MISSING_COUNT[difficulty], w.word.length - 1);
    const missingIndices = pickMissingIndices(w.word, missingCount);
    questions.push({
      id: generateEnglishId("ml"),
      word: w,
      displayWord: buildDisplay(w.word, missingIndices),
      missingIndices,
      options: buildOptions(w.word, missingIndices),
      correctAnswers: missingIndices.map((i) => w.word[i]),
    });
    if (questions.length >= count) break;
  }

  return questions;
}
