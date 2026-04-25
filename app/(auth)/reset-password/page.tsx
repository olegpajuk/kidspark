"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError("Could not send reset email. Please check the address and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="shadow-xl border-0 text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-xl font-bold">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a password reset link to <strong>{email}</strong>.
            Click the link in the email to reset your password.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-4">Back to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleReset} className="space-y-4">
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

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#FFD93D] hover:bg-[#FFC200] text-gray-900 font-semibold"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <Link href="/login" className="text-sm text-blue-600 hover:underline mx-auto">
          ← Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
