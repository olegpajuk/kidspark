"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  CoinsIcon,
  GlobeIcon,
  MonitorIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: "intro" as const,
    title: "Make learning an adventure",
    body: "KidSpark turns maths, reading, geography, and more into exciting games for children aged 5–12. Every quiz, every challenge, every game — designed to build real skills while kids have a blast.\n\nLearning shouldn't feel like homework. KidSpark makes it feel like play.",
    icon: SparklesIcon,
    gradient: "from-yellow-400 to-amber-500",
    bg: "from-yellow-50 via-amber-50 to-orange-50",
    emoji: "🌟",
  },
  {
    id: "parent" as const,
    title: "Built for parents, loved by kids",
    body: "You're in full control. Create your child's profile, choose their subjects, set daily learning limits, and track progress from your parent dashboard.\n\nNo ads. No inappropriate content. No rabbit holes. Just focused, joyful learning.",
    icon: ShieldCheckIcon,
    gradient: "from-blue-400 to-indigo-500",
    bg: "from-blue-50 via-indigo-50 to-violet-50",
    emoji: "🛡️",
  },
  {
    id: "subjects" as const,
    title: "Five subjects. Endless possibilities.",
    body: "Every subject is a world to explore — and your child levels up their skills while they play.",
    icon: BookOpenIcon,
    gradient: "from-violet-400 to-fuchsia-500",
    bg: "from-violet-50 via-fuchsia-50 to-pink-50",
    emoji: "📚",
    bullets: [
      { Icon: BrainIcon, text: "Maths adventures", color: "text-yellow-500" },
      { Icon: CoinsIcon, text: "Money & finance", color: "text-green-500" },
      { Icon: BookOpenIcon, text: "English & reading", color: "text-blue-500" },
      { Icon: GlobeIcon, text: "World geography", color: "text-teal-500" },
      { Icon: MonitorIcon, text: "Coding basics", color: "text-violet-500" },
      { Icon: TrophyIcon, text: "Rewards & streaks", color: "text-orange-500" },
    ],
  },
  {
    id: "start" as const,
    title: "Start your child's learning journey",
    body: "Create your parent account in seconds — it's free to get started. Add your child, pick their subjects, and they can begin their adventure right away.",
    icon: RocketIcon,
    gradient: "from-sky-400 to-cyan-500",
    bg: "from-sky-50 via-cyan-50 to-teal-50",
    emoji: "🚀",
    isCta: true,
  },
] as const;

export function WelcomeLanding() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const total = SLIDES.length;
  const slide = SLIDES[index];

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const Icon = slide.icon;

  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] flex-col overflow-hidden transition-colors duration-700 bg-gradient-to-br",
        slide.bg
      )}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFD93D] shadow-md">
            <span className="text-lg leading-none">✨</span>
          </div>
          <span className="text-lg font-bold text-gray-800">KidSpark</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-600 hover:text-gray-900"
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-[#FFD93D] text-gray-900 hover:bg-[#FFC200] shadow-sm"
            render={<Link href="/signup" />}
          >
            Sign up free
          </Button>
        </div>
      </header>

      {/* Main slide area */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-4 sm:px-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={reduceMotion ? false : { opacity: 0, x: 32 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="flex flex-col items-center text-center"
            >
              {/* Slide visual */}
              <div
                className={cn(
                  "mb-6 flex h-32 w-full items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg",
                  slide.gradient
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-5xl" aria-hidden>
                    {slide.emoji}
                  </span>
                  <Icon
                    className="size-5 text-white/70"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {slide.title}
              </h1>

              <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                {slide.body.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {"bullets" in slide && slide.bullets && (
                <ul className="mt-6 grid w-full grid-cols-2 gap-2.5 text-left">
                  {slide.bullets.map(({ Icon: B, text, color }) => (
                    <li
                      key={text}
                      className="flex items-center gap-2.5 rounded-2xl bg-white/80 px-3 py-2.5 shadow-sm ring-1 ring-black/5 backdrop-blur-sm"
                    >
                      <B
                        className={cn("size-4 shrink-0", color)}
                        strokeWidth={1.5}
                      />
                      <span className="text-xs font-medium text-gray-700 sm:text-sm">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {"isCta" in slide && slide.isCta && (
                <div className="mt-8 flex w-full flex-col gap-3">
                  <Button
                    className="h-12 w-full rounded-2xl bg-[#FFD93D] text-base font-semibold text-gray-900 shadow-md hover:bg-[#FFC200]"
                    render={<Link href="/signup" />}
                  >
                    Get started free
                    <ArrowRightIcon className="ml-1 size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-2xl bg-white/70 backdrop-blur-sm"
                    render={<Link href="/login" />}
                  >
                    I already have an account
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIndex(2)}
                    className="text-center text-xs font-medium text-gray-500 underline-offset-4 hover:text-gray-800 hover:underline"
                  >
                    Back to tour
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-gray-700"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>

          {/* Back / Next buttons (hidden on CTA slide) */}
          {"isCta" in slide && slide.isCta ? null : (
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl bg-white/70 backdrop-blur-sm"
                disabled={index === 0}
                onClick={goPrev}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl bg-[#FFD93D] text-gray-900 hover:bg-[#FFC200]"
                onClick={goNext}
              >
                Next
                <ArrowRightIcon className="ml-1 size-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-5 pb-6 text-center sm:px-8">
        <p className="text-[11px] text-gray-500">
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-gray-800"
          >
            Privacy Policy
          </Link>
          {" · "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-gray-800"
          >
            Terms of Use
          </Link>
          {" · "}
          <a
            href="mailto:support@kidspark.app"
            className="underline underline-offset-2 hover:text-gray-800"
          >
            Contact
          </a>
        </p>
      </footer>
    </div>
  );
}
