"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
