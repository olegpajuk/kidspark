import type { SubjectId, AvatarId } from "./child";
import type { GameId } from "./game";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";
export type RewardItemCategory = "avatar-outfit" | "theme" | "sticker-pack" | "background";

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  tier: BadgeTier;
  subject: SubjectId | null; // null = global badge
  requirement: BadgeRequirement;
}

export type BadgeRequirement =
  | { type: "sessions_completed"; count: number; gameId?: GameId }
  | { type: "perfect_sessions"; count: number }
  | { type: "stars_earned"; total: number }
  | { type: "streak_days"; days: number }
  | { type: "subject_level"; subject: SubjectId; level: number };

export interface ChildBadge {
  badgeId: string;
  earnedAt: string; // ISO timestamp
  gameSessionId: string | null;
}

export interface WeeklyChallenge {
  id: string;
  childId: string;
  weekStartDate: string; // Monday YYYY-MM-DD
  goals: WeeklyGoal[];
  rewardStars: number;
  completed: boolean;
  completedAt: string | null;
}

export interface WeeklyGoal {
  id: string;
  description: string;
  gameId: GameId | null; // null = any game
  subject: SubjectId | null;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: RewardItemCategory;
  thumbnailUrl: string;
  starCost: number;
  previewUrl: string;
  avatarId?: AvatarId; // for outfits
}

export interface ChildInventory {
  childId: string;
  ownedItems: string[]; // RewardItem ids
  equippedOutfitId: string | null;
  equippedThemeId: string | null;
  equippedBackgroundId: string | null;
}
