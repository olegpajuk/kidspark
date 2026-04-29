"use client";

import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useRef, useEffect, useState } from "react";

export type AnimationType = 
  | "celebration" 
  | "correct" 
  | "wrong" 
  | "star" 
  | "trophy"
  | "fireworks"
  | "confetti"
  | "loading"
  | "success"
  | "rocket"
  | "hearts"
  | "thumbsUp";

interface LottiePlayerProps {
  animation: AnimationType;
  loop?: boolean;
  autoplay?: boolean;
  size?: number;
  className?: string;
  onComplete?: () => void;
}

const ANIMATION_URLS: Record<AnimationType, string> = {
  celebration: "https://lottie.host/embed/e8c97583-e68c-45bb-9c4a-99a7bec2d22b/WKVPYYAz2s.json",
  correct: "https://lottie.host/embed/7c0d18d8-8ab2-4e2c-8b5e-0b5e0f5f5f5f/check.json",
  wrong: "https://lottie.host/embed/a1b2c3d4-5678-90ab-cdef-1234567890ab/wrong.json",
  star: "https://lottie.host/embed/b8d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/star.json",
  trophy: "https://lottie.host/embed/c8d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/trophy.json",
  fireworks: "https://lottie.host/embed/d8d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/fireworks.json",
  confetti: "https://lottie.host/embed/e8d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/confetti.json",
  loading: "https://lottie.host/embed/f8d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/loading.json",
  success: "https://lottie.host/embed/08d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/success.json",
  rocket: "https://lottie.host/embed/18d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/rocket.json",
  hearts: "https://lottie.host/embed/28d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/hearts.json",
  thumbsUp: "https://lottie.host/embed/38d5e8e0-6a0e-4c5e-9f5e-0f5e0f5e0f5e/thumbsup.json",
};

export function LottiePlayer({
  animation,
  loop = false,
  autoplay = true,
  size = 200,
  className = "",
  onComplete,
}: LottiePlayerProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const localPath = `/animations/${animation}.json`;
        const res = await fetch(localPath);
        if (res.ok) {
          const data = await res.json();
          setAnimationData(data);
          return;
        }
      } catch {
        // Try fallback URL
      }

      // Fallback to embedded simple animations
      const fallbackAnimations = getFallbackAnimation(animation);
      if (fallbackAnimations) {
        setAnimationData(fallbackAnimations);
      } else {
        setError(true);
      }
    };

    loadAnimation();
  }, [animation]);

  if (error || !animationData) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {getEmojiFor(animation)}
      </div>
    );
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width: size, height: size }}
      className={className}
      onComplete={onComplete}
    />
  );
}

function getEmojiFor(animation: AnimationType): string {
  const emojiMap: Record<AnimationType, string> = {
    celebration: "🎉",
    correct: "✅",
    wrong: "❌",
    star: "⭐",
    trophy: "🏆",
    fireworks: "🎆",
    confetti: "🎊",
    loading: "⏳",
    success: "🎯",
    rocket: "🚀",
    hearts: "💖",
    thumbsUp: "👍",
  };
  return emojiMap[animation] || "✨";
}

function getFallbackAnimation(type: AnimationType): object | null {
  // Simple inline Lottie animations as fallbacks
  const animations: Partial<Record<AnimationType, object>> = {
    correct: createCheckmarkAnimation(),
    star: createStarAnimation(),
    celebration: createConfettiAnimation(),
  };
  return animations[type] || null;
}

function createCheckmarkAnimation(): object {
  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Checkmark",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Check",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ind: 0,
                ty: "sh",
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0], [0, 0], [0, 0]],
                    o: [[0, 0], [0, 0], [0, 0]],
                    v: [[-35, 0], [-10, 25], [40, -30]],
                    c: false,
                  },
                },
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.8, 0.2, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 12 },
                lc: 2,
                lj: 2,
              },
              {
                ty: "tm",
                s: { a: 0, k: 0 },
                e: {
                  a: 1,
                  k: [
                    { t: 0, s: [0], e: [100] },
                    { t: 30, s: [100] },
                  ],
                },
                o: { a: 0, k: 0 },
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
            ],
            nm: "Check Shape",
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [0, 0, 100], e: [110, 110, 100] },
              { t: 15, s: [110, 110, 100], e: [100, 100, 100] },
              { t: 25, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              { ty: "el", d: 1, s: { a: 0, k: [120, 120] }, p: { a: 0, k: [0, 0] } },
              { ty: "fl", c: { a: 0, k: [0.85, 1, 0.85, 1] }, o: { a: 0, k: 100 } },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
            ],
            nm: "Circle Shape",
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
      },
    ],
  };
}

function createStarAnimation(): object {
  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Star",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Star",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [-20], e: [20] },
              { t: 30, s: [20], e: [-20] },
              { t: 60, s: [-20], e: [0] },
              { t: 90, s: [0] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [0, 0, 100], e: [120, 120, 100] },
              { t: 20, s: [120, 120, 100], e: [100, 100, 100] },
              { t: 35, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 5 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 25 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 55 },
                os: { a: 0, k: 0 },
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.84, 0, 1] },
                o: { a: 0, k: 100 },
              },
              {
                ty: "st",
                c: { a: 0, k: [0.9, 0.7, 0, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 3 },
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
            ],
            nm: "Star Shape",
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
      },
    ],
  };
}

function createConfettiAnimation(): object {
  const particles = [];
  const colors = [
    [1, 0.4, 0.4, 1], // Red
    [0.4, 1, 0.4, 1], // Green
    [0.4, 0.4, 1, 1], // Blue
    [1, 1, 0.4, 1],   // Yellow
    [1, 0.4, 1, 1],   // Pink
    [0.4, 1, 1, 1],   // Cyan
  ];

  for (let i = 0; i < 20; i++) {
    const startX = 100 + (Math.random() - 0.5) * 40;
    const endX = startX + (Math.random() - 0.5) * 150;
    const endY = 100 + Math.random() * 120;
    const color = colors[i % colors.length];
    const delay = Math.random() * 10;
    const size = 8 + Math.random() * 8;

    particles.push({
      ddd: 0,
      ind: i + 1,
      ty: 4,
      nm: `Particle ${i}`,
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: delay, s: [0], e: [100] },
            { t: delay + 5, s: [100] },
            { t: 50, s: [100], e: [0] },
            { t: 60, s: [0] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: delay, s: [0], e: [360 * (Math.random() > 0.5 ? 1 : -1)] },
            { t: 60, s: [360 * (Math.random() > 0.5 ? 1 : -1)] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: delay, s: [startX, 50, 0], e: [endX, endY, 0] },
            { t: 60, s: [endX, endY, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [size, size * 0.6] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: color }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: "Confetti",
        },
      ],
      ip: 0,
      op: 70,
      st: 0,
    });
  }

  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 70,
    w: 200,
    h: 200,
    nm: "Confetti",
    ddd: 0,
    assets: [],
    layers: particles,
  };
}

export default LottiePlayer;
