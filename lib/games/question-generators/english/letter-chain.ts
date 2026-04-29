import type { DifficultyTier } from "@/types/game";
import type { LetterChainQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";
import type { Word } from "@/types/english";

export function generateLetterChainQuestion(
  difficulty: DifficultyTier,
  chainSoFar: string[] = []
): LetterChainQuestion {
  const pool = getWordsByDifficulty(difficulty);

  let startWord: Word;
  const requiredStartLetter =
    chainSoFar.length > 0
      ? chainSoFar[chainSoFar.length - 1].slice(-1).toLowerCase()
      : null;

  if (requiredStartLetter) {
    const candidates = pool.filter(
      (w) =>
        w.word[0].toLowerCase() === requiredStartLetter &&
        !chainSoFar.includes(w.word)
    );
    startWord = candidates.length > 0
      ? shuffleArray(candidates)[0]
      : shuffleArray(pool)[0];
  } else {
    startWord = shuffleArray(pool)[0];
  }

  // Find words that start with the LAST letter of startWord
  const lastLetter = startWord.word.slice(-1).toLowerCase();
  const correct = shuffleArray(
    pool.filter(
      (w) =>
        w.word[0].toLowerCase() === lastLetter &&
        w.id !== startWord.id &&
        !chainSoFar.includes(w.word)
    )
  )[0];

  // Distractors that DON'T start with lastLetter
  const distractors = shuffleArray(
    pool.filter(
      (w) =>
        w.word[0].toLowerCase() !== lastLetter &&
        w.id !== startWord.id &&
        w.id !== correct?.id
    )
  ).slice(0, 3);

  const options = shuffleArray([correct ?? pool[1], ...distractors]);

  return {
    id: generateEnglishId("lc"),
    startWord,
    options,
    correctAnswerId: correct?.id ?? options[0].id,
    chainSoFar,
  };
}

export function generateLetterChainQuestions(
  difficulty: DifficultyTier,
  count: number
): LetterChainQuestion[] {
  const questions: LetterChainQuestion[] = [];
  const chain: string[] = [];

  for (let i = 0; i < count; i++) {
    const q = generateLetterChainQuestion(difficulty, chain);
    chain.push(q.startWord.word);
    questions.push(q);
  }

  return questions;
}
