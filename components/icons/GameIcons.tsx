"use client";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function StarIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function HeartIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function TrophyIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

export function CrownIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 1L9 9l-7-3 3 14h14l3-14-7 3-3-8zm0 4.5l1.8 4.8 4.2-1.8-1.8 8.5H7.8l-1.8-8.5 4.2 1.8L12 5.5z" />
    </svg>
  );
}

export function LightningIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
  );
}

export function RocketIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2.5c2 0 6.5 1.5 6.5 8 0 2.5-1 5-2.5 7l-1 1.5v3l-3 2-3-2v-3L8 17.5c-1.5-2-2.5-4.5-2.5-7 0-6.5 4.5-8 6.5-8zm0 3a2 2 0 100 4 2 2 0 000-4zM7 22l-3-1.5-1.5 1.5L5 20l2 2zm10 0l2-2 2.5-1.5L20 20l-3 2z" />
    </svg>
  );
}

export function GemIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M6 3l-6 8 12 10 12-10-6-8H6zm1.5 2h9l3.75 5-9.75 8.2L1.75 10 5.5 5h2z" />
    </svg>
  );
}

export function FlameIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 23c-4.4 0-8-3.6-8-8 0-3.5 2.2-6.2 4-8.5.6-.8 1.2-1.5 1.6-2.2.2-.3.5-.5.9-.5s.7.2.9.5c.4.7 1 1.4 1.6 2.2 1.8 2.3 4 5 4 8.5 0 4.4-3.6 8-8 8zm0-16c-.5.8-1.1 1.6-1.7 2.4-1.6 2-3.3 4.3-3.3 6.6 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.3-1.7-4.6-3.3-6.6-.6-.8-1.2-1.6-1.7-2.4z" />
    </svg>
  );
}

export function MedalIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2L9 6.5 4 7l3.5 3.5L6.5 16 12 13l5.5 3-1-5.5L20 7l-5-.5L12 2zm0 4.5L13 8l1.5.2-.8 1.3.2 1.5-1.4-.7-1.4.7.2-1.5-.8-1.3L12 8l1-1.5z" />
      <path d="M12 14.5V22l-3-2-3 2v-6.5l3 1.5 3-1.5zM15 22v-7.5l3 1.5v6l-3-2v2z" />
    </svg>
  );
}

export function SparkleIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 3L9 12l-9 3 9 3 3 9 3-9 9-3-9-3-3-9z" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

export function XCircleIcon({ size = 24, color = "currentColor", className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );
}

// Animated versions with Framer Motion
export { AnimatedStar, AnimatedHeart, AnimatedTrophy } from "./AnimatedGameIcons";
