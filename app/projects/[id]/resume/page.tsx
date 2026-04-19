"use client";

/**
 * File: intermate/app/projects/[id]/resume/page.tsx
 *
 * Full-featured Resume Analyzer page.
 * Flow:
 *   1. Loads existing analysis from the backend on mount.
 *   2. If no analysis exists → shows "Upload & Analyze" panel.
 *   3. If analysis exists   → shows full results dashboard.
 *   4. User can always re-upload a new PDF to re-run analysis.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  analyzeProjectResumeRequest,
  getProjectResumeReportRequest,
  type ResumeAnalysis,
} from "@/lib/api-projects";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Download,
  Tag,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  Briefcase,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Score colour helper ───────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Needs Work";
}

// ─── Priority badge ────────────────────────────────────────────────────────────
const priorityStyle = {
  high:   "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low:    "bg-green-500/10 text-green-500 border-green-500/20",
};

// ─── Section: Upload panel ─────────────────────────────────────────────────────
function UploadPanel({
  onUpload,
  uploading,
  jdPreview,
}: {
  onUpload: (file: File) => void;
  uploading: boolean;
  jdPreview: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const fmtSize = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left – upload area */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Upload Resume PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "relative flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                  dragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-3 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Drag & drop your PDF here</p>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                  </div>
                  <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    PDF only · max 10 MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{fmtSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={uploading}
                  onClick={() => onUpload(file)}
                >
                  {uploading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Analysing with AI…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyse Resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What you'll get */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            <p className="mb-3 text-sm font-semibold text-primary">What the AI analyses:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "ATS match score against the job description",
                "JD keywords present and missing from your resume",
                "Resume strengths and specific weaknesses",
                "ATS formatting suggestions",
                "Section-by-section improvement tips",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Right – JD preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jdPreview ? (
            <div className="max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
              {jdPreview}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No job description saved for this project. Go to{" "}
              <strong>Edit Project</strong> to add one — it improves match accuracy significantly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section: Analysing skeleton ──────────────────────────────────────────────
function AnalysingSkeleton() {
  const steps = [
    "Extracting text from PDF…",
    "Identifying JD keywords and requirements…",
    "Comparing resume content to job description…",
    "Computing ATS match score…",
    "Generating improvement suggestions…",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1400);
    return () => clearInterval(id);
  });

  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-6 rounded-2xl border bg-muted/20 p-10 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-9 w-9 animate-pulse text-primary" />
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">AI is analysing your resume</p>
        <p className="text-sm text-muted-foreground">{steps[step]}</p>
      </div>
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-6 rounded-full transition-all duration-500",
              i <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section: Results dashboard ────────────────────────────────────────────────
function ResultsDashboard({
  analysis,
  fileName,
  onReanalyse,
}: {
  analysis: ResumeAnalysis;
  fileName: string;
  onReanalyse: () => void;
}) {
  const [showJd, setShowJd] = useState(false);

  // Download simple text report
  const downloadReport = () => {
    const lines = [
      "INTERMATE RESUME ANALYSIS REPORT",
      "=================================",
      `File: ${fileName}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `ATS Match Score: ${analysis.matchScore}% — ${scoreLabel(analysis.matchScore)}`,
      `JD Seniority: ${analysis.jdSeniority}`,
      "",
      "JD KEYWORDS",
      analysis.jdKeywords.join(", ") || "—",
      "",
      "MISSING KEYWORDS",
      analysis.missingKeywords.join(", ") || "—",
      "",
      "STRENGTHS",
      ...analysis.resumeStrengths.map((s) => `• ${s}`),
      "",
      "WEAKNESSES",
      ...analysis.resumeWeaknesses.map((w) => `• ${w}`),
      "",
      "ATS SUGGESTIONS",
      ...analysis.atsSuggestions.map((s, i) => `${i + 1}. ${s}`),
      "",
      "IMPROVEMENT SUGGESTIONS",
      ...analysis.improvementSuggestions.map(
        (s) => `[${s.priority.toUpperCase()}] ${s.section}: ${s.text}`
      ),
      "",
      "Generated by InterMate – AI-Powered Career Preparation Platform",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `InterMate_Resume_Analysis_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Score hero card ── */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            {/* Score ring */}
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <ProgressRing progress={analysis.matchScore} size={130} strokeWidth={11}>
                <div className="text-center">
                  <span className={cn("text-3xl font-bold", scoreColor(analysis.matchScore))}>
                    {analysis.matchScore}
                  </span>
                  <p className="text-[11px] text-muted-foreground">ATS Score</p>
                </div>
              </ProgressRing>

              <div className="space-y-1">
                <p className={cn("text-xl font-bold", scoreColor(analysis.matchScore))}>
                  {scoreLabel(analysis.matchScore)}
                </p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
                {analysis.jdSeniority && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Target className="h-3 w-3" />
                    {analysis.jdSeniority} level
                  </span>
                )}
                {analysis.processedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last analysed: {new Date(analysis.processedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button variant="outline" onClick={onReanalyse} className="w-full gap-2 sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Re-analyse
              </Button>
              <Button onClick={downloadReport} className="w-full gap-2 sm:w-auto">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
              <div
                className={cn("h-full rounded-full transition-all duration-700", scoreBg(analysis.matchScore))}
                style={{ width: `${analysis.matchScore}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Keywords row ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Matched keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <Tag className="h-4 w-4" />
              Matched Keywords ({analysis.jdKeywords.length - analysis.missingKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.jdKeywords
                .filter((k) => !analysis.missingKeywords.includes(k))
                .map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400"
                  >
                    {kw}
                  </span>
                ))}
              {analysis.jdKeywords.filter((k) => !analysis.missingKeywords.includes(k)).length === 0 && (
                <p className="text-sm text-muted-foreground">No keyword matches found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missing keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Tag className="h-4 w-4" />
              Missing Keywords ({analysis.missingKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {kw}
                </span>
              ))}
              {analysis.missingKeywords.length === 0 && (
                <p className="text-sm text-muted-foreground">🎉 No missing keywords — great job!</p>
              )}
            </div>
            {analysis.missingKeywords.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Add these to your resume naturally — don&apos;t keyword-stuff.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Resume Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.resumeStrengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-primary/5 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <p className="text-sm">{s}</p>
              </div>
            ))}
            {analysis.resumeStrengths.length === 0 && (
              <p className="text-sm text-muted-foreground">No strengths identified yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              Weaknesses &amp; Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.resumeWeaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-destructive/5 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm">{w}</p>
              </div>
            ))}
            {analysis.resumeWeaknesses.length === 0 && (
              <p className="text-sm text-muted-foreground">No major weaknesses identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── ATS Suggestions ── */}
      {analysis.atsSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              ATS Optimisation Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.atsSuggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-4 hover:border-primary/30 transition-colors"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Improvement suggestions ── */}
      {analysis.improvementSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Section-by-Section Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.improvementSuggestions.map((item, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:gap-4">
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    priorityStyle[item.priority as keyof typeof priorityStyle] ||
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {item.priority}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.section}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── JD keywords breakdown (collapsible) ── */}
      {(analysis.jdRequiredSkills.length > 0 || analysis.jdNiceToHave.length > 0) && (
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setShowJd((v) => !v)}
          >
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                JD Requirements Breakdown
              </span>
              {showJd ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {showJd && (
            <CardContent className="space-y-4">
              {analysis.jdRequiredSkills.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.jdRequiredSkills.map((s) => (
                      <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.jdNiceToHave.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Nice-to-Have Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.jdNiceToHave.map((s) => (
                      <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Normalise backend response (guards against null/undefined arrays) ────────
function normalizeAnalysis(a: ResumeAnalysis): ResumeAnalysis {
  return {
    ...a,
    jdKeywords:             Array.isArray(a.jdKeywords)             ? a.jdKeywords             : [],
    jdRequiredSkills:       Array.isArray(a.jdRequiredSkills)       ? a.jdRequiredSkills       : [],
    jdNiceToHave:           Array.isArray(a.jdNiceToHave)           ? a.jdNiceToHave           : [],
    missingKeywords:        Array.isArray(a.missingKeywords)        ? a.missingKeywords        : [],
    resumeStrengths:        Array.isArray(a.resumeStrengths)        ? a.resumeStrengths        : [],
    resumeWeaknesses:       Array.isArray(a.resumeWeaknesses)       ? a.resumeWeaknesses       : [],
    atsSuggestions:         Array.isArray(a.atsSuggestions)         ? a.atsSuggestions         : [],
    improvementSuggestions: Array.isArray(a.improvementSuggestions) ? a.improvementSuggestions : [],
    suggestions:            Array.isArray(a.suggestions)            ? a.suggestions            : [],
  };
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectResumePage() {
  const params = useParams();
  const projectId = params.id as string;

  type Stage = "loading" | "upload" | "analysing" | "done" | "error";

  const [stage, setStage] = useState<Stage>("loading");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jdPreview, setJdPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("resume.pdf");

  // Load existing analysis on mount
  useEffect(() => {
    getProjectResumeReportRequest(projectId)
      .then((data) => {
        setJdPreview(data.jobDescription || "");
        if (data.hasAnalysis) {
          setAnalysis(normalizeAnalysis(data as ResumeAnalysis));
          setStage("done");
        } else {
          setStage("upload");
        }
      })
      .catch(() => setStage("upload")); // No analysis yet or error – show upload
  }, [projectId]);

  // Handle PDF upload → send to backend → show results
  async function handleUpload(file: File) {
    setUploadedFileName(file.name);
    setStage("analysing");
    setErrorMsg("");

    try {
      const result = await analyzeProjectResumeRequest(projectId, file);
      setAnalysis(normalizeAnalysis(result.analysis));
      setStage("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setStage("error");
    }
  }

  return (
    <AppShell
      title="Resume Analyzer"
      description="Upload your resume and let AI match it against the job description"
    >
      {/* Loading state */}
      {stage === "loading" && (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-muted-foreground animate-pulse">Loading analysis…</p>
        </div>
      )}

      {/* Upload panel */}
      {stage === "upload" && (
        <UploadPanel onUpload={handleUpload} uploading={false} jdPreview={jdPreview} />
      )}

      {/* Analysing / skeleton */}
      {stage === "analysing" && <AnalysingSkeleton />}

      {/* Error */}
      {stage === "error" && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <XCircle className="h-14 w-14 text-destructive" />
          <div>
            <p className="text-lg font-semibold">Analysis Failed</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
          </div>
          <Button variant="outline" onClick={() => setStage("upload")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* Results dashboard */}
      {stage === "done" && analysis && (
        <ResultsDashboard
          analysis={analysis}
          fileName={uploadedFileName}
          onReanalyse={() => setStage("upload")}
        />
      )}
    </AppShell>
  );
}
