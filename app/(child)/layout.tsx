"use client";

export const dynamic = "force-dynamic";

import { useRouter, usePathname } from "next/navigation";
import { useChildStore } from "@/lib/stores/child-store";

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊",
  rabbit: "🐰",
  bear: "🐻",
  owl: "🦉",
  lion: "🦁",
  penguin: "🐧",
  cat: "🐱",
  dog: "🐶",
};

const NAV_ITEMS = [
  { href: "/home", label: "Home", emoji: "🏠" },
  { href: "/adventure", label: "Adventure", emoji: "🗺️" },
  { href: "/rewards", label: "Rewards", emoji: "🎁" },
];

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeChild } = useChildStore();

  // Hide bottom nav in games
  const isInGame = pathname?.startsWith("/games/");

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Child-friendly sticky header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF8E7] rounded-xl flex items-center justify-center text-2xl border border-[#FFD93D]/30">
            {activeChild
              ? (AVATAR_EMOJI[activeChild.avatarId] ?? "🧒")
              : "✨"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {activeChild?.name ?? "KidSpark"}
            </p>
            <p className="text-xs text-amber-600 font-medium leading-tight">
              ⭐ {activeChild?.starBalance ?? 0} stars
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
        >
          Parent view
        </button>
      </header>

      <main className={isInGame ? "" : "pb-20"}>{children}</main>

      {/* Bottom navigation - hide in games */}
      {!isInGame && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-20">
          <div className="max-w-lg mx-auto flex justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
                    isActive
                      ? "text-amber-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
