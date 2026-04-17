import { Sparkles } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/8 bg-background/80 backdrop-blur-sm">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">

        {/* Left */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            InterMate
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/about" className="transition-colors duration-200 hover:text-primary">About</a>
          <a href="/contact" className="transition-colors duration-200 hover:text-primary">Contact</a>
          <span className="text-muted-foreground/50">© 2026 InterMate</span>
        </div>

      </div>
    </footer>
  )
}
