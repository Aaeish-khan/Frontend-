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
    <header className="sticky top-0 z-30 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card/80 px-3 py-2 shadow-sm shadow-primary/5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-2xl md:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground/80 sm:text-sm">{description}</p>
            ) : null}
          </div>
        </div>
        <ThemeToggle className="shrink-0" />
      </div>
    </header>
  )
}
