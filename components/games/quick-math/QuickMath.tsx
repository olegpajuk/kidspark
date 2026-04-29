"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "@/components/celebrations/Sparkles";
import { useAudio } from "@/hooks/useAudio";
import { Settings, X } from "lucide-react";

type Operation = "add" | "subtract" | "multiply" | "divide";
type AnswerState = "waiting" | "correct" | "wrong" | "timeout";

// Saved preferences structure
interface QuickMathPreferences {
  operations: Operation[];
  speedSeconds: number;
  lives: number;
  showCorrectAnswer: boolean;
}

// High score tracking
interface QuickMathHighScore {
  score: number;
  date: string;
  operations: string;
  speedSeconds: number;
}

const STORAGE_KEY = "quickmath_preferences_v2";
const HIGHSCORE_KEY = "quickmath_highscore_v2";

// Speed slider configuration
const MIN_SPEED_SECONDS = 5;
const MAX_SPEED_SECONDS = 30;
const DEFAULT_SPEED_SECONDS = 10;

// Lives slider configuration
const MIN_LIVES = 1;
const MAX_LIVES = 10;
const DEFAULT_LIVES = 3;

// Load preferences from localStorage
function loadPreferences(): QuickMathPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load preferences:", e);
  }
  return null;
}

// Save preferences to localStorage
function savePreferences(prefs: QuickMathPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Failed to save preferences:", e);
  }
}

// Load high score from localStorage
function loadHighScore(): QuickMathHighScore | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(HIGHSCORE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load high score:", e);
  }
  return null;
}

// Save high score to localStorage
function saveHighScore(highScore: QuickMathHighScore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(highScore));
  } catch (e) {
    console.error("Failed to save high score:", e);
  }
}

interface QuickMathProps {
  onComplete: (result: { 
    correct: number; 
    wrong: number; 
    timeouts: number;
    totalQuestions: number;
    starsEarned: number;
  }) => void;
  onExit?: () => void;
  initialLives?: number;
  initialSpeedSeconds?: number;
  enabledOperations?: Operation[];
}

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
}

const OPERATION_SYMBOLS: Record<Operation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

// Generate a random question
function generateQuestion(operations: Operation[]): Question {
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1: number, num2: number, answer: number;

  switch (operation) {
    case "add":
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 + num2;
      break;
    case "subtract":
      num1 = Math.floor(Math.random() * 10) + 5;
      num2 = Math.floor(Math.random() * Math.min(num1, 10)) + 1;
      answer = num1 - num2;
      break;
    case "multiply":
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
    case "divide":
      num2 = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }

  // Generate 2 wrong options
  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 2) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const wrong = answer + (Math.random() > 0.5 ? offset : -offset);
    if (wrong > 0 && wrong !== answer) {
      wrongOptions.add(wrong);
    }
  }

  // Shuffle options
  const options = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);

  return { num1, num2, operation, answer, options };
}

export function QuickMath({
  onComplete,
  onExit,
  initialLives = DEFAULT_LIVES,
  initialSpeedSeconds = DEFAULT_SPEED_SECONDS,
  enabledOperations = ["add"],
}: QuickMathProps) {
  // Check for saved preferences on mount
  const [hasLoadedPrefs, setHasLoadedPrefs] = useState(false);
  const [savedPrefsExist, setSavedPrefsExist] = useState(false);
  
  const [gameState, setGameState] = useState<"settings" | "playing" | "gameover">("settings");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [operations, setOperations] = useState<Operation[]>(enabledOperations);
  const [speedSeconds, setSpeedSeconds] = useState(initialSpeedSeconds);
  const [lives, setLives] = useState(initialLives);
  const [maxLives, setMaxLives] = useState(initialLives);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(true);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("waiting");
  const [timeLeft, setTimeLeft] = useState(100);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, timeouts: 0 });
  const [highScore, setHighScore] = useState<QuickMathHighScore | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useAudio();

  // Load preferences and high score on mount
  useEffect(() => {
    const prefs = loadPreferences();
    if (prefs) {
      setOperations(prefs.operations);
      setSpeedSeconds(prefs.speedSeconds);
      setMaxLives(prefs.lives);
      setLives(prefs.lives);
      setShowCorrectAnswer(prefs.showCorrectAnswer);
      setSavedPrefsExist(true);
    }
    const savedHighScore = loadHighScore();
    if (savedHighScore) {
      setHighScore(savedHighScore);
    }
    setHasLoadedPrefs(true);
  }, []);

  // Save preferences whenever they change (after initial load)
  const saveCurrentPreferences = useCallback(() => {
    savePreferences({
      operations,
      speedSeconds,
      lives: maxLives,
      showCorrectAnswer,
    });
    setSavedPrefsExist(true);
  }, [operations, speedSeconds, maxLives, showCorrectAnswer]);

  // Start new question
  const nextQuestion = useCallback(() => {
    if (lives <= 0) {
      setGameState("gameover");
      return;
    }

    const newQuestion = generateQuestion(operations);
    setQuestion(newQuestion);
    setQuestionNumber(prev => prev + 1);
    setAnswerState("waiting");
    setTimeLeft(100);
  }, [operations, lives]);

  // Start game
  const startGame = useCallback(() => {
    if (operations.length === 0) return;
    saveCurrentPreferences();
    setLives(maxLives);
    setStars(0);
    setQuestionNumber(0);
    setStats({ correct: 0, wrong: 0, timeouts: 0 });
    setIsNewRecord(false);
    setGameState("playing");
    setShowSettingsModal(false);
    nextQuestion();
  }, [operations.length, maxLives, nextQuestion, saveCurrentPreferences]);

  // Quick start with saved preferences
  const quickStart = useCallback(() => {
    if (operations.length === 0) return;
    startGame();
  }, [operations.length, startGame]);

  // Check for new high score when game ends
  useEffect(() => {
    if (gameState === "gameover" && stars > 0) {
      const currentScore = stars;
      const existingHighScore = highScore?.score || 0;
      
      if (currentScore > existingHighScore) {
        const newHighScore: QuickMathHighScore = {
          score: currentScore,
          date: new Date().toISOString(),
          operations: operations.sort().join(","),
          speedSeconds,
        };
        setHighScore(newHighScore);
        saveHighScore(newHighScore);
        setIsNewRecord(true);
      }
    }
  }, [gameState, stars, highScore?.score, operations, speedSeconds]);

  // Delay before auto-next (longer if showing correct answer)
  const autoNextDelay = showCorrectAnswer ? 2500 : 1500;

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || answerState !== "waiting" || !question) return;

    const interval = speedSeconds * 10; // Update every 1% of time (100 ticks over total duration)
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Timeout!
          clearInterval(timerRef.current!);
          setAnswerState("timeout");
          setLives(l => l - 1);
          setStats(s => ({ ...s, timeouts: s.timeouts + 1 }));
          playSound("wrong");
          
          setTimeout(() => {
            if (lives - 1 > 0) {
              nextQuestion();
            } else {
              setGameState("gameover");
            }
          }, autoNextDelay);
          
          return 0;
        }
        return newTime;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, answerState, question, speedSeconds, lives, nextQuestion, playSound, autoNextDelay]);

  // Handle answer selection
  const handleAnswer = useCallback((selected: number) => {
    if (answerState !== "waiting" || !question) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = selected === question.answer;

    if (isCorrect) {
      setAnswerState("correct");
      setStars(s => s + 1);
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      playSound("correct");
      
      setTimeout(() => {
        nextQuestion();
      }, 1200);
    } else {
      setAnswerState("wrong");
      setLives(l => l - 1);
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      playSound("wrong");
      
      setTimeout(() => {
        if (lives - 1 <= 0) {
          setGameState("gameover");
        } else {
          nextQuestion();
        }
      }, autoNextDelay);
    }
  }, [answerState, question, lives, nextQuestion, playSound, autoNextDelay]);

  // Toggle operation
  const toggleOperation = useCallback((op: Operation) => {
    setOperations(prev => {
      if (prev.includes(op)) {
        return prev.filter(o => o !== op);
      }
      return [...prev, op];
    });
  }, []);

  // End game
  const handleEndGame = useCallback(() => {
    onComplete({
      correct: stats.correct,
      wrong: stats.wrong,
      timeouts: stats.timeouts,
      totalQuestions: questionNumber,
      starsEarned: stars,
    });
  }, [onComplete, stats, questionNumber, stars]);

  // Exit game (back to games/home)
  const handleExit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowExitModal(false);
    if (onExit) {
      onExit();
    }
  }, [onExit]);

  // Pause timer when exit modal is shown
  useEffect(() => {
    if (showExitModal && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [showExitModal]);

  // Don't render until preferences are loaded
  if (!hasLoadedPrefs) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-green-100 to-blue-100">
        <div className="text-center">
          <span className="text-4xl">⚡</span>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Get speed label based on seconds
  const getSpeedLabel = (seconds: number) => {
    if (seconds <= 5) return { emoji: "🔥", label: "Super Fast" };
    if (seconds <= 10) return { emoji: "⚡", label: "Fast" };
    if (seconds <= 20) return { emoji: "🐢", label: "Medium" };
    return { emoji: "🦥", label: "Slow" };
  };

  // Settings content (used in both main screen and modal)
  const SettingsContent = ({ inModal = false }: { inModal?: boolean }) => (
    <div className={`flex flex-col gap-4 ${inModal ? "" : "p-6"}`}>
      {!inModal && (
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚡ Quick Math</h1>
          <p className="text-gray-600">Save the frog from the snake!</p>
        </div>
      )}

      {/* Operations selector */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <p className="text-sm font-medium text-gray-600 mb-3">Select Operations:</p>
        <div className="flex flex-wrap gap-2">
          {(["add", "subtract", "multiply", "divide"] as Operation[]).map(op => (
            <button
              key={op}
              onClick={() => toggleOperation(op)}
              className={`px-4 py-2 rounded-xl font-bold text-lg transition-all ${
                operations.includes(op)
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {OPERATION_SYMBOLS[op]}
            </button>
          ))}
        </div>
        {operations.length === 0 && (
          <p className="text-red-500 text-sm mt-2">Select at least one operation</p>
        )}
      </div>

      {/* Speed slider */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 shadow-md border-2 border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">⏱️ Time per Question:</p>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
            <span className="text-xl">{getSpeedLabel(speedSeconds).emoji}</span>
            <span className="font-bold text-orange-600">{speedSeconds}s</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min={MIN_SPEED_SECONDS}
            max={MAX_SPEED_SECONDS}
            value={speedSeconds}
            onChange={(e) => setSpeedSeconds(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-orange-500 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-orange-500 [&::-moz-range-thumb]:rounded-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span>🔥 5s</span>
            <span>10s</span>
            <span>15s</span>
            <span>20s</span>
            <span>25s</span>
            <span>🦥 30s</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">{getSpeedLabel(speedSeconds).label} - drag to adjust</p>
      </div>

      {/* Lives/Frogs slider */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-md border-2 border-green-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">🐸 Number of Lives:</p>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
            <span className="font-bold text-green-600">{maxLives} frogs</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min={MIN_LIVES}
            max={MAX_LIVES}
            value={maxLives}
            onChange={(e) => setMaxLives(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-green-300 to-green-500 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-green-500 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-green-500 [&::-moz-range-thumb]:rounded-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i + 1}>{i + 1}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-0.5 mt-3">
          {Array.from({ length: maxLives }, (_, i) => (
            <motion.span
              key={i}
              className="text-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              🐸
            </motion.span>
          ))}
        </div>
      </div>

      {/* Show correct answers toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Show correct answer</p>
            <p className="text-xs text-gray-500">When wrong, show the correct solution</p>
          </div>
          <button
            onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
            className={`w-14 h-8 rounded-full transition-all relative ${
              showCorrectAnswer ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
              animate={{ left: showCorrectAnswer ? "calc(100% - 28px)" : "4px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-100 to-blue-100 relative overflow-hidden">
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettingsModal(false)} />
            <motion.div
              className="relative bg-gradient-to-b from-green-50 to-blue-50 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">⚙️ Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <SettingsContent inModal />
                <motion.button
                  onClick={startGame}
                  disabled={operations.length === 0}
                  className={`w-full mt-4 py-4 rounded-2xl font-bold text-xl shadow-lg transition-all ${
                    operations.length > 0
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={operations.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={operations.length > 0 ? { scale: 0.98 } : {}}
                >
                  🎮 Start with these settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowExitModal(false)} />
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-6xl mb-4">🚪</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Leave Game?</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to exit? Your progress in this game won&apos;t be saved.
              </p>
              
              {/* Current progress summary */}
              {gameState === "playing" && questionNumber > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Current progress:</p>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-2xl">⭐</div>
                      <div className="font-bold text-yellow-600">{stars}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">✓</div>
                      <div className="font-bold text-green-600">{stats.correct}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">✗</div>
                      <div className="font-bold text-red-600">{stats.wrong}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Keep Playing
                </motion.button>
                <motion.button
                  onClick={handleExit}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Exit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* SETTINGS SCREEN */}
        {gameState === "settings" && (
          <motion.div
            key="settings"
            className="flex-1 flex flex-col overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Back button at top */}
            {onExit && (
              <div className="p-4 pb-0">
                <button
                  onClick={onExit}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="text-xl">←</span>
                  <span className="text-sm font-medium">Back to Games</span>
                </button>
              </div>
            )}

            {/* Quick Start option if preferences exist */}
            {savedPrefsExist && (
              <motion.div
                className="p-4 bg-white/80"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-white font-bold text-lg">⚡ Quick Start</h2>
                      <p className="text-white/80 text-sm">
                        {operations.map(o => OPERATION_SYMBOLS[o]).join(" ")} • {speedSeconds}s • {maxLives} 🐸
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    >
                      <Settings className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <motion.button
                    onClick={quickStart}
                    className="w-full py-3 bg-white text-green-600 rounded-xl font-bold text-lg shadow-md hover:bg-green-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🎮 Play Now!
                  </motion.button>
                </div>
                <div className="text-center my-3">
                  <span className="text-gray-400 text-sm">or change settings below</span>
                </div>
              </motion.div>
            )}

            <SettingsContent />

            {/* Start button */}
            <div className="p-6 pt-0">
              <motion.button
                onClick={startGame}
                disabled={operations.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg transition-all ${
                  operations.length > 0
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={operations.length > 0 ? { scale: 1.02 } : {}}
                whileTap={operations.length > 0 ? { scale: 0.98 } : {}}
              >
                🎮 Start Game!
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === "playing" && question && (
          <motion.div
            key="playing"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Sparkles active={answerState === "correct"} />

            {/* Exit Button - Top Right */}
            <motion.button
              onClick={() => setShowExitModal(true)}
              className="fixed top-16 right-3 z-30 w-10 h-10 bg-white/90 rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              title="Exit game"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </motion.button>

            {/* Floating Frogs Counter - Left Side */}
            <motion.div
              className="fixed left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 bg-white/95 rounded-2xl p-2 shadow-lg border-2 border-green-400"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="text-xs font-bold text-green-700 mb-1">Lives</div>
              {Array.from({ length: maxLives }, (_, i) => (
                <motion.div
                  key={i}
                  className={`text-2xl ${i < lives ? "" : "grayscale opacity-30"}`}
                  animate={i === lives - 1 && (answerState === "timeout" || answerState === "wrong") 
                    ? { scale: [1, 1.5, 0], rotate: [0, 20, -20, 0] } 
                    : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  🐸
                </motion.div>
              ))}
              <div className="mt-1 text-lg font-bold text-green-600">{lives}</div>
            </motion.div>

            {/* Floating Stars Counter - Right Side */}
            <motion.div
              className="fixed right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 bg-white/95 rounded-2xl p-2 shadow-lg border-2 border-yellow-400"
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="text-xs font-bold text-yellow-700 mb-1">Stars</div>
              <motion.div 
                className="text-3xl"
                animate={answerState === "correct" ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              >
                ⭐
              </motion.div>
              <div className="text-xl font-bold text-yellow-600">{stars}</div>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="mt-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </motion.div>

            {/* Question number */}
            <div className="text-center py-2">
              <span className="text-sm text-gray-500">Question {questionNumber}</span>
            </div>

            {/* Answer feedback overlay */}
            <AnimatePresence>
              {answerState !== "waiting" && (
                <motion.div
                  className={`absolute top-20 left-4 right-4 text-center z-10`}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {answerState === "correct" && (
                    <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                      <span className="text-2xl font-bold">✓ Correct! +⭐</span>
                    </div>
                  )}
                  {answerState === "wrong" && (
                    <div className="inline-block bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                      <span className="text-2xl font-bold">✗ Wrong!</span>
                    </div>
                  )}
                  {answerState === "timeout" && (
                    <div className="inline-block bg-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                      <span className="text-2xl font-bold">⏰ Time&apos;s up!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main question area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
              {/* Equation */}
              <motion.div
                className="bg-white rounded-3xl px-10 py-8 shadow-xl"
                key={question.num1 + question.operation + question.num2}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center justify-center gap-4 text-5xl font-bold">
                  <span className="text-blue-600">{question.num1}</span>
                  <span className="text-gray-400">{OPERATION_SYMBOLS[question.operation]}</span>
                  <span className="text-green-600">{question.num2}</span>
                  <span className="text-gray-400">=</span>
                  
                  {/* Flip card for answer */}
                  <div className="relative w-20 h-20" style={{ perspective: "1000px" }}>
                    <motion.div
                      className="w-full h-full relative"
                      style={{ transformStyle: "preserve-3d" }}
                      initial={{ rotateY: 0 }}
                      animate={{ 
                        rotateY: answerState !== "waiting" && (answerState === "correct" || showCorrectAnswer) ? 180 : 0 
                      }}
                      transition={{ duration: 0.6, delay: answerState === "correct" ? 0 : 0.3 }}
                    >
                      {/* Front: Question mark */}
                      <div 
                        className="absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center text-purple-400 border-4 border-gray-200"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        ?
                      </div>
                      
                      {/* Back: Correct answer */}
                      <div 
                        className={`absolute inset-0 rounded-2xl flex items-center justify-center border-4 ${
                          answerState === "correct" 
                            ? "bg-green-100 text-green-700 border-green-400"
                            : "bg-orange-100 text-orange-700 border-orange-400"
                        }`}
                        style={{ 
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)"
                        }}
                      >
                        {question.answer}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Answer options */}
              <div className="flex gap-4">
                {question.options.map((opt, i) => {
                  const isCorrect = opt === question.answer;
                  const showResult = answerState !== "waiting";
                  
                  return (
                    <motion.button
                      key={`${opt}-${i}`}
                      onClick={() => handleAnswer(opt)}
                      disabled={answerState !== "waiting"}
                      className={`w-24 h-24 rounded-2xl text-4xl font-bold border-4 transition-all shadow-lg ${
                        showResult
                          ? isCorrect
                            ? "bg-green-100 border-green-500 text-green-700"
                            : "bg-red-50 border-red-300 text-red-400 opacity-50"
                          : "bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:scale-110"
                      }`}
                      whileHover={answerState === "waiting" ? { scale: 1.1 } : {}}
                      whileTap={answerState === "waiting" ? { scale: 0.95 } : {}}
                      animate={
                        showResult && !isCorrect
                          ? { x: [-5, 5, -5, 5, 0] }
                          : showResult && isCorrect
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Snake-Frog Timer */}
            <div className="p-4 bg-white/80">
              <div className="relative h-16 bg-gradient-to-r from-green-200 to-green-100 rounded-2xl overflow-hidden border-2 border-green-300">
                {/* Grass/ground */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-400" />
                
                {/* Frog (at the right end) */}
                <motion.div
                  className="absolute right-2 bottom-2 text-4xl z-10"
                  animate={timeLeft < 30 ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  🐸
                </motion.div>

                {/* Snake (progresses from left) */}
                <motion.div
                  className="absolute bottom-1 text-4xl z-10"
                  style={{ left: `${Math.max(0, 100 - timeLeft - 5)}%` }}
                  animate={{ 
                    scaleX: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🐍
                </motion.div>

                {/* Progress bar (danger zone) */}
                <motion.div
                  className={`absolute top-0 left-0 h-full ${
                    timeLeft > 50 ? "bg-red-200" : timeLeft > 25 ? "bg-red-300" : "bg-red-400"
                  }`}
                  style={{ width: `${100 - timeLeft}%` }}
                  transition={{ duration: 0.1 }}
                />

                {/* Time text */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 bg-white/80 px-2 py-0.5 rounded-full">
                  {Math.ceil((timeLeft / 100) * speedSeconds)}s
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === "gameover" && (
          <motion.div
            key="gameover"
            className="flex-1 flex flex-col items-center justify-center p-6 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-7xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
            >
              {stats.correct > stats.wrong + stats.timeouts ? "🎉" : "😢"}
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-800">Game Over!</h1>

            {/* New Record Banner */}
            <AnimatePresence>
              {isNewRecord && (
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-3 rounded-2xl shadow-lg"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center gap-2 text-white">
                    <motion.span
                      className="text-2xl"
                      animate={{ rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      🏆
                    </motion.span>
                    <span className="font-black text-xl">NEW RECORD!</span>
                    <motion.span
                      className="text-2xl"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      🏆
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Large Star Score Display */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative flex items-center justify-center">
                <motion.svg
                  width="140"
                  height="140"
                  viewBox="0 0 100 100"
                  className="drop-shadow-lg"
                  animate={isNewRecord ? { 
                    filter: ["drop-shadow(0 0 10px #fbbf24)", "drop-shadow(0 0 25px #fbbf24)", "drop-shadow(0 0 10px #fbbf24)"]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"
                    fill="url(#starGradient)"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                </motion.svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-4xl font-black text-amber-800"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {stars}
                  </motion.span>
                </div>
              </div>
              {highScore && !isNewRecord && (
                <motion.p
                  className="text-center text-sm text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Best: {highScore.score}
                </motion.p>
              )}
            </motion.div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-lg w-full max-w-sm">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-bold">{questionNumber}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Correct:</span>
                  <span className="font-bold">{stats.correct}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Wrong:</span>
                  <span className="font-bold">{stats.wrong}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Timeouts:</span>
                  <span className="font-bold">{stats.timeouts}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 w-full max-w-sm">
              <motion.button
                onClick={startGame}
                className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-green-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄 Play Again
              </motion.button>
              <motion.button
                onClick={handleEndGame}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✓ Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
