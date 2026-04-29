"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useChildStore } from "@/lib/stores/child-store";
import { createChild } from "@/lib/firebase/children";
import type { AvatarId, SubjectId, ChildLevel } from "@/types";

const AVATARS: { id: AvatarId; emoji: string; label: string }[] = [
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit" },
  { id: "bear", emoji: "🐻", label: "Bear" },
  { id: "owl", emoji: "🦉", label: "Owl" },
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "penguin", emoji: "🐧", label: "Penguin" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "dog", emoji: "🐶", label: "Dog" },
];

const SUBJECTS: {
  id: SubjectId;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { id: "maths", emoji: "🔢", label: "Maths", color: "#FF6B6B" },
  { id: "finance", emoji: "💰", label: "Finance", color: "#4ECDC4" },
  { id: "english", emoji: "📚", label: "English", color: "#9B59B6" },
  { id: "geography", emoji: "🌍", label: "Geography", color: "#3498DB" },
  { id: "computer", emoji: "💻", label: "Computer Science", color: "#2ECC71" },
];

const TIME_LIMITS: { label: string; value: number | null }[] = [
  { label: "No limit", value: null },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

const ALL_SUBJECT_IDS: SubjectId[] = ["maths", "finance", "english", "geography", "computer"];

function buildDefaultLevels(): Record<SubjectId, ChildLevel> {
  return Object.fromEntries(
    ALL_SUBJECT_IDS.map((subject) => [
      subject,
      { subject, xp: 0, level: 1, adaptiveDifficulty: 1 },
    ])
  ) as Record<SubjectId, ChildLevel>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const setActiveChild = useChildStore((s) => s.setActiveChild);

  // ALL hooks must be called before any conditional returns
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>("fox");
  const [unlockedSubjects, setUnlockedSubjects] = useState<SubjectId[]>(
    ALL_SUBJECT_IDS
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

  function toggleSubject(id: SubjectId) {
    setUnlockedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!user) {
      setError("Not signed in. Please refresh the page and try again.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const childId = await createChild({
        parentUid: user.uid,
        name: name.trim(),
        dateOfBirth,
        avatarId,
        preferences: {
          soundEnabled: true,
          musicEnabled: true,
          unlockedSubjects,
          dailyTimeLimitMinutes: timeLimitMinutes,
          preferredDifficulty: 1,
        },
      });

      setActiveChild({
        id: childId,
        name: name.trim(),
        avatarId,
        starBalance: 0,
        levels: buildDefaultLevels(),
      });

      setStep(3);
    } catch (err) {
      console.error("Failed to create child profile:", err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code?.includes("permission-denied")) {
        setError("Permission denied. Please sign out and sign in again.");
      } else {
        setError("Could not save profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  const step1Valid = name.trim().length >= 2 && dateOfBirth.length > 0;
  const step2Valid = unlockedSubjects.length >= 1;

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFD93D] shadow-lg mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">KidSpark</h1>
          <p className="text-gray-500 mt-1 text-sm">Let&apos;s get started</p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-[#FFD93D]"
                    : s < step
                    ? "w-4 bg-[#FFD93D]/60"
                    : "w-4 bg-gray-200"
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-gray-400">
              Step {step} of 2
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ── Step 1: Child profile ── */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Add your child 👶
              </h2>
              <p className="text-gray-500 text-sm mb-7">
                Tell us a bit about them
              </p>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="child-name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Child&apos;s name
                  </label>
                  <input
                    id="child-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Emma"
                    maxLength={40}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD93D] focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Date of birth */}
                <div>
                  <label
                    htmlFor="child-dob"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Date of birth
                  </label>
                  <input
                    id="child-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FFD93D] focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Avatar */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Pick an avatar
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATARS.map(({ id, emoji, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setAvatarId(id)}
                        aria-label={label}
                        aria-pressed={avatarId === id}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all duration-150 ${
                          avatarId === id
                            ? "border-[#FFD93D] bg-[#FFD93D]/15 scale-105 shadow-sm"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-3xl leading-none">{emoji}</span>
                        <span className="text-xs text-gray-500">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="mt-8 w-full py-3.5 rounded-xl bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}

          {/* ── Step 2: Preferences ── */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Set preferences 🎯
              </h2>
              <p className="text-gray-500 text-sm mb-7">
                Customise {name}&apos;s learning experience
              </p>

              <div className="space-y-7">
                {/* Subjects */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Unlock subjects
                  </p>
                  <div className="space-y-2">
                    {SUBJECTS.map(({ id, emoji, label, color }) => {
                      const selected = unlockedSubjects.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleSubject(id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left font-medium text-sm ${
                            selected
                              ? "border-transparent text-white"
                              : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                          }`}
                          style={selected ? { backgroundColor: color } : {}}
                        >
                          <span className="text-xl leading-none">{emoji}</span>
                          <span className="flex-1">{label}</span>
                          <span className="text-base w-5 text-center">
                            {selected ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {unlockedSubjects.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      Select at least one subject.
                    </p>
                  )}
                </div>

                {/* Daily time limit */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Daily time limit
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_LIMITS.map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setTimeLimitMinutes(value)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          timeLimitMinutes === value
                            ? "border-[#FFD93D] bg-[#FFD93D]/15 text-gray-900 font-semibold"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!step2Valid || saving}
                  className="flex-1 py-3.5 rounded-xl bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating profile…" : "Create profile ✓"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="text-7xl mb-5">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {name} is all set!
              </h2>
              <p className="text-gray-500 mb-8 text-sm">
                Their profile has been created. Time to start learning!
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-3.5 rounded-xl bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-semibold text-sm transition-colors"
              >
                Go to dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
