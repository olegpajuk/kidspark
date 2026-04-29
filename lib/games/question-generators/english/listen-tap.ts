import type { DifficultyTier } from "@/types/game";
import type { ListenTapQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  getDistractors,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/** Option count per difficulty */
const OPTIONS_COUNT: Record<DifficultyTier, number> = {
  1: 4, 2: 4, 3: 4, 4: 6, 5: 6, 6: 6, 7: 9, 8: 9, 9: 9, 10: 9,
};

export function generateListenTapQuestion(difficulty: DifficultyTier): ListenTapQuestion {
  const pool = getWordsByDifficulty(difficulty);
  const target = shuffleArray(pool)[0];
  const optionCount = OPTIONS_COUNT[difficulty];

  const distractors = getDistractors(target.id, pool, optionCount - 1);
  const options = shuffleArray([target, ...distractors]);

  return {
    id: generateEnglishId("lt"),
    targetWord: target,
    options,
    correctId: target.id,
  };
}

export function generateListenTapQuestions(
  difficulty: DifficultyTier,
  count: number
): ListenTapQuestion[] {
  const seen = new Set<string>();
  const questions: ListenTapQuestion[] = [];
  const pool = shuffleArray(getWordsByDifficulty(difficulty));

  for (const word of pool) {
    if (seen.has(word.id)) continue;
    seen.add(word.id);

    const optionCount = OPTIONS_COUNT[difficulty];
    const distractors = getDistractors(word.id, pool, optionCount - 1);
    const options = shuffleArray([word, ...distractors]);

    questions.push({
      id: generateEnglishId("lt"),
      targetWord: word,
      options,
      correctId: word.id,
    });

    if (questions.length >= count) break;
  }

  return questions;
}
