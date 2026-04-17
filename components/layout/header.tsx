"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  title: string
  description?: string
  onMenuClick?: () => void
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-background/60 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 sm:px-6">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-foreground sm:text-xl tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground/80">{description}</p>
          ) : null}
        </div>
        </div>
        <ThemeToggle className="shrink-0" />
      </div>
    </header>
  )
}
