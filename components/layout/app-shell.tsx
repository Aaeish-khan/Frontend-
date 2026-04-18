"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { AuthGuard } from "@/components/auth/auth-guard"

interface AppShellProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AppShell({ children, title, description }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <AuthGuard>
      {/* Animated gradient background */}
      <div className="min-h-screen bg-background relative">
        {/* Subtle ambient orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="orb orb-blue absolute top-0 left-1/4 w-[500px] h-[500px] opacity-[0.06]" />
          <div className="orb orb-purple absolute bottom-1/4 right-1/4 w-[400px] h-[400px] opacity-[0.05]" />
        </div>

        <Sidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
        <div className="relative z-10 transition-all duration-300 md:pl-64">
          <Header
            title={title}
            description={description}
            onMenuClick={() => setMobileNavOpen(true)}
          />
          {/* Page enter animation */}
          <main className="px-4 py-5 sm:px-6 page-enter">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
