"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useChildStore } from "@/lib/stores/child-store";
import { updateChildXPAndLevel } from "@/lib/firebase/progress";
import { createSession, completeSession } from "@/lib/firebase/sessions";
import type { SubjectId } from "@/types/child";
import type { GameId, DifficultyTier } from "@/types/game";

export interface GameResult {
  correct: number;
  total: number;
  hintsUsed?: number;
  timeTakenSeconds?: number;
}

export interface SaveProgressResult {
  success: boolean;
  starsEarned: 0 | 1 | 2 | 3;
  xpEarned: number;
  newLevel: number;
  leveledUp: boolean;
  error?: string;
}

function calculateStarsFromAccuracy(accuracy: number, hintsUsed = 0): 0 | 1 | 2 | 3 {
  const hintPenalty = Math.min(hintsUsed * 0.1, 0.3);
  const adjustedAccuracy = Math.max(0, accuracy - hintPenalty);
  
  if (adjustedAccuracy >= 0.9) return 3;
  if (adjustedAccuracy >= 0.7) return 2;
  if (adjustedAccuracy >= 0.5) return 1;
  return 0;
}

function calculateXPFromResult(
  stars: 0 | 1 | 2 | 3,
  correct: number,
  difficulty: DifficultyTier
): number {
  const baseXP = correct * 5;
  const difficultyBonus = difficulty * 2;
  const starBonus = stars * 10;
  return baseXP + difficultyBonus + starBonus;
}

export function useGameProgress(subject: SubjectId, gameId: GameId) {
  const { user } = useAuthStore();
  const { activeChild, setActiveChild } = useChildStore();

  const saveProgress = useCallback(
    async (
      result: GameResult,
      difficulty: DifficultyTier = 1
    ): Promise<SaveProgressResult> => {
      console.log("[useGameProgress] saveProgress called", {
        userId: user?.uid,
        childId: activeChild?.id,
        result,
        difficulty,
        subject,
        gameId,
      });

      if (!user?.uid || !activeChild?.id) {
        console.error("[useGameProgress] Missing user or activeChild", {
          user,
          activeChild,
        });
        return {
          success: false,
          starsEarned: 0,
          xpEarned: 0,
          newLevel: activeChild?.levels?.[subject]?.level ?? 1,
          leveledUp: false,
          error: "No user or active child",
        };
      }

      const accuracy = result.total > 0 ? result.correct / result.total : 0;
      const stars = calculateStarsFromAccuracy(accuracy, result.hintsUsed);
      const xp = calculateXPFromResult(stars, result.correct, difficulty);

      console.log("[useGameProgress] Calculated rewards", {
        accuracy,
        stars,
        xp,
      });

      try {
        // Create and complete a session for history tracking
        console.log("[useGameProgress] Creating session...");
        const sessionId = await createSession({
          parentUid: user.uid,
          childId: activeChild.id,
          gameId,
          subject,
          difficulty,
          totalQuestions: result.total,
        });
        console.log("[useGameProgress] Session created:", sessionId);

        await completeSession(user.uid, activeChild.id, sessionId, {
          starsEarned: stars,
          xpEarned: xp,
        });
        console.log("[useGameProgress] Session completed");

        // Update the child's XP and level
        console.log("[useGameProgress] Updating child XP and level...");
        const { newLevel, leveledUp } = await updateChildXPAndLevel(
          user.uid,
          activeChild.id,
          subject,
          xp,
          stars
        );
        console.log("[useGameProgress] Child updated:", { newLevel, leveledUp });

        // Update local state immediately for responsive UI
        const updatedChild = {
          ...activeChild,
          starBalance: activeChild.starBalance + stars,
          levels: {
            ...activeChild.levels,
            [subject]: {
              ...activeChild.levels[subject],
              xp: activeChild.levels[subject].xp + xp,
              level: newLevel,
            },
          },
        };
        console.log("[useGameProgress] Setting activeChild:", updatedChild);
        setActiveChild(updatedChild);

        return {
          success: true,
          starsEarned: stars,
          xpEarned: xp,
          newLevel,
          leveledUp,
        };
      } catch (error) {
        console.error("[useGameProgress] Failed to save game progress:", error);
        return {
          success: false,
          starsEarned: stars,
          xpEarned: xp,
          newLevel: activeChild.levels[subject]?.level ?? 1,
          leveledUp: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [user, activeChild, subject, gameId, setActiveChild]
  );

  return {
    saveProgress,
    isReady: !!(user?.uid && activeChild?.id),
    currentLevel: activeChild?.levels?.[subject]?.level ?? 1,
    currentXP: activeChild?.levels?.[subject]?.xp ?? 0,
    starBalance: activeChild?.starBalance ?? 0,
  };
}
