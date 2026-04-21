"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function LandingHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      {/* Subtle gradient line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:shadow-indigo-500/50 group-hover:scale-110">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            InterMate
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 rounded-md transition-all duration-200 group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {/* Hover underline */}
                <span
                  className={cn(
                    "absolute bottom-0.5 left-3 right-3 h-px rounded-full transition-all duration-300",
                    isActive
                      ? "bg-primary opacity-100"
                      : "bg-primary opacity-0 group-hover:opacity-60",
                  )}
                />
              </Link>
            )
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
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
