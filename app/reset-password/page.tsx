"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

import { resetPasswordRequest } from "@/lib/api-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { scaleIn, staggerContainer, staggerItem } from "@/lib/animations";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = useMemo(
    () => [
      { label: "At least 12 characters", passed: newPassword.length >= 12 },
      { label: "One uppercase letter", passed: /[A-Z]/.test(newPassword) },
      { label: "One lowercase letter", passed: /[a-z]/.test(newPassword) },
      { label: "One number", passed: /[0-9]/.test(newPassword) },
    ],
    [newPassword]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resetPasswordRequest({
        token,
        newPassword,
        confirmPassword,
      });
      setMessage(response.message);
      setTimeout(() => {
        router.replace("/login?reset=1");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb orb-blue absolute top-0 left-1/4 h-[500px] w-[500px] opacity-[0.06]" />
        <div className="orb orb-purple absolute right-1/4 bottom-0 h-[400px] w-[400px] opacity-[0.05]" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={scaleIn}
      >
        <motion.div className="mb-6 flex justify-center" variants={staggerItem}>
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              InterMate
            </span>
          </Link>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Reset password</CardTitle>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Choose a strong new password for your account.
            </p>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-red-400">This reset link is missing a token.</p>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Create a secure password"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">Password requirements</p>
                  <div className="grid gap-2">
                    {checks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={cn("h-4 w-4", check.passed ? "text-emerald-500" : "text-muted-foreground/40")} />
                        <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {message ? (
                  <motion.p variants={staggerItem} className="text-sm text-emerald-500">
                    {message}
                  </motion.p>
                ) : null}

                {error ? (
                  <motion.p variants={staggerItem} className="text-sm text-red-400">
                    {error}
                  </motion.p>
                ) : null}

                <motion.div variants={staggerItem}>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Resetting..." : "Reset password"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
