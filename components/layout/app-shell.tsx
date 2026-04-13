"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { AuthGuard } from "@/components/auth/auth-guard"

interface AppShellProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64 transition-all duration-300">
          <Header title={title} description={description} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
