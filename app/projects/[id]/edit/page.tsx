"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectRequest, updateProjectRequest } from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Building2,
  User,
  Type,
  RotateCcw,
} from "lucide-react";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [hasExistingResume, setHasExistingResume] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProjectRequest(projectId)
      .then((project) => {
        setTitle(project.title || "");
        setCompanyName(project.companyName || "");
        setJobRole(project.jobRole || "");
        setJobDescription(project.jobDescription || "");
        setHasExistingResume(!!project.resumeText && project.resumeText.length > 50);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setResumeFile(dropped);
      setError("");
    } else {
      setError("Only PDF files are accepted.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== "application/pdf") {
        setError("Only PDF files are accepted.");
        return;
      }
      setResumeFile(f);
      setError("");
    }
  };

  const fmtSize = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    try {
      setSaving(true);
      await updateProjectRequest(projectId, {
        title: title.trim(),
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        jobDescription: jobDescription.trim(),
        ...(resumeFile ? { resumeFile } : {}),
      });

      router.replace(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Edit Project" description="Update this job application project">
      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse">Loading project...</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* ── Project details ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" />
                    Project Title <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project title"
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Company Name
                    </span>
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Job Role
                    </span>
                  </label>
                  <input
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="Job role"
                    className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Job Description ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                placeholder="Paste the full job description here..."
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {jobDescription.length} characters
              </p>
            </CardContent>
          </Card>

          {/* ── Resume PDF ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Resume PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current resume status */}
              {hasExistingResume && !resumeFile && (
                <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4 sm:items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Resume already uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      Upload a new PDF below to replace it and re-run AI analysis
                    </p>
                  </div>
                </div>
              )}

              {/* Upload area */}
              {!resumeFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
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
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <RotateCcw className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      {hasExistingResume ? "Upload new resume to replace" : "Upload resume PDF"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF only · max 10 MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground">{fmtSize(resumeFile.size)}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setResumeFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {resumeFile && (
                <p className="flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI analysis will re-run with the new resume when you save
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Error & Submit ── */}
          {error ? (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={saving} className="w-full gap-2 sm:min-w-[180px] sm:w-auto">
              {saving ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Saving & Analysing…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.replace(`/projects/${projectId}`)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
