"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { reactivateAccountRequest } from "@/lib/api-auth";
import { saveSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scaleIn, staggerContainer, staggerItem } from "@/lib/animations";

export default function ReactivateAccountPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await reactivateAccountRequest({
        email: email.trim(),
        password,
      });

      saveSession(response.token, response.user);
      setUser(response.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate account");
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
            <CardTitle className="text-center text-2xl">Reactivate account</CardTitle>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Sign in once to reactivate your deactivated account and return to your dashboard.
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

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </motion.div>

              {error ? (
                <motion.p variants={staggerItem} className="text-sm text-red-400">
                  {error}
                </motion.p>
              ) : null}

              <motion.div variants={staggerItem}>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Reactivating..." : "Reactivate account"}
                </Button>
              </motion.div>

              <motion.p variants={staggerItem} className="text-center text-sm text-muted-foreground">
                Need another way back in?{" "}
                <Link href="/forgot-password" className="font-medium text-primary transition-colors hover:text-primary/80">
                  Reset your password
                </Link>
              </motion.p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
