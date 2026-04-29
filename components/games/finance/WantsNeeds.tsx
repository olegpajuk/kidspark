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
import { ChevronLeft, RotateCcw, CheckCircle, Settings, X, Plus } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import {
  WANTS_NEEDS_ITEMS,
  type WantsNeedsItem,
  type ItemCategory,
} from "@/lib/data/finance/wants-needs";
import type { DifficultyTier } from "@/types/game";

const ROUNDS = 5;
const COLOR = "#4ECDC4";
const BG = "#F0FFFE";

const SETTINGS_KEY = "wants-needs-settings";
const CUSTOM_NEEDS_KEY = "wants-needs-custom-needs";
const CUSTOM_WANTS_KEY = "wants-needs-custom-wants";

interface WnSettings {
  autoNext: boolean;
  itemsPerRound: number;
}

const DEFAULT_SETTINGS: WnSettings = {
  autoNext: true,
  itemsPerRound: 4,
};

function loadSettings(): WnSettings {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_SETTINGS; }
}

function loadCustomItems(key: string): { name: string; emoji: string }[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

interface ItemChipProps {
  item: WantsNeedsItem;
  isPlaced: boolean;
}

function ItemChip({ item, isPlaced }: ItemChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled: isPlaced,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`px-3 py-2 rounded-xl bg-white border-2 border-gray-200 font-bold text-sm text-gray-700 cursor-grab active:cursor-grabbing select-none touch-none transition-all ${
        isDragging ? "opacity-40" : ""
      } ${isPlaced ? "opacity-0 pointer-events-none h-0 p-0 m-0 overflow-hidden" : "hover:border-teal-400 hover:scale-105"}`}
    >
      <span className="text-lg mr-1.5">{item.emoji}</span>
      {item.name}
    </div>
  );
}

interface BucketProps {
  category: ItemCategory;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  items: WantsNeedsItem[];
  showResults: boolean;
  correctCategory: Record<string, ItemCategory>;
}

function CategoryBucket({
  category,
  label,
  emoji,
  color,
  bgColor,
  items,
  showResults,
  correctCategory,
}: BucketProps) {
  const { setNodeRef, isOver } = useDroppable({ id: category });

  const allCorrect =
    showResults &&
    items.length > 0 &&
    items.every((item) => correctCategory[item.id] === category);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-2xl p-3 border-3 transition-all min-h-[100px] max-h-[140px] overflow-y-auto ${
        isOver ? "scale-[1.02] shadow-lg" : ""
      } ${allCorrect && showResults ? "border-green-400" : ""}`}
      style={{
        backgroundColor: isOver ? bgColor : bgColor,
        borderColor: isOver ? color : allCorrect && showResults ? "#4ADE80" : color,
        borderWidth: "3px",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <p className="font-black text-xs uppercase tracking-wide" style={{ color }}>
          {label}
        </p>
        {allCorrect && showResults && <CheckCircle className="w-4 h-4 text-green-500" />}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isCorrect = correctCategory[item.id] === category;
          return (
            <motion.div
              key={item.id}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                showResults
                  ? isCorrect
                    ? "bg-green-100 border-green-400 text-green-700"
                    : "bg-red-100 border-red-400 text-red-700"
                  : "bg-white text-gray-700"
              }`}
              style={{ 
                borderWidth: "2px",
                borderColor: showResults ? undefined : color 
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              layout
            >
              <span>{item.emoji}</span>
              <span>{item.name}</span>
              {showResults && (
                <span className="ml-0.5 font-black">
                  {isCorrect ? "✓" : "✗"}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  difficulty: DifficultyTier;
}

export function WantsNeeds({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<{ items: WantsNeedsItem[]; correctMapping: Record<string, ItemCategory> } | null>(null);
  const [placements, setPlacements] = useState<Record<string, ItemCategory>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const [settings, setSettings] = useState<WnSettings>(loadSettings);
  const [customNeeds, setCustomNeeds] = useState<{ name: string; emoji: string }[]>(() => loadCustomItems(CUSTOM_NEEDS_KEY));
  const [customWants, setCustomWants] = useState<{ name: string; emoji: string }[]>(() => loadCustomItems(CUSTOM_WANTS_KEY));
  
  const [showSettings, setShowSettings] = useState(false);
  const [draftSettings, setDraftSettings] = useState<WnSettings>(loadSettings);
  const [draftNeeds, setDraftNeeds] = useState<{ name: string; emoji: string }[]>([]);
  const [draftWants, setDraftWants] = useState<{ name: string; emoji: string }[]>([]);
  const [needInput, setNeedInput] = useState("");
  const [wantInput, setWantInput] = useState("");

  const useCustom = customNeeds.length >= 2 && customWants.length >= 2;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const generateQuestion = useCallback(() => {
    const itemsPerCategory = Math.max(2, Math.min(4, Math.floor(settings.itemsPerRound / 2)));
    
    let needs: WantsNeedsItem[];
    let wants: WantsNeedsItem[];

    if (useCustom) {
      const shuffledNeeds = [...customNeeds].sort(() => Math.random() - 0.5);
      const shuffledWants = [...customWants].sort(() => Math.random() - 0.5);
      
      needs = shuffledNeeds.slice(0, itemsPerCategory).map((item, i) => ({
        id: `custom-need-${i}-${Date.now()}`,
        name: item.name,
        emoji: item.emoji,
        category: "need" as ItemCategory,
        difficulty: 1,
      }));
      
      wants = shuffledWants.slice(0, itemsPerCategory).map((item, i) => ({
        id: `custom-want-${i}-${Date.now()}`,
        name: item.name,
        emoji: item.emoji,
        category: "want" as ItemCategory,
        difficulty: 1,
      }));
    } else {
      const maxDifficulty = Math.min(difficulty + 2, 10);
      const minDifficulty = Math.max(1, difficulty - 1);
      
      const eligibleItems = WANTS_NEEDS_ITEMS.filter(
        (item) => item.difficulty >= minDifficulty && item.difficulty <= maxDifficulty
      );
      
      const needItems = eligibleItems.filter((item) => item.category === "need");
      const wantItems = eligibleItems.filter((item) => item.category === "want");
      
      const shuffledNeeds = [...needItems].sort(() => Math.random() - 0.5);
      const shuffledWants = [...wantItems].sort(() => Math.random() - 0.5);
      
      needs = shuffledNeeds.slice(0, itemsPerCategory);
      wants = shuffledWants.slice(0, itemsPerCategory);
    }

    const allItems = [...needs, ...wants].sort(() => Math.random() - 0.5);
    
    const correctMapping: Record<string, ItemCategory> = {};
    allItems.forEach((item) => {
      correctMapping[item.id] = item.category;
    });

    return { items: allItems, correctMapping };
  }, [difficulty, settings.itemsPerRound, useCustom, customNeeds, customWants]);

  const nextRound = useCallback(() => {
    setQuestion(generateQuestion());
    setPlacements({});
    setSubmitted(false);
    setRoundCorrect(0);
    setActiveItemId(null);
  }, [generateQuestion]);

  useEffect(() => {
    nextRound();
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
  }, [difficulty, nextRound]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveItemId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItemId(null);
    if (!over) return;
    setPlacements((prev) => ({
      ...prev,
      [active.id as string]: over.id as ItemCategory,
    }));
    playSound("pop");
  };

  const handleSubmit = () => {
    if (!question) return;
    const allPlaced = question.items.every((item) => item.id in placements);
    if (!allPlaced) return;

    const correct = question.items.filter(
      (item) => placements[item.id] === question.correctMapping[item.id]
    ).length;
    setRoundCorrect(correct);

    const isAllCorrect = correct === question.items.length;
    if (isAllCorrect) playSound("correct");
    else playSound("wrong");
    setSubmitted(true);

    setTotalCorrect((t) => t + correct);

    if (settings.autoNext) {
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          setIsComplete(true);
        } else {
          setRound((r) => r + 1);
          nextRound();
        }
      }, 2000);
    }
  };

  const handleManualNext = () => {
    if (round + 1 >= ROUNDS) {
      setIsComplete(true);
    } else {
      setRound((r) => r + 1);
      nextRound();
    }
  };

  const initGame = () => {
    setRound(0);
    setTotalCorrect(0);
    setIsComplete(false);
    nextRound();
  };

  const openSettings = () => {
    setDraftSettings(settings);
    setDraftNeeds(customNeeds);
    setDraftWants(customWants);
    setShowSettings(true);
  };

  const addNeed = (input: string) => {
    const parts = input.split(" ");
    const emoji = parts[0].length <= 2 ? parts[0] : "📦";
    const name = parts[0].length <= 2 ? parts.slice(1).join(" ").trim() : input.trim();
    if (name.length < 2) return;
    if (draftNeeds.some((n) => n.name.toLowerCase() === name.toLowerCase())) return;
    setDraftNeeds((prev) => [...prev, { name, emoji }]);
    setNeedInput("");
  };

  const addWant = (input: string) => {
    const parts = input.split(" ");
    const emoji = parts[0].length <= 2 ? parts[0] : "🎁";
    const name = parts[0].length <= 2 ? parts.slice(1).join(" ").trim() : input.trim();
    if (name.length < 2) return;
    if (draftWants.some((w) => w.name.toLowerCase() === name.toLowerCase())) return;
    setDraftWants((prev) => [...prev, { name, emoji }]);
    setWantInput("");
  };

  const handleSaveSettings = () => {
    setSettings(draftSettings);
    setCustomNeeds(draftNeeds);
    setCustomWants(draftWants);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(draftSettings));
    localStorage.setItem(CUSTOM_NEEDS_KEY, JSON.stringify(draftNeeds));
    localStorage.setItem(CUSTOM_WANTS_KEY, JSON.stringify(draftWants));
    setShowSettings(false);
    
    setTimeout(() => {
      setRound(0);
      setTotalCorrect(0);
      setIsComplete(false);
      setQuestion(null);
      setTimeout(() => nextRound(), 50);
    }, 100);
  };

  if (!question) return null;

  const allPlaced = question.items.every((item) => item.id in placements);
  const bucketItems = (cat: ItemCategory) =>
    question.items.filter((item) => placements[item.id] === cat);

  const activeItem = activeItemId
    ? question.items.find((item) => item.id === activeItemId)
    : null;

  const totalItems = ROUNDS * (question.items.length || 1);
  const stars =
    totalCorrect >= totalItems * 0.9
      ? 3
      : totalCorrect >= totalItems * 0.6
      ? 2
      : 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      {/* Header */}
      <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: COLOR }}>
        <button
          onClick={() => router.push("/games/finance")}
          className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">Wants vs Needs</p>
          <p className="text-white/70 text-xs">
            Level {difficulty} · Round {round + 1}/{ROUNDS}
            {useCustom && <span className="ml-1 text-yellow-200">· custom ✏️</span>}
          </p>
        </div>
        <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          {Object.keys(placements).length}/{question.items.length}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5" style={{ backgroundColor: `${COLOR}44` }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLOR }}
          animate={{ width: `${(round / ROUNDS) * 100}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex flex-col gap-3 p-4">
          {/* Instruction + Settings */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm font-medium">
              🤔 Is it a <strong>NEED</strong> or <strong>WANT</strong>?
            </p>
            <button
              onClick={openSettings}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
                useCustom ? "bg-yellow-50 border-yellow-400 text-yellow-700" : "border-gray-300 text-gray-500"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              {useCustom && "✏️"}
            </button>
          </div>

          {/* Items to sort */}
          <div className="flex flex-wrap gap-2 justify-center min-h-[50px]">
            {question.items.map((item) => (
              <ItemChip
                key={item.id}
                item={item}
                isPlaced={item.id in placements}
              />
            ))}
          </div>

          {/* Buckets - smaller height */}
          <div className="flex gap-3">
            <CategoryBucket
              category="need"
              label="I Need It"
              emoji="✅"
              color="#22C55E"
              bgColor="#F0FDF4"
              items={bucketItems("need")}
              showResults={submitted}
              correctCategory={question.correctMapping}
            />
            <CategoryBucket
              category="want"
              label="I Want It"
              emoji="💫"
              color="#F59E0B"
              bgColor="#FFFBEB"
              items={bucketItems("want")}
              showResults={submitted}
              correctCategory={question.correctMapping}
            />
          </div>

          {/* Auto-next toggle */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">Auto-next:</span>
            <button
              onClick={() => {
                const newSettings = { ...settings, autoNext: !settings.autoNext };
                setSettings(newSettings);
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
              }}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                settings.autoNext ? "bg-teal-500" : "bg-gray-300"
              }`}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                animate={{ left: settings.autoNext ? 22 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Submit / Next buttons */}
          <div className="mt-auto space-y-2">
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={!allPlaced}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-lg disabled:opacity-40 hover:opacity-90 transition-opacity active:scale-[0.98]"
                style={{ backgroundColor: COLOR }}
              >
                Check Answers
              </button>
            )}

            {/* Feedback + Next button */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className={`py-3 rounded-2xl font-bold text-white text-center text-lg ${
                      roundCorrect === question.items.length
                        ? "bg-green-500"
                        : "bg-orange-400"
                    }`}
                  >
                    {roundCorrect === question.items.length
                      ? "🎉 Perfect!"
                      : `${roundCorrect}/${question.items.length} correct`}
                  </div>
                  
                  {!settings.autoNext && (
                    <button
                      onClick={handleManualNext}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-lg hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: COLOR }}
                    >
                      {round + 1 >= ROUNDS ? "See Results →" : "Next Round →"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DragOverlay>
          {activeItem && (
            <div className="px-3 py-2 rounded-xl bg-white border-2 border-teal-400 font-bold text-sm text-gray-700 shadow-lg">
              <span className="text-lg mr-1.5">{activeItem.emoji}</span>
              {activeItem.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85vh]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-gray-800">Game Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Auto-next setting */}
                <div className="mb-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Auto-advance</p>
                      <p className="text-xs text-gray-500">Automatically go to next round</p>
                    </div>
                    <button
                      onClick={() => setDraftSettings((p) => ({ ...p, autoNext: !p.autoNext }))}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        draftSettings.autoNext ? "bg-teal-500" : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                        animate={{ left: draftSettings.autoNext ? 26 : 4 }}
                      />
                    </button>
                  </div>
                </div>

                {/* Items per round */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Items per round</p>
                  <div className="flex items-center gap-4">
                    {[4, 6, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setDraftSettings((p) => ({ ...p, itemsPerRound: n }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          draftSettings.itemsPerRound === n
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-gray-200 text-gray-500"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Needs */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-green-600 uppercase">✅ Custom NEEDS</p>
                    {draftNeeds.length > 0 && (
                      <button
                        onClick={() => setDraftNeeds([])}
                        className="text-[10px] text-red-400 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {draftNeeds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {draftNeeds.map((item, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full"
                        >
                          {item.emoji} {item.name}
                          <button
                            onClick={() => setDraftNeeds((p) => p.filter((_, idx) => idx !== i))}
                            className="text-green-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-green-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                      placeholder="🍎 Food or just Food"
                      value={needInput}
                      onChange={(e) => setNeedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addNeed(needInput)}
                    />
                    <button
                      onClick={() => addNeed(needInput)}
                      disabled={needInput.trim().length < 2}
                      className="px-3 py-2 rounded-xl bg-green-500 text-white font-bold disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Custom Wants */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-amber-600 uppercase">💫 Custom WANTS</p>
                    {draftWants.length > 0 && (
                      <button
                        onClick={() => setDraftWants([])}
                        className="text-[10px] text-red-400 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {draftWants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {draftWants.map((item, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full"
                        >
                          {item.emoji} {item.name}
                          <button
                            onClick={() => setDraftWants((p) => p.filter((_, idx) => idx !== i))}
                            className="text-amber-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                      placeholder="🎮 Video Game or just Toy"
                      value={wantInput}
                      onChange={(e) => setWantInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addWant(wantInput)}
                    />
                    <button
                      onClick={() => addWant(wantInput)}
                      disabled={wantInput.trim().length < 2}
                      className="px-3 py-2 rounded-xl bg-amber-500 text-white font-bold disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 mb-4">
                  💡 Add at least 2 needs AND 2 wants to use custom mode. Game picks randomly each round.
                </p>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: COLOR }}
                >
                  Save & Play
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              <div className="text-6xl mb-4">
                {stars === 3 ? "🧠" : stars === 2 ? "⭐" : "💪"}
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {stars >= 2 ? "Smart Spender!" : "Keep learning!"}
              </h2>
              <p className="text-gray-500 mb-2">
                You sorted{" "}
                <span className="font-bold" style={{ color: COLOR }}>{totalCorrect}</span>{" "}
                items correctly
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Remember: Needs keep us healthy and safe!
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-3xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={initGame}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold"
                  style={{ backgroundColor: BG, color: COLOR }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-3 rounded-xl text-white font-bold"
                  style={{ backgroundColor: COLOR }}
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
