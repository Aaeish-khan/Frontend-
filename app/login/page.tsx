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
        {/* Skeleton loader */}
        <div className="w-full max-w-md space-y-4">
          <div className="shimmer h-8 rounded-lg w-48 mx-auto" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb orb-blue absolute top-0 left-1/4 w-[500px] h-[500px] opacity-[0.06]" />
        <div className="orb orb-purple absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-[0.05]" />
      </div>
      {/* Grid pattern */}
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
        {/* Logo mark above card */}
        <motion.div
          className="mb-6 flex justify-center"
          variants={staggerItem}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:shadow-indigo-500/50 group-hover:scale-110">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              InterMate
            </span>
          </Link>
        </motion.div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">Sign in to your InterMate account</p>
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
                <motion.div variants={staggerItem} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  Account created successfully. Please log in.
                </motion.div>
              ) : null}

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </motion.div>

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
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
                  onClick={() => { demoLogin(); router.replace("/dashboard"); }}
                >
                  Continue as Demo
                </Button>
              </motion.div>

              <motion.p variants={staggerItem} className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
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