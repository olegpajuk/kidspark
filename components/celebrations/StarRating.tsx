"use client";

import { motion } from "framer-motion";

interface StarRatingProps {
  /** 0–3 stars earned */
  stars: 0 | 1 | 2 | 3;
  /** Whether to animate stars in sequentially */
  animate?: boolean;
  /** Size of each star in pixels (default 56) */
  size?: number;
  className?: string;
}

const STAR_DELAY = 0.25; // seconds between each star reveal

function Star({
  filled,
  index,
  animate,
  size,
}: {
  filled: boolean;
  index: number;
  animate: boolean;
  size: number;
}) {
  // The middle star (index 1) is slightly larger — classic 1-3 star layout
  const scale = index === 1 ? 1.2 : 1;

  return (
    <motion.div
      initial={animate ? { scale: 0, rotate: -20, opacity: 0 } : undefined}
      animate={
        animate
          ? {
              scale: filled ? scale : scale * 0.85,
              rotate: 0,
              opacity: 1,
            }
          : undefined
      }
      transition={
        animate
          ? {
              delay: index * STAR_DELAY,
              type: "spring",
              damping: 12,
              stiffness: 260,
            }
          : undefined
      }
      style={{ transform: `scale(${scale})` }}
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className="drop-shadow-md"
      >
        {filled ? (
          <>
            {/* Filled star with gradient shine */}
            <defs>
              <linearGradient id={`star-fill-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE566" />
                <stop offset="100%" stopColor="#FFAA00" />
              </linearGradient>
            </defs>
            <path
              d="M24 4l5.09 10.26L40 15.27l-8 7.79 1.89 11L24 28.9l-9.89 5.16L16 23.06l-8-7.79 10.91-1.01L24 4z"
              fill={`url(#star-fill-${index})`}
              stroke="#F59E0B"
              strokeWidth="1"
            />
            {/* Shine highlight */}
            <ellipse cx="20" cy="16" rx="4" ry="2.5" fill="white" opacity="0.35" transform="rotate(-20 20 16)" />
          </>
        ) : (
          <path
            d="M24 4l5.09 10.26L40 15.27l-8 7.79 1.89 11L24 28.9l-9.89 5.16L16 23.06l-8-7.79 10.91-1.01L24 4z"
            fill="#E5E7EB"
            stroke="#D1D5DB"
            strokeWidth="1"
          />
        )}
      </svg>
    </motion.div>
  );
}

/**
 * 1-3 star rating display with optional pop-in animation.
 * Used in the session complete overlay and game history.
 *
 * ```tsx
 * <StarRating stars={2} animate />
 * ```
 */
export function StarRating({
  stars,
  animate = false,
  size = 56,
  className = "",
}: StarRatingProps) {
  return (
    <div
      className={`flex items-end justify-center gap-1 ${className}`}
      aria-label={`${stars} out of 3 stars`}
    >
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          filled={stars > i}
          index={i}
          animate={animate}
          size={i === 1 ? Math.round(size * 1.2) : size}
        />
      ))}
    </div>
  );
}
