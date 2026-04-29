import type { DifficultyTier } from "@/types/game";
import type { SpellingBeeQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

function scramble(word: string): string[] {
  const letters = word.split("");
  // Ensure the scrambled version is never the same as the original
  let scrambled: string[];
  let attempts = 0;
  do {
    scrambled = shuffleArray(letters);
    attempts++;
  } while (scrambled.join("") === word && attempts < 20);
  return scrambled;
}

export function generateSpellingBeeQuestion(
  difficulty: DifficultyTier
): SpellingBeeQuestion {
  const pool = shuffleArray(getWordsByDifficulty(difficulty));
  const word = pool[0];

  return {
    id: generateEnglishId("sb"),
    word,
    scrambledLetters: scramble(word.word),
    correctAnswer: word.word,
  };
}

export function generateSpellingBeeQuestions(
  difficulty: DifficultyTier,
  count: number
): SpellingBeeQuestion[] {
  const pool = shuffleArray(getWordsByDifficulty(difficulty));
  const seen = new Set<string>();
  const questions: SpellingBeeQuestion[] = [];

  for (const word of pool) {
    if (seen.has(word.id)) continue;
    seen.add(word.id);
    questions.push({
      id: generateEnglishId("sb"),
      word,
      scrambledLetters: scramble(word.word),
      correctAnswer: word.word,
    });
    if (questions.length >= count) break;
  }

  return questions;
}
