"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  CoinsIcon,
  LineChartIcon,
  PiggyBankIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WalletIcon,
  BrainIcon,
  BookOpenIcon,
  TrophyIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Firebase Auth
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  handleGoogleRedirectResult,
} from "@/lib/firebase/auth";
import { getIdToken } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/config";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal-versions";

// Types
type Step = "intro" | "terms" | "auth";
type AuthMode = "login" | "signup";

// Slide Data
const SLIDES = [
  {
    id: "finance",
    title: "Financial Literacy for Kids",
    body: "Give your child a head start with interactive games that teach them about saving, budgeting, and the value of money. Important skills for a lifetime.",
    icon: PiggyBankIcon,
    image: "https://images.unsplash.com/photo-1579621970588-a3f5ce5a08ae?auto=format&fit=crop&q=80&w=800",
    bullets: [
      { Icon: CoinsIcon, text: "Counting coins & notes" },
      { Icon: WalletIcon, text: "Wants vs. Needs" },
      { Icon: LineChartIcon, text: "Basic budgeting" },
      { Icon: TrophyIcon, text: "Earn rewards" },
    ],
  },
  {
    id: "subjects",
    title: "More Than Just Money",
    body: "KidSpark also covers essential subjects like Maths, Reading, and Geography. Turn screen time into productive, educational playtime.",
    icon: BrainIcon,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    bullets: [
      { Icon: BrainIcon, text: "Maths adventures" },
      { Icon: BookOpenIcon, text: "English & reading" },
    ],
  },
  {
    id: "parents",
    title: "Safe & Parent-Controlled",
    body: "You're in full control. Track their progress, manage their subjects, and rest easy knowing it's an ad-free, 100% safe environment.",
    icon: ShieldCheckIcon,
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800",
  },
];

// API Helpers
async function createSession() {
  const auth = getClientAuth();
  if (!auth.currentUser) throw new Error("No authenticated user");
  const idToken = await getIdToken(auth.currentUser);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to create session");
}

async function recordConsent(marketingConsent: boolean): Promise<void> {
  const auth = getClientAuth();
  if (!auth.currentUser) throw new Error("No authenticated user");
  const idToken = await getIdToken(auth.currentUser);
  const res = await fetch("/api/user/consent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      childDataConsent: true,
      marketingConsent,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to record consent");
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  // Navigation State
  const [step, setStep] = useState<Step>("intro");
  const [slideIndex, setSlideIndex] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  // Terms State
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentChildData, setConsentChildData] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const consentOk = consentTerms && consentChildData;

  // Auth Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  const totalSlides = SLIDES.length;

  useEffect(() => {
    async function checkRedirectResult() {
      try {
        const user = await handleGoogleRedirectResult();
        if (user) {
          // If they just signed up or logged in via redirect
          // We can't easily tell if they are new, so we'll just record marketing consent (it might be false if they didn't check it, but that's fine for redirect recovery)
          try { await recordConsent(consentMarketing); } catch (e) { /* ignore if already set */ }
          await createSession();
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error("Redirect check error:", err);
      } finally {
        setCheckingRedirect(false);
      }
    }
    checkRedirectResult();
  }, [router, consentMarketing]);

  const goNextSlide = useCallback(() => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      setStep("terms");
    }
  }, [slideIndex, totalSlides]);

  const goPrevSlide = useCallback(() => {
    setSlideIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleTermsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentOk) {
      toast.error("Please accept the required terms to continue.");
      return;
    }
    setStep("auth");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
        await recordConsent(consentMarketing);
        await createSession();
        toast.success("Account created!");
        router.push("/onboarding"); // Parent onboarding
      } else {
        await signInWithEmail(email, password);
        await createSession();
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const code = firebaseError.code ?? "";
      if (code.includes("email-already-in-use")) {
        setError("Account exists. Please sign in instead.");
        setAuthMode("login");
      } else if (code.includes("wrong-password") || code.includes("user-not-found") || code.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (authMode === "signup") {
        await recordConsent(consentMarketing);
      }
      await createSession();
      toast.success(authMode === "signup" ? "Account created!" : "Welcome back!");
      router.push(authMode === "signup" ? "/onboarding" : "/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const code = firebaseError.code ?? "";
      if (code.includes("popup-closed-by-user")) {
        setGoogleLoading(false);
        return;
      }
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (checkingRedirect) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFD93D] shadow-md">
            <span className="text-lg leading-none">✨</span>
          </div>
          <span className="text-lg font-bold text-gray-800">KidSpark</span>
        </div>
        {step === "intro" && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full font-semibold text-gray-600"
            onClick={() => {
              setAuthMode("login");
              setStep("auth");
            }}
          >
            Log in
          </Button>
        )}
        {(step === "terms" || step === "auth") && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-600"
            onClick={() => {
              if (step === "auth") {
                setStep("terms");
              } else {
                setStep("intro");
              }
            }}
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" /> Back
          </Button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {step === "intro" && (
              <motion.div
                key={`slide-${slideIndex}`}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                animate={reduceMotion ? false : { opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
              >
                <div className="relative h-48 mb-6 w-full rounded-2xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SLIDES[slideIndex].image}
                    alt={SLIDES[slideIndex].title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-md text-white">
                    {(() => {
                      const Icon = SLIDES[slideIndex].icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
                  {SLIDES[slideIndex].title}
                </h1>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {SLIDES[slideIndex].body}
                </p>

                {"bullets" in SLIDES[slideIndex] && SLIDES[slideIndex].bullets && (
                  <ul className="mb-6 grid grid-cols-2 gap-3">
                    {SLIDES[slideIndex].bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <b.Icon className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-medium truncate">{b.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mb-6">
                  {SLIDES.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === slideIndex ? "w-8 bg-blue-600" : "w-2 bg-gray-200"
                      )}
                    />
                  ))}
                </div>

                <div className="flex gap-3 mt-auto">
                  {slideIndex > 0 && (
                    <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={goPrevSlide}>
                      Back
                    </Button>
                  )}
                  <Button
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md h-12"
                    onClick={goNextSlide}
                  >
                    {slideIndex === totalSlides - 1 ? "Get Started" : "Next"}
                    <ArrowRightIcon className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "terms" && (
              <motion.div
                key="terms"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={reduceMotion ? false : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
                className="flex flex-col bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
                  <CheckCircle2Icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                  Almost there
                </h2>
                <p className="text-gray-500 mb-8 text-sm">
                  We need your permission to set up your safe learning environment.
                </p>

                <form onSubmit={handleTermsSubmit} className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="consent-terms"
                      checked={consentTerms}
                      onCheckedChange={(v) => setConsentTerms(v === true)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <label htmlFor="consent-terms" className="text-sm text-gray-700 leading-snug cursor-pointer">
                      I agree to KidSpark's{" "}
                      <Link href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">Terms of Use</Link>{" "}
                      and{" "}
                      <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
                      <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="consent-child"
                      checked={consentChildData}
                      onCheckedChange={(v) => setConsentChildData(v === true)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <label htmlFor="consent-child" className="text-sm text-gray-700 leading-snug cursor-pointer">
                      I consent to KidSpark securely storing learning progress for my children.
                      <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors mb-4">
                    <Checkbox
                      id="consent-marketing"
                      checked={consentMarketing}
                      onCheckedChange={(v) => setConsentMarketing(v === true)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <label htmlFor="consent-marketing" className="text-sm text-gray-700 leading-snug cursor-pointer">
                      Send me progress reports and product updates (optional).
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md h-12 text-base font-semibold"
                    disabled={!consentOk}
                  >
                    I Agree, Continue
                  </Button>
                </form>
              </motion.div>
            )}

            {step === "auth" && (
              <motion.div
                key="auth"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={reduceMotion ? false : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
                className="flex flex-col bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    {authMode === "signup" ? "Create your account" : "Welcome back"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {authMode === "signup" ? "Set up your parent account — it's free" : "Sign in to your parent dashboard"}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-2 hover:bg-gray-50"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading || loading}
                  >
                    {googleLoading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <GoogleIcon />
                        <span className="ml-2 font-medium">Continue with Google</span>
                      </>
                    )}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">or with email</span></div>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {authMode === "signup" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-gray-700 font-medium">Your name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={loading}
                          className="h-11 rounded-xl bg-gray-50"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="parent@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 rounded-xl bg-gray-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                        {authMode === "login" && (
                          <Link href="/reset-password" className="text-xs text-blue-600 hover:underline">Forgot?</Link>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 rounded-xl bg-gray-50"
                      />
                    </div>

                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-bold shadow-sm"
                      disabled={loading || googleLoading}
                    >
                      {loading ? "Please wait..." : (authMode === "signup" ? "Create Account" : "Sign In")}
                    </Button>
                  </form>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === "signup" ? "login" : "signup");
                        setError("");
                      }}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {authMode === "signup" ? "Sign in" : "Sign up free"}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-5 pb-6 text-center sm:px-8">
        <p className="text-[11px] text-gray-400 font-medium">
          <Link href="/privacy" className="hover:text-gray-600 underline underline-offset-2">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-gray-600 underline underline-offset-2">Terms of Use</Link>
        </p>
      </footer>
    </div>
  );
}
