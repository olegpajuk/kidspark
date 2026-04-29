"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { generateMemoryQuestion } from "@/lib/games/question-generators/english/memory";
import { useAudio } from "@/hooks/useAudio";
import type { DifficultyTier } from "@/types/game";
import type { MemoryCard, MemoryQuestion } from "@/types/english";

interface Props {
  difficulty: DifficultyTier;
}

interface CardState extends MemoryCard {
  isFlipped: boolean;
  isMatched: boolean;
}

export function WordMatchMemory({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [question, setQuestion] = useState<MemoryQuestion | null>(null);
  const [cards, setCards] = useState<CardState[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const init = useCallback(() => {
    const q = generateMemoryQuestion(difficulty);
    setQuestion(q);
    setCards(q.cards.map((c) => ({ ...c, isFlipped: false, isMatched: false })));
    setSelected([]);
    setIsChecking(false);
    setMatchedPairs(0);
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
    setElapsed(0);
  }, [difficulty]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!isComplete && startTime > 0) {
      const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
      return () => clearInterval(t);
    }
  }, [isComplete, startTime]);

  const handleCardTap = useCallback((cardId: string) => {
    if (isChecking) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (selected.includes(cardId)) return;

    const newSelected = [...selected, cardId];
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, isFlipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [aId, bId] = newSelected;
      const a = cards.find((c) => c.id === aId)!;
      const b = cards.find((c) => c.id === bId)!;
      const isMatch = a.pairId === b.pairId;

      setTimeout(() => {
        if (isMatch) {
          playSound("correct");
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === a.pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setMatchedPairs((mp) => {
            const newMp = mp + 1;
            if (question && newMp >= question.pairs) {
              setIsComplete(true);
              setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }
            return newMp;
          });
        } else {
          playSound("wrong");
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c
            )
          );
        }
        setSelected([]);
        setIsChecking(false);
      }, 900);
    }
  }, [isChecking, cards, selected, playSound, question, startTime]);

  if (!question) return null;

  const totalPairs = question.pairs;
  // columns: small sets use 4 cols, large use 5
  const cols = totalPairs <= 8 ? 4 : 5;
  const stars =
    moves <= totalPairs * 1.5 ? 3 : moves <= totalPairs * 2 ? 2 : moves <= totalPairs * 3 ? 1 : 0;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#F0FFFE] flex flex-col">
      {/* Header */}
      <div className="bg-[#4ECDC4] text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/games/english")} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Word Match Memory</p>
          <p className="text-white/70 text-xs">Level {difficulty} · {totalPairs} pairs</p>
        </div>
        <div className="text-sm font-bold">{formatTime(elapsed)}</div>
      </div>

      {/* Stats bar */}
      <div className="bg-teal-50 px-4 py-2 flex justify-between text-sm">
        <span className="text-teal-700">Pairs: <strong>{matchedPairs}/{totalPairs}</strong></span>
        <span className="text-teal-700">Moves: <strong>{moves}</strong></span>
      </div>

      {/* Card grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cards.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                onTap={handleCardTap}
                isChecking={isChecking}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Complete Overlay */}
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
              <div className="text-6xl mb-4">{stars === 3 ? "🌟" : stars === 2 ? "⭐" : "💪"}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{stars >= 2 ? "Well done!" : "You finished!"}</h2>
              <p className="text-gray-500 mb-1">
                Completed in <span className="font-bold text-teal-600">{formatTime(elapsed)}</span>
              </p>
              <p className="text-gray-500 mb-4">
                with <span className="font-bold text-teal-600">{moves} moves</span>
              </p>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3].map((s) => <span key={s} className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}>⭐</span>)}
              </div>
              <p className="text-[11px] text-gray-400 mb-5">⭐⭐⭐ = ≤{Math.round(totalPairs * 1.5)} moves &nbsp;·&nbsp; ⭐⭐ = ≤{totalPairs * 2} &nbsp;·&nbsp; ⭐ = ≤{totalPairs * 3}</p>
              <div className="flex gap-3">
                <button onClick={init} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-100 text-teal-700 font-bold hover:bg-teal-200">
                  <RotateCcw className="w-4 h-4" />Play Again
                </button>
                <button onClick={() => router.push("/games/english")} className="flex-1 py-3 rounded-xl bg-[#4ECDC4] text-white font-bold hover:opacity-90">
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

// Separate card component to avoid re-render issues with 3D CSS
interface CardTileProps {
  card: CardState;
  onTap: (id: string) => void;
  isChecking: boolean;
}

function CardTile({ card, onTap, isChecking }: CardTileProps) {
  const disabled = card.isMatched || card.isFlipped || isChecking;

  return (
    <button
      onClick={() => onTap(card.id)}
      disabled={disabled && !card.isMatched}
      className="relative w-full rounded-xl overflow-hidden focus:outline-none"
      style={{ aspectRatio: "1" }}
    >
      <AnimatePresence initial={false}>
        {!card.isFlipped && !card.isMatched ? (
          /* Card back — hidden face */
          <motion.div
            key="back"
            className="absolute inset-0 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#4ECDC4" }}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <span className="text-white font-black text-2xl select-none">?</span>
          </motion.div>
        ) : (
          /* Card front — revealed */
          <motion.div
            key="front"
            className={`absolute inset-0 rounded-xl flex items-center justify-center p-1 ${
              card.isMatched
                ? "bg-green-100 border-2 border-green-400"
                : "bg-white border-2 border-teal-300 shadow-sm"
            }`}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {card.type === "emoji" ? (
              <span className="text-2xl select-none">{card.content}</span>
            ) : (
              <span className="text-[10px] font-black text-gray-700 uppercase text-center leading-tight break-all select-none px-0.5">
                {card.content}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
