"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { BackButton } from "./back-button"
import { AuthGuard } from "@/components/auth/auth-guard"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  title: string
  description?: string
  showBack?: boolean
  backLabel?: string
}

export function AppShell({ children, title, description, showBack, backLabel }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const shouldShowBack = showBack ?? pathname !== "/dashboard"

  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-x-hidden bg-background">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.10),transparent_36%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.08),transparent_34%)]" />

        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div
          className={cn(
            "relative z-10 min-h-screen transition-[padding] duration-300",
            sidebarCollapsed ? "md:pl-[6.5rem]" : "md:pl-[15.25rem]",
          )}
        >
          <Header
            title={title}
            description={description}
            onMenuClick={() => setMobileNavOpen(true)}
          />
          <main className="px-4 pb-6 pt-4 sm:px-6 lg:px-8 page-enter">
            <div className="mx-auto w-full max-w-7xl space-y-4">
              {shouldShowBack ? <BackButton label={backLabel} /> : null}
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
