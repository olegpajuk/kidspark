import type { DifficultyTier } from "@/types/game";
import type { SynonymQuestion } from "@/types/english";
import {
  WORD_RELATIONSHIPS,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

export function generateSynonymQuestion(
  difficulty: DifficultyTier,
  mode: "synonym" | "antonym" | "mixed" = "mixed"
): SynonymQuestion {
  const resolvedMode: "synonym" | "antonym" =
    mode === "mixed" ? (Math.random() > 0.5 ? "synonym" : "antonym") : mode;

  const pool = WORD_RELATIONSHIPS.filter(
    (r) =>
      resolvedMode === "synonym"
        ? r.synonyms.length > 0
        : r.antonyms.length > 0
  );

  const shuffled = shuffleArray(pool);
  const rel = shuffled[0];
  const correct =
    resolvedMode === "synonym"
      ? shuffleArray(rel.synonyms)[0]
      : shuffleArray(rel.antonyms)[0];

  // Distractors from other synonyms/antonyms in the pool
  const distractors = shuffleArray(
    shuffled
      .slice(1)
      .flatMap((r) => (resolvedMode === "synonym" ? r.synonyms : r.antonyms))
      .filter((w) => w !== correct)
  ).slice(0, 3);

  return {
    id: generateEnglishId("syn"),
    targetWord: rel.word,
    mode: resolvedMode,
    options: shuffleArray([correct, ...distractors]),
    correctAnswer: correct,
  };
}

export function generateSynonymQuestions(
  difficulty: DifficultyTier,
  count: number
): SynonymQuestion[] {
  const questions: SynonymQuestion[] = [];
  const modes: Array<"synonym" | "antonym"> = [];

  for (let i = 0; i < count; i++) {
    modes.push(i % 2 === 0 ? "synonym" : "antonym");
  }

  for (let i = 0; i < count; i++) {
    questions.push(generateSynonymQuestion(difficulty, modes[i]));
  }

  return questions;
}
