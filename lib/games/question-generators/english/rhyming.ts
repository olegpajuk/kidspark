import type { DifficultyTier } from "@/types/game";
import type { RhymingQuestion } from "@/types/english";
import {
  WORDS_BY_LEVEL,
  RHYME_GROUPS,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

export function generateRhymingQuestion(difficulty: DifficultyTier): RhymingQuestion {
  const groups = shuffleArray(RHYME_GROUPS);

  for (const group of groups) {
    if (group.words.length < 3) continue;

    const shuffledWords = shuffleArray(group.words);
    const targetWord = WORDS_BY_LEVEL.find(
      (w) => w.word === shuffledWords[0] && w.difficulty <= difficulty
    );
    if (!targetWord) continue;

    const correctRhymes = shuffledWords.slice(1, 3);

    // Pick non-rhyming distractors
    const nonRhymers = WORDS_BY_LEVEL.filter(
      (w) =>
        w.difficulty <= difficulty &&
        !group.words.includes(w.word) &&
        w.word !== targetWord.word
    );
    const distractors = shuffleArray(nonRhymers)
      .slice(0, 2)
      .map((w) => w.word);

    const options = shuffleArray([...correctRhymes, ...distractors]);

    return {
      id: generateEnglishId("rhy"),
      targetWord,
      options,
      correctRhymes,
    };
  }

  // Fallback
  const fallback = WORDS_BY_LEVEL.find((w) => w.word === "cat")!;
  return {
    id: generateEnglishId("rhy"),
    targetWord: fallback,
    options: shuffleArray(["bat", "hat", "sun", "dog"]),
    correctRhymes: ["bat", "hat"],
  };
}

export function generateRhymingQuestions(
  difficulty: DifficultyTier,
  count: number
): RhymingQuestion[] {
  const questions: RhymingQuestion[] = [];
  const usedGroups = new Set<string>();

  for (const group of shuffleArray(RHYME_GROUPS)) {
    if (usedGroups.has(group.family)) continue;
    if (questions.length >= count) break;

    usedGroups.add(group.family);
    questions.push(generateRhymingQuestion(difficulty));
  }

  while (questions.length < count) {
    questions.push(generateRhymingQuestion(difficulty));
  }

  return questions.slice(0, count);
}
