"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      router.replace("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb orb-cyan absolute top-0 right-1/4 w-[500px] h-[500px] opacity-[0.06]" />
        <div className="orb orb-blue absolute bottom-0 left-1/4 w-[400px] h-[400px] opacity-[0.05]" />
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
            <CardTitle className="text-center text-2xl">Create account</CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">Start your AI-powered career journey</p>
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
                <Label htmlFor="name" className="text-sm font-medium text-foreground/90">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" />
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters" />
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                />
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
                  {loading ? "Creating account..." : "Sign up"}
                </Button>
              </motion.div>

              <motion.p variants={staggerItem} className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Login
                </Link>
              </motion.p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}