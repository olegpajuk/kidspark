"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, CheckCircle, Volume2 } from "lucide-react";
import { generateCrosswordQuestion } from "@/lib/games/question-generators/english/crossword";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { CrosswordQuestion, CrosswordClue } from "@/types/english";

const COLOR = "#9B59B6";
const BG = "#F8F0FF";

interface Props {
  difficulty: DifficultyTier;
}

export function Crossword({ difficulty }: Props) {
  const router = useRouter();
  const { speak } = useTTS();
  const { playSound } = useAudio();

  const [puzzle, setPuzzle] = useState<CrosswordQuestion | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [activeClue, setActiveClue] = useState<CrosswordClue | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [solvedClues, setSolvedClues] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const TOTAL_ROUNDS = 3;

  const initPuzzle = useCallback(() => {
    const q = generateCrosswordQuestion(difficulty);
    setPuzzle(q);
    setUserGrid(Array.from({ length: q.size }, () => Array(q.size).fill("")));
    setActiveClue(null);
    setInputValue("");
    setSolvedClues(new Set());
    setShowCheck(false);
  }, [difficulty]);

  const init = useCallback(() => {
    setScore(0);
    setRoundsPlayed(0);
    setIsComplete(false);
    initPuzzle();
  }, [initPuzzle]);

  useEffect(() => { init(); }, [init]);

  const handleClueSelect = (clue: CrosswordClue) => {
    setActiveClue(clue);
    setInputValue("");
    speak(clue.answer);
  };

  const handleAnswerSubmit = () => {
    if (!activeClue || !puzzle) return;
    const attempt = inputValue.toLowerCase().trim();
    const correct = attempt === activeClue.answer.toLowerCase();

    if (correct) {
      playSound("correct");
      const newSolved = new Set(solvedClues);
      newSolved.add(activeClue.number);
      setSolvedClues(newSolved);

      // Fill letters in userGrid
      const newGrid = userGrid.map((row) => [...row]);
      for (let i = 0; i < activeClue.answer.length; i++) {
        const r = activeClue.direction === "down" ? activeClue.startRow + i : activeClue.startRow;
        const c = activeClue.direction === "across" ? activeClue.startCol + i : activeClue.startCol;
        newGrid[r][c] = activeClue.answer[i];
      }
      setUserGrid(newGrid);
      setActiveClue(null);
      setInputValue("");

      if (newSolved.size === puzzle.clues.length) {
        const newScore = score + 1;
        const newRound = roundsPlayed + 1;
        setScore(newScore);
        setRoundsPlayed(newRound);
        if (newRound >= TOTAL_ROUNDS) {
          setIsComplete(true);
        } else {
          setTimeout(() => initPuzzle(), 800);
        }
      }
    } else {
      playSound("wrong");
      setInputValue("");
    }
  };

  const handleCheckAll = () => {
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 2000);
  };

  if (!puzzle) return null;

  const stars = score >= 3 ? 3 : score >= 2 ? 2 : score >= 1 ? 1 : 0;

  // Build clue number grid for display
  const clueNums: Record<string, number> = {};
  puzzle.clues.forEach((c) => {
    clueNums[`${c.startRow}-${c.startCol}`] = c.number;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      {/* Header */}
      <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: COLOR }}>
        <button
          onClick={() => router.push("/games/english")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Crossword</p>
          <p className="text-white/70 text-xs">Level {difficulty} • Puzzle {roundsPlayed + 1}/{TOTAL_ROUNDS}</p>
        </div>
        <div className="text-sm font-bold">{solvedClues.size}/{puzzle.clues.length} ✓</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-purple-200">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(solvedClues.size / puzzle.clues.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-3 py-3 gap-3 overflow-auto">
        {/* How-to-play hint — shown until first clue is picked */}
        {!activeClue && solvedClues.size === 0 && (
          <motion.div
            className="w-full max-w-sm bg-purple-50 border border-purple-200 rounded-2xl px-4 py-2.5 flex items-center gap-2"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-lg">💡</span>
            <p className="text-xs text-purple-700 font-medium">
              Tap a clue below, then type the word and press ✓
            </p>
          </motion.div>
        )}

        {/* Grid */}
        <div className="bg-white rounded-2xl shadow-md p-3 inline-block">
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
          >
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const clueNum = clueNums[`${r}-${c}`];
                const userChar = userGrid[r]?.[c] ?? "";
                const isActive = activeClue &&
                  ((activeClue.direction === "across" &&
                    r === activeClue.startRow &&
                    c >= activeClue.startCol &&
                    c < activeClue.startCol + activeClue.answer.length) ||
                  (activeClue.direction === "down" &&
                    c === activeClue.startCol &&
                    r >= activeClue.startRow &&
                    r < activeClue.startRow + activeClue.answer.length));

                if (cell === null) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="w-7 h-7 bg-gray-800 rounded-sm"
                    />
                  );
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-7 h-7 border rounded-sm relative flex items-center justify-center text-xs font-bold ${
                      isActive ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-white"
                    }`}
                  >
                    {clueNum && (
                      <span className="absolute top-0 left-0 text-[7px] text-purple-600 leading-none p-0.5">
                        {clueNum}
                      </span>
                    )}
                    <span className={`text-xs font-black uppercase ${isActive ? "text-purple-700" : "text-gray-800"}`}>
                      {userChar}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active clue input */}
        {activeClue && (
          <motion.div
            className="w-full max-w-sm bg-white rounded-2xl shadow-md p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-bold text-white px-2 py-0.5 rounded-full uppercase"
                style={{ backgroundColor: COLOR }}
              >
                {activeClue.number} {activeClue.direction}
              </span>
              <span className="text-lg">{activeClue.clue}</span>
              <button onClick={() => speak(activeClue.answer)} className="ml-auto text-purple-400 hover:text-purple-600">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
                maxLength={activeClue.answer.length}
                placeholder={`${activeClue.answer.length} letters…`}
                autoFocus
                className="flex-1 border-2 border-purple-200 rounded-xl px-3 py-2 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAnswerSubmit}
                disabled={!inputValue}
                className="px-4 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                style={{ backgroundColor: COLOR }}
              >
                ✓
              </button>
              <button
                onClick={() => setActiveClue(null)}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Clues panel */}
        <div className="w-full max-w-sm">
          <div className="grid grid-cols-2 gap-2">
            {["across", "down"].map((dir) => (
              <div key={dir} className="bg-white rounded-2xl shadow-sm p-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{dir}</h3>
                <div className="space-y-1.5">
                  {puzzle.clues
                    .filter((cl) => cl.direction === dir)
                    .map((cl) => {
                      const solved = solvedClues.has(cl.number);
                      const isActive = activeClue?.number === cl.number;
                      return (
                        <button
                          key={cl.number}
                          onClick={() => !solved && handleClueSelect(cl)}
                          disabled={solved}
                          className={`w-full text-left text-xs flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                            solved
                              ? "bg-green-50 text-green-600 line-through"
                              : isActive
                              ? "font-bold ring-1 ring-purple-400"
                              : "hover:bg-purple-50 cursor-pointer"
                          }`}
                          style={isActive && !solved ? { backgroundColor: "#F8F0FF", color: COLOR } : {}}
                        >
                          <span className="font-bold w-4 shrink-0">{cl.number}.</span>
                          <span className="flex-1">{cl.clue}</span>
                          {solved
                            ? <CheckCircle className="w-3 h-3 ml-auto shrink-0" />
                            : <span className="text-[9px] text-gray-400 shrink-0 ml-1">({cl.answer.length})</span>
                          }
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {showCheck && (
            <motion.div
              className="mt-2 bg-purple-100 rounded-xl p-3 text-center text-sm text-purple-700 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {solvedClues.size === puzzle.clues.length
                ? "🎉 All solved!"
                : `${solvedClues.size}/${puzzle.clues.length} clues solved — keep going!`}
            </motion.div>
          )}

          {!activeClue && (
            <button
              onClick={handleCheckAll}
              className="mt-2 w-full py-2 rounded-xl text-xs font-bold border-2 border-purple-200 text-purple-500 hover:bg-purple-50"
            >
              Check progress
            </button>
          )}
        </div>
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">
                {stars === 3 ? "🏆" : stars === 2 ? "🌟" : stars === 1 ? "✨" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Word Wizard!" : "Good effort!"}
              </h2>
              <p className="text-gray-500 mb-3">
                Completed <span className="font-bold" style={{ color: COLOR }}>{score}/{TOTAL_ROUNDS}</span> puzzles!
              </p>
              <p className="text-[11px] text-gray-400 mb-3">⭐⭐⭐ = all 3 &nbsp;·&nbsp; ⭐⭐ = 2 &nbsp;·&nbsp; ⭐ = 1</p>
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={init}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: BG, color: COLOR }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={() => router.push("/games/english")}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                  style={{ backgroundColor: COLOR }}
                >
                  Back to Hub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
