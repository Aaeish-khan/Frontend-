"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  FolderOpen,
  Plus,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { getProjectsRequest, type Project } from "@/lib/api-projects"
import { cardVariants, staggerContainer, staggerItem } from "@/lib/animations"
import { cn } from "@/lib/utils"
import {
  getApplicationStatusLabel,
  getProjectApplicationStatus,
  getProjectCategoryLabel,
} from "@/lib/project-options"

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-primary"
  if (score >= 40) return "text-violet-500"
  return "text-rose-500"
}

function scoreBar(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-primary"
  if (score >= 40) return "bg-violet-500"
  return "bg-rose-500"
}

const statusStyles: Record<string, string> = {
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  archived: "border-border bg-muted text-muted-foreground",
  applied: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  checking_eligibility: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  planning_to_apply: "border-primary/20 bg-primary/10 text-primary",
}

function getAverageScore(projects: Project[]) {
  const scored = projects
    .map((project) => project.aiInsights?.resumeMatchScore)
    .filter((score): score is number => typeof score === "number")

  if (scored.length === 0) return 0
  return Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length)
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getProjectsRequest()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects"))
      .finally(() => setLoading(false))
  }, [])

  const activeCount = projects.filter((project) => project.status !== "archived").length
  const averageScore = getAverageScore(projects)

  return (
    <AppShell title="Projects" description="Manage active job targets">
      <motion.div
        className="space-y-5"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={staggerItem} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Job Targets</p>
            <h2 className="text-xl font-bold tracking-tight">Application projects</h2>
          </div>
          <Button asChild className="rounded-2xl">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="shimmer h-24 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {error && !loading ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-5 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="mt-2 text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!loading && !error && projects.length === 0 ? (
          <motion.div variants={cardVariants} className="rounded-3xl border border-border/60 bg-card/80 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderOpen className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create a target role to start ATS, interview, and learning prep.</p>
            <Button asChild className="mt-5 rounded-2xl">
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </motion.div>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <>
            <motion.div variants={staggerItem} className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Projects", value: projects.length, icon: BriefcaseBusiness },
                { label: "Active", value: activeCount, icon: Briefcase },
                { label: "Avg ATS", value: `${averageScore}%`, icon: FileCheck2 },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold">{item.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-3">
              {projects.map((project) => {
                const matchScore = project.aiInsights?.resumeMatchScore
                const score = typeof matchScore === "number" ? matchScore : 0
                const hasScore = project.aiInsights?.processingStatus === "done" && matchScore != null
                const applicationStatus = getProjectApplicationStatus(project)
                const category = getProjectCategoryLabel(project)

                return (
                  <motion.div key={project.id} variants={cardVariants} whileHover="hover">
                    <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md lg:grid-cols-[minmax(0,1.2fr)_170px_110px_auto] lg:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">{project.title}</h3>
                          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {project.companyName ? (
                              <span className="inline-flex min-w-0 items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                <span className="truncate">{project.companyName}</span>
                              </span>
                            ) : null}
                            {project.jobRole ? (
                              <span className="inline-flex min-w-0 items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span className="truncate">{project.jobRole}</span>
                              </span>
                            ) : null}
                            {category ? (
                              <span className="truncate">{category}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">ATS match</span>
                          <span className={cn("font-semibold", hasScore ? scoreColor(score) : "text-muted-foreground")}>
                            {hasScore ? `${score}%` : "Pending"}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", hasScore ? scoreBar(score) : "bg-muted-foreground/30")}
                            style={{ width: `${hasScore ? score : 18}%` }}
                          />
                        </div>
                      </div>

                      <span
                        className={cn(
                          "w-fit rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                          statusStyles[applicationStatus] ?? statusStyles.active,
                        )}
                      >
                        {getApplicationStatusLabel(applicationStatus)}
                      </span>

                      <Button asChild size="sm" className="rounded-xl">
                        <Link href={`/projects/${project.id}`}>
                          Open Project
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        ) : null}
      </motion.div>
    </AppShell>
  )
}
