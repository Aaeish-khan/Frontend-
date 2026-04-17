"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectRequest, deleteProjectRequest, type Project } from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  PencilLine,
  Trash2,
  FileText,
  MessageSquare,
  BookOpen,
  Target,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Moderate Match";
  return "Needs Work";
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
  if (!projectId || projectId === "undefined") {
    router.replace("/projects");
    return;
  }
  getProjectRequest(projectId)
    .then(setProject)
    .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project"))
    .finally(() => setLoading(false));
}, [projectId, router]);


  async function handleDelete() {
    if (!project) return;
    const confirmed = window.confirm(`Archive "${project.title}"?`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteProjectRequest(project.id);
      router.replace("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive project");
    } finally {
      setDeleting(false);
    }
  }

  const insights = project?.aiInsights;
  const matchScore = insights?.resumeMatchScore ?? 0;
  const hasAnalysis = insights?.processingStatus === "done";

  return (
    <AppShell
      title={project?.title || "Project"}
      description="Job-specific hub for interview, resume, learning, and outcome tracking"
    >
      {loading ? <p className="text-sm text-muted-foreground animate-pulse">Loading project...</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {!loading && project ? (
        <div className="space-y-6">
          {/* ── Top actions ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/projects">
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="outline" className="w-full gap-2 sm:w-auto">
                  <PencilLine className="h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full gap-2 sm:w-auto">
                <Trash2 className="h-4 w-4" />
                {deleting ? "Archiving..." : "Archive"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Left sidebar: Overview ── */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{project.companyName || "Not added"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">{project.jobRole || "Not added"}</p>
                  </div>
                </div>

                {/* ATS Score card */}
                <div className="rounded-xl border p-4">
                  {hasAnalysis ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">ATS Match Score</p>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className={cn("text-3xl font-bold", scoreColor(matchScore))}>
                          {matchScore}%
                        </span>
                        <span className={cn("text-sm", scoreColor(matchScore))}>
                          {scoreLabel(matchScore)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            matchScore >= 80 ? "bg-green-500" :
                            matchScore >= 60 ? "bg-yellow-500" :
                            matchScore >= 40 ? "bg-orange-400" : "bg-red-500"
                          )}
                          style={{ width: `${matchScore}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Resume Match Score</p>
                      <p className="text-sm text-muted-foreground">
                        {project.resumeText
                          ? "Analysis pending — go to Resume Analyzer to run it"
                          : "Upload a resume to get your ATS match score"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick insights */}
                {hasAnalysis && (
                  <div className="space-y-2">
                    {(insights?.resumeStrengths?.length ?? 0) > 0 && (
                      <div className="flex items-start gap-2 rounded-lg bg-green-500/5 p-2.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-green-500 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {insights!.resumeStrengths![0]}
                        </p>
                      </div>
                    )}
                    {(insights?.missingKeywords?.length ?? 0) > 0 && (
                      <div className="flex items-start gap-2 rounded-lg bg-red-500/5 p-2.5">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 text-red-500 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Missing: {insights!.missingKeywords!.slice(0, 3).join(", ")}
                          {(insights!.missingKeywords!.length > 3) && ` +${insights!.missingKeywords!.length - 3} more`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Outcome */}
                <div className="rounded-xl border p-3">
                  <p className="text-sm font-medium">Current Outcome</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {project.outcome?.status || "applied"}
                  </p>
                </div>

                {/* Navigation buttons */}
                <div className="grid gap-2">
                  <Link href={`/projects/${project.id}/resume`}>
                    <Button className="w-full gap-2">
                      <Sparkles className="h-4 w-4" />
                      Resume Analyzer
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/interview`}>
                    <Button variant="outline" className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Mock Interview
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/learning`}>
                    <Button variant="outline" className="w-full gap-2">
                      <BookOpen className="h-4 w-4" />
                      Learning Mode
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/outcome`}>
                    <Button variant="outline" className="w-full gap-2">
                      <Target className="h-4 w-4" />
                      Update Outcome
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* ── Right content ── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.jobDescription ? (
                    <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
                      {project.jobDescription}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No job description added yet.{" "}
                      <Link href={`/projects/${project.id}/edit`} className="text-primary underline">
                        Edit project
                      </Link>{" "}
                      to add one.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Parsed Resume Text (collapsible, read-only) */}
              <Card>
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => setShowResume((v) => !v)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Parsed Resume Text
                    </span>
                    <span className="flex items-center gap-2">
                      {project.resumeText ? (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                          Extracted
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          No resume
                        </span>
                      )}
                      {showResume ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                {showResume && (
                  <CardContent>
                    {project.resumeText ? (
                      <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
                        {project.resumeText}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No resume uploaded yet. Go to{" "}
                        <Link href={`/projects/${project.id}/resume`} className="text-primary underline">
                          Resume Analyzer
                        </Link>{" "}
                        or{" "}
                        <Link href={`/projects/${project.id}/edit`} className="text-primary underline">
                          Edit Project
                        </Link>{" "}
                        to upload a PDF.
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
