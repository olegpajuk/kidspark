import type { DifficultyTier } from "@/types/game";
import type { FlashcardQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  getDistractors,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

export function generateFlashcardQuestion(
  difficulty: DifficultyTier,
  mode: "image-to-word" | "word-to-image" = "image-to-word"
): FlashcardQuestion {
  const pool = getWordsByDifficulty(difficulty);
  const shuffled = shuffleArray(pool);
  const word = shuffled[0];

  const distractors = getDistractors(word.id, pool, 3);
  const options = shuffleArray([word.word, ...distractors.map((d) => d.word)]);

  return {
    id: generateEnglishId("fc"),
    word,
    mode,
    options,
    correctAnswer: word.word,
  };
}

export function generateFlashcardQuestions(
  difficulty: DifficultyTier,
  count: number
): FlashcardQuestion[] {
  const pool = shuffleArray(getWordsByDifficulty(difficulty)).slice(0, count * 2);
  const seen = new Set<string>();
  const questions: FlashcardQuestion[] = [];

  for (const word of pool) {
    if (seen.has(word.id)) continue;
    seen.add(word.id);

    const mode: "image-to-word" | "word-to-image" =
      questions.length % 2 === 0 ? "image-to-word" : "word-to-image";

    const distractors = getDistractors(word.id, pool, 3);
    const options = shuffleArray([word.word, ...distractors.map((d) => d.word)]);

    questions.push({ id: generateEnglishId("fc"), word, mode, options, correctAnswer: word.word });

    if (questions.length >= count) break;
  }

  return questions;
}
