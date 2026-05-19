"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  createProjectRequest,
  extractJobDescriptionTextRequest,
  updateProjectOutcomeRequest,
} from "@/lib/api-projects";
import {
  APPLICATION_STATUS_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  type ApplicationStatus,
  type JobDescriptionExtractionSource,
} from "@/lib/project-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Building2,
  User,
  Type,
  Loader2,
  WandSparkles,
  FileImage,
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const RESUME_ACCEPTED_TYPES = new Set(["application/pdf"]);
const JOB_DESCRIPTION_ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getJobDescriptionTypeLabel(type: string) {
  switch (type) {
    case "application/pdf":
      return "PDF";
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPG/JPEG";
    case "image/webp":
      return "WEBP";
    default:
      return "Unsupported file";
  }
}

function isValidJobDescriptionFile(file: File) {
  return JOB_DESCRIPTION_ACCEPTED_TYPES.has(file.type) && file.size <= MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES;
}

function isValidResumeFile(file: File) {
  return RESUME_ACCEPTED_TYPES.has(file.type) && file.size <= MAX_RESUME_FILE_SIZE_BYTES;
}

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [customJobCategory, setCustomJobCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | "">("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionExtractionSource, setJobDescriptionExtractionSource] =
    useState<JobDescriptionExtractionSource>("manual");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);

  const [draggingResume, setDraggingResume] = useState(false);
  const [draggingJobDescription, setDraggingJobDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [jobDescriptionError, setJobDescriptionError] = useState("");

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jobDescriptionInputRef = useRef<HTMLInputElement>(null);

  const jobDescriptionMeta = useMemo(() => {
    if (!jobDescriptionFile) return null;
    return {
      name: jobDescriptionFile.name,
      size: fmtSize(jobDescriptionFile.size),
      typeLabel: getJobDescriptionTypeLabel(jobDescriptionFile.type),
    };
  }, [jobDescriptionFile]);

  const handleResumeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingResume(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;

    if (!isValidResumeFile(dropped)) {
      setError("Only PDF resume files up to 10 MB are accepted.");
      return;
    }

    setResumeFile(dropped);
    setError("");
  }, []);

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidResumeFile(file)) {
      setError("Only PDF resume files up to 10 MB are accepted.");
      return;
    }

    setResumeFile(file);
    setError("");
  };

  const handleJobDescriptionDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingJobDescription(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;

    if (!JOB_DESCRIPTION_ACCEPTED_TYPES.has(dropped.type)) {
      setJobDescriptionError("Unsupported file type. Please upload PNG, JPG/JPEG, WEBP, or PDF.");
      return;
    }

    if (dropped.size > MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES) {
      setJobDescriptionError("File is too large. Please upload a file smaller than 5 MB.");
      return;
    }

    setJobDescriptionFile(dropped);
    setJobDescriptionError("");
    setError("");
  }, []);

  const handleJobDescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!JOB_DESCRIPTION_ACCEPTED_TYPES.has(file.type)) {
      setJobDescriptionError("Unsupported file type. Please upload PNG, JPG/JPEG, WEBP, or PDF.");
      return;
    }

    if (file.size > MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES) {
      setJobDescriptionError("File is too large. Please upload a file smaller than 5 MB.");
      return;
    }

    setJobDescriptionFile(file);
    setJobDescriptionError("");
    setError("");
  };

  async function handleExtractJobDescription() {
    setError("");
    setJobDescriptionError("");

    if (!jobDescriptionFile) {
      setJobDescriptionError("Please choose a job description file first.");
      return;
    }

    if (!JOB_DESCRIPTION_ACCEPTED_TYPES.has(jobDescriptionFile.type)) {
      setJobDescriptionError("Unsupported file type. Please upload PNG, JPG/JPEG, WEBP, or PDF.");
      return;
    }

    if (jobDescriptionFile.size > MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES) {
      setJobDescriptionError("File is too large. Please upload a file smaller than 5 MB.");
      return;
    }

    try {
      setExtracting(true);
      const result = await extractJobDescriptionTextRequest(jobDescriptionFile);
      setJobDescription(result.text.trim());
      setJobDescriptionExtractionSource("upload");
      if (!result.text.trim()) {
        setJobDescriptionError(
          "No readable text was found. You can still paste the job description manually."
        );
      }
    } catch (err) {
      setJobDescriptionError(
        err instanceof Error
          ? err.message
          : "Failed to extract the job description text. Please paste it manually."
      );
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }
    if (!jobRole.trim()) {
      setError("Role title is required.");
      return;
    }
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!jobCategory) {
      setError("Please select a job category or industry.");
      return;
    }
    if (jobCategory === "Other" && !customJobCategory.trim()) {
      setError("Please enter a custom job category.");
      return;
    }
    if (!experienceLevel) {
      setError("Please select an experience level.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Job description is required for AI analysis.");
      return;
    }
    if (!applicationStatus) {
      setError("Please select your application status.");
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
        jobCategory,
        customJobCategory: jobCategory === "Other" ? customJobCategory.trim() : "",
        experienceLevel,
        applicationStatus,
        jobDescription: jobDescription.trim(),
        jobDescriptionFileName: jobDescriptionFile?.name,
        jobDescriptionExtractionSource,
        resumeFile,
      });

      try {
        await updateProjectOutcomeRequest(res.project.id, { status: applicationStatus });
      } catch (outcomeError) {
        console.warn("Project created, but application status update failed:", outcomeError);
      }

      router.replace(`/projects/${res.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Create Project"
      description="Set up a new job application project with AI-powered analysis"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Basic Project Details
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
                  placeholder="e.g. Marketing Coordinator at Acme Corp"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Company Name <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Role Title <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Marketing Coordinator"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Job Category / Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jobCategory}
                    onChange={(e) => {
                      setJobCategory(e.target.value);
                      if (e.target.value !== "Other") setCustomJobCategory("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  >
                    <option value="">Select a category</option>
                    {JOB_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  >
                    <option value="">Select a level</option>
                    {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {jobCategory === "Other" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Custom Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={customJobCategory}
                    onChange={(e) => setCustomJobCategory(e.target.value)}
                    placeholder="e.g. Public Policy, Hospitality, Research"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Job Description <span className="text-sm font-normal text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <WandSparkles className="h-3.5 w-3.5" />
                    Upload Job Description
                  </span>
                </label>
                <p className="mb-3 text-xs text-muted-foreground">
                  Upload a screenshot, image, PDF, or page capture of the job post. InterMate will extract the job description text automatically.
                </p>

                {!jobDescriptionFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingJobDescription(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDraggingJobDescription(false);
                    }}
                    onDrop={handleJobDescriptionDrop}
                    onClick={() => jobDescriptionInputRef.current?.click()}
                    className={cn(
                      "relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300",
                      draggingJobDescription
                        ? "border-primary bg-primary/10 scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                        : "border-white/15 hover:border-primary/50 hover:bg-white/3"
                    )}
                  >
                    <input
                      ref={jobDescriptionInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={handleJobDescriptionFileChange}
                    />
                    <div className="flex flex-col items-center gap-3 px-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/20 to-purple-500/10">
                        <FileImage className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Drag & drop a job description file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse files</p>
                      </div>
                      <p className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        PNG, JPG/JPEG, WEBP, or PDF · max 5 MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="icon-box flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-purple-500/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{jobDescriptionMeta?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {jobDescriptionMeta?.typeLabel} · {jobDescriptionMeta?.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleExtractJobDescription}
                        disabled={extracting}
                        className="gap-2"
                      >
                        {extracting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Extracting job description...
                          </>
                        ) : (
                          <>
                            <WandSparkles className="h-4 w-4" />
                            Extract Job Description
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setJobDescriptionFile(null);
                          setJobDescriptionError("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {jobDescriptionError ? (
                  <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
                    {jobDescriptionError}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Job Description Text <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setJobDescriptionExtractionSource((source) =>
                      source === "upload" ? "manual_edited_after_upload" : source
                    );
                  }}
                  rows={10}
                  placeholder="Paste the full job description here, or extract it from the uploaded file above. InterMate will use this text as the source of truth for resume matching, interviews, and learning recommendations..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/60 transition-all duration-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                />
                {jobDescriptionExtractionSource !== "manual" ? (
                  <p className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Please review the extracted job description before continuing.
                  </p>
                ) : null}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {jobDescription.length} characters — the more detail, the better the AI analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Application Status <span className="text-sm font-normal text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="block text-sm font-medium">
                What is your application status?
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {APPLICATION_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setApplicationStatus(option.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-sm transition-all",
                      applicationStatus === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 hover:border-primary/40"
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Shows as {option.display}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
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
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggingResume(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDraggingResume(false);
                  }}
                  onDrop={handleResumeDrop}
                  onClick={() => resumeInputRef.current?.click()}
                  className={cn(
                    "relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300",
                    draggingResume
                      ? "border-primary bg-primary/10 scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                      : "border-white/15 hover:border-primary/50 hover:bg-white/3"
                  )}
                >
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleResumeFileChange}
                  />
                  <div className="flex flex-col items-center gap-3 px-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-primary/20 to-purple-500/10">
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
                <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="icon-box flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-purple-500/10">
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
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="pt-5">
              <p className="mb-3 text-sm font-semibold text-primary">
                When you create this project, the AI will automatically:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Extract text from your resume PDF",
                  "Identify role-specific keywords and requirements from the job description",
                  "Compute an ATS match score",
                  "Detect missing keywords, strengths, and weaknesses",
                  "Generate section-by-section improvement suggestions for this role",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
          >
            {error}
          </motion.p>
        ) : null}

        <motion.div variants={staggerItem} className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading || extracting} className="w-full gap-2 sm:min-w-[200px] sm:w-auto">
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
        </motion.div>
      </motion.form>
    </AppShell>
  );
}
