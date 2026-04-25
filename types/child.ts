export type AvatarId =
  | "fox"
  | "rabbit"
  | "bear"
  | "owl"
  | "lion"
  | "penguin"
  | "cat"
  | "dog";

export type SubjectId =
  | "maths"
  | "finance"
  | "english"
  | "geography"
  | "computer";

export interface ChildPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  unlockedSubjects: SubjectId[];
  dailyTimeLimitMinutes: number | null; // null = no limit
  preferredDifficulty: number; // 1-10 starting point
}

export interface ChildLevel {
  subject: SubjectId;
  xp: number;
  level: number;
  adaptiveDifficulty: number; // 1-10, auto-adjusted per game
}

export interface Child {
  id: string;
  parentUid: string;
  name: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  avatarId: AvatarId;
  preferences: ChildPreferences;
  levels: Record<SubjectId, ChildLevel>;
  starBalance: number;
  totalStarsEarned: number;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface ChildSummary {
  id: string;
  name: string;
  avatarId: AvatarId;
  starBalance: number;
  levels: Record<SubjectId, ChildLevel>;
}
