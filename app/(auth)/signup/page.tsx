"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signUpWithEmail,
  signInWithGoogle,
  handleGoogleRedirectResult,
} from "@/lib/firebase/auth";
import { getIdToken } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal-versions";

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
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  const [consentTerms, setConsentTerms] = useState(false);
  const [consentChildData, setConsentChildData] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const consentOk = consentTerms && consentChildData;

  useEffect(() => {
    async function checkRedirectResult() {
      try {
        const user = await handleGoogleRedirectResult();
        if (user) {
          await recordConsent(consentMarketing);
          await createSession();
          router.push("/onboarding");
          return;
        }
      } catch (err) {
        console.error("Redirect check error:", err);
      } finally {
        setCheckingRedirect(false);
      }
    }
    checkRedirectResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!consentOk) {
      toast.error("Please tick both required boxes before creating your account.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      await recordConsent(consentMarketing);
      await createSession();
      toast.success("Account created — let's get set up!");
      router.push("/onboarding");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const code = firebaseError.code ?? "";
      if (code.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (code.includes("weak-password")) {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Could not create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    if (!consentOk) {
      toast.error("Please tick both required boxes before continuing.");
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      await recordConsent(consentMarketing);
      await createSession();
      toast.success("Account created — let's get set up!");
      router.push("/onboarding");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const code = firebaseError.code ?? "";
      if (code.includes("popup-closed-by-user")) {
        setGoogleLoading(false);
        return;
      }
      if (code.includes("unauthorized-domain")) {
        setError(
          "This domain is not authorized for Google sign-in. Please check Firebase Console > Authentication > Settings > Authorized domains."
        );
      } else if (code.includes("popup-blocked")) {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(`Google sign-up failed: ${code || "Unknown error"}`);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  if (checkingRedirect) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Checking sign-in status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>Set up your parent account — it&apos;s free</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consent block — shown first so it is always visible */}
        <div
          role="group"
          aria-labelledby="consent-heading"
          className="flex flex-col gap-3 rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-4"
        >
          <p
            id="consent-heading"
            className="text-center text-xs font-semibold uppercase tracking-widest text-gray-600"
          >
            Agree to continue
          </p>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-terms"
                checked={consentTerms}
                onCheckedChange={(v) => setConsentTerms(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-required={true}
              />
              <label
                htmlFor="consent-terms"
                className="cursor-pointer text-sm leading-snug text-gray-700"
              >
                I agree to KidSpark&apos;s{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-yellow-600 underline underline-offset-2 hover:text-yellow-700"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-yellow-600 underline underline-offset-2 hover:text-yellow-700"
                >
                  Privacy Policy
                </Link>
                <span className="text-red-500"> *</span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-children"
                checked={consentChildData}
                onCheckedChange={(v) => setConsentChildData(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-required={true}
              />
              <label
                htmlFor="consent-children"
                className="cursor-pointer text-sm leading-snug text-gray-700"
              >
                I consent to KidSpark storing learning data about my children
                (names, progress, game history), as described in the Privacy
                Policy
                <span className="text-red-500"> *</span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-marketing"
                checked={consentMarketing}
                onCheckedChange={(v) => setConsentMarketing(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <label
                htmlFor="consent-marketing"
                className="cursor-pointer text-sm leading-snug text-gray-500"
              >
                Send me occasional product updates by email{" "}
                <span className="text-xs">(optional)</span>
              </label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading || !consentOk}
        >
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Signing up...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <GoogleIcon /> Continue with Google
            </span>
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-semibold"
            disabled={loading || googleLoading || !consentOk}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <p className="text-sm text-center w-full text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
        <p className="text-[11px] text-center text-gray-400">
          <Link href="/privacy" target="_blank" className="underline hover:text-gray-600">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" target="_blank" className="underline hover:text-gray-600">
            Terms of Use
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
