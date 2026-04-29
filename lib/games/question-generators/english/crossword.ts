import type { DifficultyTier } from "@/types/game";
import type { CrosswordClue, CrosswordQuestion } from "@/types/english";
import {
  getWordsByDifficulty,
  shuffleArray,
  generateEnglishId,
} from "@/lib/data/english";

/** Grid sizes by difficulty */
const GRID_SIZE: Record<DifficultyTier, number> = {
  1: 7, 2: 7, 3: 9, 4: 9, 5: 11, 6: 11, 7: 13, 8: 13, 9: 15, 10: 15,
};

const WORD_COUNT: Record<DifficultyTier, number> = {
  1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 7: 6, 8: 6, 9: 7, 10: 8,
};

function createEmptyGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

interface PlacedWord {
  word: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down",
  size: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const cell = grid[r][c];
    if (cell !== null && cell !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down"
): void {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    grid[r][c] = word[i];
  }
}

export function generateCrosswordQuestion(difficulty: DifficultyTier): CrosswordQuestion {
  const size = GRID_SIZE[difficulty];
  const wordCount = WORD_COUNT[difficulty];
  const pool = shuffleArray(
    getWordsByDifficulty(difficulty).filter((w) => w.word.length <= size - 2)
  );

  const grid = createEmptyGrid(size);
  const placed: PlacedWord[] = [];
  const usedWords = new Set<string>();

  // Place first word horizontally in the center
  const firstWord = pool[0];
  const firstRow = Math.floor(size / 2);
  const firstCol = Math.floor((size - firstWord.word.length) / 2);
  placeWord(grid, firstWord.word, firstRow, firstCol, "across");
  placed.push({ word: firstWord.word, row: firstRow, col: firstCol, direction: "across" });
  usedWords.add(firstWord.id);

  // Try to intersect subsequent words
  for (const candidate of pool.slice(1)) {
    if (usedWords.has(candidate.id)) continue;
    if (placed.length >= wordCount) break;

    let placedSuccessfully = false;

    for (const existing of placed) {
      const dir: "across" | "down" = existing.direction === "across" ? "down" : "across";

      for (let ci = 0; ci < candidate.word.length; ci++) {
        for (let ei = 0; ei < existing.word.length; ei++) {
          if (candidate.word[ci] !== existing.word[ei]) continue;

          const r =
            dir === "down"
              ? (existing.direction === "across" ? existing.row - ci : existing.row + ei - ci)
              : existing.row + ei;

          const c =
            dir === "across"
              ? (existing.direction === "down" ? existing.col - ci : existing.col + ei - ci)
              : existing.col + ei;

          if (canPlace(grid, candidate.word, r, c, dir, size)) {
            placeWord(grid, candidate.word, r, c, dir);
            placed.push({ word: candidate.word, row: r, col: c, direction: dir });
            usedWords.add(candidate.id);
            placedSuccessfully = true;
            break;
          }
        }
        if (placedSuccessfully) break;
      }
      if (placedSuccessfully) break;
    }
  }

  // Assign clue numbers
  const clueNumberGrid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  let clueNum = 1;
  const clues: CrosswordClue[] = [];

  for (const p of placed) {
    clueNumberGrid[p.row][p.col] = clueNum;

    // Find the word object for emoji hint
    const wordObj = pool.find((w) => w.word === p.word);
    const clue = wordObj ? `${wordObj.emoji} (${p.word.length} letters)` : `${p.word.length} letters`;

    clues.push({
      number: clueNum,
      direction: p.direction,
      clue,
      answer: p.word,
      startRow: p.row,
      startCol: p.col,
    });
    clueNum++;
  }

  return {
    id: generateEnglishId("cw"),
    grid,
    clues,
    size,
  };
}
