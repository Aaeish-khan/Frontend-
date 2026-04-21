"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { forgotPasswordRequest } from "@/lib/api-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scaleIn, staggerContainer, staggerItem } from "@/lib/animations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPasswordRequest({ email: email.trim() });
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset");
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
            <CardTitle className="text-center text-2xl">Forgot password</CardTitle>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </CardHeader>
          <CardContent>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
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
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </motion.div>

              <motion.p variants={staggerItem} className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
                  Back to login
                </Link>
              </motion.p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
