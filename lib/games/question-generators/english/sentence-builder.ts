import type { DifficultyTier } from "@/types/game";
import type { SentenceBuilderQuestion } from "@/types/english";
import {
  getSentencesByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

export function generateSentenceBuilderQuestion(
  difficulty: DifficultyTier
): SentenceBuilderQuestion {
  const [sentence] = getSentencesByDifficulty(difficulty, 1);

  const correctOrder = sentence.text.replace(/\.$/, "").split(" ");
  const scrambledWords = shuffleArray([...correctOrder]);

  return {
    id: generateEnglishId("sent"),
    sentence,
    scrambledWords,
    correctOrder,
  };
}

export function generateSentenceBuilderQuestions(
  difficulty: DifficultyTier,
  count: number
): SentenceBuilderQuestion[] {
  const sentences = getSentencesByDifficulty(difficulty, count);
  return sentences.map((sentence) => {
    const correctOrder = sentence.text.replace(/\.$/, "").split(" ");
    return {
      id: generateEnglishId("sent"),
      sentence,
      scrambledWords: shuffleArray([...correctOrder]),
      correctOrder,
    };
  });
}
