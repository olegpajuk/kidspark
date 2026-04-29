import type { DifficultyTier } from "@/types/game";
import type { WordSearchQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

const GRID_SIZE: Record<DifficultyTier, number> = {
  1: 8, 2: 8, 3: 10, 4: 10, 5: 12, 6: 12, 7: 14, 8: 14, 9: 15, 10: 15,
};

const WORD_COUNT: Record<DifficultyTier, number> = {
  1: 4, 2: 4, 3: 5, 4: 5, 5: 6, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8,
};

type Direction = "horizontal" | "vertical" | "diagonal";

function getAllowedDirections(difficulty: DifficultyTier): Direction[] {
  if (difficulty <= 3) return ["horizontal"];
  if (difficulty <= 6) return ["horizontal", "vertical"];
  return ["horizontal", "vertical", "diagonal"];
}

function randomLetter(): string {
  return "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
}

function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function fillRandomLetters(grid: string[][]): void {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "") grid[r][c] = randomLetter();
    }
  }
}

interface PlacementResult {
  startRow: number;
  startCol: number;
  direction: Direction;
}

/**
 * Enumerate every valid starting position for `word` in `direction`,
 * then pick one at random. This guarantees placement whenever any
 * valid position exists — no off-by-one, no random-miss.
 *
 * A cell is valid if it is empty ("") OR already contains the same letter
 * (two words can share a crossing letter).
 */
function tryPlace(
  grid: string[][],
  word: string,
  direction: Direction,
  size: number
): PlacementResult | null {
  // Upper-bound for start indices so the full word fits inside the grid
  const rowBound = direction === "horizontal" ? size : size - word.length + 1;
  const colBound = direction === "vertical"   ? size : size - word.length + 1;

  const valid: { startRow: number; startCol: number }[] = [];

  for (let sr = 0; sr < rowBound; sr++) {
    for (let sc = 0; sc < colBound; sc++) {
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = direction === "horizontal" ? sr : sr + i;
        const c = direction === "vertical"   ? sc : sc + i;
        const existing = grid[r][c];
        if (existing !== "" && existing !== word[i]) {
          fits = false;
          break;
        }
      }
      if (fits) valid.push({ startRow: sr, startCol: sc });
    }
  }

  if (valid.length === 0) return null;

  const { startRow, startCol } = valid[Math.floor(Math.random() * valid.length)];

  for (let i = 0; i < word.length; i++) {
    const r = direction === "horizontal" ? startRow : startRow + i;
    const c = direction === "vertical"   ? startCol : startCol + i;
    grid[r][c] = word[i];
  }

  return { startRow, startCol, direction };
}

function buildPuzzle(
  wordList: string[],
  size: number,
  maxWords: number,
  allowedDirs: Direction[]
): { grid: string[][]; hiddenWords: string[]; wordPositions: WordSearchQuestion["wordPositions"] } {
  const grid = createEmptyGrid(size);
  const hiddenWords: string[] = [];
  const wordPositions: WordSearchQuestion["wordPositions"] = [];

  for (const word of wordList) {
    if (hiddenWords.length >= maxWords) break;
    if (word.length >= size) continue; // word literally cannot fit

    // Try all allowed directions; place in the first that succeeds
    const dirs = shuffleArray([...allowedDirs]);
    for (const direction of dirs) {
      const result = tryPlace(grid, word, direction, size);
      if (result) {
        hiddenWords.push(word);
        wordPositions.push({ word, ...result });
        break;
      }
    }
  }

  fillRandomLetters(grid);
  return { grid, hiddenWords, wordPositions };
}

export function generateWordSearchQuestion(
  difficulty: DifficultyTier,
  overrideDirs?: Direction[],
  overrideCount?: number
): WordSearchQuestion {
  const size = GRID_SIZE[difficulty];
  const wordCount = overrideCount ?? WORD_COUNT[difficulty];
  const allowedDirs = overrideDirs ?? getAllowedDirections(difficulty);

  const wordList = shuffleArray(
    getWordsByDifficulty(difficulty).filter((w) => w.word.length < size)
  )
    .slice(0, wordCount * 4)
    .map((w) => w.word);

  const { grid, hiddenWords, wordPositions } = buildPuzzle(wordList, size, wordCount, allowedDirs);

  return { id: generateEnglishId("ws"), grid, hiddenWords, wordPositions };
}

/** Generate from a parent-supplied list. Long words auto-expand the grid. */
export function generateWordSearchFromWords(
  words: string[],
  difficulty: DifficultyTier,
  overrideDirs?: Direction[],
  overrideCount?: number
): WordSearchQuestion {
  const baseSize = GRID_SIZE[difficulty];
  const allowedDirs = overrideDirs ?? getAllowedDirections(difficulty);

  const cleaned = shuffleArray(
    words.map((w) => w.toLowerCase().trim().replace(/[^a-z]/g, "")).filter((w) => w.length >= 2)
  );

  // Expand grid if needed so the longest word can always fit
  const longestWord = cleaned.reduce((m, w) => Math.max(m, w.length), 0);
  const size = Math.max(baseSize, longestWord + 2);

  const count = overrideCount ?? Math.min(cleaned.length, 8);
  const { grid, hiddenWords, wordPositions } = buildPuzzle(cleaned, size, count, allowedDirs);

  return { id: generateEnglishId("ws-custom"), grid, hiddenWords, wordPositions };
}

export type { Direction };
