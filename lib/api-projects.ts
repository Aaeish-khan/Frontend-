/**
 * File: intermate/lib/api-projects.ts
 *
 * All project-related API calls.
 * Updated: createProjectRequest and updateProjectRequest now use
 *          multipart/form-data to support resume PDF upload.
 */

import { getToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Project = {
  id: string;
  title: string;
  companyName: string;
  jobRole: string;
  jobDescription: string;
  resumeFileUrl?: string;
  resumeText: string;
  aiInsights?: {
    jdKeywords?: string[];
    jdRequiredSkills?: string[];
    jdNiceToHave?: string[];
    jdSeniority?: string;
    resumeMatchScore?: number;
    missingKeywords?: string[];
    resumeStrengths?: string[];
    resumeWeaknesses?: string[];
    topicWeaknessMap?: string[];
    atsSuggestions?: string[];
    improvementSuggestions?: ImprovementSuggestion[];
    processingStatus?: string;
    processedAt?: string | null;
  };
  outcome?: {
    status?: string;
    notes?: string;
    updatedAt?: string | null;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ImprovementSuggestion = {
  section: string;
  priority: "high" | "medium" | "low";
  text: string;
};

export type ResumeAnalysis = {
  hasAnalysis: boolean;
  processingStatus: string;
  matchScore: number;
  jdKeywords: string[];
  jdRequiredSkills: string[];
  jdNiceToHave: string[];
  jdSeniority: string;
  missingKeywords: string[];
  resumeStrengths: string[];
  resumeWeaknesses: string[];
  atsSuggestions: string[];
  improvementSuggestions: ImprovementSuggestion[];
  suggestions: string[];           // backward-compat alias
  resumeText: string;
  resumeFileUrl: string;
  processedAt: string | null;
  jobDescription: string;
  jobRole: string;
  companyName: string;
};

type CreateProjectResponse = {
  message: string;
  project: Project;
};

type UpdateProjectResponse = {
  message: string;
  project: Project;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Standard JSON fetch with JWT auth header.
 */
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── Project CRUD ──────────────────────────────────────────────────────────────

export async function getProjectsRequest(): Promise<Project[]> {
  if (getToken() === "demo-token") return [];
  return authFetch(`${API_URL}/projects`);
}

export async function getProjectRequest(id: string): Promise<Project> {
  return authFetch(`${API_URL}/projects/${id}`);
}

/**
 * Create a new project with resume PDF upload.
 * Uses multipart/form-data — browser sets Content-Type automatically.
 */
export async function createProjectRequest(data: {
  title: string;
  companyName: string;
  jobRole: string;
  jobDescription: string;
  resumeFile: File;
}): Promise<CreateProjectResponse> {
  const token = getToken();

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("companyName", data.companyName);
  formData.append("jobRole", data.jobRole);
  formData.append("jobDescription", data.jobDescription);
  formData.append("resume", data.resumeFile);

  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type — browser adds it with boundary
    },
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to create project");
  }

  return result;
}

/**
 * Update a project. Supports optional resume PDF re-upload.
 * Uses multipart/form-data.
 */
export async function updateProjectRequest(
  id: string,
  data: {
    title?: string;
    companyName?: string;
    jobRole?: string;
    jobDescription?: string;
    resumeFile?: File;
    status?: string;
  }
): Promise<UpdateProjectResponse> {
  const token = getToken();

  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.companyName !== undefined) formData.append("companyName", data.companyName);
  if (data.jobRole !== undefined) formData.append("jobRole", data.jobRole);
  if (data.jobDescription !== undefined) formData.append("jobDescription", data.jobDescription);
  if (data.status !== undefined) formData.append("status", data.status);
  if (data.resumeFile) formData.append("resume", data.resumeFile);

  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to update project");
  }

  return result;
}

export async function deleteProjectRequest(id: string) {
  return authFetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
  });
}

export async function processProjectRequest(id: string) {
  return authFetch(`${API_URL}/projects/${id}/process`, {
    method: "POST",
  });
}

export async function getProjectStatusRequest(id: string) {
  return authFetch(`${API_URL}/projects/${id}/status`);
}

export async function updateProjectOutcomeRequest(
  id: string,
  data: {
    status: string;
    notes?: string;
  }
) {
  return authFetch(`${API_URL}/projects/${id}/outcome`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ─── Interview ─────────────────────────────────────────────────────────────────

export async function getProjectInterviewHistoryRequest(id: string) {
  return authFetch(`${API_URL}/projects/${id}/interview/history`);
}

export async function startProjectInterviewRequest(id: string, opts: { persona?: string } = {}) {
  return authFetch(`${API_URL}/projects/${id}/interview/start`, {
    method: "POST",
    body: JSON.stringify({ persona: opts.persona || "mixed" }),
  });
}

export async function answerProjectInterviewRequest(
  projectId: string,
  sessionId: string,
  data: {
    index: number;
    answer: string;
    delivery?: {
      answerDurationSec?: number;
      responseLatencySec?: number;
      averagePauseSec?: number;
      longSilenceCount?: number;
    };
  }
) {
  return authFetch(`${API_URL}/projects/${projectId}/interview/${sessionId}/answer`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteInterviewSessionRequest(projectId: string, sessionId: string) {
  return authFetch(`${API_URL}/projects/${projectId}/interview/${sessionId}`, {
    method: "DELETE",
  });
}

export async function transcribeInterviewAnswerRequest(
  projectId: string,
  sessionId: string,
  audioBlob: Blob,
): Promise<{
  transcript: string;
  deliveryObservations?: {
    answer_duration_sec?: number;
    average_pause_sec?: number;
    long_silence_count?: number;
    segment_count?: number;
  };
}> {
  const token = getToken();
  const form = new FormData();
  form.append("audio", audioBlob, "answer.webm");

  const res = await fetch(`${API_URL}/projects/${projectId}/interview/${sessionId}/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Transcription failed");
  return data;
}

// ─── Resume ────────────────────────────────────────────────────────────────────

export async function getProjectResumeReportRequest(id: string): Promise<ResumeAnalysis> {
  return authFetch(`${API_URL}/projects/${id}/resume/report`);
}

/**
 * Upload a new resume PDF for an existing project and re-run AI analysis.
 */
export async function analyzeProjectResumeRequest(
  projectId: string,
  file: File
): Promise<{ message: string; analysis: ResumeAnalysis; resumeText: string }> {
  const token = getToken();

  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_URL}/projects/${projectId}/resume/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Resume analysis failed");
  }

  return data;
}

// ─── Learning ──────────────────────────────────────────────────────────────────

export type TargetedResource = {
  concept: string;
  label: string;
  url: string;
  platform: string;
  type: string;
  whyThisHelps: string;
};

export type ConceptDiagnosis = {
  skillLevel: "beginner" | "intermediate" | "advanced";
  scorePct: number;
  conceptsKnown: string[];
  conceptsWeak: string[];
  targetedResources: TargetedResource[];
  summary: string;
  diagnosedAt?: string;
};

export type ProjectRecommendation = {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  primarySkill: string;
  relatedSkills: string[];
  whyThisProject: string;
  steps: string[];
  weakAreasAddressed: string[];
};

export type LearningModule = {
  id: string;
  title: string;
  objective: string;
  whyItMatters: string;
  category: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  prerequisites: string[];
  outcomes: string[];
  status: "not_started" | "in_progress" | "completed" | "needs_review";
  orderIndex: number;
  resources: { label: string; url: string; platform: string; type: string }[];
  quiz: { id: string; question: string; options: string[]; difficulty: string; conceptTested?: string }[];
  quizAttempts: { attemptedAt: string; score: number; passed: boolean }[];
  bestQuizScore: number | null;
  conceptDiagnosis?: ConceptDiagnosis | null;
  labSpec?: {
    title: string;
    description: string;
    starterPrompt: string;
    difficulty: string;
    platformHint: string;
    completed: boolean;
  };
};

export type LearningPlan = {
  _id: string;
  projectId: string;
  targetRole: string;
  roleFocus: string;
  projectRecommendations?: ProjectRecommendation[];
  diagnosis: {
    weaknesses: {
      key: string;
      category: string;
      label: string;
      severity: string;
      urgency: string;
      explanation: string;
      missingSkills: string[];
    }[];
    strengths: string[];
    generatedAt: string;
  };
  objectives: {
    id: string;
    title: string;
    category: string;
    priority: string;
    linkedWeaknessKeys: string[];
    successCriteria: string[];
  }[];
  modules: LearningModule[];
  progress: {
    completedModules: number;
    totalModules: number;
    readinessScore: number;
    nextBestActions: string[];
    lastUpdatedAt: string;
  };
  version: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  conceptTested?: string;
};

export type QuizResult = {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  feedback: {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    correct: boolean;
    explanation: string;
  }[];
  conceptDiagnosis?: ConceptDiagnosis | null;
  module: { id: string; status: string; bestQuizScore: number | null; attemptCount: number };
  progress: LearningPlan["progress"];
};

export async function getProjectLearningPlanRequest(id: string): Promise<LearningPlan> {
  return authFetch(`${API_URL}/projects/${id}/learning/plan`);
}

export async function generateLearningPlanRequest(
  projectId: string,
  body: Record<string, unknown> = {}
): Promise<LearningPlan> {
  return authFetch(`${API_URL}/projects/${projectId}/learning/plan/generate`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateModuleStatusRequest(
  projectId: string,
  moduleId: string,
  status: LearningModule["status"]
) {
  return authFetch(`${API_URL}/projects/${projectId}/learning/modules/${moduleId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getLearningProgressRequest(projectId: string) {
  return authFetch(`${API_URL}/projects/${projectId}/learning/progress`);
}

export async function getModuleQuizRequest(
  projectId: string,
  moduleId: string
): Promise<{ questions: QuizQuestion[]; attemptCount: number; bestScore: number | null }> {
  return authFetch(`${API_URL}/projects/${projectId}/learning/quiz/${moduleId}`);
}

export async function submitModuleQuizRequest(
  projectId: string,
  moduleId: string,
  answers: number[]
): Promise<QuizResult> {
  return authFetch(`${API_URL}/projects/${projectId}/learning/quiz/${moduleId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function completeLabRequest(
  projectId: string,
  moduleId: string,
  completed: boolean
) {
  return authFetch(`${API_URL}/projects/${projectId}/learning/lab/${moduleId}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
}

export async function generateProjectRecommendationsRequest(
  projectId: string
): Promise<{ projects: ProjectRecommendation[] }> {
  return authFetch(`${API_URL}/projects/${projectId}/learning/projects`, {
    method: "POST",
  });
}

export async function getInterviewReportHtmlRequest(
  projectId: string,
  sessionId: string
): Promise<string> {
  const token = getToken();
  const res = await fetch(
    `${API_URL}/projects/${projectId}/interview/${sessionId}/report`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.text();
}
