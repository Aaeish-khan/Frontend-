import { getToken, getStoredUser } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReviewStatus = "pending" | "accepted" | "declined" | "completed";

export type CommentCategory =
  | "positive" | "suggestion" | "technical"
  | "communication" | "confidence" | "behavioral" | "structure";

export const COMMENT_CATEGORIES: { value: CommentCategory; label: string; color: string }[] = [
  { value: "positive",      label: "Positive",      color: "bg-green-100 text-green-700 border-green-200" },
  { value: "suggestion",    label: "Suggestion",     color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "technical",     label: "Technical",      color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "communication", label: "Communication",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "confidence",    label: "Confidence",     color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "behavioral",    label: "Behavioral",     color: "bg-pink-100 text-pink-700 border-pink-200" },
  { value: "structure",     label: "Structure",      color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

export type TimestampComment = {
  _id: string;
  authorId: string;
  timestamp: number;
  text: string;
  category: CommentCategory;
  createdAt: string;
};

export type ChatMessage = {
  _id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type Suggestion = {
  _id: string;
  text: string;
  appliedByRequester: boolean;
  appliedAt: string | null;
};

export type ReviewFeedback = {
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  overallComments: string;
  rating: number | null;
  summary: string;
  submittedAt: string | null;
};

export type UserRef = {
  _id: string;
  name: string;
  email: string;
};

export type PeerReview = {
  _id: string;
  requester: UserRef;
  reviewer: UserRef | null;
  interviewSessionId: string;
  projectId: string | null;
  title: string;
  recordingUrl: string;
  requestMessage: string;
  status: ReviewStatus;
  feedback: ReviewFeedback;
  timestampComments: TimestampComment[];
  chatMessages: ChatMessage[];
  requestedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  declinedReason: string;
};

export type InterviewQuestion = {
  question: string;
  userAnswer: string;
  aiFeedback: string;
  score: number;
  type: string;
};

export type SessionSummary = {
  _id: string;
  title: string;
  role: string;
  overallScore: number;
  completedAt: string;
  persona: string;
  questions: InterviewQuestion[];
  report: {
    strengths: string[];
    improvements: string[];
    recommendation: string;
  };
};

export type ReviewThread = {
  review: PeerReview;
  session: SessionSummary | null;
};

export type AvailableSession = {
  _id: string;
  title: string;
  role: string;
  overallScore: number;
  completedAt: string;
  projectTitle: string;
  companyName: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body && typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export function getCurrentUserId(): string {
  const user = getStoredUser() as { _id?: string; id?: string } | null;
  return user?._id || user?.id || "";
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getAvailableSessions(): Promise<AvailableSession[]> {
  return authFetch(`${API_URL}/peer-reviews/available-sessions`);
}

export async function createReviewRequest(data: {
  interviewSessionId: string;
  recordingUrl?: string;
  requestMessage?: string;
}): Promise<{ message: string; review: PeerReview }> {
  return authFetch(`${API_URL}/peer-reviews/request`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getIncomingRequests(): Promise<PeerReview[]> {
  return authFetch(`${API_URL}/peer-reviews/incoming`);
}

export async function getOutgoingRequests(): Promise<PeerReview[]> {
  return authFetch(`${API_URL}/peer-reviews/outgoing`);
}

export async function getReviewsGiven(): Promise<PeerReview[]> {
  return authFetch(`${API_URL}/peer-reviews/given`);
}

export async function acceptReview(id: string): Promise<{ message: string; review: PeerReview }> {
  return authFetch(`${API_URL}/peer-reviews/${id}/accept`, { method: "PATCH" });
}

export async function declineReview(id: string, reason?: string): Promise<{ message: string }> {
  return authFetch(`${API_URL}/peer-reviews/${id}/decline`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export async function getReviewThread(id: string): Promise<ReviewThread> {
  return authFetch(`${API_URL}/peer-reviews/${id}`);
}

export async function addTimestampComment(
  reviewId: string,
  data: { timestamp: number; text: string; category: CommentCategory }
): Promise<{ comment: TimestampComment }> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTimestampComment(reviewId: string, commentId: string): Promise<void> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export async function getThreadMessages(reviewId: string): Promise<{ messages: ChatMessage[] }> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/messages`);
}

export async function sendChatMessage(
  reviewId: string,
  text: string
): Promise<{ message: ChatMessage }> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function submitFeedback(
  reviewId: string,
  data: {
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
    overallComments?: string;
    rating?: number | null;
    summary?: string;
  }
): Promise<{ message: string; feedback: ReviewFeedback }> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/feedback`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function completeReview(reviewId: string): Promise<{ message: string; review: PeerReview }> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/complete`, { method: "PATCH" });
}

export async function applySuggestion(
  reviewId: string,
  suggestionId: string,
  applied: boolean
): Promise<{ message: string; suggestion: Suggestion }> {
  return authFetch(`${API_URL}/peer-reviews/${reviewId}/suggestions/${suggestionId}/apply`, {
    method: "PATCH",
    body: JSON.stringify({ applied }),
  });
}
