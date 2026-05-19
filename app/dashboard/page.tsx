"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Download,
  FileBarChart,
  FileCheck2,
  Flame,
  FolderKanban,
  Mic2,
  Plus,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { getGamificationSummary, type GamificationSummary } from "@/lib/api-gamification"
import { getProjectsRequest, type Project } from "@/lib/api-projects"
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { getApplicationStatusLabel, getProjectApplicationStatus } from "@/lib/project-options"

const fallbackProjects: Project[] = [
  {
    id: "demo-ai-engineer",
    title: "AI Engineer",
    companyName: "CodeNinja",
    jobRole: "Junior AI Engineer",
    jobDescription: "",
    resumeText: "",
    status: "active",
    createdAt: "",
    updatedAt: "",
    aiInsights: { resumeMatchScore: 43 },
    outcome: { status: "applied" },
  },
  {
    id: "demo-frontend-developer",
    title: "Frontend Developer",
    companyName: "Acme",
    jobRole: "Junior Frontend Developer",
    jobDescription: "",
    resumeText: "",
    status: "active",
    createdAt: "",
    updatedAt: "",
    aiInsights: { resumeMatchScore: 61 },
    outcome: { status: "applied" },
  },
]

type MetricCard = {
  label: string
  value: string
  helper: string
  icon: ComponentType<{ className?: string }>
  surfaceClass: string
  iconClass: string
  barClass: string
  progress?: number
}

function getAverageMatch(projects: Project[]) {
  if (projects.length === 0) return 0
  const total = projects.reduce((sum, project) => sum + (project.aiInsights?.resumeMatchScore ?? 0), 0)
  return Math.round(total / projects.length)
}

function getMissionCurrent(gamification: GamificationSummary | null, type: string) {
  return gamification?.dailyMissions?.find((mission) => mission.type === type)?.current ?? 0
}

function getMissionProgress(gamification: GamificationSummary | null, type: string) {
  const mission = gamification?.dailyMissions?.find((item) => item.type === type)
  if (!mission) return 0
  if (mission.completed) return 100
  if (!mission.target) return 0
  return Math.min(100, Math.round((mission.current / mission.target) * 100))
}

function getDailyProgress(gamification: GamificationSummary | null) {
  const missions = gamification?.dailyMissions ?? []
  if (missions.length === 0) return Math.min(100, (gamification?.learningStreak ?? 0) * 10)
  const completed = missions.filter((mission) => mission.completed).length
  return Math.round((completed / missions.length) * 100)
}

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-primary"
  if (score >= 40) return "text-violet-500"
  return "text-rose-500"
}

function statusTone(status?: string) {
  const normalized = status?.toLowerCase()
  if (normalized === "applied") return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300"
  if (normalized === "checking_eligibility") return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300"
  if (normalized === "planning_to_apply") return "border-primary/20 bg-primary/10 text-primary"
  if (normalized === "interview") return "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300"
  if (normalized === "offer") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
  if (normalized === "rejected") return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300"
  return "border-primary/20 bg-primary/10 text-primary"
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [gamification, setGamification] = useState<GamificationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [data, gam] = await Promise.all([
          getProjectsRequest(),
          getGamificationSummary().catch(() => null),
        ])
        setProjects(data)
        setGamification(gam)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const displayName = user?.name?.split(" ")[0] ?? "User"
  const visibleProjects = projects.length > 0 ? projects : fallbackProjects
  const averageMatch = getAverageMatch(visibleProjects)
  const readinessScore = Math.min(
    100,
    Math.round((averageMatch + (gamification?.level ?? 1) * 6 + projects.length * 4 + 24) / 1.25),
  )
  const learningProgress = getDailyProgress(gamification)
  const mockInterviews = getMissionCurrent(gamification, "interview_complete")
  const peerReviews = getMissionCurrent(gamification, "peer_review_given")

  const metrics = useMemo<MetricCard[]>(
    () => [
      {
        label: "Readiness Score",
        value: `${readinessScore}%`,
        helper: "Overall",
        icon: Target,
        surfaceClass: "border-primary/20 bg-primary/10",
        iconClass: "text-primary",
        barClass: "bg-primary",
        progress: readinessScore,
      },
      {
        label: "ATS Match",
        value: `${averageMatch}%`,
        helper: "Avg fit",
        icon: FileCheck2,
        surfaceClass: "border-sky-500/20 bg-sky-500/10",
        iconClass: "text-sky-500",
        barClass: "bg-sky-500",
        progress: averageMatch,
      },
      {
        label: "Mock Interviews",
        value: `${mockInterviews}`,
        helper: "Today",
        icon: Mic2,
        surfaceClass: "border-violet-500/20 bg-violet-500/10",
        iconClass: "text-violet-500",
        barClass: "bg-violet-500",
        progress: getMissionProgress(gamification, "interview_complete"),
      },
      {
        label: "Learning Progress",
        value: `${learningProgress}%`,
        helper: "Daily plan",
        icon: BookOpen,
        surfaceClass: "border-indigo-500/20 bg-indigo-500/10",
        iconClass: "text-indigo-500",
        barClass: "bg-indigo-500",
        progress: learningProgress,
      },
      {
        label: "Badges Earned",
        value: `${gamification?.badgeCount ?? 0}`,
        helper: "CareerQuest",
        icon: Award,
        surfaceClass: "border-fuchsia-500/20 bg-fuchsia-500/10",
        iconClass: "text-fuchsia-500",
        barClass: "bg-fuchsia-500",
      },
      {
        label: "Peer Reviews",
        value: `${peerReviews}`,
        helper: "Today",
        icon: Users,
        surfaceClass: "border-cyan-500/20 bg-cyan-500/10",
        iconClass: "text-cyan-500",
        barClass: "bg-cyan-500",
        progress: getMissionProgress(gamification, "peer_review_given"),
      },
    ],
    [averageMatch, gamification, learningProgress, mockInterviews, peerReviews, readinessScore],
  )

  const progressItems = [
    {
      title: "Projects",
      value: projects.length ? `${projects.length} active` : "Start one",
      helper: "Job targets",
      href: "/projects",
      icon: FolderKanban,
      color: "text-primary",
    },
    {
      title: "Gamification",
      value: gamification ? `Level ${gamification.level}` : "Ready",
      helper: gamification ? `${(gamification.xp ?? 0).toLocaleString()} XP` : "XP and badges",
      href: "/gamification",
      icon: Trophy,
      color: "text-violet-500",
    },
    {
      title: "Peer Review",
      value: peerReviews > 0 ? `${peerReviews} today` : "Open",
      helper: "Feedback loop",
      href: "/peer-reviews",
      icon: Users,
      color: "text-cyan-500",
    },
    {
      title: "Reports",
      value: "Exports",
      helper: "Interview and ATS",
      href: "/reports",
      icon: FileBarChart,
      color: "text-sky-500",
    },
  ]

  return (
    <AppShell
      title={`Welcome back, ${displayName}`}
      description="Track your career readiness and active job targets"
    >
      <div className="space-y-5">
        {loading ? (
          <div className="space-y-4">
            <div className="shimmer h-36 rounded-3xl" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="shimmer h-28 rounded-2xl" />
              ))}
            </div>
            <div className="shimmer h-64 rounded-3xl" />
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-5">
            <motion.section
              variants={staggerItem}
              className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-cyan-500/10 p-5 shadow-md shadow-primary/5 md:p-6"
            >
              <div className="relative grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
                <div className="min-w-0 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Career readiness hub
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                      Hi, {displayName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ready to improve your next application?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-2xl shadow-md shadow-primary/20">
                      <Link href="/projects/new">
                        <Plus className="h-4 w-4" />
                        New Project
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-2xl bg-background/70">
                      <Link href="/projects">
                        View Projects
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="relative min-h-32">
                  <div className="absolute right-0 top-0 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-primary/20 bg-background/70 text-primary shadow-sm">
                    <Target className="h-10 w-10" />
                  </div>
                  <div className="absolute bottom-0 right-20 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-500/20 bg-background/70 text-cyan-500 shadow-sm">
                    <ClipboardCheck className="h-7 w-7" />
                  </div>
                  <div className="absolute bottom-2 left-0 hidden rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm sm:block">
                    <span className="text-primary">{readinessScore}%</span> readiness
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section variants={staggerItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={cn(
                    "rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    metric.surfaceClass,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-muted-foreground">{metric.label}</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{metric.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{metric.helper}</p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/70">
                      <metric.icon className={cn("h-5 w-5", metric.iconClass)} />
                    </div>
                  </div>
                  {metric.progress !== undefined ? (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", metric.barClass)}
                        style={{ width: `${metric.progress}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </motion.section>

            {projects.length === 0 ? (
              <motion.section
                variants={cardVariants}
                className="rounded-3xl border border-primary/20 bg-card/80 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Create your first preparation project</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a role, resume, and job description to unlock prep tools.
                    </p>
                  </div>
                  <Button asChild className="rounded-2xl">
                    <Link href="/projects/new">
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                </div>
              </motion.section>
            ) : null}

            <motion.div variants={staggerItem} className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Active Targets</p>
                    <h3 className="text-xl font-bold tracking-tight">Job application projects</h3>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-2xl bg-card/70">
                    <Link href="/projects">View all</Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  {visibleProjects.slice(0, 4).map((project) => {
                    const score = project.aiInsights?.resumeMatchScore ?? 0
                    const isDemo = project.id.startsWith("demo-")
                    const applicationStatus = getProjectApplicationStatus(project)
                    const status = getApplicationStatusLabel(applicationStatus)
                    const row = (
                      <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md md:grid-cols-[minmax(0,1.2fr)_170px_110px_auto] md:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <BriefcaseBusiness className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-foreground">{project.title}</h4>
                            <p className="truncate text-xs text-muted-foreground">
                              {project.companyName || "Company"} / {project.jobRole || "Role"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">ATS match</span>
                            <span className={cn("font-semibold", scoreTone(score))}>{score}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-700"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>

                        <span
                          className={cn(
                            "w-fit rounded-full border px-2.5 py-1 text-xs font-semibold",
                            statusTone(applicationStatus),
                          )}
                        >
                          {isDemo ? "Sample" : status}
                        </span>

                        {isDemo ? (
                          <Button size="sm" className="rounded-xl" disabled>
                            Open Project
                          </Button>
                        ) : (
                          <Button asChild size="sm" className="rounded-xl">
                            <Link href={`/projects/${project.id}`}>Open Project</Link>
                          </Button>
                        )}
                      </div>
                    )

                    return isDemo ? (
                      <div key={project.id}>{row}</div>
                    ) : (
                      <motion.div key={project.id} variants={cardVariants} whileHover="hover">
                        {row}
                      </motion.div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Today</p>
                    <h3 className="text-lg font-bold tracking-tight">Momentum</h3>
                  </div>
                  <Flame className="h-5 w-5 text-violet-500" />
                </div>

                {gamification ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{gamification.levelName}</p>
                        <p className="text-xl font-bold">{(gamification.xp ?? 0).toLocaleString()} XP</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{gamification.learningStreak}d streak</p>
                        <p>{gamification.badgeCount} badges</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(gamification.dailyMissions ?? []).slice(0, 3).map((mission) => (
                        <div key={mission.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-sm">
                          {mission.completed ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className={cn("min-w-0 flex-1 truncate", mission.completed && "text-muted-foreground line-through")}>
                            {mission.title}
                          </span>
                          <span className="text-xs font-semibold text-primary">+{mission.xpReward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">XP, badges, and missions appear here.</p>
                    <Button asChild variant="outline" className="rounded-2xl">
                      <Link href="/gamification">
                        Open Gamification
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </section>
            </motion.div>

            <motion.section variants={staggerItem} className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Overview</p>
                <h3 className="text-xl font-bold tracking-tight">Global Progress</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {progressItems.map((item) => (
                  <Link key={item.title} href={item.href} className="group">
                    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                          <item.icon className={cn("h-5 w-5", item.color)} />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-xl font-bold tracking-tight">{item.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.helper}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>

            <motion.section variants={staggerItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Resume analysis", href: "/projects", icon: FileCheck2 },
                { label: "Mock interview", href: "/projects", icon: Mic2 },
                { label: "Learning plan", href: "/projects", icon: BookOpen },
                { label: "Download reports", href: "/reports", icon: Download },
              ].map((action) => (
                <Button key={action.label} asChild variant="outline" className="h-12 justify-between rounded-2xl bg-card/80 px-4">
                  <Link href={action.href}>
                    <span className="inline-flex items-center gap-2">
                      <action.icon className="h-4 w-4 text-primary" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </motion.section>
          </motion.div>
        ) : null}
      </div>
    </AppShell>
  )
}
