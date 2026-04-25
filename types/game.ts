import type { SubjectId } from "./child";

export type GameId =
  | "banana-bridge"
  | "frog-jump"
  | "array-garden"
  | "fair-share-bakery"
  | "number-bond-balloons"
  | "market-stall"
  | "piggy-bank-goals"
  | "word-builder"
  | "map-puzzle"
  | "binary-builder";

export type GameStatus = "locked" | "available" | "mastered";

export type DifficultyTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GameDefinition {
  id: GameId;
  name: string;
  description: string;
  subject: SubjectId;
  minAge: number;
  maxAge: number | null;
  minDifficulty: DifficultyTier;
  maxDifficulty: DifficultyTier;
  questionCount: number; // Questions per session
  timePerQuestion: number | null; // seconds, null = untimed
  thumbnailUrl: string;
  colorHex: string;
}

export interface GameQuestion {
  id: string;
  gameId: GameId;
  difficulty: DifficultyTier;
  prompt: string;
  correctAnswer: string | number;
  hints?: string[];
  metadata?: Record<string, unknown>; // Game-specific extra data
}

export interface GameConfig {
  gameId: GameId;
  childId: string;
  difficulty: DifficultyTier;
  questionCount: number;
  timeLimit: number | null;
}
