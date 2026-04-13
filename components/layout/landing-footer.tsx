import { FileText } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">

        {/* Left */}
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            InterMate
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <span>© 2025 InterMate</span>
        </div>

      </div>
    </footer>
  )
}