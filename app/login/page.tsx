"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, demoLogin, user, loading: authLoading } = useAuth();

  const registered = searchParams.get("registered") === "1";
  const reset = searchParams.get("reset") === "1";
  const reactivated = searchParams.get("reactivated") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md space-y-4">
          <div className="shimmer mx-auto h-8 w-48 rounded-lg" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb orb-blue absolute top-0 left-1/4 h-[500px] w-[500px] opacity-[0.06]" />
        <div className="orb orb-purple absolute right-1/4 bottom-0 h-[400px] w-[400px] opacity-[0.05]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.06) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="relative w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={scaleIn}
      >
        <motion.div className="mb-6 flex justify-center" variants={staggerItem}>
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              InterMate
            </span>
          </Link>
        </motion.div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Sign in to your InterMate account
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
              {registered ? (
                <motion.div
                  variants={staggerItem}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
                >
                  Account created successfully. Please log in.
                </motion.div>
              ) : null}

              {reset ? (
                <motion.div
                  variants={staggerItem}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
                >
                  Password reset successfully. You can log in with your new password.
                </motion.div>
              ) : null}

              {reactivated ? (
                <motion.div
                  variants={staggerItem}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
                >
                  Account reactivated successfully. Please log in.
                </motion.div>
              ) : null}

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="........"
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-red-400">{error}</p>
                  {error.toLowerCase().includes("deactivated") ? (
                    <Link
                      href="/reactivate-account"
                      className="inline-block text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Reactivate account
                    </Link>
                  ) : null}
                </motion.div>
              ) : null}

              <motion.div variants={staggerItem}>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>
              </motion.div>

              <motion.div variants={staggerItem} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground/60">or</span>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    demoLogin();
                    router.replace("/dashboard");
                  }}
                >
                  Continue as Demo
                </Button>
              </motion.div>

              <motion.p variants={staggerItem} className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary transition-colors hover:text-primary/80">
                  Sign up
                </Link>
              </motion.p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
