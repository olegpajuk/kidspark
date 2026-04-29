"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { ChevronLeft, RotateCcw, CheckCircle } from "lucide-react";
import { generateCategoryQuestion } from "@/lib/games/question-generators/english/categories";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { CategoryQuestion, Word, WordCategory } from "@/types/english";

const ROUNDS = 3;

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  animals:   { bg: "#FFF0F0", border: "#FF6B6B", text: "#CC3333" },
  food:      { bg: "#FFF8E7", border: "#FFB800", text: "#996600" },
  colors:    { bg: "#F0EEFF", border: "#6C63FF", text: "#4444CC" },
  nature:    { bg: "#F0FFF4", border: "#2ECC71", text: "#1A8C4E" },
  transport: { bg: "#EBF5FF", border: "#3498DB", text: "#1A6699" },
  clothes:   { bg: "#FFF0F9", border: "#E91E9E", text: "#AA1177" },
  home:      { bg: "#FEF5E7", border: "#E67E22", text: "#AA5500" },
  school:    { bg: "#E8FDF5", border: "#1ABC9C", text: "#117766" },
  body:      { bg: "#F5EEF8", border: "#8E44AD", text: "#6622AA" },
  family:    { bg: "#FDEDEC", border: "#E74C3C", text: "#AA1111" },
  actions:   { bg: "#EAF8FF", border: "#0ABDE3", text: "#0077AA" },
  numbers:   { bg: "#FFF8E7", border: "#F39C12", text: "#AA6600" },
};

interface WordChipProps {
  word: Word;
  isPlaced: boolean;
}

function WordChip({ word, isPlaced }: WordChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: word.id, disabled: isPlaced });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`px-3 py-2 rounded-xl bg-white border-2 border-gray-200 font-bold text-sm text-gray-700 cursor-grab active:cursor-grabbing select-none touch-none transition-all ${
        isDragging ? "opacity-40" : ""
      } ${isPlaced ? "opacity-0 pointer-events-none" : "hover:border-orange-400 hover:scale-105"}`}
    >
      <span className="mr-1">{word.emoji}</span>
      {word.word}
    </div>
  );
}

interface BucketProps {
  category: WordCategory;
  words: Word[];
  isCorrect?: boolean;
}

function CategoryBucket({ category, words, isCorrect }: BucketProps) {
  const { setNodeRef, isOver } = useDroppable({ id: category });
  const colors = CATEGORY_COLORS[category] ?? { bg: "#F5F5F5", border: "#999", text: "#333" };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-3 border-2 transition-all min-h-[80px] ${
        isOver
          ? "scale-[1.02] shadow-md"
          : isCorrect
          ? "border-green-400 bg-green-50"
          : ""
      }`}
      style={{
        backgroundColor: isOver ? colors.bg : isCorrect ? undefined : colors.bg,
        borderColor: isOver ? colors.border : isCorrect ? undefined : colors.border,
      }}
    >
      <div className="flex items-center gap-1 mb-2">
        <p className="text-xs font-black uppercase tracking-wide" style={{ color: colors.text }}>
          {category}
        </p>
        {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {words.map((w) => (
          <span
            key={w.id}
            className="px-2 py-1 rounded-lg bg-white border text-xs font-bold text-gray-700"
            style={{ borderColor: colors.border }}
          >
            {w.emoji} {w.word}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  difficulty: DifficultyTier;
}

export function WordCategories({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<CategoryQuestion | null>(null);
  const [placements, setPlacements] = useState<Record<string, WordCategory>>({});
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const nextRound = useCallback(() => {
    setQuestion(generateCategoryQuestion(difficulty));
    setPlacements({});
    setSubmitted(false);
    setRoundCorrect(0);
    setActiveWordId(null);
  }, [difficulty]);

  useEffect(() => {
    nextRound();
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
  }, [difficulty, nextRound]);

  const handleDragStart = ({ active }: DragStartEvent) => setActiveWordId(active.id as string);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveWordId(null);
    if (!over) return;
    setPlacements((prev) => ({ ...prev, [active.id as string]: over.id as WordCategory }));
  };

  const handleSubmit = () => {
    if (!question) return;
    const allPlaced = question.words.every((w) => w.id in placements);
    if (!allPlaced) return;

    const correct = question.words.filter(
      (w) => placements[w.id] === question.correctMapping[w.id]
    ).length;
    setRoundCorrect(correct);

    const isAllCorrect = correct === question.words.length;
    if (isAllCorrect) playSound("correct"); else playSound("wrong");
    setSubmitted(true);

    setTotalCorrect((t) => t + correct);

    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        setIsComplete(true);
      } else {
        setRound((r) => r + 1);
        nextRound();
      }
    }, 2000);
  };

  if (!question) return null;

  const allPlaced = question.words.every((w) => w.id in placements);
  const bucketWords = (cat: WordCategory) =>
    question.words.filter((w) => placements[w.id] === cat);
  const isCorrectBucket = (cat: WordCategory) =>
    submitted && bucketWords(cat).every((w) => question.correctMapping[w.id] === cat);

  const activeWord = activeWordId ? question.words.find((w) => w.id === activeWordId) : null;
  const totalWords = ROUNDS * (question.words.length || 1);
  const stars = totalCorrect >= totalWords * 0.9 ? 3 : totalCorrect >= totalWords * 0.6 ? 2 : 1;

  const initGame = () => {
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
    nextRound();
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] flex flex-col">
      {/* Header */}
      <div className="bg-[#FF8C42] text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/games/english")} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Word Categories</p>
          <p className="text-white/70 text-xs">Level {difficulty} · Round {round + 1}/{ROUNDS}</p>
        </div>
        <div className="text-sm font-bold">
          {Object.keys(placements).length}/{question.words.length}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-orange-200">
        <motion.div className="h-full bg-[#FF8C42]" animate={{ width: `${(round / ROUNDS) * 100}%` }} transition={{ type: "spring" }} />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
          <p className="text-center text-gray-500 text-sm">Drag each word into the correct category!</p>

          {/* Words to sort */}
          <div className="flex flex-wrap gap-2 justify-center">
            {question.words.map((word) => (
              <WordChip key={word.id} word={word} isPlaced={word.id in placements} />
            ))}
          </div>

          {/* Buckets */}
          <div className="grid gap-3" style={{ gridTemplateColumns: question.categories.length <= 2 ? "1fr 1fr" : "1fr 1fr" }}>
            {question.categories.map((cat) => (
              <CategoryBucket
                key={cat}
                category={cat}
                words={bucketWords(cat)}
                isCorrect={isCorrectBucket(cat)}
              />
            ))}
          </div>

          {/* Submit */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!allPlaced}
              className="w-full py-4 rounded-2xl bg-[#FF8C42] text-white font-bold text-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Check Answers
            </button>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                className={`py-3 rounded-2xl font-bold text-white text-center text-lg ${roundCorrect === question.words.length ? "bg-green-500" : "bg-orange-400"}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                {roundCorrect === question.words.length
                  ? "🎉 Perfect round!"
                  : `${roundCorrect}/${question.words.length} correct!`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DragOverlay>
          {activeWord && (
            <div className="px-3 py-2 rounded-xl bg-white border-2 border-orange-400 font-bold text-sm text-gray-700 shadow-lg">
              <span className="mr-1">{activeWord.emoji}</span>
              {activeWord.word}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Complete Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}>
              <div className="text-6xl mb-4">{stars === 3 ? "🌟" : stars === 2 ? "⭐" : "💪"}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{stars >= 2 ? "Sorted!" : "Keep practising!"}</h2>
              <p className="text-gray-500 mb-6">You sorted <span className="font-bold text-orange-500">{totalCorrect}</span> words correctly</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>)}
              </div>
              <div className="flex gap-3">
                <button onClick={initGame} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">
                  <RotateCcw className="w-4 h-4" />Play Again
                </button>
                <button onClick={() => router.push("/games/english")} className="flex-1 py-3 rounded-xl bg-[#FF8C42] text-white font-bold hover:opacity-90">
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
