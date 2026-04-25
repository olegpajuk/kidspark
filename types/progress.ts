import type { GameId, DifficultyTier } from "./game";
import type { SubjectId } from "./child";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface QuestionResult {
  questionId: string;
  answeredCorrectly: boolean;
  hintsUsed: number;
  timeSpentSeconds: number;
  attemptCount: number;
}

export interface GameSession {
  id: string;
  childId: string;
  parentUid: string;
  gameId: GameId;
  subject: SubjectId;
  difficulty: DifficultyTier;
  status: SessionStatus;
  questionResults: QuestionResult[];
  totalQuestions: number;
  correctCount: number;
  starsEarned: 0 | 1 | 2 | 3;
  xpEarned: number;
  startedAt: string; // ISO timestamp
  completedAt: string | null;
  durationSeconds: number | null;
}

export interface DailyTask {
  id: string;
  childId: string;
  gameId: GameId;
  subject: SubjectId;
  targetDifficulty: DifficultyTier;
  questionCount: number;
  completed: boolean;
  completedSessionId: string | null;
  scheduledDate: string; // YYYY-MM-DD
  isParentAssigned: boolean;
}

export interface ConceptMastery {
  subjectId: SubjectId;
  conceptKey: string; // e.g. "addition-bridging-10"
  masteryScore: number; // 0-100
  lastAssessedAt: string;
  sessionCount: number;
}

export interface ChildProgress {
  childId: string;
  subjectMastery: ConceptMastery[];
  weeklySessionCount: number;
  weeklyStarsEarned: number;
  streakDays: number;
  lastActiveAt: string;
}
