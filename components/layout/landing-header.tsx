"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">
            InterMate
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex text-primary items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/">Home</Link>
          <Link href="/resume" className="text-primary">CV Analyzer</Link>
          <Link href="/interview">Interview Prep</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Button */}
        <div className="flex items-center gap-3">
          <Link href="/signup">
            <Button className="h-9 px-4 text-sm font-medium">
              Sign Up
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="outline" className="h-9 px-4 text-sm font-medium">
              Login
            </Button>
          </Link>
        </div>

      </div>
    </header>
  )
}