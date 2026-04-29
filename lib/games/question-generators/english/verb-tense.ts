import type { DifficultyTier } from "@/types/game";
import type { VerbTenseQuestion, VerbTense } from "@/types/english";
import {
  VERB_FORMS,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/** Which tenses are tested at each level */
const TENSES_BY_DIFFICULTY: Record<DifficultyTier, VerbTense[]> = {
  1:  ["past", "present"],
  2:  ["past", "present"],
  3:  ["past", "present", "future"],
  4:  ["past", "present", "future"],
  5:  ["past", "present", "future", "presentParticiple"],
  6:  ["past", "present", "future", "presentParticiple"],
  7:  ["past", "present", "future", "presentParticiple"],
  8:  ["past", "present", "future", "presentParticiple"],
  9:  ["past", "present", "future", "presentParticiple"],
  10: ["past", "present", "future", "presentParticiple"],
};

const CONTEXT_TEMPLATES: Record<VerbTense, (base: string) => string> = {
  past: (base) => `Yesterday I _____ to the park.`,
  present: (base) => `I _____ every morning.`,
  future: (base) => `Tomorrow I will _____.`,
  presentParticiple: (base) => `Right now I am _____.`,
};

function getFormForTense(verb: typeof VERB_FORMS[0], tense: VerbTense): string {
  switch (tense) {
    case "past": return verb.past;
    case "present": return verb.base;
    case "future": return verb.future;
    case "presentParticiple": return verb.presentParticiple;
  }
}

export function generateVerbTenseQuestion(difficulty: DifficultyTier): VerbTenseQuestion {
  const allowedTenses = TENSES_BY_DIFFICULTY[difficulty];
  const tense: VerbTense = shuffleArray(allowedTenses)[0];

  const pool = difficulty <= 4
    ? VERB_FORMS.filter((v) => !v.irregular)
    : VERB_FORMS;

  const verb = shuffleArray(pool)[0];
  const correctAnswer = getFormForTense(verb, tense);

  // Distractors: other verb forms
  const distractors = shuffleArray(pool)
    .filter((v) => v.base !== verb.base)
    .slice(0, 3)
    .map((v) => getFormForTense(v, tense));

  return {
    id: generateEnglishId("vt"),
    verb,
    targetTense: tense,
    options: shuffleArray([correctAnswer, ...distractors]),
    correctAnswer,
    contextSentence: CONTEXT_TEMPLATES[tense](verb.base),
  };
}

export function generateVerbTenseQuestions(
  difficulty: DifficultyTier,
  count: number
): VerbTenseQuestion[] {
  return Array.from({ length: count }, () => generateVerbTenseQuestion(difficulty));
}
