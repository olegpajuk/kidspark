import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";
import type { Child, SubjectId, ChildLevel } from "@/types/child";
import type { DifficultyTier } from "@/types/game";
import type { GameSession } from "@/types/progress";
import { getRecentSessions } from "./sessions";

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 50;

function childDoc(parentUid: string, childId: string) {
  return doc(db, "users", parentUid, "children", childId);
}

export function calculateLevel(totalXP: number): number {
  return Math.min(MAX_LEVEL, Math.floor(totalXP / XP_PER_LEVEL) + 1);
}

export function xpToNextLevel(totalXP: number): { current: number; needed: number } {
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  return {
    current: currentLevelXP,
    needed: XP_PER_LEVEL,
  };
}

export async function updateChildXPAndLevel(
  parentUid: string,
  childId: string,
  subject: SubjectId,
  xpEarned: number,
  starsEarned: 0 | 1 | 2 | 3
): Promise<{ newLevel: number; leveledUp: boolean }> {
  const ref = childDoc(parentUid, childId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(`Child ${childId} not found`);
  }

  const childData = snap.data() as Child;
  const currentSubjectLevel = childData.levels[subject];

  const newXP = currentSubjectLevel.xp + xpEarned;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > currentSubjectLevel.level;

  const updatedLevel: ChildLevel = {
    ...currentSubjectLevel,
    xp: newXP,
    level: newLevel,
  };

  const newStarBalance = childData.starBalance + starsEarned;
  const newTotalStars = childData.totalStarsEarned + starsEarned;

  await updateDoc(ref, {
    [`levels.${subject}`]: updatedLevel,
    starBalance: newStarBalance,
    totalStarsEarned: newTotalStars,
    updatedAt: new Date().toISOString(),
  });

  return { newLevel, leveledUp };
}

export async function getChildProgress(
  parentUid: string,
  childId: string
): Promise<Child | null> {
  const ref = childDoc(parentUid, childId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return { id: snap.id, ...snap.data() } as Child;
}

export interface AdaptiveDifficultyResult {
  recommendedDifficulty: DifficultyTier;
  reason: string;
  confidence: "low" | "medium" | "high";
}

export async function calculateAdaptiveDifficulty(
  parentUid: string,
  childId: string,
  gameId: string,
  currentDifficulty: DifficultyTier
): Promise<AdaptiveDifficultyResult> {
  const recentSessions = await getRecentSessions(
    parentUid,
    childId,
    gameId as GameSession["gameId"],
    5
  );

  const completedSessions = recentSessions.filter(
    (s) => s.status === "completed"
  );

  if (completedSessions.length < 2) {
    return {
      recommendedDifficulty: currentDifficulty,
      reason: "Not enough session data yet",
      confidence: "low",
    };
  }

  const recentResults = completedSessions.slice(0, 3);

  const avgAccuracy =
    recentResults.reduce((sum, s) => {
      return sum + s.correctCount / s.totalQuestions;
    }, 0) / recentResults.length;

  const avgStars =
    recentResults.reduce((sum, s) => sum + s.starsEarned, 0) / recentResults.length;

  const totalHints = recentResults.reduce((sum, s) => {
    return sum + s.questionResults.reduce((qSum, q) => qSum + q.hintsUsed, 0);
  }, 0);
  const avgHintsPerSession = totalHints / recentResults.length;

  let recommendedDifficulty = currentDifficulty;
  let reason = "";

  if (avgAccuracy >= 0.9 && avgStars >= 2.5 && avgHintsPerSession < 1) {
    if (currentDifficulty < 10) {
      recommendedDifficulty = Math.min(10, currentDifficulty + 1) as DifficultyTier;
      reason = "Excellent performance - increasing difficulty";
    } else {
      reason = "Already at maximum difficulty";
    }
  } else if (avgAccuracy >= 0.8 && avgStars >= 2) {
    reason = "Good performance - maintaining current difficulty";
  } else if (avgAccuracy < 0.5 || avgStars < 1.5) {
    if (currentDifficulty > 1) {
      recommendedDifficulty = Math.max(1, currentDifficulty - 1) as DifficultyTier;
      reason = "Struggling - decreasing difficulty to build confidence";
    } else {
      reason = "Already at minimum difficulty";
    }
  } else if (avgAccuracy < 0.7 && avgHintsPerSession > 3) {
    if (currentDifficulty > 1) {
      recommendedDifficulty = Math.max(1, currentDifficulty - 1) as DifficultyTier;
      reason = "Using many hints - decreasing difficulty";
    }
  } else {
    reason = "Moderate performance - maintaining current difficulty";
  }

  const confidence =
    completedSessions.length >= 5
      ? "high"
      : completedSessions.length >= 3
      ? "medium"
      : "low";

  return {
    recommendedDifficulty,
    reason,
    confidence,
  };
}

export async function updateChildAdaptiveDifficulty(
  parentUid: string,
  childId: string,
  subject: SubjectId,
  newDifficulty: DifficultyTier
): Promise<void> {
  const ref = childDoc(parentUid, childId);

  await updateDoc(ref, {
    [`levels.${subject}.adaptiveDifficulty`]: newDifficulty,
    updatedAt: new Date().toISOString(),
  });
}

export async function applyAdaptiveDifficultyAdjustment(
  parentUid: string,
  childId: string,
  gameId: string,
  subject: SubjectId,
  currentDifficulty: DifficultyTier
): Promise<AdaptiveDifficultyResult> {
  const result = await calculateAdaptiveDifficulty(
    parentUid,
    childId,
    gameId,
    currentDifficulty
  );

  if (result.recommendedDifficulty !== currentDifficulty && result.confidence !== "low") {
    await updateChildAdaptiveDifficulty(
      parentUid,
      childId,
      subject,
      result.recommendedDifficulty
    );
  }

  return result;
}
