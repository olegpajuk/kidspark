"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useChildStore } from "@/lib/stores/child-store";
import {
  createSession,
  updateSession,
  completeSession,
  calculateStars,
  calculateXP,
} from "@/lib/firebase/sessions";
import { updateChildXPAndLevel } from "@/lib/firebase/progress";
import type { GameId, DifficultyTier } from "@/types/game";
import type { SubjectId } from "@/types/child";
import type { QuestionResult } from "@/types/progress";

export type SessionPhase = "idle" | "loading" | "intro" | "playing" | "reviewing" | "complete" | "error";

interface QuestionAttempt {
  questionId: string;
  correct: boolean;
  hintsUsed: number;
  timeSpent: number;
  attempts: number;
}

interface SessionState {
  phase: SessionPhase;
  sessionId: string | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionAttempts: QuestionAttempt[];
  correctCount: number;
  totalHintsUsed: number;
  starsEarned: 0 | 1 | 2 | 3;
  xpEarned: number;
  error: string | null;
}

interface UseGameSessionOptions {
  gameId: GameId;
  subject: SubjectId;
  difficulty: DifficultyTier;
  questionCount: number;
  onSessionComplete?: (result: {
    starsEarned: 0 | 1 | 2 | 3;
    xpEarned: number;
    correctCount: number;
    totalQuestions: number;
  }) => void;
}

const initialState: SessionState = {
  phase: "idle",
  sessionId: null,
  currentQuestionIndex: 0,
  totalQuestions: 0,
  questionAttempts: [],
  correctCount: 0,
  totalHintsUsed: 0,
  starsEarned: 0,
  xpEarned: 0,
  error: null,
};

export function useGameSession(options: UseGameSessionOptions) {
  const { gameId, subject, difficulty, questionCount, onSessionComplete } = options;

  const [state, setState] = useState<SessionState>({
    ...initialState,
    totalQuestions: questionCount,
  });

  const { user } = useAuthStore();
  const { activeChild } = useChildStore();
  const sessionStartTimeRef = useRef<number>(0);

  const startSession = useCallback(async () => {
    if (!user?.uid || !activeChild?.id) {
      setState((s) => ({
        ...s,
        phase: "error",
        error: "No authenticated user or active child",
      }));
      return;
    }

    setState((s) => ({ ...s, phase: "loading" }));

    try {
      const sessionId = await createSession({
        childId: activeChild.id,
        parentUid: user.uid,
        gameId,
        subject,
        difficulty,
        totalQuestions: questionCount,
      });

      sessionStartTimeRef.current = Date.now();

      setState((s) => ({
        ...s,
        phase: "intro",
        sessionId,
        currentQuestionIndex: 0,
        questionAttempts: [],
        correctCount: 0,
        totalHintsUsed: 0,
        starsEarned: 0,
        xpEarned: 0,
        error: null,
      }));
    } catch (err) {
      console.error("Failed to create session:", err);
      setState((s) => ({
        ...s,
        phase: "error",
        error: "Failed to start game session",
      }));
    }
  }, [user?.uid, activeChild?.id, gameId, subject, difficulty, questionCount]);

  const beginPlaying = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "playing",
    }));
  }, []);

  const recordAnswer = useCallback(
    async (result: {
      questionId: string;
      correct: boolean;
      hintsUsed: number;
      timeSpent: number;
    }) => {
      if (!user?.uid || !activeChild?.id || !state.sessionId) {
        return;
      }

      const attempt: QuestionAttempt = {
        questionId: result.questionId,
        correct: result.correct,
        hintsUsed: result.hintsUsed,
        timeSpent: result.timeSpent,
        attempts: 1,
      };

      const questionResult: QuestionResult = {
        questionId: result.questionId,
        answeredCorrectly: result.correct,
        hintsUsed: result.hintsUsed,
        timeSpentSeconds: result.timeSpent,
        attemptCount: 1,
      };

      try {
        await updateSession(user.uid, activeChild.id, state.sessionId, {
          questionResult,
        });
      } catch (err) {
        console.error("Failed to save question result:", err);
      }

      setState((s) => {
        const newAttempts = [...s.questionAttempts, attempt];
        const newCorrectCount = newAttempts.filter((a) => a.correct).length;
        const newHintsUsed = newAttempts.reduce((sum, a) => sum + a.hintsUsed, 0);
        const nextIndex = s.currentQuestionIndex + 1;
        const isComplete = nextIndex >= s.totalQuestions;

        if (isComplete) {
          const stars = calculateStars(newCorrectCount, s.totalQuestions, newHintsUsed);
          const xp = calculateXP(stars, difficulty, newCorrectCount);

          return {
            ...s,
            questionAttempts: newAttempts,
            correctCount: newCorrectCount,
            totalHintsUsed: newHintsUsed,
            currentQuestionIndex: nextIndex,
            phase: "reviewing",
            starsEarned: stars,
            xpEarned: xp,
          };
        }

        return {
          ...s,
          questionAttempts: newAttempts,
          correctCount: newCorrectCount,
          totalHintsUsed: newHintsUsed,
          currentQuestionIndex: nextIndex,
        };
      });
    },
    [user?.uid, activeChild?.id, state.sessionId, difficulty]
  );

  const nextQuestion = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "playing",
    }));
  }, []);

  const finishSession = useCallback(async () => {
    if (!user?.uid || !activeChild?.id || !state.sessionId) {
      return;
    }

    setState((s) => ({ ...s, phase: "complete" }));

    try {
      await completeSession(user.uid, activeChild.id, state.sessionId, {
        starsEarned: state.starsEarned,
        xpEarned: state.xpEarned,
      });

      await updateChildXPAndLevel(
        user.uid,
        activeChild.id,
        subject,
        state.xpEarned,
        state.starsEarned
      );

      onSessionComplete?.({
        starsEarned: state.starsEarned,
        xpEarned: state.xpEarned,
        correctCount: state.correctCount,
        totalQuestions: state.totalQuestions,
      });
    } catch (err) {
      console.error("Failed to complete session:", err);
    }
  }, [
    user?.uid,
    activeChild?.id,
    state.sessionId,
    state.starsEarned,
    state.xpEarned,
    state.correctCount,
    state.totalQuestions,
    subject,
    onSessionComplete,
  ]);

  const abandonSession = useCallback(async () => {
    if (!user?.uid || !activeChild?.id || !state.sessionId) {
      setState(initialState);
      return;
    }

    try {
      await updateSession(user.uid, activeChild.id, state.sessionId, {
        status: "abandoned",
      });
    } catch (err) {
      console.error("Failed to abandon session:", err);
    }

    setState(initialState);
  }, [user?.uid, activeChild?.id, state.sessionId]);

  const resetSession = useCallback(() => {
    setState({
      ...initialState,
      totalQuestions: questionCount,
    });
  }, [questionCount]);

  return {
    phase: state.phase,
    sessionId: state.sessionId,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.totalQuestions,
    correctCount: state.correctCount,
    totalHintsUsed: state.totalHintsUsed,
    starsEarned: state.starsEarned,
    xpEarned: state.xpEarned,
    error: state.error,

    startSession,
    beginPlaying,
    recordAnswer,
    nextQuestion,
    finishSession,
    abandonSession,
    resetSession,
  };
}
