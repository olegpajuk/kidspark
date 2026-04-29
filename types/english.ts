import type { DifficultyTier } from "./game";

export type WordCategory =
  | "animals"
  | "food"
  | "colors"
  | "numbers"
  | "body"
  | "family"
  | "nature"
  | "transport"
  | "clothes"
  | "home"
  | "school"
  | "actions";

export interface Word {
  id: string;
  word: string;
  emoji: string;
  imageUrl?: string;
  audioUrl?: string;
  category: WordCategory;
  difficulty: DifficultyTier;
  syllables: number;
}

export interface SightWord {
  id: string;
  word: string;
  list: "dolch" | "fry";
  grade: number;
}

export interface WordRelationship {
  wordId: string;
  word: string;
  synonyms: string[];
  antonyms: string[];
  rhymes: string[];
}

export interface GradedSentence {
  id: string;
  text: string;
  difficulty: DifficultyTier;
  wordCount: number;
  targetWords: string[];
}

export interface PhonicsPattern {
  pattern: string;
  sound: string;
  examples: string[];
}

export type PluralRule = "add-s" | "add-es" | "y-to-ies" | "f-to-ves" | "irregular";

export interface PluralForm {
  singular: string;
  plural: string;
  rule: PluralRule;
}

export type VerbTense = "past" | "present" | "future" | "presentParticiple";

export interface VerbForms {
  base: string;
  past: string;
  future: string;
  presentParticiple: string;
  irregular: boolean;
}

// Question types for each game

export interface FlashcardQuestion {
  id: string;
  word: Word;
  mode: "image-to-word" | "word-to-image";
  options: string[];
  correctAnswer: string;
}

export interface MissingLetterQuestion {
  id: string;
  word: Word;
  displayWord: string;
  missingIndices: number[];
  options: string[];
  correctAnswers: string[];
}

export interface SpellingBeeQuestion {
  id: string;
  word: Word;
  scrambledLetters: string[];
  correctAnswer: string;
}

export interface MemoryCard {
  id: string;
  type: "word" | "emoji";
  content: string;
  pairId: string;
}

export interface MemoryQuestion {
  id: string;
  cards: MemoryCard[];
  pairs: number;
}

export interface CategoryQuestion {
  id: string;
  words: Word[];
  categories: WordCategory[];
  correctMapping: Record<string, WordCategory>;
}

export interface RhymingQuestion {
  id: string;
  targetWord: Word;
  options: string[];
  correctRhymes: string[];
}

export interface LetterChainQuestion {
  id: string;
  startWord: Word;
  options: Word[];
  correctAnswerId: string;
  chainSoFar: string[];
}

export interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
}

export interface CrosswordQuestion {
  id: string;
  grid: (string | null)[][];
  clues: CrosswordClue[];
  size: number;
}

export interface WordSearchQuestion {
  id: string;
  grid: string[][];
  hiddenWords: string[];
  wordPositions: Array<{
    word: string;
    startRow: number;
    startCol: number;
    direction: "horizontal" | "vertical" | "diagonal";
  }>;
}

export interface SentenceBuilderQuestion {
  id: string;
  sentence: GradedSentence;
  scrambledWords: string[];
  correctOrder: string[];
}

export interface SynonymQuestion {
  id: string;
  targetWord: string;
  mode: "synonym" | "antonym";
  options: string[];
  correctAnswer: string;
}

export interface PluralQuestion {
  id: string;
  form: PluralForm;
  options: string[];
  correctAnswer: string;
}

export interface VerbTenseQuestion {
  id: string;
  verb: VerbForms;
  targetTense: VerbTense;
  options: string[];
  correctAnswer: string;
  contextSentence: string;
}

export interface DictationQuestion {
  id: string;
  text: string;
  difficulty: DifficultyTier;
  type: "word" | "sentence";
}

export interface ListenTapQuestion {
  id: string;
  targetWord: Word;
  options: Word[];
  correctId: string;
}

export interface PronunciationQuestion {
  id: string;
  word: Word;
  phonetic: string;
}

export interface SpeechGameQuestion {
  id: string;
  word: Word;
  acceptableVariants: string[];
}
