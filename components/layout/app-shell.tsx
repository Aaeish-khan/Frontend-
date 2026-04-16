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
      <div className="min-h-screen bg-background">
        <Sidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
        <div className="transition-all duration-300 md:pl-64">
          <Header
            title={title}
            description={description}
            onMenuClick={() => setMobileNavOpen(true)}
          />
          <main className="px-4 py-5 sm:px-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
