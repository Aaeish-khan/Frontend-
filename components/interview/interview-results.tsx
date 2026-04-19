"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InterviewResults as IResults } from "./interview-session"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { interviewHistory } from "@/lib/mock-data"
import {
  Download, RotateCcw, CheckCircle, AlertCircle, Clock, Target,
  TrendingUp, ChevronDown, ChevronUp, BookOpen, Users, BarChart2,
  Trophy, ArrowRight, Zap, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// ── Types ─────────────────────────────────────────────────────────────────────

interface InterviewResultsProps {
  results: IResults
  onRetry: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function scoreGrade(score: number): { label: string; color: string; ring: string } {
  if (score >= 90) return { label: "Outstanding",  color: "text-emerald-400", ring: "text-emerald-400" }
  if (score >= 80) return { label: "Strong",        color: "text-green-500",  ring: "text-green-500"  }
  if (score >= 70) return { label: "Good",          color: "text-primary",    ring: "text-primary"    }
  if (score >= 55) return { label: "Fair",          color: "text-yellow-500", ring: "text-yellow-500" }
  return                  { label: "Needs Work",    color: "text-red-500",    ring: "text-red-500"    }
}

function subScoreColor(score: number) {
  if (score >= 80) return "text-green-500 bg-green-500/10"
  if (score >= 65) return "text-primary bg-primary/10"
  return "text-yellow-500 bg-yellow-500/10"
}

// ── Main component ────────────────────────────────────────────────────────────

export function InterviewResults({ results, onRetry }: InterviewResultsProps) {
  const [expandedQ,    setExpandedQ]    = useState<number | null>(null)
  const [displayScore, setDisplayScore] = useState(0)

  // Count-up animation
  useEffect(() => {
    const target    = results.overallScore
    const duration  = 1400
    const stepMs    = 16
    const increment = target / (duration / stepMs)
    let current     = 0
    const id = setInterval(() => {
      current = Math.min(current + increment, target)
      setDisplayScore(Math.round(current))
      if (current >= target) clearInterval(id)
    }, stepMs)
    return () => clearInterval(id)
  }, [results.overallScore])

  // Derived sub-scores (deterministic from question data)
  const sub = useMemo(() => {
    const avg  = results.overallScore
    const qs   = results.questions
    const hard = qs.filter(q => q.difficulty === "hard")
    const usagePct = qs.length
      ? qs.reduce((a, q) => a + (q.timeSpent / Math.max(q.timeLimit, 1)), 0) / qs.length
      : 0.7

    const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)))
    return {
      technical:     clamp(hard.length ? hard.reduce((a, q) => a + q.score, 0) / hard.length : avg),
      communication: clamp(avg + (qs[0]?.score ?? avg) / 10 - 3),
      clarity:       clamp(avg * 0.97),
      confidence:    clamp(avg * (0.6 + usagePct * 0.5)),
      depth:         clamp(avg - 4 + (hard.length * 2)),
      jdAlignment:   clamp(avg + (results.company ? 4 : -2)),
    }
  }, [results])

  // Strengths / weaknesses generated from score
  const allStrengths = [
    "Clear and well-structured communication",
    "Effective use of the STAR method",
    "Strong technical depth and precision",
    "Confident and composed delivery",
    "Logical problem breakdown",
    "Good use of specific examples",
  ]
  const allWeaknesses = [
    "Add concrete metrics to quantify impact",
    "Expand on trade-offs and edge cases",
    "Improve time management per question",
    "Maintain stronger eye contact with camera",
    "Structure answers more tightly before speaking",
  ]
  const strengthCount  = Math.ceil(results.overallScore / 22)
  const weaknessCount  = Math.ceil((100 - results.overallScore) / 22)
  const strengths      = allStrengths.slice(0, Math.min(strengthCount, 4))
  const weaknesses     = allWeaknesses.slice(0, Math.min(weaknessCount, 4))

  const suggestions = [
    { priority: "high",   text: "Review your weakest question and re-record a tighter version" },
    { priority: "high",   text: "Practice adding a specific number or outcome to every example" },
    { priority: "medium", text: "Time each answer — aim for 90% of the allowed time" },
    { priority: "low",    text: "Record yourself answering common questions without notes" },
  ].slice(0, Math.max(2, 5 - Math.floor(results.overallScore / 25)))

  // Previous attempts from mock history
  const pastAttempts = interviewHistory.slice(0, 3).map((h, i) => ({
    label: `Attempt ${i + 1}`,
    score: h.score,
    current: false,
  }))
  const allAttempts = [
    ...pastAttempts,
    { label: "This attempt", score: results.overallScore, current: true },
  ]

  const grade = scoreGrade(results.overallScore)

  const SUB_SCORES = [
    { key: "technical",     label: "Technical",     score: sub.technical },
    { key: "communication", label: "Communication", score: sub.communication },
    { key: "clarity",       label: "Clarity",       score: sub.clarity },
    { key: "confidence",    label: "Confidence",    score: sub.confidence },
    { key: "depth",         label: "Depth",         score: sub.depth },
    { key: "jdAlignment",   label: "Role Fit",      score: sub.jdAlignment },
  ]

  const handleDownload = () => {
    const lines = [
      "INTERMATE INTERVIEW REPORT",
      "==========================",
      "",
      `Interview Type:  ${results.category}`,
      `Target Role:     ${results.role}`,
      `Company:         ${results.company || "Not specified"}`,
      `Date:            ${new Date().toLocaleDateString()}`,
      `Duration:        ${formatTime(results.totalTime)}`,
      "",
      `OVERALL SCORE: ${results.overallScore}% — ${grade.label}`,
      "",
      "SUB-SCORES:",
      ...SUB_SCORES.map(s => `  ${s.label.padEnd(16)} ${s.score}%`),
      "",
      "STRENGTHS:",
      ...strengths.map(s => `  ✓ ${s}`),
      "",
      "AREAS FOR IMPROVEMENT:",
      ...weaknesses.map(w => `  △ ${w}`),
      "",
      "QUESTION BREAKDOWN:",
      ...results.questions.map((q, i) =>
        `\n  Q${i + 1} [${q.difficulty}] — ${q.score}%\n  ${q.question}\n  Feedback: ${q.feedback}`
      ),
      "",
      "Generated by InterMate · AI-Powered Interview Preparation",
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement("a"), { href: url, download: `InterMate_Report_${new Date().toISOString().split("T")[0]}.txt` })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >

      {/* ── Score hero ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-6">
                <ProgressRing progress={displayScore} size={120} strokeWidth={10}>
                  <div className="text-center">
                    <span className={cn("text-3xl font-bold tabular-nums", grade.color)}>
                      {displayScore}
                    </span>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </ProgressRing>
                <div>
                  <p className={cn("text-2xl font-bold", grade.color)}>{grade.label}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {results.role}{results.company ? ` · ${results.company}` : ""}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />{formatTime(results.totalTime)}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />{results.questions.length} questions
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground capitalize">
                      <MessageSquare className="h-4 w-4" />{results.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" />Download Report
                </Button>
                <Button size="sm" className="gap-2" onClick={onRetry}>
                  <RotateCcw className="h-4 w-4" />Retry
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Sub-scores ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SUB_SCORES.map(({ key, label, score }) => (
                <div key={key} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", subScoreColor(score))}>
                      {score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn("h-full rounded-full", score >= 80 ? "bg-green-500" : score >= 65 ? "bg-primary" : "bg-yellow-500")}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Strengths / Weaknesses ── */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-green-500">
              <CheckCircle className="h-5 w-5" />Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-yellow-500">
              <AlertCircle className="h-5 w-5" />Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                <span>{w}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Question breakdown ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
        <Card>
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                >
                  <span className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    q.score >= 80 ? "bg-green-500/10 text-green-500" :
                    q.score >= 65 ? "bg-primary/10 text-primary"     :
                    "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {q.score}%
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium line-clamp-1 text-sm">{q.question}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn(
                        "text-xs font-medium capitalize",
                        q.difficulty === "easy"   && "text-green-500",
                        q.difficulty === "medium" && "text-yellow-500",
                        q.difficulty === "hard"   && "text-red-500",
                      )}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(q.timeSpent)} used · {formatTime(q.timeLimit)} limit
                      </span>
                    </div>
                  </div>
                  {expandedQ === i
                    ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {expandedQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Question</p>
                          <p className="text-sm">{q.question}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">AI Feedback</p>
                          <p className="text-sm text-muted-foreground">{q.feedback}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full",
                                q.score >= 80 ? "bg-green-500" :
                                q.score >= 65 ? "bg-primary"   : "bg-yellow-500"
                              )}
                              style={{ width: `${q.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums">{q.score}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Suggestions ── */}
      {suggestions.length > 0 && (
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Specific Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <span className={cn(
                    "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    s.priority === "high"   ? "bg-red-500/10 text-red-400"    :
                    s.priority === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {s.priority}
                  </span>
                  <p className="text-sm">{s.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Attempt history ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Attempt History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-28">
              {allAttempts.map((a, i) => {
                const heightPct = Math.max(8, a.score)
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className={cn(
                      "text-xs font-semibold tabular-nums",
                      a.current ? "text-primary" : "text-muted-foreground"
                    )}>
                      {a.score}%
                    </span>
                    <div className="w-full flex items-end" style={{ height: "72px" }}>
                      <motion.div
                        className={cn(
                          "w-full rounded-t-md",
                          a.current ? "bg-primary" : "bg-muted-foreground/25"
                        )}
                        initial={{ height: 0 }}
                        animate={{ height: `${(heightPct / 100) * 72}px` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
                      />
                    </div>
                    <span className={cn(
                      "text-xs text-center truncate w-full",
                      a.current ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {a.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Next actions ── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BookOpen,
                  label: "Improve Skills",
                  desc:  "Recommended learning modules",
                  href:  "/learning",
                  cls:   "border-primary/20 hover:border-primary/40 hover:bg-primary/5",
                  icls:  "text-primary bg-primary/10",
                },
                {
                  icon: Users,
                  label: "Peer Review",
                  desc:  "Get feedback from a teammate",
                  href:  "/peer-reviews",
                  cls:   "border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5",
                  icls:  "text-cyan-400 bg-cyan-500/10",
                },
                {
                  icon: Trophy,
                  label: "View Progress",
                  desc:  "XP, badges, and streaks",
                  href:  "/gamification",
                  cls:   "border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/5",
                  icls:  "text-yellow-400 bg-yellow-500/10",
                },
                {
                  icon: BarChart2,
                  label: "All Reports",
                  desc:  "Full interview history",
                  href:  "/reports",
                  cls:   "border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5",
                  icls:  "text-purple-400 bg-purple-500/10",
                },
              ].map(({ icon: Icon, label, desc, href, cls, icls }) => (
                <Link key={label} href={href}>
                  <div className={cn(
                    "flex flex-col gap-3 rounded-xl border p-4 transition-all cursor-pointer h-full",
                    cls
                  )}>
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", icls)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-auto" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Not satisfied with this attempt?</p>
              <Button variant="outline" className="gap-2" onClick={onRetry}>
                <RotateCcw className="h-4 w-4" />
                Retry Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  )
}
