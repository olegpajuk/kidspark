import type { DifficultyTier } from "@/types/game";

export interface BananaBridgeQuestion {
  id: string;
  difficulty: DifficultyTier;
  addends: number[];
  correctAnswer: number;
  bridgesThrough: 10 | 20 | null;
  hint: string;
}

interface QuestionConfig {
  minAddend: number;
  maxAddend: number;
  maxSum: number;
  requireBridging: boolean;
  bridgeTarget: 10 | 20 | null;
  addendCount: 2 | 3;
}

const DIFFICULTY_CONFIG: Record<DifficultyTier, QuestionConfig> = {
  1: { minAddend: 1, maxAddend: 5, maxSum: 10, requireBridging: false, bridgeTarget: null, addendCount: 2 },
  2: { minAddend: 1, maxAddend: 6, maxSum: 10, requireBridging: false, bridgeTarget: null, addendCount: 2 },
  3: { minAddend: 2, maxAddend: 7, maxSum: 10, requireBridging: false, bridgeTarget: null, addendCount: 2 },
  4: { minAddend: 4, maxAddend: 8, maxSum: 15, requireBridging: true, bridgeTarget: 10, addendCount: 2 },
  5: { minAddend: 5, maxAddend: 9, maxSum: 17, requireBridging: true, bridgeTarget: 10, addendCount: 2 },
  6: { minAddend: 6, maxAddend: 9, maxSum: 18, requireBridging: true, bridgeTarget: 10, addendCount: 2 },
  7: { minAddend: 8, maxAddend: 14, maxSum: 25, requireBridging: true, bridgeTarget: 20, addendCount: 2 },
  8: { minAddend: 10, maxAddend: 16, maxSum: 28, requireBridging: true, bridgeTarget: 20, addendCount: 2 },
  9: { minAddend: 12, maxAddend: 18, maxSum: 32, requireBridging: true, bridgeTarget: 20, addendCount: 2 },
  10: { minAddend: 3, maxAddend: 9, maxSum: 25, requireBridging: true, bridgeTarget: 10, addendCount: 3 },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueId(): string {
  return `bb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateTwoAddendQuestion(config: QuestionConfig): { addends: number[]; correctAnswer: number } {
  const { minAddend, maxAddend, maxSum, requireBridging, bridgeTarget } = config;

  let attempts = 0;
  while (attempts < 100) {
    const a = randomInt(minAddend, maxAddend);
    const b = randomInt(minAddend, maxAddend);
    const sum = a + b;

    if (sum > maxSum) {
      attempts++;
      continue;
    }

    if (requireBridging && bridgeTarget) {
      const smallerAddend = Math.min(a, b);
      const largerAddend = Math.max(a, b);
      const bridgesProperly = largerAddend < bridgeTarget && sum > bridgeTarget;

      if (!bridgesProperly) {
        attempts++;
        continue;
      }
    }

    if (!requireBridging && bridgeTarget === null) {
      const sum = a + b;
      if (sum > 10) {
        attempts++;
        continue;
      }
    }

    return { addends: [a, b], correctAnswer: sum };
  }

  return { addends: [3, 4], correctAnswer: 7 };
}

function generateThreeAddendQuestion(config: QuestionConfig): { addends: number[]; correctAnswer: number } {
  const { minAddend, maxAddend, maxSum } = config;

  let attempts = 0;
  while (attempts < 100) {
    const a = randomInt(minAddend, maxAddend);
    const b = randomInt(minAddend, maxAddend);
    const c = randomInt(minAddend, maxAddend);
    const sum = a + b + c;

    if (sum <= maxSum && sum > 10) {
      return { addends: [a, b, c], correctAnswer: sum };
    }
    attempts++;
  }

  return { addends: [3, 4, 5], correctAnswer: 12 };
}

function generateHint(addends: number[], bridgeTarget: 10 | 20 | null): string {
  if (bridgeTarget === null) {
    return `Count the fruits one by one!`;
  }

  const sum = addends.reduce((a, b) => a + b, 0);
  if (bridgeTarget === 10 && sum > 10) {
    const first = addends[0];
    const needToMake10 = 10 - first;
    return `First make 10: ${first} + ${needToMake10} = 10, then add the rest!`;
  }

  if (bridgeTarget === 20 && sum > 20) {
    const first = addends[0];
    const needToMake20 = 20 - first;
    return `First make 20: ${first} + ${needToMake20} = 20, then add the rest!`;
  }

  return `Use the number line to count!`;
}

export function generateBananaBridgeQuestion(difficulty: DifficultyTier): BananaBridgeQuestion {
  const config = DIFFICULTY_CONFIG[difficulty];

  const { addends, correctAnswer } =
    config.addendCount === 3
      ? generateThreeAddendQuestion(config)
      : generateTwoAddendQuestion(config);

  return {
    id: generateUniqueId(),
    difficulty,
    addends,
    correctAnswer,
    bridgesThrough: config.requireBridging ? config.bridgeTarget : null,
    hint: generateHint(addends, config.bridgeTarget),
  };
}

export function generateBananaBridgeQuestions(
  difficulty: DifficultyTier,
  count: number
): BananaBridgeQuestion[] {
  const questions: BananaBridgeQuestion[] = [];
  const seenAnswers = new Set<string>();

  let attempts = 0;
  while (questions.length < count && attempts < count * 10) {
    const question = generateBananaBridgeQuestion(difficulty);
    const key = question.addends.join("+");

    if (!seenAnswers.has(key)) {
      seenAnswers.add(key);
      questions.push(question);
    }
    attempts++;
  }

  while (questions.length < count) {
    questions.push(generateBananaBridgeQuestion(difficulty));
  }

  return questions;
}

export const BANANA_BRIDGE_GAME_DEFINITION = {
  id: "banana-bridge" as const,
  name: "Banana Bridge",
  description: "Drag bananas onto the number line to solve addition problems. Learn to bridge through 10 and 20!",
  subject: "maths" as const,
  minAge: 5,
  maxAge: 9,
  minDifficulty: 1 as DifficultyTier,
  maxDifficulty: 10 as DifficultyTier,
  questionCount: 8,
  timePerQuestion: null,
  thumbnailUrl: "/images/games/banana-bridge.png",
  colorHex: "#FF6B6B",
};
