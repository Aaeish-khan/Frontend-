"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Video,
  FileText,
  BookOpen,
  Trophy,
  Users,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { getProjectsRequest, type Project } from "@/lib/api-projects"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

const globalNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Gamification", href: "/gamification", icon: Trophy },
  { name: "Peer Review", href: "/peer-review", icon: Users },
  { name: "Reports", href: "/reports", icon: FileBarChart },
]

const bottomNav = [{ name: "Settings", href: "/settings", icon: Settings }]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function Sidebar({ mobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getProjectsRequest().then(setProjects).catch(() => {})
  }, [])

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  const activeProject = projects.find((project) =>
    pathname.startsWith(`/projects/${project.id}`)
  )

  const projectNavigation = activeProject
    ? [
        { name: "Project Hub", href: `/projects/${activeProject.id}`, icon: FolderKanban },
        { name: "Mock Interview", href: `/projects/${activeProject.id}/interview`, icon: Video },
        { name: "Resume Analyzer", href: `/projects/${activeProject.id}/resume`, icon: FileText },
        { name: "Learning Mode", href: `/projects/${activeProject.id}/learning`, icon: BookOpen },
      ]
    : []

  const closeMobileNav = () => onMobileOpenChange?.(false)

  const handleLogout = () => {
    logout()
    router.replace("/login")
    closeMobileNav()
  }

  const renderNavContent = (isMobile = false) => (
    <>
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/8 px-4",
          collapsed && !isMobile ? "justify-center" : "justify-between",
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => isMobile && closeMobileNav()}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {(isMobile || !collapsed) && (
            <span className="text-lg font-semibold text-sidebar-foreground">InterMate</span>
          )}
        </Link>

        {isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={closeMobileNav}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-sidebar",
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {(isMobile || !collapsed) && activeProject ? (
        <div className="border-b border-sidebar-border px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-sidebar-foreground/50">Active Project</p>
          <p className="truncate text-sm font-medium text-sidebar-foreground">{activeProject.title}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{activeProject.companyName || activeProject.jobRole}</p>
        </div>
      ) : null}

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1">
          {(isMobile || !collapsed) && <p className="px-2 text-xs uppercase tracking-wide text-sidebar-foreground/50">Global</p>}
          {globalNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && closeMobileNav()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-primary border-l-2 border-primary shadow-sm shadow-primary/10"
                    : "text-sidebar-foreground/80 hover:bg-white/6 hover:text-foreground",
                  collapsed && !isMobile && "justify-center px-2 border-l-0",
                )}
                title={!isMobile && collapsed ? item.name : undefined}
              >
                <span className={cn("icon-box rounded-md p-0.5", isActive && "text-primary")}>
                  <item.icon className="h-5 w-5 shrink-0" />
                </span>
                {(isMobile || !collapsed) && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>

        {projectNavigation.length > 0 ? (
          <div className="space-y-1">
            {(isMobile || !collapsed) && <p className="px-2 text-xs uppercase tracking-wide text-sidebar-foreground/50">This Project</p>}
            {projectNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && closeMobileNav()}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && !isMobile && "justify-center px-2",
                  )}
                  title={!isMobile && collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {(isMobile || !collapsed) && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        ) : null}
      </nav>

        <div className="border-t border-white/8 p-3">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && closeMobileNav()}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-primary border-l-2 border-primary shadow-sm shadow-primary/10"
                  : "text-sidebar-foreground/80 hover:bg-white/6 hover:text-foreground",
                collapsed && !isMobile && "justify-center px-2 border-l-0",
              )}
              title={!isMobile && collapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {(isMobile || !collapsed) && <span>{item.name}</span>}
            </Link>
          )
        })}

        <div
          className={cn(
            "mt-3 flex items-center gap-3 rounded-lg bg-white/5 border border-white/8 p-2",
            collapsed && !isMobile && "justify-center",
          )}
        >
          <Avatar className="h-9 w-9 border-2 border-primary/30 ring-1 ring-primary/10">
            <AvatarImage src={"/placeholder-user.jpg"} alt={user?.name ?? "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          {(isMobile || !collapsed) && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name ?? "Guest User"}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.email ?? ""}</p>
            </div>
          )}

          {(isMobile || !collapsed) && (
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          {collapsed && !isMobile && (
            <ThemeToggle />
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/8 bg-sidebar/80 backdrop-blur-xl transition-all duration-300 md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        {renderNavContent()}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[88vw] max-w-[320px] border-r border-white/8 bg-sidebar/90 backdrop-blur-xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Browse sections and project tools.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">
            {renderNavContent(true)}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
