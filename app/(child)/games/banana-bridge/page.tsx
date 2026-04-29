"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameShell, type SessionResult } from "@/components/game-shell/GameShell";
import { BananaBridge, type BridgeGameMode } from "@/components/games/banana-bridge";
import { useChildStore } from "@/lib/stores/child-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  generateBananaBridgeQuestions,
  BANANA_BRIDGE_GAME_DEFINITION,
  type BananaBridgeQuestion,
} from "@/lib/games/question-generators/banana-bridge";
import { updateChildXPAndLevel } from "@/lib/firebase/progress";
import type { DifficultyTier } from "@/types/game";
import { motion } from "framer-motion";

const QUESTIONS_PER_SESSION = 8;

type GamePhase = "loading" | "playing" | "complete";

interface QuestionResult {
  correct: boolean;
  hintsUsed: number;
  timeSpent: number;
}

function calculateStars(correctCount: number, totalQuestions: number, hintsUsed: number): 0 | 1 | 2 | 3 {
  const accuracy = correctCount / totalQuestions;
  const hintPenalty = Math.min(hintsUsed * 0.1, 0.3);
  const adjustedAccuracy = Math.max(0, accuracy - hintPenalty);

  if (adjustedAccuracy >= 0.9) return 3;
  if (adjustedAccuracy >= 0.7) return 2;
  if (adjustedAccuracy >= 0.5) return 1;
  return 0;
}

export default function BananaBridgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#FFF8E7]">
          <div className="text-center">
            <div className="text-6xl mb-4">🍌</div>
            <p className="text-xl font-bold text-gray-700">Loading...</p>
          </div>
        </div>
      }
    >
      <BananaBridgeGameContent />
    </Suspense>
  );
}

function BananaBridgeGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeChild, setActiveChild } = useChildStore();
  const { user } = useAuthStore();

  // Get mode from URL params
  const urlMode = searchParams.get("mode") ?? "auto";
  const levelParam = searchParams.get("level");
  
  // Parse mode for UI and game type
  const isBridgePractice = urlMode === "bridge-practice";
  const isBridgeLearn = urlMode === "bridge-learn";
  const isBridge = isBridgePractice || isBridgeLearn || urlMode === "bridge";
  const isCounting = urlMode === "counting";
  
  // Game mode for BananaBridge component
  const gameMode: BridgeGameMode = isBridgeLearn ? "learn" : "practice";
  
  // Determine difficulty based on mode and explicit level
  const baseDifficulty = activeChild?.levels?.maths?.adaptiveDifficulty ?? 1;
  const difficulty = (
    levelParam ? parseInt(levelParam, 10) :
    isCounting ? Math.min(baseDifficulty, 3) :
    isBridge ? Math.max(baseDifficulty, 4) :
    baseDifficulty
  ) as DifficultyTier;

  const gameName = isBridgePractice ? "Bridge to 10 - Practice" :
                   isBridgeLearn ? "Bridge to 10 - Learn" :
                   isCounting ? "Fruit Counting" : 
                   BANANA_BRIDGE_GAME_DEFINITION.name;

  const [phase, setPhase] = useState<GamePhase>("loading");
  const [questions, setQuestions] = useState<BananaBridgeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  // Generate questions on mount
  useEffect(() => {
    if (!activeChild) {
      router.push("/home");
      return;
    }

    const generatedQuestions = generateBananaBridgeQuestions(difficulty, QUESTIONS_PER_SESSION);
    setQuestions(generatedQuestions);
    setPhase("playing");
  }, [activeChild, difficulty, router]);

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] ?? null;
  }, [questions, currentQuestionIndex]);

  const handleQuestionComplete = useCallback(
    (result: { correct: boolean; hintsUsed: number; timeSpent: number }) => {
      const newResults = [...results, result];
      setResults(newResults);

      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex >= questions.length) {
        // Session complete
        const correctCount = newResults.filter((r) => r.correct).length;
        const totalHints = newResults.reduce((sum, r) => sum + r.hintsUsed, 0);
        const stars = calculateStars(correctCount, questions.length, totalHints);
        const xp = correctCount * 5 + stars * 10 + difficulty * 2;

        setSessionResult({
          starsEarned: stars,
          correctCount,
          totalQuestions: questions.length,
          xpEarned: xp,
        });
        setPhase("complete");

        // Save progress to Firebase
        if (user?.uid && activeChild?.id) {
          updateChildXPAndLevel(user.uid, activeChild.id, "maths", xp, stars)
            .then(({ newLevel, leveledUp }) => {
              // Update local state with new values
              if (activeChild) {
                const updatedChild = {
                  ...activeChild,
                  starBalance: activeChild.starBalance + stars,
                  levels: {
                    ...activeChild.levels,
                    maths: {
                      ...activeChild.levels.maths,
                      xp: activeChild.levels.maths.xp + xp,
                      level: newLevel,
                    },
                  },
                };
                setActiveChild(updatedChild);
              }
            })
            .catch((err) => {
              console.error("Failed to save progress:", err);
            });
        }
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    },
    [results, currentQuestionIndex, questions.length, difficulty]
  );

  const handleExit = useCallback(() => {
    router.push("/home");
  }, [router]);

  const handlePlayAgain = useCallback(() => {
    const newQuestions = generateBananaBridgeQuestions(difficulty, QUESTIONS_PER_SESSION);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setResults([]);
    setSessionResult(null);
    setPhase("playing");
  }, [difficulty]);

  const handleContinue = useCallback(() => {
    router.push("/games/maths");
  }, [router]);

  if (!activeChild) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFF8E7]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xl text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (phase === "loading" || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFF8E7]">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <div className="text-6xl mb-4">🍌</div>
          <p className="text-xl font-bold text-gray-700">Getting bananas ready...</p>
        </motion.div>
      </div>
    );
  }

  const correctCount = results.filter((r) => r.correct).length;
  const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0);
  const currentStars = calculateStars(correctCount, Math.max(1, results.length), totalHints);

  return (
    <GameShell
      gameName={gameName}
      colorHex={isBridgePractice ? "#9B59B6" : isBridgeLearn ? "#4ECDC4" : BANANA_BRIDGE_GAME_DEFINITION.colorHex}
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      starsEarned={currentStars}
      isSessionComplete={phase === "complete"}
      sessionResult={sessionResult ?? undefined}
      onExit={handleExit}
      onPlayAgain={handlePlayAgain}
      onContinue={handleContinue}
    >
      {phase === "playing" && currentQuestion && (
        <BananaBridge
          question={currentQuestion}
          onComplete={handleQuestionComplete}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          gameMode={gameMode}
        />
      )}
    </GameShell>
  );
}

