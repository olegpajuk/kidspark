"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "@/components/celebrations/Sparkles";
import { useAudio } from "@/hooks/useAudio";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { X } from "lucide-react";

type GameStep = 
  | "pick-bigger"
  | "swap-animation"
  | "bridge-to-ten"
  | "complete"
  | "waiting-next";  // New: waiting for user to click Next

interface BridgeToTenProps {
  num1: number;
  num2: number;
  onComplete: (result: { correct: boolean; hintsUsed: number; timeSpent: number }) => void;
  questionNumber: number;
  totalQuestions: number;
}

interface FlyingFruit {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Available icons/fruits
const ICON_OPTIONS = [
  { id: "banana", emoji: "🍌", label: "Banana" },
  { id: "apple", emoji: "🍎", label: "Apple" },
  { id: "orange", emoji: "🍊", label: "Orange" },
  { id: "strawberry", emoji: "🍓", label: "Strawberry" },
  { id: "grape", emoji: "🍇", label: "Grape" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "check", emoji: "✓", label: "Check" },
];

// Segmented Ring SVG component
function SegmentedRing({ 
  total, 
  remaining, 
  size = 120,
}: { 
  total: number; 
  remaining: number;
  size?: number;
}) {
  const radius = (size - 20) / 2;
  const center = size / 2;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const gapAngle = 8; // degrees gap between segments
  const segmentAngle = (360 - (gapAngle * total)) / total;
  
  return (
    <svg width={size} height={size} className="absolute inset-0">
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < remaining;
        const startAngle = i * (segmentAngle + gapAngle) - 90;
        const endAngle = startAngle + segmentAngle;
        
        // Calculate arc path
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        
        const largeArcFlag = segmentAngle > 180 ? 1 : 0;
        
        const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
        
        return (
          <motion.path
            key={i}
            d={pathD}
            fill="none"
            stroke={isFilled ? "#F97316" : "#E5E7EB"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={false}
            animate={{ 
              stroke: isFilled ? "#F97316" : "#E5E7EB",
              opacity: isFilled ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </svg>
  );
}

// Draggable source component with segmented ring
function DraggableSource({ 
  id, 
  initialValue,
  remaining, 
  emoji, 
  disabled,
  onTap,
}: { 
  id: string; 
  initialValue: number;
  remaining: number; 
  emoji: string;
  disabled: boolean;
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Segmented Ring */}
        <SegmentedRing total={initialValue} remaining={remaining} size={128} />
        
        {/* Center Content */}
        <motion.div
          className={`absolute inset-3 rounded-full flex flex-col items-center justify-center shadow-inner ${
            disabled
              ? "bg-gray-100"
              : "bg-gradient-to-br from-orange-50 to-orange-100"
          } ${isDragging ? "opacity-40" : ""}`}
        >
          {/* Initial number - always shown */}
          <span className={`text-3xl font-black ${disabled ? "text-gray-400" : "text-orange-600"}`}>
            {initialValue}
          </span>
          
          {/* Remaining indicator */}
          {!disabled && (
            <span className="text-xs text-orange-500 font-medium">
              {remaining} left
            </span>
          )}
          
          {disabled && (
            <span className="text-xs text-gray-400 font-medium">
              All moved!
            </span>
          )}
        </motion.div>

        {/* TAP BUTTON - Overlay on center */}
        <button
          onClick={disabled ? undefined : onTap}
          disabled={disabled}
          className={`absolute inset-3 rounded-full z-10 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-orange-500/10 active:bg-orange-500/20"
          }`}
        />

        {/* DRAG HANDLE - Bottom area */}
        {!disabled && (
          <motion.div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing touch-none shadow-lg border-2 border-orange-400 hover:from-orange-600 hover:to-orange-700 transition-colors z-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">{emoji}</span>
              <div className="flex gap-0.5">
                <div className="w-1 h-4 bg-orange-300 rounded-full" />
                <div className="w-1 h-4 bg-orange-300 rounded-full" />
                <div className="w-1 h-4 bg-orange-300 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Pulse animation when active */}
        {!disabled && !isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-orange-400"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Labels */}
      {!disabled && (
        <div className="mt-4 flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">👆</span>
            Tap
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">✋</span>
            Drag
          </span>
        </div>
      )}
    </div>
  );
}

// Droppable slot for individual number positions
function DroppableSlot({ 
  id, 
  num,
  isNextSlot,
  isFilled,
  isBridgePoint,
  isToTen,
  isAfterTen,
  isBiggerFilled,
  isTarget,
  fruitEmoji,
  countLabel,
  wrongDrop,
}: { 
  id: string;
  num: number;
  isNextSlot: boolean;
  isFilled: boolean;
  isBridgePoint: boolean;
  isToTen: boolean;
  isAfterTen: boolean;
  isBiggerFilled: boolean;
  isTarget: boolean;
  fruitEmoji: string;
  countLabel?: number;
  wrongDrop: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const isValidDrop = isOver && isNextSlot;
  const isInvalidDrop = isOver && !isNextSlot && !isFilled;

  return (
    <motion.div
      ref={setNodeRef}
      className={`flex-shrink-0 rounded-lg flex flex-col items-center justify-center font-bold border-2 transition-all relative ${
        isBridgePoint
          ? "w-11 h-14 text-sm bg-yellow-100 border-yellow-500 text-yellow-700 border-3 shadow-lg"
          : "w-9 h-12 text-xs"
      } ${
        isValidDrop
          ? "ring-4 ring-green-400 ring-opacity-70 scale-110 bg-green-100 border-green-400"
          : isInvalidDrop
          ? "ring-4 ring-red-400 ring-opacity-70 scale-95 bg-red-50 border-red-300"
          : !isBridgePoint && (
              isBiggerFilled
                ? "bg-green-100 border-green-400 text-green-700"
                : isToTen
                ? "bg-blue-100 border-blue-400 text-blue-700"
                : isAfterTen
                ? "bg-purple-100 border-purple-400 text-purple-700"
                : isNextSlot
                ? "bg-orange-50 border-orange-300 border-dashed text-orange-400"
                : isTarget && !isFilled
                ? "bg-pink-50 border-pink-300 text-pink-500 border-dashed"
                : "bg-gray-50 border-gray-200 text-gray-400"
          )
      }`}
      animate={wrongDrop ? { x: [-8, 8, -8, 8, 0], scale: [1, 0.9, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Count label above filled slots (1, 2, 3...) */}
      {countLabel !== undefined && countLabel > 0 && (
        <motion.div 
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full"
          initial={{ scale: 0, y: 5 }}
          animate={{ scale: 1, y: 0 }}
        >
          +{countLabel}
        </motion.div>
      )}
      
      {isFilled && <span className={isBridgePoint ? "text-lg" : "text-base"} style={{ lineHeight: 1 }}>{fruitEmoji}</span>}
      <span className={isBridgePoint ? "font-black" : ""}>{num}</span>
    </motion.div>
  );
}

export function BridgeToTen({
  num1,
  num2,
  onComplete,
  questionNumber,
  totalQuestions,
}: BridgeToTenProps) {
  const bigger = Math.max(num1, num2);
  const smaller = Math.min(num1, num2);
  const answer = num1 + num2;
  const toMakeTen = 10 - bigger;
  const remaining = smaller - toMakeTen;

  const [step, setStep] = useState<GameStep>("pick-bigger");
  const [wrongPick, setWrongPick] = useState(false);
  const [filledSlots, setFilledSlots] = useState<number[]>([]);
  const [movedCount, setMovedCount] = useState(0);
  const [bridgeReached, setBridgeReached] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const [flyingFruits, setFlyingFruits] = useState<FlyingFruit[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [wrongDropSlot, setWrongDropSlot] = useState<number | null>(null);

  const sourceRef = useRef<HTMLDivElement>(null);
  const numberLineRef = useRef<HTMLDivElement>(null);

  // The next slot to fill
  const nextSlotToFill = bigger + movedCount + 1;

  const { playSound } = useAudio();

  useEffect(() => {
    setStep("pick-bigger");
    setWrongPick(false);
    setFilledSlots([]);
    setMovedCount(0);
    setBridgeReached(false);
    setHintsUsed(0);
    setShowHint(false);
    setFlyingFruits([]);
  }, [num1, num2]);

  const handlePickNumber = useCallback((picked: number) => {
    if (picked === bigger) {
      playSound("correct");
      setStep("swap-animation");
      setTimeout(() => setStep("bridge-to-ten"), 1500);
    } else {
      playSound("wrong");
      setWrongPick(true);
      setTimeout(() => setWrongPick(false), 500);
    }
  }, [bigger, playSound]);

  const addOneToLine = useCallback(() => {
    if (movedCount >= smaller) return;

    const newMovedCount = movedCount + 1;
    const newSlotPosition = bigger + newMovedCount;

    const sourceRect = sourceRef.current?.getBoundingClientRect();
    const lineRect = numberLineRef.current?.getBoundingClientRect();
    
    if (sourceRect && lineRect) {
      const targetSlotIndex = newSlotPosition - 1;
      const slotWidth = lineRect.width / (answer + 1);
      const endX = lineRect.left + (targetSlotIndex * slotWidth) + (slotWidth / 2);
      const endY = lineRect.top + lineRect.height / 2;

      const newFruit: FlyingFruit = {
        id: Date.now(),
        startX: sourceRect.left + sourceRect.width / 2,
        startY: sourceRect.top + sourceRect.height / 2,
        endX,
        endY,
      };

      setFlyingFruits(prev => [...prev, newFruit]);
      setTimeout(() => {
        setFlyingFruits(prev => prev.filter(f => f.id !== newFruit.id));
      }, 500);
    }
    
    playSound("snap");
    setMovedCount(newMovedCount);
    setFilledSlots((prev) => [...prev, newSlotPosition]);

    if (newSlotPosition === 10 && !bridgeReached) {
      setBridgeReached(true);
      playSound("coin");
    }

    if (newMovedCount === smaller) {
      setTimeout(() => {
        setStep("complete");
        playSound("fanfare");
      }, 500);
    }
  }, [movedCount, smaller, bigger, bridgeReached, playSound, answer]);

  // Handle drag end - drop on specific slot
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!event.over) return;
    
    const droppedSlot = event.over.id as string;
    
    // Check if dropped on a slot
    if (droppedSlot.startsWith("slot-")) {
      const slotNum = parseInt(droppedSlot.replace("slot-", ""), 10);
      
      if (slotNum === nextSlotToFill) {
        // Correct slot!
        addOneToLine();
        playSound("correct");
      } else {
        // Wrong slot - bounce animation
        setWrongDropSlot(slotNum);
        playSound("wrong");
        setTimeout(() => setWrongDropSlot(null), 500);
      }
    }
  }, [addOneToLine, nextSlotToFill, playSound]);

  // Also allow tap/click to add
  const handleTapSource = useCallback(() => {
    if (movedCount < smaller) {
      addOneToLine();
    }
  }, [movedCount, smaller, addOneToLine]);

  // Handle "Next" button click
  const handleNext = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete({ correct: true, hintsUsed, timeSpent });
  }, [startTime, hintsUsed, onComplete]);

  const handleShowHint = useCallback(() => {
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
    playSound("pop");
    setTimeout(() => setShowHint(false), 4000);
  }, [playSound]);

  const getHintText = () => {
    if (step === "pick-bigger") {
      return `Which number is larger: ${num1} or ${num2}? Tap the bigger one!`;
    }
    if (movedCount < toMakeTen) {
      return `Drag or tap the ${smaller - movedCount} to move one to the number line. We need ${toMakeTen - movedCount} more to reach 10!`;
    }
    return `Great! Now add the remaining ${smaller - movedCount} to complete ${answer}!`;
  };

  const fruitEmoji = selectedIcon.emoji;
  const leftNodeValue = Math.min(movedCount, toMakeTen);
  const rightNodeValue = Math.max(0, movedCount - toMakeTen);
  const sourceRemaining = smaller - movedCount;

  return (
    <DndContext 
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="flex flex-col h-full p-4 gap-4 relative overflow-auto">
        <Sparkles active={step === "complete"} />

        {/* Flying fruits animation */}
        <AnimatePresence>
          {flyingFruits.map(fruit => (
            <motion.div
              key={fruit.id}
              className="fixed text-2xl z-50 pointer-events-none"
              initial={{ 
                left: fruit.startX - 16, 
                top: fruit.startY - 16,
                scale: 1.2,
              }}
              animate={{ 
                left: fruit.endX - 16, 
                top: fruit.endY - 16,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {fruitEmoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Drag Overlay */}
        <DragOverlay>
          {isDragging && (
            <div className="w-16 h-16 rounded-full bg-orange-400 border-4 border-orange-500 flex items-center justify-center text-2xl shadow-2xl">
              {fruitEmoji}
            </div>
          )}
        </DragOverlay>

        {/* Icon Picker Button - Top Left */}
        <button
          onClick={() => setShowIconPicker(true)}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl shadow-md border-2 border-gray-200 flex items-center justify-center text-xl hover:scale-110 transition-transform z-20"
          title="Choose icon"
        >
          {selectedIcon.emoji}
        </button>

        {/* Icon Picker Modal */}
        <AnimatePresence>
          {showIconPicker && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="absolute inset-0 bg-black/30"
                onClick={() => setShowIconPicker(false)}
              />
              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <button
                  onClick={() => setShowIconPicker(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  Choose your icon
                </h3>
                
                <div className="grid grid-cols-4 gap-3">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => {
                        setSelectedIcon(icon);
                        setShowIconPicker(false);
                      }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedIcon.id === icon.id
                          ? "bg-orange-100 border-2 border-orange-400 scale-110"
                          : "bg-gray-50 border-2 border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <span className="text-2xl">{icon.emoji}</span>
                      <span className="text-[10px] text-gray-500">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Header */}
        <div className="text-center py-1">
          <p className="text-sm text-gray-500">Question {questionNumber} of {totalQuestions}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Pick the bigger number */}
          {step === "pick-bigger" && (
          <motion.div
            key="pick-bigger"
            className="flex-1 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl font-bold text-gray-700">Which number is bigger?</h2>
            
            <div className="flex items-center gap-4 text-4xl font-bold">
              <motion.button
                onClick={() => handlePickNumber(num1)}
                className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border-4 transition-colors ${
                  wrongPick && num1 < num2
                    ? "bg-red-100 border-red-400"
                    : "bg-yellow-100 border-yellow-300 hover:border-yellow-400"
                }`}
                animate={wrongPick && num1 < num2 ? { x: [-5, 5, -5, 5, 0] } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {num1}
              </motion.button>
              
              <span className="text-gray-400">+</span>
              
              <motion.button
                onClick={() => handlePickNumber(num2)}
                className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border-4 transition-colors ${
                  wrongPick && num2 < num1
                    ? "bg-red-100 border-red-400"
                    : "bg-teal-100 border-teal-300 hover:border-teal-400"
                }`}
                animate={wrongPick && num2 < num1 ? { x: [-5, 5, -5, 5, 0] } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {num2}
              </motion.button>
            </div>

            <p className="text-gray-500 text-sm">Tap the bigger number!</p>
          </motion.div>
        )}

        {/* Step 2: Swap animation */}
        {step === "swap-animation" && (
          <motion.div
            key="swap"
            className="flex-1 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-green-600">Correct! Let&apos;s put the bigger number first.</h2>
            
            <div className="flex items-center gap-4 text-4xl font-bold">
              <motion.div
                className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border-4 bg-green-100 border-green-400"
                initial={{ x: num1 > num2 ? 0 : 120 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {bigger}
              </motion.div>
              
              <span className="text-gray-400">+</span>
              
              <motion.div
                className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border-4 bg-orange-100 border-orange-300"
                initial={{ x: num1 > num2 ? -120 : 0 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {smaller}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Bridge to 10 - TREE LAYOUT with DnD */}
        {(step === "bridge-to-ten" || step === "complete") && (
          <motion.div
            key="bridge"
            className="flex-1 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* ROW 1: Equation */}
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md text-center">
              <div className="flex items-center justify-center gap-3 text-2xl font-bold">
                <span className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-700">{bigger}</span>
                <span className="text-gray-400">+</span>
                <span className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center text-orange-700">{smaller}</span>
                <span className="text-gray-400">=</span>
                {step === "complete" ? (
                  <motion.span
                    className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-700"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                  >
                    {answer}
                  </motion.span>
                ) : (
                  <span className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center text-gray-400">?</span>
                )}
              </div>
            </div>

            {/* ROW 2: Decomposition Tree (like worksheet) */}
            {step !== "complete" && (
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex flex-col items-center">
                  {/* SOURCE NUMBER - Segmented ring with tap/drag */}
                  <div ref={sourceRef}>
                    <DraggableSource 
                      id="source-number"
                      initialValue={smaller}
                      remaining={sourceRemaining}
                      emoji={fruitEmoji}
                      disabled={sourceRemaining <= 0}
                      onTap={handleTapSource}
                    />
                  </div>

                  {/* CONNECTING LINES - SVG tree branches */}
                  <svg className="w-48 h-8 -my-1" viewBox="0 0 192 32">
                    <path 
                      d="M 96 0 L 96 16 L 48 32" 
                      stroke={leftNodeValue > 0 ? "#3B82F6" : "#CBD5E1"}
                      strokeWidth="3" 
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path 
                      d="M 96 0 L 96 16 L 144 32" 
                      stroke={rightNodeValue > 0 ? "#A855F7" : "#CBD5E1"}
                      strokeWidth="3" 
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* CHILD NODES - Left (to 10) and Right (after 10) */}
                  <div className="flex gap-16">
                    {/* Left node: "to 10" */}
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-3 shadow-md ${
                          leftNodeValue > 0 
                            ? "bg-blue-400 border-blue-500 text-white" 
                            : "bg-gray-100 border-gray-300 text-gray-400 border-dashed"
                        }`}
                        animate={leftNodeValue > 0 && leftNodeValue < toMakeTen ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {leftNodeValue}
                      </motion.div>
                      <span className="text-xs text-blue-600 font-semibold mt-1">to 10</span>
                      {leftNodeValue === toMakeTen && toMakeTen > 0 && (
                        <motion.span 
                          className="text-xs text-green-600 font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ✓ Done!
                        </motion.span>
                      )}
                    </div>

                    {/* Right node: "after 10" (the remainder) */}
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-3 shadow-md ${
                          rightNodeValue > 0 
                            ? "bg-purple-400 border-purple-500 text-white" 
                            : "bg-gray-100 border-gray-300 text-gray-400 border-dashed"
                        }`}
                        animate={rightNodeValue > 0 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {rightNodeValue}
                      </motion.div>
                      <span className="text-xs text-purple-600 font-semibold mt-1">after 10</span>
                    </div>
                  </div>

                  {/* Bridge reached celebration */}
                  <AnimatePresence>
                    {bridgeReached && (
                      <motion.div
                        className="mt-3 bg-green-100 px-4 py-2 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <span className="text-green-700 font-bold text-sm">
                          🎯 {bigger} + {toMakeTen} = 10! Now add the rest!
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ROW 3: Number Line - Individual drop zones */}
            <div 
              ref={numberLineRef}
              className="bg-white rounded-2xl p-4 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Number Line</span>
                {bridgeReached && (
                  <motion.span
                    className="text-sm font-bold text-green-600 flex items-center gap-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span>✨</span> 10 reached!
                  </motion.span>
                )}
              </div>
              
              {/* Number line with individual drop zones */}
              <div className="flex items-end gap-1 overflow-x-auto pb-2 pt-8">
                {Array.from({ length: Math.max(answer + 1, 12) }, (_, i) => {
                  const num = i + 1;
                  const isBiggerFilled = num <= bigger;
                  const isNewlyFilled = filledSlots.includes(num);
                  const isFilled = isBiggerFilled || isNewlyFilled;
                  const isBridgePoint = num === 10;
                  const isTarget = num === answer;
                  const isToTen = isNewlyFilled && num <= 10;
                  const isAfterTen = isNewlyFilled && num > 10;
                  const isNextSlot = num === nextSlotToFill && sourceRemaining > 0;
                  
                  // Calculate count label for newly filled slots (1, 2, 3...)
                  const slotIndex = filledSlots.indexOf(num);
                  const countLabel = slotIndex >= 0 ? slotIndex + 1 : undefined;
                  
                  // Show divider line between 10 and 11
                  const showDividerAfter = num === 10;
                  
                  return (
                    <div key={num} className="flex items-end relative">
                      {/* Arrow pointing down to 10 */}
                      {isBridgePoint && !isFilled && (
                        <motion.div 
                          className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center"
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <span className="text-yellow-600 text-xs font-bold">GOAL</span>
                          <span className="text-yellow-500 text-lg">⬇️</span>
                        </motion.div>
                      )}
                      
                      <DroppableSlot
                        id={`slot-${num}`}
                        num={num}
                        isNextSlot={isNextSlot}
                        isFilled={isFilled}
                        isBridgePoint={isBridgePoint}
                        isToTen={isToTen}
                        isAfterTen={isAfterTen}
                        isBiggerFilled={isBiggerFilled}
                        isTarget={isTarget}
                        fruitEmoji={fruitEmoji}
                        countLabel={countLabel}
                        wrongDrop={wrongDropSlot === num}
                      />
                      
                      {/* Divider line after 10 */}
                      {showDividerAfter && (
                        <div className="w-1 h-14 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-300 rounded-full mx-1 self-stretch" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drag hint */}
              {step === "bridge-to-ten" && sourceRemaining > 0 && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  🎯 Drag to slot <span className="font-bold text-orange-600">{nextSlotToFill}</span> or tap to auto-fill
                </p>
              )}

              {/* Live equation below number line */}
              {movedCount > 0 && step !== "complete" && (
                <motion.div 
                  className="mt-3 text-center text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">{bigger}</span>
                  <span className="text-gray-400 mx-1">+</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{leftNodeValue}</span>
                  {rightNodeValue > 0 && (
                    <>
                      <span className="text-gray-400 mx-1">+</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">{rightNodeValue}</span>
                    </>
                  )}
                  <span className="text-gray-400 mx-1">=</span>
                  <span className="text-gray-700 font-bold">{bigger + movedCount}</span>
                </motion.div>
              )}
            </div>

            {/* Completion celebration with NEXT button */}
            {step === "complete" && (
              <motion.div
                className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-2xl p-6 shadow-lg text-center border-2 border-green-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Amazing!</h2>
                <div className="bg-white rounded-xl p-4 shadow-inner mb-4">
                  <p className="text-lg text-gray-600 font-mono">
                    <span className="text-green-600 font-bold">{bigger}</span>
                    <span className="text-gray-400"> + </span>
                    <span className="text-orange-600 font-bold">{smaller}</span>
                    <span className="text-gray-400"> = </span>
                    <span className="text-green-600">{bigger}</span>
                    <span className="text-gray-400"> + </span>
                    <span className="text-blue-600">{toMakeTen}</span>
                    <span className="text-gray-400"> + </span>
                    <span className="text-purple-600">{remaining}</span>
                    <span className="text-gray-400"> = </span>
                    <span className="text-yellow-600 font-bold">10</span>
                    <span className="text-gray-400"> + </span>
                    <span className="text-purple-600">{remaining}</span>
                    <span className="text-gray-400"> = </span>
                    <span className="text-pink-600 font-black text-xl">{answer}</span>
                  </p>
                </div>

                {/* NEXT BUTTON */}
                <motion.button
                  onClick={handleNext}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {questionNumber < totalQuestions ? "Next Question →" : "Finish! 🎯"}
                </motion.button>

                <p className="text-xs text-gray-500 mt-3">
                  Take time to discuss how we solved this!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Button */}
      {step !== "complete" && step !== "swap-animation" && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={handleShowHint}
            className="px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl font-medium text-sm
              hover:bg-yellow-200 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💡 Need a hint?
          </motion.button>
        </motion.div>
      )}

      {/* Hint Display */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="fixed bottom-24 left-4 right-4 bg-yellow-50 border-2 border-yellow-300 
              rounded-2xl p-4 shadow-xl z-50 max-w-md mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <p className="text-center text-yellow-800 font-medium">
              💡 {getHintText()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </DndContext>
  );
}
