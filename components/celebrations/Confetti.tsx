"use client";

import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  /** Fire confetti immediately on mount */
  autoFire?: boolean;
  /** Particle count (default 120) */
  particleCount?: number;
  /** Spread angle in degrees (default 100) */
  spread?: number;
  /** Starting y-origin 0–1 (default 0.6 — slightly above centre) */
  originY?: number;
  /** Custom colours — defaults to child-friendly palette */
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#FFD93D",
  "#FF6B6B",
  "#6BCB77",
  "#4ECDC4",
  "#FF8C42",
  "#9B59B6",
  "#ffffff",
];

/**
 * Wrapper around canvas-confetti.
 *
 * - Mount with `autoFire` to trigger once on appearance (session complete overlay).
 * - Or call the imperative `fire()` function via a ref:
 *   ```tsx
 *   const confettiRef = useRef<{ fire: () => void }>(null);
 *   <Confetti ref={confettiRef} />
 *   confettiRef.current?.fire();
 *   ```
 */
export function Confetti({
  autoFire = false,
  particleCount = 120,
  spread = 100,
  originY = 0.6,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const hasFired = useRef(false);

  const fire = useCallback(() => {
    // Fire from both sides for a fuller effect
    confetti({
      particleCount: Math.floor(particleCount * 0.6),
      angle: 60,
      spread,
      origin: { x: 0, y: originY },
      colors,
      scalar: 1.1,
    });
    confetti({
      particleCount: Math.floor(particleCount * 0.6),
      angle: 120,
      spread,
      origin: { x: 1, y: originY },
      colors,
      scalar: 1.1,
    });

    // Second wave for a 3-star celebration
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount * 0.4),
        angle: 90,
        spread: spread * 0.8,
        origin: { x: 0.5, y: 0.5 },
        colors,
        scalar: 0.9,
        startVelocity: 25,
      });
    }, 350);
  }, [particleCount, spread, originY, colors]);

  useEffect(() => {
    if (autoFire && !hasFired.current) {
      hasFired.current = true;
      // Small delay so the overlay has time to render before firing
      const t = setTimeout(fire, 150);
      return () => clearTimeout(t);
    }
  }, [autoFire, fire]);

  // This component renders nothing — confetti is drawn on a global canvas
  // managed by the canvas-confetti library.
  return null;
}
