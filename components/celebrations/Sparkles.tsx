"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  duration: number;
}

interface SparklesProps {
  /** Whether sparkles are visible */
  active: boolean;
  /** Optional origin point (default: centre of parent) */
  originX?: number;
  originY?: number;
  /** Number of particles to emit */
  count?: number;
  /** Colour palette — defaults to child-friendly rainbow */
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "#FFD93D", // yellow
  "#FF6B6B", // coral
  "#6BCB77", // green
  "#4ECDC4", // teal
  "#FF8C42", // orange
  "#9B59B6", // purple
];

function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    angle: Math.random() * 360,
    distance: 40 + Math.random() * 80,
    duration: 0.5 + Math.random() * 0.5,
  }));
}

/**
 * Burst of sparkle particles originating from a single point.
 * Typically triggered on a correct answer.
 *
 * Usage:
 * ```tsx
 * <div className="relative">
 *   <Sparkles active={isCorrect} />
 *   <YourContent />
 * </div>
 * ```
 */
export function Sparkles({
  active,
  originX,
  originY,
  count = 14,
  colors = DEFAULT_COLORS,
  className = "",
}: SparklesProps) {
  const particles = useRef<Particle[]>([]);

  if (active && particles.current.length === 0) {
    particles.current = generateParticles(count, colors);
  }
  if (!active) {
    particles.current = [];
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}
      aria-hidden
    >
      <AnimatePresence>
        {active &&
          particles.current.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance + p.x;
            const ty = Math.sin(rad) * p.distance + p.y;
            const startX = originX ?? "50%";
            const startY = originY ?? "50%";

            return (
              <motion.span
                key={p.id}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: startX,
                  y: startY,
                }}
                animate={{
                  opacity: 0,
                  scale: [0, 1.2, 0.8],
                  x: `calc(${startX} + ${tx}px)`,
                  y: `calc(${startY} + ${ty}px)`,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: p.duration, ease: "easeOut" }}
                className="absolute block rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  top: 0,
                  left: 0,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}
