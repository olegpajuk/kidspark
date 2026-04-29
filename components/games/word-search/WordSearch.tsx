"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, RotateCcw, Shuffle, Settings, X, Plus, Eye,
  MoveHorizontal, MoveVertical, ArrowDownRight, Minus,
} from "lucide-react";
import {
  generateWordSearchQuestion,
  generateWordSearchFromWords,
  type Direction,
} from "@/lib/games/question-generators/english/wordsearch";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { WordSearchQuestion } from "@/types/english";

const COLOR = "#3498DB";
const BG = "#EBF5FF";
const CUSTOM_WORDS_KEY = "wordsearch-custom-words";
const SETTINGS_KEY = "wordsearch-settings";

interface WsSettings {
  directions: Direction[];
  wordsPerPuzzle: number;
}

const DEFAULT_SETTINGS: WsSettings = {
  directions: ["horizontal"],
  wordsPerPuzzle: 4,
};

function loadSettings(): WsSettings {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as WsSettings;
    // ensure at least horizontal
    if (!parsed.directions?.length) parsed.directions = ["horizontal"];
    if (!parsed.wordsPerPuzzle) parsed.wordsPerPuzzle = 4;
    return parsed;
  } catch { return DEFAULT_SETTINGS; }
}

function loadCustomWords(): string[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(CUSTOM_WORDS_KEY) : null;
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

interface Props {
  difficulty: DifficultyTier;
}

interface CellPos { row: number; col: number; }

function getCellsBetween(start: CellPos, end: CellPos): CellPos[] {
  const cells: CellPos[] = [];
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [start];
  const isDiagonal = dr !== 0 && dc !== 0 && Math.abs(dr) === Math.abs(dc);
  const isHoriz = dr === 0 && dc !== 0;
  const isVert = dc === 0 && dr !== 0;
  if (!isDiagonal && !isHoriz && !isVert) return [];
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  for (let i = 0; i <= steps; i++) cells.push({ row: start.row + sr * i, col: start.col + sc * i });
  return cells;
}

export function WordSearch({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [puzzle, setPuzzle] = useState<WordSearchQuestion | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);
  const [selStart, setSelStart] = useState<CellPos | null>(null);
  const [selCurrent, setSelCurrent] = useState<CellPos | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Map<string, string>>(new Map());
  const [peekedWord, setPeekedWord] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 3;
  const gridRef = useRef<HTMLDivElement>(null);

  // Settings — loaded synchronously
  const [settings, setSettings] = useState<WsSettings>(loadSettings);
  const [savedCustomWords, setSavedCustomWords] = useState<string[]>(loadCustomWords);

  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);
  const [draftSettings, setDraftSettings] = useState<WsSettings>(loadSettings);
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>(loadCustomWords);

  const useCustom = savedCustomWords.length >= 2;

  // Per-session word queue for custom bank (keeps variety across rounds)
  const customQueueRef = useRef<string[]>([]);
  const customQueuePosRef = useRef(0);

  const getNextCustomWords = useCallback((bank: string[], n: number): string[] => {
    if (bank.length <= n) return [...bank]; // too few — use all
    if (customQueuePosRef.current + n > customQueueRef.current.length) {
      // Reshuffle queue
      customQueueRef.current = [...bank].sort(() => Math.random() - 0.5);
      customQueuePosRef.current = 0;
    }
    const slice = customQueueRef.current.slice(customQueuePosRef.current, customQueuePosRef.current + n);
    customQueuePosRef.current += n;
    return slice;
  }, []);

  const buildPuzzle = useCallback((customBank?: string[], forceSettings?: WsSettings) => {
    const s = forceSettings ?? settings;
    const dirs: Direction[] = s.directions.length ? s.directions : ["horizontal"];
    const count = s.wordsPerPuzzle;

    const q = customBank && customBank.length >= 2
      ? generateWordSearchFromWords(getNextCustomWords(customBank, count), difficulty, dirs, count)
      : generateWordSearchQuestion(difficulty, dirs, count);

    setPuzzle(q);
    setFoundWords(new Set());
    setSelecting(false);
    setSelStart(null);
    setSelCurrent(null);
    setHighlightedCells(new Set());
    setFoundCells(new Map());
    setPeekedWord(null);
  }, [difficulty, settings, getNextCustomWords]);

  const initPuzzle = useCallback(() => {
    buildPuzzle(useCustom ? savedCustomWords : undefined);
  }, [buildPuzzle, useCustom, savedCustomWords]);

  const init = useCallback(() => {
    setScore(0);
    setRoundsPlayed(0);
    setIsComplete(false);
    customQueuePosRef.current = 0; // reset word queue for new session
    buildPuzzle(useCustom ? savedCustomWords : undefined);
  }, [buildPuzzle, useCustom, savedCustomWords]);

  useEffect(() => { init(); }, [init]);

  // ── Settings panel helpers ──
  const toggleDraftDir = (dir: Direction) => {
    setDraftSettings((prev) => {
      const has = prev.directions.includes(dir);
      // must keep at least one direction
      if (has && prev.directions.length === 1) return prev;
      return {
        ...prev,
        directions: has ? prev.directions.filter((d) => d !== dir) : [...prev.directions, dir],
      };
    });
  };

  const addCustomTag = (raw: string) => {
    const word = raw.toLowerCase().trim().replace(/[^a-z]/g, "");
    if (word.length < 2) return;
    if (customTags.includes(word)) return;
    setCustomTags((prev) => [...prev, word]);
    setCustomTagInput("");
  };

  const removeCustomTag = (word: string) => setCustomTags((prev) => prev.filter((w) => w !== word));

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCustomTag(customTagInput); }
    if (e.key === "Backspace" && customTagInput === "" && customTags.length > 0)
      setCustomTags((prev) => prev.slice(0, -1));
  };

  const handleSaveSettings = () => {
    const newSettings = { ...draftSettings };
    const newWords = customTags.filter((w) => w.length >= 2);

    setSettings(newSettings);
    setSavedCustomWords(newWords);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(newWords));
    setShowSettings(false);

    customQueuePosRef.current = 0;
    buildPuzzle(newWords.length >= 2 ? newWords : undefined, newSettings);
  };

  const handleClearCustomWords = () => {
    setSavedCustomWords([]);
    setCustomTags([]);
    localStorage.removeItem(CUSTOM_WORDS_KEY);
  };

  // ── Peek ──
  const handlePeekWord = (word: string) => {
    if (!foundWords.has(word)) return;
    setPeekedWord(word);
    setTimeout(() => setPeekedWord(null), 1600);
  };

  // ── Grid interaction ──
  const getCellFromPoint = useCallback((x: number, y: number): CellPos | null => {
    const el = gridRef.current;
    if (!el || !puzzle) return null;
    const rect = el.getBoundingClientRect();
    const cellSize = rect.width / puzzle.grid[0].length;
    const col = Math.floor((x - rect.left) / cellSize);
    const row = Math.floor((y - rect.top) / cellSize);
    if (row < 0 || row >= puzzle.grid.length || col < 0 || col >= puzzle.grid[0].length) return null;
    return { row, col };
  }, [puzzle]);

  useEffect(() => {
    if (!selStart || !selCurrent) { setHighlightedCells(new Set()); return; }
    const cells = getCellsBetween(selStart, selCurrent);
    setHighlightedCells(new Set(cells.map((c) => `${c.row}-${c.col}`)));
  }, [selStart, selCurrent]);

  const checkSelection = useCallback((start: CellPos, end: CellPos) => {
    if (!puzzle) return;
    const cells = getCellsBetween(start, end);
    if (cells.length < 2) return;
    const word = cells.map((c) => puzzle.grid[c.row][c.col]).join("");
    const wordRev = word.split("").reverse().join("");

    let matchedWord: string | null = null;
    for (const hw of puzzle.hiddenWords) {
      if ((hw === word || hw === wordRev) && !foundWords.has(hw)) { matchedWord = hw; break; }
    }

    if (matchedWord) {
      playSound("correct");
      const newFound = new Set(foundWords);
      newFound.add(matchedWord);
      setFoundWords(newFound);
      const newFoundCells = new Map(foundCells);
      cells.forEach((c) => newFoundCells.set(`${c.row}-${c.col}`, matchedWord!));
      setFoundCells(newFoundCells);

      if (newFound.size === puzzle.hiddenWords.length) {
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
    }
  }, [puzzle, foundWords, foundCells, playSound, score, roundsPlayed, initPuzzle]);

  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    e.preventDefault();
    setSelecting(true);
    setSelStart({ row, col });
    setSelCurrent({ row, col });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!selecting) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) setSelCurrent(cell);
  }, [selecting, getCellFromPoint]);

  const handlePointerUp = useCallback(() => {
    if (selStart && selCurrent) checkSelection(selStart, selCurrent);
    setSelecting(false);
    setSelStart(null);
    setSelCurrent(null);
    setHighlightedCells(new Set());
  }, [selStart, selCurrent, checkSelection]);

  if (!puzzle) return null;

  const stars = score >= 3 ? 3 : score >= 2 ? 2 : score >= 1 ? 1 : 0;
  const cellColors = ["#3498DB","#E74C3C","#2ECC71","#F39C12","#9B59B6","#E91E9E","#16A085","#E67E22","#C0392B","#2980B9"];
  const wordColorMap: Record<string, string> = {};
  puzzle.hiddenWords.forEach((w, i) => { wordColorMap[w] = cellColors[i % cellColors.length]; });

  const dirLabels: { dir: Direction; label: string; Icon: React.ElementType }[] = [
    { dir: "horizontal", label: "Horizontal", Icon: MoveHorizontal },
    { dir: "vertical", label: "Vertical", Icon: MoveVertical },
    { dir: "diagonal", label: "Diagonal", Icon: ArrowDownRight },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      {/* Header */}
      <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: COLOR }}>
        <button onClick={() => router.push("/games/english")} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Word Search</p>
          <p className="text-white/70 text-xs">
            Level {difficulty} · Round {roundsPlayed + 1}/{TOTAL_ROUNDS}
            {useCustom && <span className="ml-1 text-yellow-200">· custom ✏️</span>}
          </p>
        </div>
        <div className="text-sm font-bold">{foundWords.size}/{puzzle.hiddenWords.length}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-blue-200">
        <motion.div className="h-full" style={{ backgroundColor: COLOR }}
          animate={{ width: `${(foundWords.size / puzzle.hiddenWords.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      </div>

      <div className="flex-1 flex flex-col items-center px-3 py-3 gap-3">
        {/* Word chips — tap found word to peek */}
        <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
          {puzzle.hiddenWords.map((word) => {
            const found = foundWords.has(word);
            const isPeeked = peekedWord === word;
            return (
              <button
                key={word}
                onClick={() => found && handlePeekWord(word)}
                disabled={!found}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${
                  isPeeked ? "scale-110" : ""
                } ${found ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                style={{
                  backgroundColor: found ? "#e5e7eb" : `${wordColorMap[word]}22`,
                  color: found ? (isPeeked ? wordColorMap[word] : "#6b7280") : wordColorMap[word],
                  border: `2px solid ${found ? (isPeeked ? wordColorMap[word] : "#e5e7eb") : wordColorMap[word]}`,
                }}
              >
                {found && <span className="text-xs">✓</span>}
                <span className={found ? "line-through" : ""}>{word}</span>
                {found && <Eye className="w-3 h-3 opacity-50" />}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="bg-white rounded-2xl shadow-md p-2 select-none touch-none w-full max-w-md"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ userSelect: "none" }}
        >
          <div className="grid" style={{ gridTemplateColumns: `repeat(${puzzle.grid[0]?.length ?? 8}, 1fr)`, gap: "1px" }}>
            {puzzle.grid.map((row, r) =>
              row.map((letter, c) => {
                const key = `${r}-${c}`;
                const isHighlighted = highlightedCells.has(key);
                const foundWord = foundCells.get(key);
                const foundColor = foundWord ? wordColorMap[foundWord] : null;
                const isPeekedCell = peekedWord !== null && foundCells.get(key) === peekedWord;
                return (
                  <div
                    key={key}
                    onPointerDown={(e) => handlePointerDown(e, r, c)}
                    className="aspect-square flex items-center justify-center font-black uppercase rounded cursor-pointer transition-all"
                    style={{
                      backgroundColor: isPeekedCell ? `${foundColor}66` : foundColor ? `${foundColor}33` : isHighlighted ? `${COLOR}44` : "transparent",
                      color: foundColor ?? (isHighlighted ? COLOR : "#374151"),
                      fontSize: `clamp(8px, ${100 / puzzle.grid[0].length}vw, 14px)`,
                      fontWeight: foundColor ? 900 : undefined,
                      boxShadow: isPeekedCell ? `0 0 0 2px ${foundColor}` : undefined,
                      borderRadius: isPeekedCell ? "4px" : undefined,
                    }}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <button
            onClick={initPuzzle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all hover:opacity-80 shrink-0"
            style={{ borderColor: COLOR, color: COLOR, backgroundColor: `${COLOR}11` }}
            title="Same words, new grid layout"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle
          </button>

          <button
            onClick={() => { setDraftSettings(settings); setCustomTags(savedCustomWords); setShowSettings(true); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all hover:opacity-80 shrink-0 ${
              useCustom ? "bg-yellow-50 border-yellow-400 text-yellow-700" : "border-gray-300 text-gray-500"
            }`}
            title="Game settings"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
            {useCustom && <span className="ml-0.5">✏️</span>}
          </button>

          <p className="text-xs text-gray-400 flex-1 text-center">Drag to find · tap ✓ to peek</p>
        </div>
      </div>

      {/* ── Settings bottom sheet ── */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85vh]"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-gray-800">Game Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                </div>

                {/* Directions */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Word directions</p>
                  <div className="flex gap-2">
                    {dirLabels.map(({ dir, label, Icon }) => {
                      const active = draftSettings.directions.includes(dir);
                      const isOnly = draftSettings.directions.length === 1 && active;
                      return (
                        <button
                          key={dir}
                          onClick={() => toggleDraftDir(dir)}
                          disabled={isOnly}
                          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                            active
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-400 hover:border-gray-300"
                          } ${isOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">At least one direction must stay on.</p>
                </div>

                {/* Words per puzzle */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Words per puzzle</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDraftSettings((p) => ({ ...p, wordsPerPuzzle: Math.max(2, p.wordsPerPuzzle - 1) }))}
                      className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-black text-blue-600">{draftSettings.wordsPerPuzzle}</span>
                      <p className="text-[10px] text-gray-400">words</p>
                    </div>
                    <button
                      onClick={() => setDraftSettings((p) => ({ ...p, wordsPerPuzzle: Math.min(10, p.wordsPerPuzzle + 1) }))}
                      className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {useCustom && savedCustomWords.length >= 2 && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Your bank has {savedCustomWords.length} words — each round picks {Math.min(draftSettings.wordsPerPuzzle, savedCustomWords.length)} different ones.
                    </p>
                  )}
                </div>

                {/* Custom word bank */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">Custom word bank</p>
                    {customTags.length > 0 && (
                      <button onClick={handleClearCustomWords} className="text-[10px] text-red-400 hover:text-red-600">Clear all</button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mb-2">
                    Add your own words. Each round picks a fresh subset — great for vocab practice!
                  </p>

                  {/* Tags */}
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {customTags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                          {tag}
                          <button onClick={() => removeCustomTag(tag)} className="text-blue-500 hover:text-red-500 ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Type a word and press +"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={handleCustomKeyDown}
                    />
                    <button
                      onClick={() => addCustomTag(customTagInput)}
                      disabled={customTagInput.trim().length < 2}
                      className="px-3 py-2 rounded-xl text-white font-bold disabled:opacity-40"
                      style={{ backgroundColor: COLOR }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {customTags.length < 2 && (
                    <p className="text-[10px] text-gray-400 mt-1">Add at least 2 words to use custom mode.</p>
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveSettings}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: COLOR }}
                >
                  Save & play
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}>
              <div className="text-6xl mb-4">{stars === 3 ? "🔍" : stars === 2 ? "🌟" : "💪"}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{stars >= 2 ? "Word Detective!" : "Good search!"}</h2>
              <p className="text-gray-500 mb-3">Completed <span className="font-bold" style={{ color: COLOR }}>{score}/{TOTAL_ROUNDS}</span> puzzles!</p>
              <p className="text-[11px] text-gray-400 mb-3">⭐⭐⭐ = all 3 &nbsp;·&nbsp; ⭐⭐ = 2 &nbsp;·&nbsp; ⭐ = 1</p>
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3].map((s) => <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>)}
              </div>
              <div className="flex gap-3">
                <button onClick={init} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: BG, color: COLOR }}>
                  <RotateCcw className="w-4 h-4" />Play Again
                </button>
                <button onClick={() => router.push("/games/english")} className="flex-1 py-3 rounded-xl text-white font-bold text-sm" style={{ backgroundColor: COLOR }}>
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
