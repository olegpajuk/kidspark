import type { DifficultyTier } from "@/types/game";
import type { PluralQuestion } from "@/types/english";
import type { PluralRule } from "@/types/english";
import {
  PLURAL_FORMS,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/** Which rules are available at each difficulty */
const ALLOWED_RULES: Record<DifficultyTier, PluralRule[]> = {
  1:  ["add-s"],
  2:  ["add-s"],
  3:  ["add-s", "add-es"],
  4:  ["add-s", "add-es"],
  5:  ["add-s", "add-es", "y-to-ies"],
  6:  ["add-s", "add-es", "y-to-ies"],
  7:  ["add-s", "add-es", "y-to-ies", "f-to-ves"],
  8:  ["add-s", "add-es", "y-to-ies", "f-to-ves", "irregular"],
  9:  ["add-s", "add-es", "y-to-ies", "f-to-ves", "irregular"],
  10: ["add-s", "add-es", "y-to-ies", "f-to-ves", "irregular"],
};

export function generatePluralQuestion(difficulty: DifficultyTier): PluralQuestion {
  const allowedRules = ALLOWED_RULES[difficulty];
  const pool = PLURAL_FORMS.filter((p) => allowedRules.includes(p.rule));
  const form = shuffleArray(pool)[0];

  // Generate plausible wrong answers
  const wrongs: string[] = [];
  if (!form.plural.endsWith("s")) wrongs.push(form.singular + "s");
  if (!form.plural.endsWith("es")) wrongs.push(form.singular + "es");
  if (!form.plural.endsWith("ies") && form.singular.endsWith("y")) {
    wrongs.push(form.singular.slice(0, -1) + "ies");
  }
  // Take other plurals as distractors
  const others = shuffleArray(pool)
    .filter((p) => p.plural !== form.plural)
    .slice(0, 3)
    .map((p) => p.plural);

  const options = shuffleArray([form.plural, ...[...wrongs, ...others].slice(0, 3)]);

  return {
    id: generateEnglishId("pl"),
    form,
    options,
    correctAnswer: form.plural,
  };
}

export function generatePluralQuestions(
  difficulty: DifficultyTier,
  count: number
): PluralQuestion[] {
  const seen = new Set<string>();
  const questions: PluralQuestion[] = [];
  const allowedRules = ALLOWED_RULES[difficulty];
  const pool = shuffleArray(PLURAL_FORMS.filter((p) => allowedRules.includes(p.rule)));

  for (const form of pool) {
    if (seen.has(form.singular)) continue;
    seen.add(form.singular);

    const wrongs: string[] = [];
    if (!form.plural.endsWith("s")) wrongs.push(form.singular + "s");
    if (!form.plural.endsWith("es")) wrongs.push(form.singular + "es");
    const others = pool
      .filter((p) => p.plural !== form.plural)
      .slice(0, 3)
      .map((p) => p.plural);

    const options = shuffleArray([form.plural, ...[...wrongs, ...others].slice(0, 3)]);

    questions.push({
      id: generateEnglishId("pl"),
      form,
      options,
      correctAnswer: form.plural,
    });

    if (questions.length >= count) break;
  }

  return questions;
}
