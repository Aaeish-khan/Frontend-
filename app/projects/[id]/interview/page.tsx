"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  getProjectInterviewHistoryRequest,
  startProjectInterviewRequest,
  answerProjectInterviewRequest,
  transcribeInterviewAnswerRequest,
  deleteInterviewSessionRequest,
} from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera, Mic, MicOff, Video, VideoOff, StopCircle, ChevronRight,
  Clock, CheckCircle, AlertCircle, Trophy, Check, Play, Loader2,
  Square, Sparkles, Download, Volume2, VolumeX, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { ProgressRing } from "@/components/dashboard/progress-ring";

// ── Types ─────────────────────────────────────────────────────────────────────

type Dimensions = {
  relevance:     number;
  structure:     number;
  depth:         number;
  communication: number;
};

type Question = {
  question:    string;
  type?:       string;
  targetSkill?: string;
  isFollowup?:  boolean;
  userAnswer?: string;
  aiFeedback?: string;
  strength?:   string;
  improvement?: string;
  score?:      number;
  dimensions?: Dimensions;
};

type Report = {
  strengths:          string[];
  improvements:       string[];
  suggestedResources: string[];
  recommendation:     string;
};

type Persona = "friendly" | "strict" | "technical" | "behavioral" | "mixed";

type InterviewSession = {
  _id: string;
  title: string;
  role?: string;
  persona?: Persona;
  questions: Question[];
  overallScore?: number;
  report?: Report;
  completedAt?: string | null;
};

type Stage = "history" | "preparing" | "session" | "done";

type InterviewerState = "asking" | "listening" | "thinking";

// ── Constants ─────────────────────────────────────────────────────────────────

const WORD_STAGGER = 0.055;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function scoreColor(s: number) {
  if (s >= 8) return "text-green-500";
  if (s >= 6) return "text-primary";
  if (s >= 4) return "text-yellow-500";
  return "text-red-500";
}

// ── Results sub-components (defined before main export for TS resolution) ─────

const DIMENSION_LABELS: Record<string, string> = {
  relevance:     "Relevance",
  structure:     "Structure",
  depth:         "Depth",
  communication: "Communication",
};

function DimensionBar({ label, value }: { label: string; value: number }) {
  const pct  = (value / 10) * 100;
  const color = value >= 8 ? "bg-green-500" : value >= 6 ? "bg-primary" : value >= 4 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", scoreColor(value))}>{value}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function AggregateDimensions({ questions }: { questions: Question[] }) {
  const qs = questions.filter(q => q.dimensions);
  if (qs.length === 0) return null;

  const avg = (key: keyof Dimensions) =>
    Math.round(qs.reduce((s, q) => s + (q.dimensions?.[key] ?? 0), 0) / qs.length);

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Breakdown</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(DIMENSION_LABELS) as (keyof Dimensions)[]).map((k) => (
          <DimensionBar key={k} label={DIMENSION_LABELS[k]} value={avg(k)} />
        ))}
      </CardContent>
    </Card>
  );
}

const Q_TYPE_COLORS: Record<string, string> = {
  behavioral:   "bg-blue-500/10 text-blue-500",
  technical:    "bg-purple-500/10 text-purple-500",
  situational:  "bg-orange-500/10 text-orange-500",
  motivational: "bg-green-500/10 text-green-500",
};

function QuestionFeedbackCard({ q, index }: { q: Question; index: number }) {
  const [open, setOpen] = useState(false);
  const typeCls = Q_TYPE_COLORS[q.type || ""] || "bg-muted text-muted-foreground";

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-muted/30 transition"
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Q{index + 1}</span>
            {q.isFollowup && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 font-medium">
                Follow-up
              </span>
            )}
            {q.type && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize", typeCls)}>
                {q.type}
              </span>
            )}
            {q.targetSkill && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {q.targetSkill}
              </span>
            )}
          </div>
          <p className="text-sm font-medium">{q.question}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {q.score != null && (
            <span className={cn("font-bold text-sm", scoreColor(q.score))}>{q.score}/10</span>
          )}
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90")} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 space-y-4">
              {q.dimensions && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(DIMENSION_LABELS) as (keyof Dimensions)[]).map((k) => (
                    <DimensionBar key={k} label={DIMENSION_LABELS[k]} value={q.dimensions![k]} />
                  ))}
                </div>
              )}
              {q.userAnswer && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Your answer</p>
                  <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 leading-relaxed">{q.userAnswer}</p>
                </div>
              )}
              {q.strength && (
                <div className="flex gap-2 text-xs text-green-500 bg-green-500/5 rounded-lg px-3 py-2">
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{q.strength}</span>
                </div>
              )}
              {q.improvement && (
                <div className="flex gap-2 text-xs text-yellow-500 bg-yellow-500/5 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{q.improvement}</span>
                </div>
              )}
              {q.aiFeedback && (
                <p className="text-xs text-muted-foreground leading-relaxed">{q.aiFeedback}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectInterviewPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const [stage,           setStage]           = useState<Stage>("history");
  const [history,         setHistory]         = useState<InterviewSession[]>([]);
  const [currentSession,  setCurrentSession]  = useState<InterviewSession | null>(null);
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [answer,          setAnswer]          = useState("");
  const [loading,         setLoading]         = useState(true);
  const [starting,        setStarting]        = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState("");
  const [interviewerState, setInterviewerState] = useState<InterviewerState>("asking");
  const [isMuted,         setIsMuted]         = useState(false);
  const [isVideoOff,      setIsVideoOff]      = useState(false);
  const [stream,          setStream]          = useState<MediaStream | null>(null);
  const [timeLeft,        setTimeLeft]        = useState(180);
  const [totalTime,       setTotalTime]       = useState(0);
  const [countdown,       setCountdown]       = useState(3);
  const [showEndConfirm,  setShowEndConfirm]  = useState(false);
  // Phase 2 — recording
  const [isRecording,     setIsRecording]     = useState(false);
  const [isTranscribing,  setIsTranscribing]  = useState(false);
  const [recordingTime,   setRecordingTime]   = useState(0);
  // Phase 3 — adaptive follow-up
  const [showFollowupAlert, setShowFollowupAlert] = useState(false);

  // Phase 4 — persona + session recording
  const [selectedPersona, setSelectedPersona] = useState<Persona>("mixed");
  const [sessionRecordingUrl, setSessionRecordingUrl] = useState<string | null>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);

  // Delete session
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [deleteConfirmId,   setDeleteConfirmId]   = useState<string | null>(null);
  const [showDeleteDoneConfirm, setShowDeleteDoneConfirm] = useState(false);
  const sessionRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionChunksRef   = useRef<Blob[]>([]);

  const videoRef        = useRef<HTMLVideoElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef  = useRef<Blob[]>([]);
  const audioLevel = useAudioLevel(stream);

  const currentQ = currentSession?.questions[currentIndex];

  // ── Load history ──
  async function loadHistory() {
    try {
      const sessions = await getProjectInterviewHistoryRequest(projectId);
      setHistory(sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, [projectId]);

  // ── Attach stream to video ──
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // ── Cleanup ──
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ── Start camera + session recorder when entering session ──
  useEffect(() => {
    if (stage !== "session") return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        streamRef.current = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
        // Start session-level recording (video + audio)
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("video/webm")) {
          sessionChunksRef.current = [];
          const sr = new MediaRecorder(s, { mimeType: "video/webm" });
          sr.ondataavailable = (e) => { if (e.data.size > 0) sessionChunksRef.current.push(e.data); };
          sr.start(1000);
          sessionRecorderRef.current = sr;
        }
      })
      .catch(() => {});
  }, [stage]);

  // ── Countdown before session ──
  useEffect(() => {
    if (stage !== "preparing") return;
    if (countdown <= 0) { setStage("session"); return; }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [stage, countdown]);

  // ── AI question voice-over (TTS) → then switch to listening ──
  useEffect(() => {
    if (stage !== "session" || interviewerState !== "asking" || !currentQ) return;

    if (isTTSEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.question);
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      utterance.onend = () => setInterviewerState("listening");

      const speak = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("google")) ||
          voices.find(v => v.lang.startsWith("en")) ||
          voices[0];
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speak();
      } else {
        window.speechSynthesis.onvoiceschanged = speak;
      }
      return () => { window.speechSynthesis.cancel(); };
    } else {
      // Fallback: timer proportional to question length
      const words = currentQ.question.split(" ").length;
      const id = setTimeout(() => setInterviewerState("listening"), words * WORD_STAGGER * 1000 + 700);
      return () => clearTimeout(id);
    }
  }, [currentIndex, interviewerState, stage, currentQ, isTTSEnabled]);

  // ── Stop TTS when leaving session ──
  useEffect(() => {
    if (stage !== "session" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [stage]);

  // ── Per-question timer (resets on question change) ──
  useEffect(() => {
    if (stage !== "session" || interviewerState === "thinking") return;
    setTimeLeft(180);
    const id = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
      setTotalTime(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [currentIndex, stage]);

  // ── Recording timer ──
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecordingTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // ── Start interview ──
  async function handleStart() {
    try {
      setStarting(true);
      setError("");
      const session = await startProjectInterviewRequest(projectId, { persona: selectedPersona });
      setCurrentSession(session);
      setCurrentIndex(0);
      setAnswer("");
      setCountdown(3);
      setStage("preparing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    } finally {
      setStarting(false);
    }
  }

  // ── Submit answer (Phase 3: server determines completion) ──
  async function handleSubmitAnswer() {
    if (!currentSession || !answer.trim()) return;
    try {
      setSubmitting(true);
      setInterviewerState("thinking");
      const updated = await answerProjectInterviewRequest(projectId, currentSession._id, {
        index: currentIndex,
        answer,
      });
      const followupWasAdded = (updated as { followupAdded?: boolean }).followupAdded ?? false;
      setCurrentSession(updated);
      setAnswer("");
      if (followupWasAdded) {
        setShowFollowupAlert(true);
        setTimeout(() => setShowFollowupAlert(false), 3500);
      }
      setTimeout(() => {
        if (updated.completedAt) {
          // stop session recorder
          if (sessionRecorderRef.current && sessionRecorderRef.current.state !== "inactive") {
            sessionRecorderRef.current.stop();
            sessionRecorderRef.current.onstop = () => {
              const blob = new Blob(sessionChunksRef.current, { type: "video/webm" });
              setSessionRecordingUrl(URL.createObjectURL(blob));
            };
          }
          streamRef.current?.getTracks().forEach(t => t.stop());
          setStage("done");
          loadHistory();
        } else {
          setCurrentIndex(i => i + 1);
          setInterviewerState("asking");
        }
      }, followupWasAdded ? 2000 : 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
      setInterviewerState("listening");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Phase 2: voice recording ──
  function startRecording() {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;
    const audioStream = new MediaStream([audioTrack]);
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg";
    const mr = new MediaRecorder(audioStream, { mimeType });
    audioChunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    mr.start(250);
    mediaRecorderRef.current = mr;
    setIsRecording(true);
    setRecordingTime(0);
  }

  async function stopRecordingAndTranscribe() {
    if (!mediaRecorderRef.current || !currentSession) return;
    setIsRecording(false);
    setIsTranscribing(true);
    mediaRecorderRef.current.stop();
    await new Promise<void>((resolve) => {
      if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = () => resolve();
      else resolve();
    });
    try {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const { transcript } = await transcribeInterviewAnswerRequest(
        projectId, currentSession._id, blob
      );
      if (transcript) setAnswer(transcript);
    } catch {
      // silently fail — user can type manually
    } finally {
      setIsTranscribing(false);
    }
  }

  // ── End early ──
  function handleEndEarly() {
    if (sessionRecorderRef.current && sessionRecorderRef.current.state !== "inactive") {
      sessionRecorderRef.current.stop();
      sessionRecorderRef.current.onstop = () => {
        const blob = new Blob(sessionChunksRef.current, { type: "video/webm" });
        setSessionRecordingUrl(URL.createObjectURL(blob));
      };
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStage("done");
    loadHistory();
  }

  async function handleDeleteSession(sessionId: string, thenGoBack = false) {
    setDeletingSessionId(sessionId);
    try {
      await deleteInterviewSessionRequest(projectId, sessionId);
      setHistory(h => h.filter(s => s._id !== sessionId));
      if (thenGoBack) {
        setSessionRecordingUrl(null);
        setCurrentSession(null);
        setStage("history");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setDeletingSessionId(null);
      setDeleteConfirmId(null);
      setShowDeleteDoneConfirm(false);
    }
  }

  function handleExportPDF() {
    if (!currentSession) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    window.open(`${API_URL}/projects/${projectId}/interview/${currentSession._id}/report`, "_blank");
  }

  const toggleMute = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = isMuted; setIsMuted(v => !v); }
  };
  const toggleVideo = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = isVideoOff; setIsVideoOff(v => !v); }
  };

  const timerPct  = (timeLeft / 180) * 100;
  const isDanger  = timeLeft <= 10;
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const progress  = currentSession ? ((currentIndex + 1) / currentSession.questions.length) * 100 : 0;

  // ── Stage: countdown ──────────────────────────────────────────────────────
  if (stage === "preparing") {
    return (
      <AppShell title="Mock Interview" description="Get ready…">
        <div className="flex flex-col items-center justify-center min-h-[55vh] gap-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Interview starting in</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-8xl font-bold gradient-text select-none"
            >
              {countdown === 0 ? "Begin" : countdown}
            </motion.div>
          </AnimatePresence>
          <p className="text-sm text-muted-foreground">Sit up straight · Look at the camera · Speak clearly</p>
        </div>
      </AppShell>
    );
  }

  // ── Stage: session ────────────────────────────────────────────────────────
  if (stage === "session" && currentSession && currentQ) {
    const isLastQ = currentIndex === currentSession.questions.length - 1;
    return (
      <AppShell title="Mock Interview" description="Interview in progress — stay focused">
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {/* Phase 3: follow-up alert */}
        <AnimatePresence>
          {showFollowupAlert && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              Follow-up question added based on your answer — keep going!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── LEFT: Interviewer + question ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              {/* Interviewer identity */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                    AI
                  </div>
                  {interviewerState === "listening" && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">AI Interviewer</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentSession.persona || "mixed"} style</p>
                </div>
                <InterviewerStateLabel state={interviewerState} />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "rounded-xl border p-5",
                    currentQ.isFollowup
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Question {currentIndex + 1} of {currentSession.questions.length}
                    </p>
                    {currentQ.isFollowup && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
                        Follow-up
                      </span>
                    )}
                  </div>
                  {interviewerState === "asking" ? (
                    <TypewriterText text={currentQ.question} />
                  ) : (
                    <p className="text-base leading-relaxed font-medium">{currentQ.question}</p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Time warning */}
              <AnimatePresence>
                {(isDanger || isWarning) && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      isDanger ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                    )}
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {isDanger ? "Almost out of time!" : "30 seconds remaining"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Answer panel */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  Your Answer
                </p>
                {/* Phase 2: voice record button */}
                {!isTranscribing && interviewerState === "listening" && !submitting && (
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    className="h-7 gap-1.5 text-xs"
                    onClick={isRecording ? stopRecordingAndTranscribe : startRecording}
                  >
                    {isRecording ? (
                      <><Square className="h-3 w-3" />Stop ({recordingTime}s)</>
                    ) : (
                      <><Mic className="h-3 w-3" />Voice</>
                    )}
                  </Button>
                )}
                {isTranscribing && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />Transcribing…
                  </span>
                )}
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Recording…
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder={isRecording ? "Recording… speak your answer" : "Type or record your answer…"}
                disabled={submitting || interviewerState === "asking" || interviewerState === "thinking" || isRecording || isTranscribing}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{answer.length} characters</span>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer.trim() || interviewerState !== "listening" || isRecording || isTranscribing}
                  className="gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Evaluating…</>
                  ) : (
                    <><ChevronRight className="h-4 w-4" />{isLastQ ? "Finish Interview" : "Next Question"}</>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{currentIndex + 1} / {currentSession.questions.length} questions</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Video + controls ── */}
          <div className="lg:col-span-2 space-y-3">
            {/* Camera */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-black">
              <div className="aspect-video">
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  className={cn("h-full w-full object-cover scale-x-[-1]", isVideoOff && "hidden")}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                    <VideoOff className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* REC badge */}
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-white tracking-wide">LIVE</span>
              </div>

              {/* Timer ring */}
              <div className="absolute right-3 top-3">
                <TimerRing
                  percent={timerPct}
                  isWarning={isWarning}
                  isDanger={isDanger}
                  label={`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`}
                />
              </div>
            </div>

            {/* Audio bars */}
            {!isMuted && (
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Mic className="h-3 w-3" />Microphone level
                </p>
                <SessionAudioBars level={audioLevel} />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex gap-2">
                <Button variant={isMuted ? "destructive" : "secondary"} size="icon" className="h-10 w-10 rounded-full" onClick={toggleMute}>
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button variant={isVideoOff ? "destructive" : "secondary"} size="icon" className="h-10 w-10 rounded-full" onClick={toggleVideo}>
                  {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isTTSEnabled ? "secondary" : "outline"}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  title={isTTSEnabled ? "AI voice on — click to mute" : "AI voice off — click to enable"}
                  onClick={() => {
                    if (isTTSEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsTTSEnabled(v => !v);
                  }}
                >
                  {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {showEndConfirm ? (
                  <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">End interview?</span>
                    <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs" onClick={() => { setShowEndConfirm(false); handleEndEarly(); }}>Yes</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setShowEndConfirm(false)}>No</Button>
                  </motion.div>
                ) : (
                  <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={() => setShowEndConfirm(true)}>
                      <StopCircle className="h-4 w-4" />End
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 space-y-1.5">
              <p className="text-xs font-medium text-primary">Quick tips</p>
              {["Type your answer clearly and in full sentences", "Use STAR method: Situation, Task, Action, Result", "Be specific — vague answers score lower"].map((t, i) => (
                <p key={i} className="text-xs text-muted-foreground">· {t}</p>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Stage: done ───────────────────────────────────────────────────────────
  if (stage === "done" && currentSession) {
    const overall = currentSession.overallScore ?? 0;
    const pct     = overall * 10;
    const report  = currentSession.report;

    return (
      <AppShell title="Mock Interview" description="Interview complete">
        <motion.div className="space-y-6 max-w-2xl mx-auto" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Hero score card ── */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
              <div className="flex items-center gap-6">
                <ProgressRing progress={pct} size={100} strokeWidth={9}>
                  <div className="text-center">
                    <span className={cn("text-2xl font-bold", scoreColor(overall))}>{overall}</span>
                    <p className="text-xs text-muted-foreground">/10</p>
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Interview Complete</h2>
                  <p className="text-muted-foreground text-sm mt-0.5">{currentSession.title}</p>
                  <p className="text-sm mt-2 flex items-center gap-1.5 text-primary font-medium">
                    <Trophy className="h-4 w-4" />Overall score: {overall} / 10
                  </p>
                  {report?.recommendation && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{report.recommendation}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Aggregate dimension bars ── */}
          <AggregateDimensions questions={currentSession.questions} />

          {/* ── Report: strengths + improvements ── */}
          {report && (report.strengths.length > 0 || report.improvements.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {report.strengths.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-green-500">What You Did Well</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5">
                    {report.strengths.map((s, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-green-500 mt-0.5" />{s}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}
              {report.improvements.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-500">Areas to Improve</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5">
                    {report.improvements.map((s, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex gap-2">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-yellow-500 mt-0.5" />{s}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Per-question feedback ── */}
          <Card>
            <CardHeader><CardTitle>Question Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {currentSession.questions.map((q, i) => (
                <QuestionFeedbackCard key={i} q={q} index={i} />
              ))}
            </CardContent>
          </Card>

          {/* ── Suggested resources ── */}
          {report?.suggestedResources && report.suggestedResources.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Next Steps</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {report.suggestedResources.map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex gap-2">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />{r}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3 justify-between items-center">
            {/* Left: destructive actions */}
            <div className="flex flex-wrap gap-2">
              {sessionRecordingUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-red-500"
                  onClick={() => setSessionRecordingUrl(null)}
                >
                  <Trash2 className="h-3.5 w-3.5" />Clear Recording
                </Button>
              )}
              {showDeleteDoneConfirm ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Delete this session permanently?</span>
                  <Button
                    size="sm" variant="destructive" className="h-7 px-2.5 text-xs"
                    disabled={deletingSessionId === currentSession._id}
                    onClick={() => handleDeleteSession(currentSession._id, true)}
                  >
                    {deletingSessionId === currentSession._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, Delete"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setShowDeleteDoneConfirm(false)}>
                    Cancel
                  </Button>
                </span>
              ) : (
                <Button
                  variant="ghost" size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-red-500"
                  onClick={() => setShowDeleteDoneConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />Delete Session &amp; Report
                </Button>
              )}
            </div>

            {/* Right: normal actions */}
            <div className="flex flex-wrap gap-3">
              {sessionRecordingUrl && (
                <a href={sessionRecordingUrl} download="interview-recording.webm">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />Download Recording
                  </Button>
                </a>
              )}
              <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
                <Download className="h-4 w-4" />Export PDF
              </Button>
              <Button variant="outline" onClick={() => { setStage("history"); setCurrentSession(null); }}>
                Back to History
              </Button>
              <Button onClick={() => { setCurrentSession(null); setStage("history"); handleStart(); }} className="gap-2">
                <Play className="h-4 w-4" />Try Again
              </Button>
            </div>
          </div>
        </motion.div>
      </AppShell>
    );
  }

  // ── Stage: history (default) ──────────────────────────────────────────────
  return (
    <AppShell title="Mock Interview" description="AI-powered interview practice for this project">
      <div className="space-y-6 max-w-2xl mx-auto">
        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Persona picker */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Choose Interviewer Style</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(["mixed", "friendly", "strict", "technical", "behavioral"] as Persona[]).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPersona(p)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-all",
                  selectedPersona === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <p className="text-xs font-semibold capitalize">{p}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {p === "mixed" && "Balanced"}
                  {p === "friendly" && "Warm & supportive"}
                  {p === "strict" && "Demanding"}
                  {p === "technical" && "Deep tech"}
                  {p === "behavioral" && "STAR-focused"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Start card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Start a New Interview</h2>
                <p className="text-sm text-muted-foreground">
                  AI will generate questions based on your project's JD and resume.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Camera className="h-3 w-3" />Camera + mic required</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~15–20 minutes</span>
                </div>
              </div>
              <Button size="lg" className="gap-2" onClick={handleStart} disabled={starting}>
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {starting ? "Starting…" : "Start Interview"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Past sessions */}
        <Card>
          <CardHeader><CardTitle>Past Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />Loading history…
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No sessions yet. Start your first interview above.</p>
            ) : (
              history.map((s) => (
                <div key={s._id} className="flex items-center justify-between rounded-xl border border-border p-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.title}</p>
                    {s.completedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(s.completedAt)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.overallScore != null && (
                      <span className={cn("text-sm font-bold", scoreColor(s.overallScore))}>
                        {s.overallScore}/10
                      </span>
                    )}
                    {s.completedAt
                      ? <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="h-3 w-3" />Done</span>
                      : <span className="text-xs text-yellow-500">In progress</span>}

                    {/* Delete inline confirm */}
                    {deleteConfirmId === s._id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Delete?</span>
                        <Button
                          size="sm" variant="destructive"
                          className="h-6 px-2 text-xs"
                          disabled={deletingSessionId === s._id}
                          onClick={() => handleDeleteSession(s._id)}
                        >
                          {deletingSessionId === s._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setDeleteConfirmId(null)}>
                          No
                        </Button>
                      </span>
                    ) : (
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => setDeleteConfirmId(s._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function TypewriterText({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      className="text-base leading-relaxed font-medium"
      variants={{ visible: { transition: { staggerChildren: WORD_STAGGER } } }}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0, transition: { duration: 0.18 } } }}
          className="inline"
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.p>
  );
}

function InterviewerStateLabel({ state }: { state: InterviewerState }) {
  const cfg = {
    asking:    { text: "Asking…",     cls: "text-primary" },
    listening: { text: "Listening…",  cls: "text-green-500" },
    thinking:  { text: "Evaluating…", cls: "text-yellow-500" },
  };
  const { text, cls } = cfg[state];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.2 }}
        className={cn("flex items-center gap-1.5 text-xs font-medium shrink-0", cls)}
        aria-live="polite"
      >
        {state === "thinking" ? (
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <motion.span key={i} className="inline-block h-1.5 w-1.5 rounded-full bg-current"
                animate={{ y: ["0%", "-55%", "0%"] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
            ))}
          </div>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        )}
        {text}
      </motion.div>
    </AnimatePresence>
  );
}

function TimerRing({ percent, isWarning, isDanger, label }: {
  percent: number; isWarning: boolean; isDanger: boolean; label: string;
}) {
  const size = 54, sw = 4, r = (size - sw) / 2, circ = r * 2 * Math.PI;
  const color = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#ffffff";
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (percent / 100) * circ} stroke={color}
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
      </svg>
      <span className={cn("absolute text-[10px] font-bold tabular-nums",
        isDanger ? "text-red-400" : isWarning ? "text-yellow-400" : "text-white")}>
        {label}
      </span>
    </div>
  );
}

function SessionAudioBars({ level }: { level: number }) {
  const N = 20;
  return (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: N }).map((_, i) => {
        const mid = N / 2;
        const h   = 15 + (i < mid ? i / mid : (N - i) / mid) * 85;
        const lit = level > (i / N) * 100;
        return (
          <div key={i} className={cn("flex-1 rounded-full transition-all duration-75",
            lit ? "bg-primary" : "bg-muted-foreground/20")}
            style={{ height: `${lit ? h : 15}%` }} />
        );
      })}
    </div>
  );
}

