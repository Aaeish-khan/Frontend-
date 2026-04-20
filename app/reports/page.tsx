"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  FileText,
  Video,
  FileBarChart,
  Calendar,
  Search,
  TrendingUp,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"
import {
  getProjectsRequest,
  getProjectInterviewHistoryRequest,
  deleteInterviewSessionRequest,
  getInterviewReportHtmlRequest,
  type Project,
} from "@/lib/api-projects"

// ── Types ────────────────────────────────────────────────────────────────────

type ReportType = "all" | "interview" | "resume"

type ReportEntry = {
  id: string
  type: "interview" | "resume"
  title: string
  subtitle: string
  date: string
  score: number | null
  projectId: string
  sessionId?: string
  strengths?: string[]
  improvements?: string[]
  recommendation?: string
  persona?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const reportTypeIcons = {
  interview: Video,
  resume: FileText,
}

const reportTypeColors = {
  interview: "bg-blue-500/10 text-blue-500",
  resume: "bg-green-500/10 text-green-500",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number | null) {
  if (!score) return "text-muted-foreground"
  if (score >= 85) return "text-green-500"
  if (score >= 70) return "text-primary"
  if (score >= 50) return "text-yellow-500"
  return "text-red-500"
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function buildReports(
  projects: Project[],
  sessionsByProject: Record<string, any[]>
): ReportEntry[] {
  const entries: ReportEntry[] = []

  for (const project of projects) {
    // Resume report — only if ATS analysis is done
    const atsScore =
      (project.aiInsights as any)?.atsScore ??
      project.aiInsights?.resumeMatchScore ??
      null
    const processedAt = project.aiInsights?.processedAt

    if (atsScore != null && processedAt) {
      entries.push({
        id: `resume_${project.id}`,
        type: "resume",
        title: `${project.jobRole} Resume Analysis`,
        subtitle: project.companyName || project.title,
        date: processedAt,
        score: atsScore,
        projectId: project.id,
      })
    }

    // Interview reports — completed sessions only
    for (const session of sessionsByProject[project.id] ?? []) {
      if (!session.completedAt) continue
      entries.push({
        id: `interview_${session._id}`,
        type: "interview",
        title: session.title || "Mock Interview",
        subtitle: `${project.jobRole} · ${project.companyName}`,
        date: session.completedAt,
        score: session.overallScore != null ? session.overallScore * 10 : null,
        projectId: project.id,
        sessionId: session._id,
        strengths: session.report?.strengths ?? [],
        improvements: session.report?.improvements ?? [],
        recommendation: session.report?.recommendation ?? "",
        persona: session.persona,
      })
    }
  }

  return entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<ReportType>("all")
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const projects = await getProjectsRequest()

        const sessionResults = await Promise.allSettled(
          projects.map((p) => getProjectInterviewHistoryRequest(p.id))
        )

        const sessionsByProject: Record<string, any[]> = {}
        projects.forEach((p, i) => {
          const result = sessionResults[i]
          sessionsByProject[p.id] =
            result.status === "fulfilled" ? result.value : []
        })

        setReports(buildReports(projects, sessionsByProject))
      } catch (err: any) {
        setError(err.message || "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filters: { id: ReportType; label: string }[] = [
    { id: "all", label: "All Reports" },
    { id: "interview", label: "Interview" },
    { id: "resume", label: "Resume" },
  ]

  async function handleDeleteReport(report: ReportEntry) {
    if (report.type === "interview" && report.sessionId) {
      setDeleting(true)
      try {
        await deleteInterviewSessionRequest(report.projectId, report.sessionId)
      } catch {
        // still remove from UI
      } finally {
        setDeleting(false)
      }
    }
    setReports((prev) => prev.filter((r) => r.id !== report.id))
    if (selectedReport === report.id) setSelectedReport(null)
    setDeleteConfirmId(null)
  }

  async function handleViewFull(report: ReportEntry) {
    if (report.type === "interview" && report.sessionId) {
      try {
        const html = await getInterviewReportHtmlRequest(
          report.projectId,
          report.sessionId
        )
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const win = window.open(url, "_blank")
        if (win) setTimeout(() => URL.revokeObjectURL(url), 10000)
      } catch {
        window.open("/projects", "_self")
      }
    } else {
      window.open("/projects", "_self")
    }
  }

  function handleDownload(report: ReportEntry) {
    let content = ""

    if (report.type === "interview") {
      const rawScore = report.score != null ? report.score / 10 : null
      content = [
        "INTERMATE INTERVIEW REPORT",
        "==========================",
        report.title,
        report.subtitle,
        `Date: ${formatDate(report.date)}`,
        rawScore != null ? `Score: ${rawScore}/10 (${report.score}%)` : "",
        report.persona ? `Persona: ${report.persona}` : "",
        "",
        ...(report.strengths?.length
          ? ["STRENGTHS:", ...report.strengths.map((s) => `- ${s}`), ""]
          : []),
        ...(report.improvements?.length
          ? ["AREAS FOR IMPROVEMENT:", ...report.improvements.map((s) => `- ${s}`), ""]
          : []),
        ...(report.recommendation ? [`RECOMMENDATION:`, report.recommendation, ""] : []),
        "Generated by InterMate - AI-Powered Interview Preparation Platform",
      ]
        .filter((l) => l !== undefined)
        .join("\n")
    } else {
      content = [
        "INTERMATE RESUME ANALYSIS REPORT",
        "=================================",
        report.title,
        report.subtitle,
        `Date: ${formatDate(report.date)}`,
        `ATS Score: ${report.score ?? "N/A"}%`,
        "",
        "Open the project in InterMate for the full detailed analysis.",
        "",
        "Generated by InterMate - AI-Powered Resume Analyzer",
      ].join("\n")
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `InterMate_${report.type}_${formatDate(report.date).replace(/ /g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredReports = reports.filter((r) => {
    const q = search.toLowerCase()
    if (!r.title.toLowerCase().includes(q) && !r.subtitle.toLowerCase().includes(q))
      return false
    if (activeFilter === "all") return true
    return r.type === activeFilter
  })

  const selectedReportData = reports.find((r) => r.id === selectedReport)
  const interviewCount = reports.filter((r) => r.type === "interview").length
  const resumeCount = reports.filter((r) => r.type === "resume").length
  const scored = reports.filter((r) => r.score != null)
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((s, r) => s + r.score!, 0) / scored.length)
      : null

  if (loading) {
    return (
      <AppShell title="Reports" description="View and download your interview and resume reports">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Reports" description="View and download your interview and resume reports">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Reports"
      description="View and download your interview and resume reports"
    >
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Stats */}
        <motion.div variants={staggerItem} className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileBarChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Video className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{interviewCount}</p>
                <p className="text-sm text-muted-foreground">Interview Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumeCount}</p>
                <p className="text-sm text-muted-foreground">Resume Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {avgScore != null ? `${avgScore}%` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <motion.div variants={staggerItem} className="grid gap-6 lg:grid-cols-3">
          {/* Reports List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredReports.map((report) => {
              const Icon =
                reportTypeIcons[report.type as keyof typeof reportTypeIcons] ||
                FileText
              const colors =
                reportTypeColors[report.type as keyof typeof reportTypeColors] ||
                "bg-muted text-muted-foreground"

              return (
                <Card
                  key={report.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedReport === report.id && "border-primary"
                  )}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                          colors
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{report.title}</p>
                          {report.score != null && (
                            <span
                              className={cn(
                                "font-bold",
                                getScoreColor(report.score)
                              )}
                            >
                              {report.score}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {report.subtitle}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.date)}
                          </span>
                          <span className="capitalize">{report.type} Report</span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {deleteConfirmId === report.id ? (
                          <span className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              disabled={deleting}
                              onClick={() => handleDeleteReport(report)}
                            >
                              {deleting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-red-500"
                            onClick={() => setDeleteConfirmId(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  {reports.length === 0 ? "No reports yet" : "No reports found"}
                </h3>
                <p className="text-muted-foreground">
                  {reports.length === 0
                    ? "Complete an interview or resume analysis to see reports here."
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            )}
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-1">
            {selectedReportData ? (
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Report Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    {(() => {
                      const Icon =
                        reportTypeIcons[
                          selectedReportData.type as keyof typeof reportTypeIcons
                        ] || FileText
                      const colors =
                        reportTypeColors[
                          selectedReportData.type as keyof typeof reportTypeColors
                        ]
                      return (
                        <div
                          className={cn(
                            "mx-auto flex h-16 w-16 items-center justify-center rounded-xl",
                            colors
                          )}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                      )
                    })()}
                    <h3 className="mt-4 font-semibold">
                      {selectedReportData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedReportData.subtitle}
                    </p>
                  </div>

                  {selectedReportData.score != null && (
                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <span className="text-sm font-medium">Score</span>
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          getScoreColor(selectedReportData.score)
                        )}
                      >
                        {selectedReportData.score}%
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{formatDate(selectedReportData.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize">
                        {selectedReportData.type}
                      </span>
                    </div>
                    {selectedReportData.persona && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Persona</span>
                        <span className="capitalize">
                          {selectedReportData.persona}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedReportData.recommendation && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                      {selectedReportData.recommendation}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleDownload(selectedReportData)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleViewFull(selectedReportData)}
                    >
                      <Eye className="h-4 w-4" />
                      View Full
                    </Button>
                  </div>

                  <div className="pt-1">
                    {deleteConfirmId === selectedReportData.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex-1">
                          Delete permanently?
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2.5 text-xs"
                          disabled={deleting}
                          onClick={() => handleDeleteReport(selectedReportData)}
                        >
                          {deleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Yes, Delete"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-muted-foreground hover:text-red-500 text-xs"
                        onClick={() =>
                          setDeleteConfirmId(selectedReportData.id)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {selectedReportData.type === "interview"
                          ? "Delete Report"
                          : "Remove from List"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-[300px]">
                <div className="text-center text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Select a report to preview</p>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
