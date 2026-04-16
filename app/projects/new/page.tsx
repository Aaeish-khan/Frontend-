"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createProjectRequest } from "@/lib/api-projects";
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
} from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setResumeFile(dropped);
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
    if (!jobDescription.trim()) {
      setError("Job description is required for AI analysis.");
      return;
    }
    if (!resumeFile) {
      setError("Please upload your resume PDF.");
      return;
    }

    try {
      setLoading(true);
      const res = await createProjectRequest({
        title: title.trim(),
        companyName: companyName.trim(),
        jobRole: jobRole.trim(),
        jobDescription: jobDescription.trim(),
        resumeFile,
      });

      router.replace(`/projects/${res.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Create Project" description="Set up a new job application project with AI-powered analysis">
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
                placeholder="e.g. Frontend Developer at Acme Corp"
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
                  placeholder="e.g. Acme Corp"
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
                  placeholder="e.g. Senior Frontend Developer"
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
              Job Description <span className="text-sm font-normal text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here. The AI will extract keywords, required skills, and seniority level to match against your resume..."
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {jobDescription.length} characters — the more detail, the better the AI analysis
            </p>
          </CardContent>
        </Card>

        {/* ── Resume PDF Upload ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Resume PDF <span className="text-sm font-normal text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!resumeFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
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
                    <p className="font-semibold">Drag & drop your resume PDF here</p>
                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                  </div>
                  <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    PDF only · max 10 MB
                  </p>
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setResumeFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── What happens next ── */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            <p className="mb-3 text-sm font-semibold text-primary">
              When you create this project, the AI will automatically:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Extract text from your resume PDF",
                "Identify keywords and requirements from the job description",
                "Compute an ATS match score",
                "Detect missing keywords, strengths, and weaknesses",
                "Generate section-by-section improvement suggestions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Error & Submit ── */}
        {error ? (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading} className="w-full gap-2 sm:min-w-[200px] sm:w-auto">
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Creating & Analysing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
