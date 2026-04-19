"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Send, CheckCircle2, XCircle, Star, Clock, User,
  MessageSquare, Play, Plus, Trash2, RefreshCw, ExternalLink,
  ChevronDown, ChevronUp, AlertCircle, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PeerReview, type ReviewThread, type AvailableSession,
  type TimestampComment, type ChatMessage, type CommentCategory,
  type Suggestion, type ReviewFeedback,
  COMMENT_CATEGORIES,
  getCurrentUserId, formatTimestamp,
  getIncomingRequests, getOutgoingRequests, getReviewsGiven,
  getAvailableSessions, createReviewRequest,
  acceptReview, declineReview,
  getReviewThread, getThreadMessages, addTimestampComment, deleteTimestampComment,
  sendChatMessage, submitFeedback, completeReview, applySuggestion,
} from "@/lib/api-peer-reviews";

// ── Utilities ─────────────────────────────────────────────────────────────────

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

function relativeDate(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  accepted:  { label: "In Review", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  declined:  { label: "Declined",  cls: "bg-red-100 text-red-700 border-red-200" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700 border-green-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function categoryStyle(cat: CommentCategory) {
  return COMMENT_CATEGORIES.find(c => c.value === cat)?.color ?? "bg-gray-100 text-gray-600 border-gray-200";
}

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({
  value, onChange, readonly = false,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={cn("transition-colors", readonly ? "cursor-default" : "hover:text-yellow-400")}
        >
          <Star
            className={cn(
              "h-5 w-5",
              (value ?? 0) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
      {value && <span className="ml-1 text-sm text-muted-foreground">{value}/5</span>}
    </div>
  );
}

// ── Request Modal ─────────────────────────────────────────────────────────────

function RequestModal({
  onClose, onCreated,
}: {
  onClose: () => void;
  onCreated: (r: PeerReview) => void;
}) {
  const [sessions, setSessions]           = useState<AvailableSession[]>([]);
  const [selectedSession, setSelected]    = useState("");
  const [recordingUrl, setRecordingUrl]   = useState("");
  const [message, setMessage]             = useState("");
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [err, setErr]                     = useState("");

  useEffect(() => {
    getAvailableSessions()
      .then(setSessions)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (!selectedSession) { setErr("Please select an interview session"); return; }
    setSubmitting(true);
    setErr("");
    try {
      const res = await createReviewRequest({
        interviewSessionId: selectedSession,
        recordingUrl: recordingUrl.trim(),
        requestMessage: message.trim(),
      });
      onCreated(res.review);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-background border shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-base">Request a Peer Review</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {err && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {err}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Interview session *</label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No completed interview sessions found. Complete a mock interview first.
              </p>
            ) : (
              <select
                value={selectedSession}
                onChange={e => setSelected(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a session…</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.title} — {s.companyName || s.projectTitle || "Project"} · Score {s.overallScore}%
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Recording URL <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://… (Loom, Drive, etc.)"
              value={recordingUrl}
              onChange={e => setRecordingUrl(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Share a Loom link, Google Drive link, or any shareable video URL.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Message to reviewer <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="What specific feedback are you looking for?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-0.5 text-right">{message.length}/500</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !selectedSession || loading}>
            {submitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Posting…</> : "Post Review Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────

function ReviewCard({
  review, currentUserId, onOpen, onAccepted, onDeclined,
}: {
  review: PeerReview;
  currentUserId: string;
  onOpen: () => void;
  onAccepted?: (r: PeerReview) => void;
  onDeclined?: (id: string) => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const requesterId = String(review.requester._id ?? review.requester);
  const other = requesterId !== currentUserId ? review.requester : review.reviewer;
  const isIncoming = requesterId !== currentUserId && review.status === "pending";

  async function handleAccept() {
    setAccepting(true);
    try {
      const res = await acceptReview(review._id);
      onAccepted?.(res.review);
    } catch {
      /* ignore */
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    try {
      await declineReview(review._id);
      onDeclined?.(review._id);
    } catch {
      /* ignore */
    } finally {
      setDeclining(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card hover:border-primary/40 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm truncate">{review.title}</p>
              <StatusBadge status={review.status} />
            </div>
            {other && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {initials(other.name)}
                </div>
                <span className="text-xs text-muted-foreground">{other.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {relativeDate(review.requestedAt)}
              </span>
              {review.timestampComments?.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {review.timestampComments.length} comment{review.timestampComments.length !== 1 ? "s" : ""}
                </span>
              )}
              {review.feedback?.rating && (
                <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {review.feedback.rating}/5
                </span>
              )}
            </div>
            {review.requestMessage && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 italic">
                &ldquo;{review.requestMessage}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t px-4 py-2.5">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onOpen}>
          Open thread
        </Button>
        {isIncoming && (
          <>
            <Button
              size="sm" className="h-7 text-xs"
              onClick={handleAccept} disabled={accepting || declining}
            >
              {accepting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="mr-1 h-3 w-3" />Accept</>}
            </Button>
            <Button
              size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDecline} disabled={accepting || declining}
            >
              {declining ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Decline"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Private Chat ──────────────────────────────────────────────────────────────

function PrivateChat({
  reviewId, messages: initialMessages, currentUserId,
  requesterId, requesterName, reviewerId, reviewerName,
}: {
  reviewId: string;
  messages: ChatMessage[];
  currentUserId: string;
  requesterId: string;
  requesterName: string;
  reviewerId: string;
  reviewerName: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 15 s while chat is visible
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await getThreadMessages(reviewId);
        setMessages(res.messages);
      } catch { /* silent */ }
    }, 15_000);
    return () => clearInterval(id);
  }, [reviewId]);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await getThreadMessages(reviewId);
      setMessages(res.messages);
    } catch { /* ignore */ } finally {
      setRefreshing(false);
    }
  }

  async function send() {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const res = await sendChatMessage(reviewId, t);
      setMessages(prev => [...prev, res.message]);
      setText("");
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  }

  // Resolve sender display name using actual IDs — not guessing
  function nameFor(senderId: string): string {
    if (senderId === currentUserId) return "You";
    if (senderId === requesterId)   return requesterName || "Requester";
    if (senderId === reviewerId)    return reviewerName  || "Reviewer";
    return "Participant";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <p className="text-xs font-medium text-muted-foreground">Private thread — visible only to participants</p>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh messages"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation about the review</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg._id} className={cn("flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}>
                <span className="text-[10px] text-muted-foreground px-1">{nameFor(msg.senderId)}</span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{relativeDate(msg.createdAt)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex items-center gap-2">
        <input
          type="text"
          placeholder="Message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          className="flex-1 rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
        >
          {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Timestamp Comments ────────────────────────────────────────────────────────

function TimestampComments({
  reviewId, comments: initial, currentUserId, canAdd, videoRef, onSeek,
}: {
  reviewId: string;
  comments: TimestampComment[];
  currentUserId: string;
  canAdd: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onSeek?: (t: number) => void;
}) {
  const [comments, setComments]   = useState(initial);
  const [timestamp, setTimestamp] = useState(0);
  const [text, setText]           = useState("");
  const [category, setCategory]   = useState<CommentCategory>("suggestion");
  const [adding, setAdding]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const sorted = [...comments].sort((a, b) => a.timestamp - b.timestamp);

  async function handleAdd() {
    if (!text.trim()) return;
    setAdding(true);
    try {
      const res = await addTimestampComment(reviewId, { timestamp, text: text.trim(), category });
      setComments(prev => [...prev, res.comment]);
      setText("");
      setShowForm(false);
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(commentId: string) {
    setDeleting(commentId);
    try {
      await deleteTimestampComment(reviewId, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  }

  function captureCurrentTime() {
    if (videoRef?.current) {
      setTimestamp(Math.floor(videoRef.current.currentTime));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
          Timestamp Comments ({comments.length})
        </h3>
        {canAdd && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowForm(v => !v)}>
            <Plus className="mr-1 h-3 w-3" />
            Add comment
          </Button>
        )}
      </div>

      {showForm && canAdd && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block">Timestamp (seconds)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={timestamp}
                  onChange={e => setTimestamp(Number(e.target.value))}
                  className="w-24 rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">= {formatTimestamp(timestamp)}</span>
                {videoRef && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={captureCurrentTime}>
                    <Play className="mr-1 h-3 w-3" /> Capture
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CommentCategory)}
                className="w-full rounded border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {COMMENT_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="What did you notice at this moment?"
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={adding || !text.trim()}>
              {adding ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Add"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          {canAdd ? "Add your first timestamp comment using the button above." : "No timestamp comments yet."}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map(c => (
            <div key={c._id} className="flex items-start gap-3 rounded-lg border p-3">
              <button
                onClick={() => onSeek?.(c.timestamp)}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-mono font-medium text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                title="Jump to this moment"
              >
                <Play className="h-3 w-3" /> {formatTimestamp(c.timestamp)}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", categoryStyle(c.category))}>
                    {COMMENT_CATEGORIES.find(x => x.value === c.category)?.label ?? c.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{relativeDate(c.createdAt)}</span>
                </div>
                <p className="text-sm">{c.text}</p>
              </div>
              {c.authorId === currentUserId && (
                <button
                  onClick={() => handleDelete(c._id)}
                  disabled={deleting === c._id}
                  className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                >
                  {deleting === c._id
                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Feedback Panel (reviewer fills, requester reads) ──────────────────────────

function FeedbackPanel({
  reviewId, feedback: initial, isReviewer, status,
  onFeedbackUpdated, onCompleted,
}: {
  reviewId: string;
  feedback: ReviewFeedback;
  isReviewer: boolean;
  status: string;
  onFeedbackUpdated: (f: ReviewFeedback) => void;
  onCompleted: () => void;
}) {
  const [strengths, setStrengths]             = useState<string[]>(initial.strengths ?? []);
  const [weaknesses, setWeaknesses]           = useState<string[]>(initial.weaknesses ?? []);
  const [suggestions, setSuggestions]         = useState<string[]>(
    (initial.suggestions ?? []).map(s => s.text)
  );
  const [suggestionObjs, setSuggestionObjs]   = useState<Suggestion[]>(initial.suggestions ?? []);
  const [overallComments, setOverallComments] = useState(initial.overallComments ?? "");
  const [summary, setSummary]                 = useState(initial.summary ?? "");
  const [rating, setRating]                   = useState<number | null>(initial.rating ?? null);
  const [newStrength, setNewStrength]         = useState("");
  const [newWeakness, setNewWeakness]         = useState("");
  const [newSuggestion, setNewSuggestion]     = useState("");
  const [saving, setSaving]                   = useState(false);
  const [completing, setCompleting]           = useState(false);
  const [saveMsg, setSaveMsg]                 = useState("");

  async function save() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await submitFeedback(reviewId, {
        strengths, weaknesses,
        suggestions,
        overallComments, rating, summary,
      });
      onFeedbackUpdated(res.feedback);
      setSuggestionObjs(res.feedback.suggestions);
      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      await save();
      await completeReview(reviewId);
      onCompleted();
    } catch {
      /* ignore */
    } finally {
      setCompleting(false);
    }
  }

  async function handleApply(sid: string, applied: boolean) {
    try {
      const res = await applySuggestion(reviewId, sid, applied);
      setSuggestionObjs(prev => prev.map(s => s._id === sid ? res.suggestion : s));
    } catch {
      /* ignore */
    }
  }

  function addToList(
    list: string[], setter: (v: string[]) => void,
    value: string, clearFn: (v: string) => void
  ) {
    const v = value.trim();
    if (!v) return;
    setter([...list, v]);
    clearFn("");
  }

  if (!isReviewer) {
    // Requester view — read-only with apply buttons
    const hasFeedback =
      strengths.length > 0 || weaknesses.length > 0 ||
      suggestionObjs.length > 0 || overallComments || summary || rating;

    if (!hasFeedback) {
      return (
        <div className="rounded-lg border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Feedback will appear here once the reviewer submits it.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {rating && (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Overall Rating</p>
            <StarRating value={rating} readonly />
          </div>
        )}

        {summary && (
          <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs font-semibold text-blue-800 mb-1">Summary</p>
            <p className="text-sm text-blue-900 leading-relaxed">{summary}</p>
          </div>
        )}

        {strengths.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Strengths</p>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Areas to improve</p>
            <ul className="space-y-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestionObjs.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Specific Suggestions</p>
            <div className="space-y-2">
              {suggestionObjs.map(s => (
                <div key={s._id} className="flex items-start gap-3 rounded-md border p-3">
                  <p className="flex-1 text-sm">{s.text}</p>
                  {status === "completed" && (
                    <button
                      onClick={() => handleApply(s._id, !s.appliedByRequester)}
                      className={cn(
                        "flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                        s.appliedByRequester
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                      )}
                    >
                      {s.appliedByRequester ? "✓ Applied" : "Mark applied"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {overallComments && (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Overall Comments</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{overallComments}</p>
          </div>
        )}
      </div>
    );
  }

  // Reviewer form
  const canComplete = !!rating && !!summary.trim() && status === "accepted";

  return (
    <div className="space-y-5">
      {/* Rating */}
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
          Overall Rating *
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Strengths */}
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
          Strengths ({strengths.length})
        </label>
        {strengths.map((s, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className="flex-1 rounded border bg-green-50 px-3 py-1.5 text-sm">{s}</span>
            <button
              onClick={() => setStrengths(prev => prev.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Add a strength…"
            value={newStrength}
            onChange={e => setNewStrength(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addToList(strengths, setStrengths, newStrength, setNewStrength)}
            className="flex-1 rounded border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" variant="outline" className="h-8"
            onClick={() => addToList(strengths, setStrengths, newStrength, setNewStrength)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
          Areas to Improve ({weaknesses.length})
        </label>
        {weaknesses.map((w, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className="flex-1 rounded border bg-amber-50 px-3 py-1.5 text-sm">{w}</span>
            <button
              onClick={() => setWeaknesses(prev => prev.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Add an area to improve…"
            value={newWeakness}
            onChange={e => setNewWeakness(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addToList(weaknesses, setWeaknesses, newWeakness, setNewWeakness)}
            className="flex-1 rounded border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" variant="outline" className="h-8"
            onClick={() => addToList(weaknesses, setWeaknesses, newWeakness, setNewWeakness)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
          Specific Suggestions ({suggestions.length})
        </label>
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className="flex-1 rounded border bg-muted/40 px-3 py-1.5 text-sm">{s}</span>
            <button
              onClick={() => setSuggestions(prev => prev.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Add a specific suggestion…"
            value={newSuggestion}
            onChange={e => setNewSuggestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addToList(suggestions, setSuggestions, newSuggestion, setNewSuggestion)}
            className="flex-1 rounded border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" variant="outline" className="h-8"
            onClick={() => addToList(suggestions, setSuggestions, newSuggestion, setNewSuggestion)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Overall comments */}
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
          Overall Comments
        </label>
        <textarea
          rows={4}
          placeholder="Your overall observations about this interview…"
          value={overallComments}
          onChange={e => setOverallComments(e.target.value)}
          maxLength={3000}
          className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
          Final Summary * <span className="font-normal text-muted-foreground">(required to complete)</span>
        </label>
        <textarea
          rows={3}
          placeholder="A brief summary of your review and key takeaways for the candidate…"
          value={summary}
          onChange={e => setSummary(e.target.value)}
          maxLength={2000}
          className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button variant="outline" onClick={save} disabled={saving}>
          {saving ? <><RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />Saving…</> : "Save Draft"}
        </Button>
        <Button onClick={handleComplete} disabled={!canComplete || completing || saving}>
          {completing
            ? <><RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />Completing…</>
            : <><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Complete Review</>}
        </Button>
        {saveMsg && (
          <span className={cn("text-xs", saveMsg === "Saved" ? "text-green-600" : "text-red-500")}>
            {saveMsg}
          </span>
        )}
      </div>

      {!canComplete && status === "accepted" && (
        <p className="text-xs text-muted-foreground">
          Add a rating and summary to complete the review.
        </p>
      )}
    </div>
  );
}

// ── Review Thread View ────────────────────────────────────────────────────────

function ReviewThreadView({
  thread: initial, currentUserId, onBack, onUpdated,
}: {
  thread: ReviewThread;
  currentUserId: string;
  onBack: () => void;
  onUpdated: (r: PeerReview) => void;
}) {
  const [thread, setThread]           = useState(initial);
  const [activeSection, setSection]   = useState<"overview" | "feedback" | "comments" | "chat">("overview");
  const [sessionOpen, setSessionOpen] = useState(false);
  const videoRef                      = useRef<HTMLVideoElement>(null);

  const { review, session } = thread;
  const isReviewer  = String(review.reviewer?._id ?? review.reviewer ?? "") === currentUserId;
  const isRequester = String(review.requester._id ?? review.requester) === currentUserId;
  const canChat     = (isReviewer || isRequester) && ["accepted", "completed"].includes(review.status);
  const canComment  = (isReviewer || isRequester) && review.status === "accepted";

  function seekVideo(t: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      videoRef.current.play().catch(() => {});
    }
  }

  function handleFeedbackUpdated(f: ReviewFeedback) {
    setThread(prev => ({ ...prev, review: { ...prev.review, feedback: f } }));
  }

  function handleCompleted() {
    const updated = { ...review, status: "completed" as const, completedAt: new Date().toISOString() };
    setThread(prev => ({ ...prev, review: updated }));
    onUpdated(updated);
  }

  const tsComments = review.timestampComments ?? [];
  const chatMsgs   = review.chatMessages ?? [];

  const tabs = [
    { id: "overview",  label: "Overview" },
    { id: "feedback",  label: "Feedback" },
    { id: "comments",  label: `Comments (${tsComments.length})` },
    ...(canChat ? [{ id: "chat", label: `Chat (${chatMsgs.length})` }] : []),
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <button onClick={onBack} className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-base truncate">{review.title}</h2>
            <StatusBadge status={review.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Requester: {review.requester.name}
            </span>
            {review.reviewer && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Reviewer: {review.reviewer.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {relativeDate(review.requestedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1 border-b mb-4 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSection(t.id as typeof activeSection)}
            className={cn(
              "px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeSection === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* ── Overview ── */}
        {activeSection === "overview" && (
          <div className="space-y-5">
            {review.requestMessage && (
              <div className="rounded-md bg-muted/40 border px-4 py-3 text-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Request message</p>
                <p className="leading-relaxed">{review.requestMessage}</p>
              </div>
            )}

            {/* Recording */}
            {review.recordingUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Recording</p>
                {review.recordingUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    ref={videoRef}
                    src={review.recordingUrl}
                    controls
                    className="w-full rounded-lg border bg-black max-h-64 object-contain"
                  />
                ) : (
                  <a
                    href={review.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <Video className="h-4 w-4 text-primary" />
                    Watch recording
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                <Video className="h-6 w-6 mx-auto mb-1 opacity-30" />
                No recording attached — review is based on the interview report below.
              </div>
            )}

            {/* Interview session summary */}
            {session && (
              <div className="rounded-lg border overflow-hidden">
                <button
                  onClick={() => setSessionOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    Interview Report — Score {session.overallScore}%
                    {session.role && <span className="text-muted-foreground font-normal">· {session.role}</span>}
                  </span>
                  {sessionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {sessionOpen && (
                  <div className="p-4 space-y-4">
                    {session.report?.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-1.5">AI-identified strengths</p>
                        <ul className="space-y-1">
                          {session.report.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-sm">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {session.report?.improvements?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-1.5">AI-identified improvements</p>
                        <ul className="space-y-1">
                          {session.report.improvements.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-sm">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {session.questions?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                          Questions & Answers ({session.questions.length})
                        </p>
                        <div className="space-y-3">
                          {session.questions.map((q, i) => (
                            <div key={i} className="rounded-md border p-3 space-y-1.5">
                              <p className="text-sm font-medium">{q.question}</p>
                              {q.userAnswer && (
                                <div>
                                  <p className="text-[11px] text-muted-foreground font-medium uppercase">Answer</p>
                                  <p className="text-sm whitespace-pre-wrap">{q.userAnswer}</p>
                                </div>
                              )}
                              {q.aiFeedback && (
                                <div className="rounded bg-muted/40 p-2">
                                  <p className="text-[11px] text-muted-foreground font-medium uppercase mb-0.5">AI Feedback</p>
                                  <p className="text-xs">{q.aiFeedback}</p>
                                </div>
                              )}
                              {q.score > 0 && (
                                <p className="text-xs text-muted-foreground">Score: {q.score}%</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Feedback ── */}
        {activeSection === "feedback" && (
          <FeedbackPanel
            reviewId={review._id}
            feedback={review.feedback ?? { strengths: [], weaknesses: [], suggestions: [], overallComments: "", summary: "", rating: null, submittedAt: null }}
            isReviewer={isReviewer}
            status={review.status}
            onFeedbackUpdated={handleFeedbackUpdated}
            onCompleted={handleCompleted}
          />
        )}

        {/* ── Comments ── */}
        {activeSection === "comments" && (
          <TimestampComments
            reviewId={review._id}
            comments={tsComments}
            currentUserId={currentUserId}
            canAdd={canComment}
            videoRef={videoRef}
            onSeek={seekVideo}
          />
        )}

        {/* ── Chat ── */}
        {activeSection === "chat" && canChat && (
          <div className="h-[500px] flex flex-col rounded-lg border overflow-hidden">
            <PrivateChat
              reviewId={review._id}
              messages={chatMsgs}
              currentUserId={currentUserId}
              requesterId={review.requester._id}
              requesterName={review.requester.name}
              reviewerId={review.reviewer?._id ?? ""}
              reviewerName={review.reviewer?.name ?? ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PeerReviewsPage() {
  const currentUserId = getCurrentUserId();

  const [incoming,    setIncoming]    = useState<PeerReview[]>([]);
  const [outgoing,    setOutgoing]    = useState<PeerReview[]>([]);
  const [given,       setGiven]       = useState<PeerReview[]>([]);
  const [thread,      setThread]      = useState<ReviewThread | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showModal,   setShowModal]   = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inc, out, giv] = await Promise.all([
        getIncomingRequests(),
        getOutgoingRequests(),
        getReviewsGiven(),
      ]);
      setIncoming(Array.isArray(inc) ? inc : []);
      setOutgoing(Array.isArray(out) ? out : []);
      setGiven(Array.isArray(giv) ? giv : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function openThread(id: string) {
    setThreadLoading(true);
    try {
      const t = await getReviewThread(id);
      setThread(t);
    } catch {
      /* ignore */
    } finally {
      setThreadLoading(false);
    }
  }

  function handleAccepted(updated: PeerReview) {
    setIncoming(prev => prev.filter(r => r._id !== updated._id));
    setGiven(prev => [updated, ...prev]);
  }

  function handleDeclined(id: string) {
    setIncoming(prev => prev.filter(r => r._id !== id));
  }

  function handleCreated(review: PeerReview) {
    setOutgoing(prev => [review, ...prev]);
    setShowModal(false);
  }

  function handleUpdated(updated: PeerReview) {
    setGiven(prev => prev.map(r => r._id === updated._id ? updated : r));
    setOutgoing(prev => prev.map(r => r._id === updated._id ? updated : r));
  }

  if (thread) {
    return (
      <AppShell title="Peer Review" description="Private review thread">
        <ReviewThreadView
          thread={thread}
          currentUserId={currentUserId}
          onBack={() => setThread(null)}
          onUpdated={handleUpdated}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Peer Reviews" description="Request and give professional interview feedback">
      {showModal && (
        <RequestModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Request Review
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      ) : (
        <Tabs defaultValue="incoming">
          <TabsList>
            <TabsTrigger value="incoming">
              Open Requests
              {incoming.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-medium">
                  {incoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">My Reviews ({outgoing.length})</TabsTrigger>
            <TabsTrigger value="given">Given ({given.length})</TabsTrigger>
          </TabsList>

          {/* ── Open Requests (from community) ── */}
          <TabsContent value="incoming" className="mt-4">
            {incoming.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
                  <User className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium">No open requests right now</p>
                  <p className="text-sm mt-1">Check back later or ask a peer to request a review.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {incoming.map(r => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    currentUserId={currentUserId}
                    onOpen={() => openThread(r._id)}
                    onAccepted={handleAccepted}
                    onDeclined={handleDeclined}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── My Requests (I am requester) ── */}
          <TabsContent value="outgoing" className="mt-4">
            {outgoing.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium">No review requests yet</p>
                  <p className="text-sm mt-1">Click &ldquo;Request Review&rdquo; to get feedback on one of your interviews.</p>
                  <Button className="mt-4" onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Request Review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {outgoing.map(r => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    currentUserId={currentUserId}
                    onOpen={() => openThread(r._id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Reviews Given (I am reviewer) ── */}
          <TabsContent value="given" className="mt-4">
            {given.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
                  <Star className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium">No reviews given yet</p>
                  <p className="text-sm mt-1">Accept an open request from the &ldquo;Open Requests&rdquo; tab to start reviewing.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {given.map(r => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    currentUserId={currentUserId}
                    onOpen={() => openThread(r._id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {threadLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="rounded-xl bg-background border px-6 py-4 flex items-center gap-3 shadow-lg">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading thread…</span>
          </div>
        </div>
      )}
    </AppShell>
  );
}
