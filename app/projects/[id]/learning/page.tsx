"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  getProjectLearningPlanRequest,
  generateLearningPlanRequest,
  updateModuleStatusRequest,
  getModuleQuizRequest,
  submitModuleQuizRequest,
  completeLabRequest,
  generateProjectRecommendationsRequest,
  type LearningPlan,
  type LearningModule,
  type QuizQuestion,
  type QuizResult,
  type ConceptDiagnosis,
  type ProjectRecommendation,
} from "@/lib/api-projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  FlaskConical,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Trophy,
  Brain,
  Lightbulb,
  Code2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Readiness Ring ────────────────────────────────────────────────────────────

function ReadinessRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={110} height={110} className="-rotate-90">
        <circle cx={55} cy={55} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle
          cx={55} cy={55} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center" style={{ marginTop: -80 }}>
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">readiness</span>
      </div>
      <div style={{ marginTop: 40 }} />
    </div>
  );
}

// ── Skill Level Badge ─────────────────────────────────────────────────────────

const SKILL_LEVEL_CONFIG = {
  beginner:     { label: "Beginner",     border: "border-red-300",    text: "text-red-700",    bg: "bg-red-50"    },
  intermediate: { label: "Intermediate", border: "border-amber-300",  text: "text-amber-700",  bg: "bg-amber-50"  },
  advanced:     { label: "Advanced",     border: "border-green-300",  text: "text-green-700",  bg: "bg-green-50"  },
};

function SkillLevelBadge({ level }: { level: "beginner" | "intermediate" | "advanced" }) {
  const cfg = SKILL_LEVEL_CONFIG[level] ?? SKILL_LEVEL_CONFIG.beginner;
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", cfg.border, cfg.text, cfg.bg)}>
      ▲ {cfg.label}
    </span>
  );
}

// ── Concept Breakdown ─────────────────────────────────────────────────────────

function ConceptBreakdown({ diagnosis }: { diagnosis: ConceptDiagnosis }) {
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <div className="rounded-md border border-blue-100 bg-blue-50/40 mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100/50 transition-colors rounded-md"
      >
        <span className="flex items-center gap-1.5">
          <Brain className="h-4 w-4" />
          Concept Breakdown — {diagnosis.scorePct}% · <SkillLevelBadge level={diagnosis.skillLevel} />
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {diagnosis.conceptsKnown.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase mb-1.5">Known concepts</p>
              <div className="flex flex-wrap gap-1.5">
                {diagnosis.conceptsKnown.map((c, i) => (
                  <span key={i} className="rounded-full bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {diagnosis.conceptsWeak.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase mb-1.5">Weak concepts</p>
              <div className="flex flex-wrap gap-1.5">
                {diagnosis.conceptsWeak.map((c, i) => (
                  <span key={i} className="rounded-full bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {diagnosis.targetedResources.length > 0 && (
            <div>
              <button
                onClick={() => setResourcesOpen((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-700 uppercase hover:underline mb-1.5"
              >
                <BookOpen className="h-3 w-3" />
                Targeted resources ({diagnosis.targetedResources.length})
                {resourcesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {resourcesOpen && (
                <div className="space-y-2">
                  {diagnosis.targetedResources.map((r, i) => (
                    <div key={i} className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-blue-900">{r.concept}</span>
                        <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] uppercase flex-shrink-0">
                          {r.platform}
                        </span>
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {r.label} <ExternalLink className="h-3 w-3" />
                      </a>
                      {r.whyThisHelps && (
                        <p className="text-muted-foreground italic">{r.whyThisHelps}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {diagnosis.summary && (
            <p className="text-xs text-muted-foreground italic border-t pt-2">{diagnosis.summary}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not started", color: "bg-gray-100 text-gray-600" },
  in_progress:  { label: "In progress",  color: "bg-blue-100 text-blue-700"  },
  completed:    { label: "Completed",    color: "bg-green-100 text-green-700" },
  needs_review: { label: "Needs review", color: "bg-amber-100 text-amber-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.color)}>{cfg.label}</span>;
}

// ── Quiz Panel ────────────────────────────────────────────────────────────────

function QuizPanel({
  projectId, moduleId, onResult,
}: {
  projectId: string;
  moduleId: string;
  onResult: (r: QuizResult) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [selected, setSelected]   = useState<(number | null)[]>([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState<QuizResult | null>(null);
  const [err, setErr]             = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getModuleQuizRequest(projectId, moduleId);
      setQuestions(data.questions);
      setSelected(new Array(data.questions.length).fill(null));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [projectId, moduleId]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!questions) return;
    const answers = selected.map((s) => s ?? 0);
    setSubmitting(true);
    try {
      const r = await submitModuleQuizRequest(projectId, moduleId, answers);
      setResult(r);
      onResult(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground py-2">Generating quiz questions…</p>;
  if (err)     return <p className="text-sm text-red-500 py-2">{err}</p>;
  if (!questions) return null;

  if (result) {
    return (
      <div className="space-y-3 pt-2">
        <div className={cn("rounded-lg px-4 py-3 text-sm font-medium", result.passed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
          {result.passed ? "Passed" : "Needs review"} — {result.score}% ({result.correct}/{result.total} correct)
        </div>
        {result.feedback.map((f, i) => (
          <div key={i} className={cn("rounded-md border p-3 text-sm", f.correct ? "border-green-200 bg-green-50/40" : "border-red-200 bg-red-50/40")}>
            <p className="font-medium mb-1">{f.question}</p>
            <p className="text-muted-foreground">Your answer: {f.yourAnswer}</p>
            {!f.correct && <p className="text-green-700">Correct: {f.correctAnswer}</p>}
            {f.explanation && <p className="text-muted-foreground mt-1 italic">{f.explanation}</p>}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => { setResult(null); load(); }}>
          Retry quiz
        </Button>
      </div>
    );
  }

  const allAnswered = selected.every((s) => s !== null);

  return (
    <div className="space-y-4 pt-2">
      {questions.map((q, qi) => (
        <div key={q.id} className="space-y-1.5">
          {q.conceptTested && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 flex items-center gap-1">
              <Brain className="h-3 w-3" /> Testing: {q.conceptTested}
            </p>
          )}
          <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setSelected((prev) => { const n = [...prev]; n[qi] = oi; return n; })}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  selected[qi] === oi
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted/50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button size="sm" disabled={!allAnswered || submitting} onClick={submit}>
        {submitting ? "Submitting…" : "Submit answers"}
      </Button>
    </div>
  );
}

// ── Project Workshop ──────────────────────────────────────────────────────────

function ProjectWorkshop({
  projectId,
  existing,
}: {
  projectId: string;
  existing?: ProjectRecommendation[];
}) {
  const [projects, setProjects] = useState<ProjectRecommendation[]>(existing ?? []);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  async function generate() {
    setLoading(true);
    setErr("");
    try {
      const res = await generateProjectRecommendationsRequest(projectId);
      setProjects(res.projects);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  const DIFF_COLOR: Record<string, string> = {
    beginner:     "bg-green-100 text-green-700",
    intermediate: "bg-amber-100 text-amber-700",
    advanced:     "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-violet-600" /> Project Workshop
          </CardTitle>
          <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
            {loading
              ? <><RefreshCw className="mr-1.5 h-3 w-3 animate-spin" /> Generating…</>
              : projects.length > 0 ? "Refresh ideas" : "Generate project ideas"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          AI-curated projects that directly target your weak concepts
        </p>
      </CardHeader>
      <CardContent>
        {err && <p className="text-sm text-red-500 mb-3">{err}</p>}
        {projects.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Generate project ideas&quot; to get personalized project recommendations based on your quiz results.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden"
            >
              <div className="p-4 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-snug">{p.title}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold flex-shrink-0", DIFF_COLOR[p.difficulty] ?? DIFF_COLOR.intermediate)}>
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> ~{p.estimatedHours}h
                </div>

                {p.weakAreasAddressed.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-red-600 mb-1">Targets your weak areas</p>
                    <div className="flex flex-wrap gap-1">
                      {p.weakAreasAddressed.map((w, wi) => (
                        <span key={wi} className="rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] px-2 py-0.5">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {p.relatedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.relatedSkills.map((s, si) => (
                      <span key={si} className="rounded-full bg-muted text-muted-foreground text-[10px] px-2 py-0.5">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t">
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-primary hover:bg-muted/40 transition-colors"
                >
                  {expandedIdx === i ? "Hide details" : "Why + steps"}
                  {expandedIdx === i ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {expandedIdx === i && (
                  <div className="px-4 pb-4 space-y-2">
                    {p.whyThisProject && (
                      <p className="text-xs text-muted-foreground italic">{p.whyThisProject}</p>
                    )}
                    {p.steps.length > 0 && (
                      <ol className="list-decimal pl-4 space-y-1">
                        {p.steps.map((s, si) => (
                          <li key={si} className="text-xs">{s}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Module Card ───────────────────────────────────────────────────────────────

function ModuleCard({
  module, projectId, onStatusChange, onDiagnosed,
}: {
  module: LearningModule;
  projectId: string;
  onStatusChange: (moduleId: string, status: LearningModule["status"]) => void;
  onDiagnosed: (moduleId: string, diagnosis: ConceptDiagnosis) => void;
}) {
  const [open, setOpen]         = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [labDone, setLabDone]   = useState(module.labSpec?.completed ?? false);
  const [localDiagnosis, setLocalDiagnosis] = useState<ConceptDiagnosis | null>(
    module.conceptDiagnosis ?? null
  );

  const NEXT_STATUS: Partial<Record<LearningModule["status"], LearningModule["status"]>> = {
    not_started:  "in_progress",
    in_progress:  "completed",
    needs_review: "in_progress",
    completed:    "not_started",
  };

  async function cycleStatus() {
    const next = NEXT_STATUS[module.status];
    if (!next) return;
    await updateModuleStatusRequest(projectId, module.id, next);
    onStatusChange(module.id, next);
  }

  async function toggleLab(done: boolean) {
    await completeLabRequest(projectId, module.id, done);
    setLabDone(done);
  }

  const PRIORITY_COLOR: Record<string, string> = {
    high: "text-red-600", medium: "text-amber-600", low: "text-gray-400",
  };

  const weakCount  = localDiagnosis?.conceptsWeak.length ?? 0;
  const knownCount = localDiagnosis?.conceptsKnown.length ?? 0;

  return (
    <Card className={cn("transition-shadow", open && "shadow-md")}>
      <CardHeader className="cursor-pointer select-none pb-2" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <button
              onClick={(e) => { e.stopPropagation(); cycleStatus(); }}
              className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary"
              title="Cycle status"
            >
              {module.status === "completed"
                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                : <Circle className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn("font-medium leading-snug", module.status === "completed" && "line-through text-muted-foreground")}>
                  {module.title}
                </p>
                <span className={cn("text-xs font-semibold uppercase", PRIORITY_COLOR[module.priority])}>
                  {module.priority}
                </span>
                {localDiagnosis && (
                  <SkillLevelBadge level={localDiagnosis.skillLevel} />
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {module.estimatedMinutes} min
                </p>
                {localDiagnosis && (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 font-medium">{knownCount}</span>
                    {" / "}
                    <span className="font-medium">{knownCount + weakCount}</span>
                    {" concepts"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={module.status} />
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">
          {module.objective && (
            <p className="text-sm text-muted-foreground">{module.objective}</p>
          )}
          {module.whyItMatters && (
            <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-800">
              <span className="font-medium">Why it matters: </span>{module.whyItMatters}
            </div>
          )}

          {localDiagnosis && (
            <ConceptBreakdown diagnosis={localDiagnosis} />
          )}

          {module.outcomes.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Outcomes</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {module.outcomes.map((o, i) => <li key={i} className="text-sm">{o}</li>)}
              </ul>
            </div>
          )}

          {module.resources.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Resources
              </p>
              <div className="flex flex-wrap gap-2">
                {module.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors">
                    {r.label} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {module.labSpec && (
            <div className="rounded-md border border-violet-200 bg-violet-50/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-violet-600" />
                  Lab: {module.labSpec.title}
                </p>
                <Badge variant={labDone ? "default" : "outline"} className="text-xs">
                  {labDone ? "Done" : "Pending"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{module.labSpec.description}</p>
              {module.labSpec.starterPrompt && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-violet-700 font-medium">Starter prompt</summary>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{module.labSpec.starterPrompt}</p>
                </details>
              )}
              <Button size="sm" variant={labDone ? "outline" : "default"}
                onClick={() => toggleLab(!labDone)}>
                {labDone ? "Mark incomplete" : "Mark complete"}
              </Button>
            </div>
          )}

          <div className="border-t pt-3">
            <button onClick={() => setShowQuiz((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Zap className="h-4 w-4" />
              {showQuiz ? "Hide quiz" : "Take knowledge quiz"}
              {module.bestQuizScore !== null && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (best: {module.bestQuizScore}%)
                </span>
              )}
            </button>
            {showQuiz && (
              <QuizPanel
                projectId={projectId}
                moduleId={module.id}
                onResult={(r) => {
                  if (r.module.status !== module.status) {
                    onStatusChange(module.id, r.module.status as LearningModule["status"]);
                  }
                  if (r.conceptDiagnosis) {
                    setLocalDiagnosis(r.conceptDiagnosis);
                    onDiagnosed(module.id, r.conceptDiagnosis);
                  }
                  setShowQuiz(false);
                }}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectLearningPage() {
  const params    = useParams();
  const projectId = params?.id as string;

  const [plan, setPlan]             = useState<LearningPlan | null>(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState("");

  const fetchPlan = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const p = await getProjectLearningPlanRequest(projectId);
      setPlan(p);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("404") || msg.toLowerCase().includes("no learning plan")) {
        setPlan(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  async function generatePlan() {
    setGenerating(true);
    setError("");
    try {
      const p = await generateLearningPlanRequest(projectId);
      setPlan(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  }

  function handleModuleStatusChange(moduleId: string, status: LearningModule["status"]) {
    setPlan((prev) => {
      if (!prev) return prev;
      const modules = prev.modules.map((m) =>
        m.id === moduleId ? { ...m, status } : m
      );
      const completedModules = modules.filter((m) => m.status === "completed").length;
      return { ...prev, modules, progress: { ...prev.progress, completedModules } };
    });
  }

  function handleModuleDiagnosed(moduleId: string, diagnosis: ConceptDiagnosis) {
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, conceptDiagnosis: diagnosis } : m
        ),
      };
    });
  }

  const readiness  = plan?.progress?.readinessScore ?? 0;
  const completed  = plan?.progress?.completedModules ?? 0;
  const total      = plan?.modules?.length ?? 0;
  const actions    = plan?.progress?.nextBestActions ?? [];
  const weaknesses = plan?.diagnosis?.weaknesses ?? [];
  const strengths  = plan?.diagnosis?.strengths ?? [];

  const SEV_COLOR: Record<string, string> = {
    high:   "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low:    "bg-gray-100 text-gray-600 border-gray-200",
  };

  const diagnosedModules = plan?.modules?.filter((m) => m.conceptDiagnosis) ?? [];
  const totalWeakConcepts = diagnosedModules.reduce(
    (sum, m) => sum + (m.conceptDiagnosis?.conceptsWeak.length ?? 0), 0
  );

  return (
    <AppShell title="Learning Mode" description="Personalized plan for this job application">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      ) : !plan ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Lightbulb className="h-10 w-10 text-amber-400" />
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            No learning plan yet. Generate one to get a personalized roadmap based on your resume gaps and job description.
          </p>
          <Button onClick={generatePlan} disabled={generating}>
            {generating ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : "Generate Learning Plan"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* § 1 — Dashboard row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <ReadinessRing score={readiness} />
                <p className="text-sm text-muted-foreground mt-1">
                  {completed}/{total} modules complete
                </p>
                {diagnosedModules.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalWeakConcepts} weak concepts identified
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" /> Next best actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {actions.length === 0
                  ? <p className="text-sm text-muted-foreground">All caught up!</p>
                  : actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Zap className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{a}</span>
                    </div>
                  ))}
                <Button
                  size="sm" variant="outline" className="mt-2"
                  onClick={generatePlan} disabled={generating}>
                  <RefreshCw className={cn("mr-2 h-3 w-3", generating && "animate-spin")} />
                  Regenerate plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* § 2 — Diagnosis */}
          {(weaknesses.length > 0 || strengths.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weaknesses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Skill gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {weaknesses.slice(0, 6).map((w, i) => (
                      <div key={i} className={cn("rounded-md border px-3 py-2 text-sm", SEV_COLOR[w.severity])}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{w.label || w.key}</span>
                          <span className="text-xs capitalize">{w.severity}</span>
                        </div>
                        {w.explanation && <p className="text-xs mt-0.5 opacity-80">{w.explanation}</p>}
                        {w.missingSkills && w.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {w.missingSkills.map((s, si) => (
                              <span key={si} className="rounded bg-white/60 border px-1.5 py-0.5 text-[10px]">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {strengths.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-green-500" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* § 3 — Modules */}
          <div>
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
              Learning Modules ({total})
            </h2>
            <div className="space-y-3">
              {plan.modules
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    projectId={projectId}
                    onStatusChange={handleModuleStatusChange}
                    onDiagnosed={handleModuleDiagnosed}
                  />
                ))}
            </div>
          </div>

          {/* § 4 — Project Workshop */}
          <ProjectWorkshop
            projectId={projectId}
            existing={plan.projectRecommendations}
          />

        </div>
      )}
    </AppShell>
  );
}
