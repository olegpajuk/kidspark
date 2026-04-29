"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useChildStore } from "@/lib/stores/child-store";
import { useChildren } from "@/hooks/useChildren";

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊", rabbit: "🐰", bear: "🐻", owl: "🦉",
  lion: "🦁", penguin: "🐧", cat: "🐱", dog: "🐶",
};

const NAV_LINKS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/progress", label: "Statistics", icon: "📊" },
  { href: "/children", label: "Children", icon: "👧" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const GAME_SECTIONS = [
  {
    subject: "maths",
    label: "Maths",
    emoji: "🔢",
    color: "#FF6B6B",
    hub: "/games/maths",
    games: [
      { label: "Banana Bridge", href: "/games/banana-bridge" },
      { label: "Quick Math", href: "/games/quick-math" },
    ],
  },
  {
    subject: "english",
    label: "English",
    emoji: "📚",
    color: "#9B59B6",
    hub: "/games/english",
    games: [
      { label: "Flashcard Flip", href: "/games/flashcard-flip" },
      { label: "Missing Letter", href: "/games/missing-letter" },
      { label: "Spelling Bee", href: "/games/spelling-bee" },
      { label: "Word Match", href: "/games/word-match" },
      { label: "Word Categories", href: "/games/word-categories" },
      { label: "Rhyming Words", href: "/games/rhyming-words" },
      { label: "Letter Chain", href: "/games/letter-chain" },
      { label: "Crossword", href: "/games/crossword" },
      { label: "Word Search", href: "/games/word-search" },
      { label: "Sentence Builder", href: "/games/sentence-builder" },
      { label: "Synonym & Antonym", href: "/games/synonym-match" },
      { label: "Plural Practice", href: "/games/plural-practice" },
      { label: "Verb Tense", href: "/games/verb-tense" },
      { label: "Dictation", href: "/games/dictation" },
      { label: "Listen & Tap", href: "/games/listen-tap" },
      { label: "Pronunciation", href: "/games/pronunciation" },
      { label: "Speech Recognition", href: "/games/speech-games" },
    ],
  },
  {
    subject: "finance",
    label: "Finance",
    emoji: "💰",
    color: "#4ECDC4",
    hub: "/home",
    games: [],
  },
  {
    subject: "geography",
    label: "Geography",
    emoji: "🌍",
    color: "#3498DB",
    hub: "/home",
    games: [],
  },
  {
    subject: "computer",
    label: "Computer Science",
    emoji: "💻",
    color: "#2ECC71",
    hub: "/home",
    games: [],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { children } = useChildren();
  const { activeChild, setActiveChild } = useChildStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const handleNavClick = () => onClose?.();

  return (
    <div className="flex flex-col h-full py-6 px-4 gap-1">
      {/* Logo + close button (mobile) */}
      <div className="flex items-center justify-between mb-5 px-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="text-lg font-bold text-gray-800">KidSpark</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV_LINKS.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#FFD93D]/25 text-gray-900 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Games section */}
      <div className="mt-4 border-t pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          Games
        </p>
        <div className="flex flex-col gap-0.5">
          {GAME_SECTIONS.map((section) => {
            const isExpanded = expandedSection === section.subject;
            const hasGames = section.games.length > 0;

            return (
              <div key={section.subject}>
                <button
                  onClick={() => {
                    if (hasGames) {
                      setExpandedSection(isExpanded ? null : section.subject);
                    } else {
                      router.push(section.hub);
                      onClose?.();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <span className="text-base">{section.emoji}</span>
                  <span className="flex-1 text-left">{section.label}</span>
                  {hasGames ? (
                    isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <span className="text-[10px] text-gray-300 font-normal">soon</span>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && hasGames && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {/* Hub link */}
                      <Link
                        href={section.hub}
                        onClick={handleNavClick}
                        className="flex items-center gap-2 pl-10 pr-3 py-1.5 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: section.color }}
                      >
                        All {section.label} Games →
                      </Link>
                      {/* Individual games */}
                      {section.games.map((game) => (
                        <Link
                          key={game.href}
                          href={game.href}
                          onClick={handleNavClick}
                          className={`flex items-center gap-2 pl-10 pr-3 py-1.5 text-xs rounded-lg transition-colors ${
                            pathname === game.href
                              ? "bg-gray-100 font-semibold text-gray-900"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          }`}
                        >
                          {game.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active child selector */}
      {children.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            Active child
          </p>
          <div className="flex flex-col gap-0.5">
            {children.map((child) => {
              const isActive = activeChild?.id === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => { setActiveChild(child); onClose?.(); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                    isActive
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg leading-none">
                    {AVATAR_EMOJI[child.avatarId] ?? "🧒"}
                  </span>
                  <span className="truncate flex-1">{child.name}</span>
                  {isActive && <span className="text-amber-500 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <span>🚪</span>
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile burger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-white rounded-xl shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col shadow-sm shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
}
