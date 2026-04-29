import type { DifficultyTier } from "@/types/game";
import type { DictationQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  getSentencesByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

export function generateDictationQuestion(difficulty: DifficultyTier): DictationQuestion {
  // Levels 1-3: single words; 4+: mix of words and sentences
  const useWord = difficulty <= 3 || Math.random() > 0.5;

  if (useWord) {
    const word = shuffleArray(getWordsByDifficulty(difficulty))[0];
    return {
      id: generateEnglishId("dict"),
      text: word.word,
      difficulty,
      type: "word",
    };
  } else {
    const [sentence] = getSentencesByDifficulty(difficulty, 1);
    return {
      id: generateEnglishId("dict"),
      text: sentence.text,
      difficulty,
      type: "sentence",
    };
  }
}

export function generateDictationQuestions(
  difficulty: DifficultyTier,
  count: number
): DictationQuestion[] {
  return Array.from({ length: count }, () => generateDictationQuestion(difficulty));
}
