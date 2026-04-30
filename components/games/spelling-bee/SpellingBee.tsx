"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, RotateCcw, Volume2, RefreshCw } from "lucide-react";
import { generateSpellingBeeQuestions } from "@/lib/games/question-generators/english/spelling";
import { useTTS } from "@/hooks/useTTS";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { SpellingBeeQuestion } from "@/types/english";

const QUESTIONS_PER_SESSION = 8;

interface GameResult {
  correct: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
}

interface Props {
  difficulty: DifficultyTier;
  onComplete?: (result: GameResult) => void;
}

function LetterTile({ id, letter }: { id: string; letter: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FFB800] text-white font-black text-xl uppercase flex items-center justify-center cursor-grab active:cursor-grabbing select-none shadow-md touch-none"
    >
      {letter}
    </div>
  );
}

function DragTile({ letter }: { letter: string }) {
  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FF9500] text-white font-black text-xl uppercase flex items-center justify-center shadow-2xl rotate-3 scale-110 select-none">
      {letter}
    </div>
  );
}

export function SpellingBee({ difficulty, onComplete }: Props) {
  const router = useRouter();
  const { speak, isSpeaking } = useTTS();
  const { playSound } = useAudio();

  const [questions, setQuestions] = useState<SpellingBeeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [arranged, setArranged] = useState<{ id: string; letter: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toTiles = (letters: string[]) =>
    letters.map((l, i) => ({ id: `tile-${i}-${l}`, letter: l }));

  const init = useCallback(() => {
    const qs = generateSpellingBeeQuestions(difficulty, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setCurrentIdx(0);
    setArranged(toTiles(qs[0]?.scrambledLetters ?? []));
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setIsComplete(false);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (currentQ) setArranged(toTiles(currentQ.scrambledLetters));
  }, [currentIdx, currentQ]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = arranged.findIndex((t) => t.id === active.id);
    const newIdx = arranged.findIndex((t) => t.id === over.id);
    setArranged(arrayMove(arranged, oldIdx, newIdx));
  };

  const handleDragCancel = () => setActiveId(null);

  const handleTapLetter = (tileId: string) => {
    // On tap, cycle clicked letter to next position (simple reorder for touch users)
    const idx = arranged.findIndex((t) => t.id === tileId);
    if (idx === -1 || idx === arranged.length - 1) return;
    setArranged(arrayMove(arranged, idx, idx + 1));
  };

  const handleSubmit = () => {
    if (submitted) return;
    const attempt = arranged.map((t) => t.letter).join("");
    const correct = attempt === currentQ.correctAnswer;
    setSubmitted(true);
    setIsCorrect(correct);
    if (correct) {
      playSound("correct");
      setScore((s) => s + 1);
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      if (currentIdx + 1 >= QUESTIONS_PER_SESSION) {
        const finalScore = correct ? score + 1 : score;
        const finalStars = finalScore >= 7 ? 3 : finalScore >= 5 ? 2 : finalScore >= 3 ? 1 : 0;
        setIsComplete(true);
        onComplete?.({
          correct: finalScore,
          total: QUESTIONS_PER_SESSION,
          stars: finalStars as 0 | 1 | 2 | 3,
        });
      } else {
        setCurrentIdx((i) => i + 1);
        setSubmitted(false);
        setIsCorrect(false);
      }
    }, 1500);
  };

  const handleReshuffle = () => {
    if (submitted) return;
    setArranged((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  if (!currentQ) return null;

  const currentWord = arranged.map((t) => t.letter).join("");
  const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex flex-col">
      {/* Header */}
      <div className="bg-[#FFB800] text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/games/english")} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Spelling Bee 🐝</p>
          <p className="text-white/70 text-xs">Level {difficulty}</p>
        </div>
        <div className="text-sm font-bold">{currentIdx + 1}/{QUESTIONS_PER_SESSION}</div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-yellow-200">
        <motion.div className="h-full bg-[#FFB800]" animate={{ width: `${(currentIdx / QUESTIONS_PER_SESSION) * 100}%` }} transition={{ type: "spring" }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-3 py-4 gap-4">
        <p className="text-gray-500 text-xs text-center">Drag the letters to spell the word!</p>

        {/* Emoji + hint - more compact */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">{currentQ.word.emoji}</span>
          <button
            onClick={() => speak(currentQ.word.word)}
            className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1.5 text-xs transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isSpeaking ? "Speaking…" : "Hear the word"}
          </button>
        </div>

        {/* Drop zone preview - smaller */}
        <div className={`min-w-[140px] px-3 py-2 rounded-xl border-2 border-dashed text-center font-black text-xl uppercase tracking-wider transition-colors ${
          submitted
            ? isCorrect
              ? "border-green-400 bg-green-50 text-green-700"
              : "border-red-400 bg-red-50 text-red-500"
            : currentWord
            ? "border-yellow-400 bg-yellow-50 text-yellow-800"
            : "border-gray-300 bg-white text-gray-300"
        }`}>
          {currentWord || "_ _ _"}
        </div>

        {/* Draggable letter tiles */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={arranged.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-2 flex-wrap justify-center">
              {arranged.map((tile) => (
                <div key={tile.id} onClick={() => !submitted && !activeId && handleTapLetter(tile.id)}>
                  <LetterTile id={tile.id} letter={tile.letter} />
                </div>
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeId ? (
              <DragTile letter={arranged.find((t) => t.id === activeId)?.letter ?? ""} />
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="flex gap-2">
          <button
            onClick={handleReshuffle}
            disabled={submitted}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 font-semibold text-xs disabled:opacity-40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />Shuffle
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitted || currentWord.length !== currentQ.correctAnswer.length}
            className="px-6 py-2 rounded-lg bg-[#FFB800] text-white font-bold text-sm disabled:opacity-40 transition-opacity"
          >
            Check!
          </button>
        </div>

        <AnimatePresence>
          {submitted && (
            <motion.div
              className={`px-4 py-2 rounded-xl font-bold text-white text-sm ${isCorrect ? "bg-green-500" : "bg-red-400"}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {isCorrect ? "🎉 Spot on!" : `The word was: ${currentQ.correctAnswer.toUpperCase()}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}>
              <div className="text-6xl mb-4">{stars === 3 ? "🌟" : stars === 2 ? "⭐" : "💪"}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{stars >= 2 ? "Brilliant!" : "Keep practising!"}</h2>
              <p className="text-gray-500 mb-4">You got <span className="font-bold text-yellow-500">{score}/{QUESTIONS_PER_SESSION}</span> correct</p>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3].map((s) => <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>)}
              </div>
              <div className="text-[11px] text-gray-400 mb-5 space-y-0.5">
                <p>⭐⭐⭐ = 7+ correct &nbsp;·&nbsp; ⭐⭐ = 5+ &nbsp;·&nbsp; ⭐ = 3+</p>
              </div>
              <div className="flex gap-3">
                <button onClick={init} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-100 text-yellow-700 font-bold hover:bg-yellow-200">
                  <RotateCcw className="w-4 h-4" />Play Again
                </button>
                <button onClick={() => router.push("/games/english")} className="flex-1 py-3 rounded-xl bg-[#FFB800] text-white font-bold hover:opacity-90">
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
