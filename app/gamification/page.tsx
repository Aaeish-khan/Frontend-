"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import {
  getGamificationProfile,
  getGamificationBadges,
  getLeaderboard,
  getGamificationStats,
  getXPLog,
  getSkillTree,
  getBadgeProgress,
  type GamificationProfile,
  type Mission,
  type Badge,
  type LeaderboardEntry,
  type GamificationStats,
  type SkillTree,
  type SkillTreeNode,
} from "@/lib/api-gamification"
import { getProjectsRequest } from "@/lib/api-projects"
import {
  Flame,
  Award,
  Trophy,
  TrendingUp,
  Target,
  Calendar,
  BookOpen,
  Code2,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Map,
  ChevronRight,
  GitBranch,
  Zap,
  Lock,
  Star,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Mission action links ──────────────────────────────────────────────────────

function buildMissionActions(projectId: string | null): Record<string, { label: string; href: string }> {
  const learn     = projectId ? `/projects/${projectId}/learning`  : "/projects"
  const interview = projectId ? `/projects/${projectId}/interview` : "/projects"
  return {
    module_complete:    { label: "Go to Learning",  href: learn },
    quiz_pass:          { label: "Take a Quiz",      href: learn },
    lab_complete:       { label: "Open a Lab",       href: learn },
    interview_complete: { label: "Start Interview",  href: interview },
    peer_review_given:  { label: "Review a Peer",    href: "/peer-reviews" },
  }
}

// ── Badge icons ───────────────────────────────────────────────────────────────

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  resume:      FileText,
  learning:    BookOpen,
  interview:   Code2,
  peer:        Users,
  peer_review: Users,
  streak:      Flame,
  quest:       Map,
  level:       Trophy,
  quiz:        Award,
}

function BadgeIcon({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIcons[category] ?? Award
  return <Icon className={className} />
}

function rankStyle(rank: number) {
  if (rank === 1) return "bg-yellow-500/10 text-yellow-500"
  if (rank === 2) return "bg-gray-400/10 text-gray-400"
  if (rank === 3) return "bg-orange-500/10 text-orange-500"
  return "bg-muted text-muted-foreground"
}

// ── Mission row ───────────────────────────────────────────────────────────────

function MissionRow({ mission, actions }: { mission: Mission; actions: Record<string, { label: string; href: string }> }) {
  const action = actions[mission.type]
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-3 gap-3",
        mission.completed ? "border-green-500/30 bg-green-500/5" : "border-border"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", mission.completed ? "bg-green-500/10" : "bg-muted")}>
          {mission.completed
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <Circle className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-medium truncate", mission.completed && "line-through text-muted-foreground")}>
            {mission.title}
          </p>
          <p className="text-xs text-muted-foreground">{mission.current} / {mission.target}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-sm font-medium", mission.completed ? "text-green-500" : "text-primary")}>
          +{mission.xpReward} XP
        </span>
        {!mission.completed && action && (
          <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs">
            <Link href={action.href}>{action.label} <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// ── CareerQuest ───────────────────────────────────────────────────────────────

type QuestTask  = { id: string; description: string; target: number; current: number; completed: boolean }
type QuestStage = { stage: number; name: string; status: string; tasks: QuestTask[] }

function CareerQuestSection({ careerQuest, projectId }: { careerQuest: GamificationProfile["careerQuest"]; projectId: string | null }) {
  const stages       = (careerQuest.stages as QuestStage[]) ?? []
  const currentStage = stages.find(s => s.status === "in_progress")
  const completedCount = stages.filter(s => s.status === "completed").length
  if (!currentStage) return null
  const stageTasks    = currentStage.tasks ?? []
  const stageProgress = stageTasks.length
    ? Math.round((stageTasks.filter(t => t.completed).length / stageTasks.length) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          CareerQuest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {stages.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-1">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2",
                s.status === "completed"   && "bg-primary border-primary text-primary-foreground",
                s.status === "in_progress" && "border-primary text-primary bg-primary/10",
                s.status === "locked"      && "border-muted text-muted-foreground bg-muted/30"
              )}>
                {s.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : s.stage}
              </div>
              {i < stages.length - 1 && (
                <div className={cn("h-0.5 w-6", s.status === "completed" ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{completedCount}/{stages.length} stages</span>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Stage {currentStage.stage}</p>
              <h3 className="font-semibold">{currentStage.name}</h3>
            </div>
            <span className="text-sm font-medium text-primary">{stageProgress}%</span>
          </div>
          <div className="space-y-2">
            {stageTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                {task.completed
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className={cn("flex-1", task.completed && "line-through text-muted-foreground")}>
                  {task.description}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">{task.current}/{task.target}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={projectId ? `/projects/${projectId}/learning` : "/projects"}>
              <BookOpen className="mr-1 h-3 w-3" />Learning Modules
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={projectId ? `/projects/${projectId}/interview` : "/projects"}>
              <Code2 className="mr-1 h-3 w-3" />Mock Interviews
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/peer-reviews"><Users className="mr-1 h-3 w-3" />Peer Reviews</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Skill Tree ────────────────────────────────────────────────────────────────

const SKILL_TREE_DOMAINS: {
  key: keyof SkillTree
  label: string
  icon: React.ComponentType<{ className?: string }>
  nodes: { id: string; label: string }[]
}[] = [
  {
    key: "frontend",
    label: "Frontend",
    icon: Code2,
    nodes: [
      { id: "html_css",   label: "HTML & CSS" },
      { id: "javascript", label: "JavaScript" },
      { id: "react",      label: "React" },
      { id: "state",      label: "State Mgmt" },
      { id: "testing_fe", label: "FE Testing" },
    ],
  },
  {
    key: "backend",
    label: "Backend",
    icon: GitBranch,
    nodes: [
      { id: "http",       label: "HTTP & REST" },
      { id: "node",       label: "Node.js" },
      { id: "auth",       label: "Auth & JWT" },
      { id: "apis",       label: "API Design" },
      { id: "microsvcs",  label: "Microservices" },
    ],
  },
  {
    key: "databases",
    label: "Databases",
    icon: BookOpen,
    nodes: [
      { id: "sql_basics", label: "SQL Basics" },
      { id: "mongodb",    label: "MongoDB" },
      { id: "indexing",   label: "Indexing" },
      { id: "orm",        label: "ORM / ODM" },
      { id: "redis",      label: "Redis" },
    ],
  },
  {
    key: "dsa",
    label: "DSA",
    icon: Target,
    nodes: [
      { id: "arrays",     label: "Arrays" },
      { id: "strings",    label: "Strings" },
      { id: "trees",      label: "Trees" },
      { id: "graphs",     label: "Graphs" },
      { id: "dp",         label: "Dynamic Prog." },
    ],
  },
  {
    key: "cloud_devops",
    label: "Cloud / DevOps",
    icon: Zap,
    nodes: [
      { id: "linux",      label: "Linux" },
      { id: "docker",     label: "Docker" },
      { id: "ci_cd",      label: "CI/CD" },
      { id: "aws_basics", label: "AWS Basics" },
      { id: "k8s",        label: "Kubernetes" },
    ],
  },
  {
    key: "testing",
    label: "Testing",
    icon: CheckCircle2,
    nodes: [
      { id: "unit",       label: "Unit Tests" },
      { id: "integration",label: "Integration" },
      { id: "e2e",        label: "E2E Tests" },
      { id: "tdd",        label: "TDD" },
      { id: "perf",       label: "Perf Testing" },
    ],
  },
  {
    key: "behavioral",
    label: "Behavioral",
    icon: Users,
    nodes: [
      { id: "star",       label: "STAR Method" },
      { id: "conflict",   label: "Conflict" },
      { id: "leadership", label: "Leadership" },
      { id: "collab",     label: "Collaboration" },
      { id: "growth",     label: "Growth Mindset" },
    ],
  },
  {
    key: "cs_fundamentals",
    label: "CS Fundamentals",
    icon: Award,
    nodes: [
      { id: "oop",        label: "OOP" },
      { id: "os",         label: "OS Basics" },
      { id: "networking", label: "Networking" },
      { id: "security",   label: "Security" },
      { id: "system_design", label: "System Design" },
    ],
  },
]

function nodeStatusStyle(status: SkillTreeNode["status"] | undefined) {
  switch (status) {
    case "mastered":     return "bg-yellow-500/20 border-yellow-500 text-yellow-600"
    case "completed":    return "bg-green-500/20 border-green-500 text-green-600"
    case "in_progress":  return "bg-primary/20 border-primary text-primary"
    case "unlocked":     return "bg-muted border-border text-foreground"
    default:             return "bg-muted/50 border-muted text-muted-foreground"
  }
}

function NodeIcon({ status }: { status: SkillTreeNode["status"] | undefined }) {
  if (status === "mastered")    return <Star className="h-3 w-3" />
  if (status === "completed")   return <CheckCircle2 className="h-3 w-3" />
  if (status === "in_progress") return <Zap className="h-3 w-3" />
  if (status === "unlocked")    return <Circle className="h-3 w-3" />
  return <Lock className="h-3 w-3" />
}

function SkillTreeTab({ tree }: { tree: SkillTree }) {
  const getNodeStatus = (domainKey: keyof SkillTree, nodeId: string): SkillTreeNode["status"] | undefined => {
    const domainNodes = tree[domainKey] ?? []
    return domainNodes.find(n => n.nodeId === nodeId)?.status
  }

  const getDomainStats = (domainKey: keyof SkillTree, nodeIds: string[]) => {
    const mastered  = nodeIds.filter(id => getNodeStatus(domainKey, id) === "mastered").length
    const completed = nodeIds.filter(id => ["completed", "mastered"].includes(getNodeStatus(domainKey, id) ?? "")).length
    return { mastered, completed, total: nodeIds.length }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Skills unlock as you complete modules, quizzes, and interviews. Master a node by scoring 100% on its quiz.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SKILL_TREE_DOMAINS.map(({ key, label, icon: Icon, nodes }) => {
          const stats = getDomainStats(key, nodes.map(n => n.id))
          return (
            <Card key={key} className="overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                </CardTitle>
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-col gap-1">
                  {nodes.map((node, i) => {
                    const status = getNodeStatus(key, node.id)
                    const isLocked = !status || status === "locked"
                    return (
                      <div key={node.id} className="flex items-center gap-2">
                        {i > 0 && (
                          <div className="ml-3 -mt-1 mb-1 h-3 w-px bg-border" />
                        )}
                        {i > 0 ? null : null}
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium w-full transition-colors",
                            nodeStatusStyle(status),
                            isLocked && "opacity-50"
                          )}
                        >
                          <NodeIcon status={status} />
                          <span className="flex-1">{node.label}</span>
                          {status === "mastered" && (
                            <span className="text-yellow-500 text-xs">★</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 rounded-lg border p-4 text-sm">
        {[
          { status: "locked" as const,      label: "Locked",      cls: "bg-muted/50 border-muted text-muted-foreground" },
          { status: "unlocked" as const,    label: "Unlocked",    cls: "bg-muted border-border text-foreground" },
          { status: "in_progress" as const, label: "In Progress", cls: "bg-primary/20 border-primary text-primary" },
          { status: "completed" as const,   label: "Completed",   cls: "bg-green-500/20 border-green-500 text-green-600" },
          { status: "mastered" as const,    label: "Mastered",    cls: "bg-yellow-500/20 border-yellow-500 text-yellow-600" },
        ].map(({ status, label, cls }) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded border text-xs", cls)}>
              <NodeIcon status={status} />
            </div>
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── XP Log ────────────────────────────────────────────────────────────────────

type XPEntry = { action: string; xp: number; description: string; timestamp: string }

const XP_ACTION_LABELS: Record<string, string> = {
  module_complete:    "Module Completed",
  quiz_pass:          "Quiz Passed",
  quiz_retry_pass:    "Quiz Retry Pass",
  lab_complete:       "Lab Completed",
  interview_complete: "Interview Done",
  interview_improve:  "Interview Improved",
  peer_review_given:  "Peer Review Given",
  resume_upload:      "Resume Uploaded",
  resume_ats_score:   "ATS Score",
  project_created:    "Project Created",
  daily_bonus:        "Daily Bonus",
  weekly_bonus:       "Weekly Bonus",
  streak_bonus:       "Streak Bonus",
  level_up:           "Level Up",
  badge_earned:       "Badge Earned",
}

function XPLogTab({ log }: { log: XPEntry[] }) {
  if (log.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
        <Zap className="h-8 w-8" />
        <p>No XP earned yet. Complete a module, quiz, or interview to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {log.map((entry, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{XP_ACTION_LABELS[entry.action] ?? entry.action}</p>
            {entry.description && (
              <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-primary">+{entry.xp} XP</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Overview content (extracted) ──────────────────────────────────────────────

function OverviewTab({
  profile,
  earnedBadges,
  unearnedBadges,
  dailyMissions,
  weeklyMissions,
  missionActions,
  stats,
  leaderboard,
  projectId,
}: {
  profile: GamificationProfile
  earnedBadges: Badge[]
  unearnedBadges: (Badge & { isEarned: boolean })[]
  dailyMissions: Mission[]
  weeklyMissions: Mission[]
  missionActions: Record<string, { label: string; href: string }>
  stats: GamificationStats | null
  leaderboard: LeaderboardEntry[]
  projectId: string | null
}) {
  const featuredWeekly = weeklyMissions[0] ?? null
  const weekEnd = new Date(profile.missions.weekly.weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const daysLeft = Math.max(0, Math.ceil((weekEnd.getTime() - Date.now()) / 86_400_000))

  return (
    <div className="space-y-6">
      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: BookOpen, label: "Complete a Module",  sub: "+50 XP",    href: projectId ? `/projects/${projectId}/learning`  : "/projects" },
          { icon: Award,    label: "Pass a Quiz",        sub: "+30–75 XP", href: projectId ? `/projects/${projectId}/learning`  : "/projects" },
          { icon: Code2,    label: "Mock Interview",     sub: "+80 XP",    href: projectId ? `/projects/${projectId}/interview` : "/projects" },
          { icon: Users,    label: "Peer Review",        sub: "+40 XP",    href: "/peer-reviews" },
        ].map(({ icon: Icon, label, sub, href }) => (
          <Link key={label} href={href}>
            <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium leading-tight">{label}</p>
              <span className="text-xs font-semibold text-primary">{sub}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Missions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredWeekly ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{featuredWeekly.title}</h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    +{featuredWeekly.xpReward} XP
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{featuredWeekly.current} / {featuredWeekly.target} completed</span>
                    <span className="text-muted-foreground">Ends in {daysLeft}d</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (featuredWeekly.current / featuredWeekly.target) * 100)}%` }}
                    />
                  </div>
                </div>
                {!featuredWeekly.completed && missionActions[featuredWeekly.type] && (
                  <Button asChild size="sm" className="mt-3 w-full" variant="outline">
                    <Link href={missionActions[featuredWeekly.type].href}>
                      {missionActions[featuredWeekly.type].label}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No weekly challenge active.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Missions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyMissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No daily missions today.</p>
            ) : (
              dailyMissions.map((m) => <MissionRow key={m.id} mission={m} actions={missionActions} />)
            )}
          </CardContent>
        </Card>
      </div>

      {/* CareerQuest */}
      {profile.careerQuest && (profile.careerQuest.stages as QuestStage[]).length > 0 && (
        <CareerQuestSection careerQuest={profile.careerQuest} projectId={projectId} />
      )}

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges ({earnedBadges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <BadgeIcon category={badge.category} className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                  {badge.earnedAt && (
                    <p className="text-xs text-primary">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges In Progress */}
      {unearnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges In Progress ({unearnedBadges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unearnedBadges.map((badge) => {
                const progress = stats ? getBadgeProgress(badge.id, stats) : 0
                const action = missionActions[
                  badge.category === "interview" ? "interview_complete"
                    : badge.category === "peer_review" ? "peer_review_given"
                    : "module_complete"
                ]
                return (
                  <div key={badge.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                      <BadgeIcon category={badge.category} className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{badge.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-medium">{progress}%</span>
                      </div>
                    </div>
                    {action && progress < 100 && (
                      <Button asChild size="sm" variant="ghost" className="shrink-0 h-7 w-7 p-0">
                        <Link href={action.href}><ChevronRight className="h-4 w-4" /></Link>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leaderboard data yet.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-4 rounded-lg border p-3">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", rankStyle(entry.rank))}>
                    {entry.rank}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.levelName} &middot; Lv {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{(entry.xp ?? 0).toLocaleString()} XP</p>
                    <p className="text-xs text-muted-foreground">{entry.badgeCount} badges</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GamificationPage() {
  const [profile,     setProfile]     = useState<GamificationProfile | null>(null)
  const [badges,      setBadges]      = useState<{ earned: Badge[]; all: (Badge & { isEarned: boolean })[] } | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats,       setStats]       = useState<GamificationStats | null>(null)
  const [xpLog,       setXpLog]       = useState<XPEntry[]>([])
  const [skillTree,   setSkillTree]   = useState<SkillTree>({})
  const [projectId,   setProjectId]   = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [prof, bdg, lb, st, xp, tree, projects] = await Promise.all([
          getGamificationProfile(),
          getGamificationBadges(),
          getLeaderboard(),
          getGamificationStats(),
          getXPLog(50),
          getSkillTree(),
          getProjectsRequest(),
        ])
        setProfile(prof)
        setBadges(bdg)
        setLeaderboard(lb.leaderboard)
        setStats(st.stats)
        setXpLog(xp.log)
        setSkillTree(tree)
        if (projects.length > 0) setProjectId(projects[0].id)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load gamification data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <AppShell title="Gamification" description="Track your progress, earn badges, and level up">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    )
  }

  if (error || !profile) {
    return (
      <AppShell title="Gamification" description="Track your progress, earn badges, and level up">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p>{error ?? "Could not load data"}</p>
        </div>
      </AppShell>
    )
  }

  const earnedBadges   = badges?.earned ?? []
  const unearnedBadges = (badges?.all ?? []).filter(b => !b.isEarned)
  const dailyMissions  = profile.missions.daily.missions
  const weeklyMissions = profile.missions.weekly.missions
  const missionActions = buildMissionActions(projectId)

  return (
    <AppShell title="Gamification" description="Track your progress, earn badges, and level up">
      <div className="space-y-6">

        {/* Level & XP Hero */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <ProgressRing progress={profile.progressPercent} size={140} strokeWidth={12}>
                <div className="text-center">
                  <span className="text-4xl font-bold">{profile.level}</span>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
              </ProgressRing>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{profile.levelName}</h2>
                {profile.nextLevelName && (
                  <p className="text-sm text-muted-foreground">Next: {profile.nextLevelName}</p>
                )}
                <p className="mt-1 text-muted-foreground">
                  {(profile.xp?.total ?? 0).toLocaleString()} XP total &middot; {profile.xp?.todayXP ?? 0} XP today
                </p>
                <div className="mt-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${profile.progressPercent}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {(profile.xpToNextLevel ?? 0).toLocaleString()} XP to next level
                </p>
              </div>

              <div className="flex gap-6 md:gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500">
                    <Flame className="h-6 w-6" />
                    <span className="text-3xl font-bold">{profile.streaks.learning.current}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Learning Streak</p>
                  {profile.streaks.learning.current >= 14 && (
                    <p className="text-xs text-orange-400 font-medium">+10% XP bonus</p>
                  )}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Trophy className="h-6 w-6" />
                    <span className="text-3xl font-bold">{earnedBadges.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skill-tree">Skill Tree</TabsTrigger>
            <TabsTrigger value="xp-log">XP Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              profile={profile}
              earnedBadges={earnedBadges}
              unearnedBadges={unearnedBadges}
              dailyMissions={dailyMissions}
              weeklyMissions={weeklyMissions}
              missionActions={missionActions}
              stats={stats}
              leaderboard={leaderboard}
              projectId={projectId}
            />
          </TabsContent>

          <TabsContent value="skill-tree" className="mt-6">
            <SkillTreeTab tree={skillTree} />
          </TabsContent>

          <TabsContent value="xp-log" className="mt-6">
            <XPLogTab log={xpLog} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
