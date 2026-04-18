"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { interviewQuestions } from "@/lib/mock-data"
import {
  Mic, MicOff, Video, VideoOff, StopCircle, ChevronRight, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAudioLevel } from "@/hooks/use-audio-level"

// ── Types ─────────────────────────────────────────────────────────────────────

interface InterviewSessionProps {
  config: { category: string; role: string; company: string }
  onComplete: (results: InterviewResults) => void
}

export interface InterviewResults {
  category: string
  role: string
  company: string
  questions: QuestionResult[]
  totalTime: number
  overallScore: number
}

interface QuestionResult {
  question: string
  difficulty: string
  timeSpent: number
  timeLimit: number
  score: number
  feedback: string
}

type InterviewerState = "asking" | "listening" | "thinking"

// ── Persona data ──────────────────────────────────────────────────────────────

const PERSONAS: Record<string, { name: string; initials: string; title: string }> = {
  tech:       { name: "Alex Chen",      initials: "AC", title: "Senior Engineer" },
  behavioral: { name: "Sarah Mitchell", initials: "SM", title: "HR Director" },
  hr:         { name: "James Park",     initials: "JP", title: "Talent Acquisition" },
  case:       { name: "Priya Sharma",   initials: "PS", title: "Strategy Consultant" },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const WORD_STAGGER = 0.055 // seconds per word in typewriter

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function generateFeedback(score: number): string {
  if (score >= 85) return "Excellent response — clear structure, strong examples, and confident delivery."
  if (score >= 75) return "Good answer with solid points. Adding specific metrics would strengthen it further."
  if (score >= 65) return "Decent response. Focus on structuring your answer more clearly and being concise."
  return "Needs improvement. Practice articulating your thoughts with the STAR method."
}

// ── Main component ────────────────────────────────────────────────────────────

export function InterviewSession({ config, onComplete }: InterviewSessionProps) {
  const questions = interviewQuestions[config.category as keyof typeof interviewQuestions] ?? interviewQuestions.tech

  const [currentIndex,     setCurrentIndex]     = useState(0)
  const [interviewerState, setInterviewerState] = useState<InterviewerState>("asking")
  const [isRecording,      setIsRecording]      = useState(false)
  const [isMuted,          setIsMuted]          = useState(false)
  const [isVideoOff,       setIsVideoOff]       = useState(false)
  const [timeLeft,         setTimeLeft]         = useState(questions[0]?.timeLimit ?? 180)
  const [totalTime,        setTotalTime]        = useState(0)
  const [answers,          setAnswers]          = useState<QuestionResult[]>([])
  const [showWarning,      setShowWarning]      = useState(false)
  const [showEndConfirm,   setShowEndConfirm]   = useState(false)
  const [stream,           setStream]           = useState<MediaStream | null>(null)

  const videoRef        = useRef<HTMLVideoElement>(null)
  const streamRef       = useRef<MediaStream | null>(null)
  const thinkRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Always-current snapshot of submit logic, avoids stale closures in effects
  const submitRef       = useRef<() => void>(() => {})
  const audioLevel      = useAudioLevel(stream)
  const currentQuestion = questions[currentIndex]

  // ── Camera init ──
  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = s
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      } catch (err) {
        console.error("Camera failed:", err)
      }
    }
    start()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (thinkRef.current) clearTimeout(thinkRef.current)
    }
  }, [])

  // Re-attach stream after re-render
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  // ── Typewriter: switch to listening after reveal completes ──
  useEffect(() => {
    if (interviewerState !== "asking") return
    const wordCount = currentQuestion.question.split(" ").length
    const id = setTimeout(
      () => setInterviewerState("listening"),
      wordCount * WORD_STAGGER * 1000 + 700
    )
    return () => clearTimeout(id)
  }, [currentIndex, interviewerState, currentQuestion.question])

  // ── Main countdown timer (paused while interviewer is thinking) ──
  useEffect(() => {
    if (interviewerState === "thinking") return
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 30 && prev > 10) setShowWarning(true)
        if (prev <= 10) setShowWarning(true)
        return Math.max(0, prev - 1)
      })
      setTotalTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [interviewerState])

  // ── Auto-advance when timer hits zero ──
  useEffect(() => {
    if (timeLeft === 0 && interviewerState === "listening") {
      submitRef.current()
    }
  }, [timeLeft, interviewerState])

  // ── Submit answer (ref keeps it fresh for the auto-advance effect) ──
  const handleSubmitAnswer = () => {
    if (interviewerState === "thinking") return
    const timeSpent = currentQuestion.timeLimit - timeLeft
    const score     = Math.floor(Math.random() * 30) + 65
    const result: QuestionResult = {
      question:  currentQuestion.question,
      difficulty: currentQuestion.difficulty,
      timeSpent,
      timeLimit: currentQuestion.timeLimit,
      score,
      feedback: generateFeedback(score),
    }
    const newAnswers = [...answers, result]
    setAnswers(newAnswers)
    setInterviewerState("thinking")

    thinkRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1)
        setTimeLeft(questions[currentIndex + 1].timeLimit)
        setIsRecording(false)
        setShowWarning(false)
        setInterviewerState("asking")
      } else {
        const avg = Math.round(newAnswers.reduce((a, q) => a + q.score, 0) / newAnswers.length)
        onComplete({ category: config.category, role: config.role, company: config.company, questions: newAnswers, totalTime, overallScore: avg })
      }
    }, 1600)
  }
  submitRef.current = handleSubmitAnswer

  // ── End interview early ──
  const handleEndInterview = () => {
    if (thinkRef.current) clearTimeout(thinkRef.current)
    const timeSpent = currentQuestion.timeLimit - timeLeft
    const score     = isRecording ? Math.floor(Math.random() * 30) + 65 : 0
    const current: QuestionResult = {
      question: currentQuestion.question,
      difficulty: currentQuestion.difficulty,
      timeSpent,
      timeLimit: currentQuestion.timeLimit,
      score,
      feedback: score > 0 ? generateFeedback(score) : "Ended early",
    }
    const skipped = questions.slice(currentIndex + 1).map(q => ({
      question: q.question, difficulty: q.difficulty,
      timeSpent: 0, timeLimit: q.timeLimit, score: 0, feedback: "Question skipped",
    }))
    const all    = [...answers, current, ...skipped]
    const scored = all.filter(a => a.score > 0)
    const avg    = scored.length > 0 ? Math.round(scored.reduce((a, q) => a + q.score, 0) / scored.length) : 0
    onComplete({ category: config.category, role: config.role, company: config.company, questions: all, totalTime, overallScore: avg })
  }

  // ── Media controls ──
  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0]
    if (track) { track.enabled = isMuted; setIsMuted(v => !v) }
  }
  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (track) { track.enabled = isVideoOff; setIsVideoOff(v => !v) }
  }

  // ── Derived display values ──
  const persona      = PERSONAS[config.category] ?? PERSONAS.tech
  const timerPct     = (timeLeft / currentQuestion.timeLimit) * 100
  const isWarning    = timeLeft <= 30 && timeLeft > 10
  const isDanger     = timeLeft <= 10

  // ── Render ──
  return (
    <div className="grid gap-6 lg:grid-cols-5">

      {/* ─────── LEFT: Interviewer + question ─────── */}
      <div className="lg:col-span-3 space-y-4">

        {/* Interviewer panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">

          {/* Identity row */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                {persona.initials}
              </div>
              {interviewerState === "listening" && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{persona.name}</p>
              <p className="text-xs text-muted-foreground">{persona.title}</p>
            </div>
            <InterviewerStateLabel state={interviewerState} />
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  currentQuestion.difficulty === "easy"   && "bg-green-500/10 text-green-500",
                  currentQuestion.difficulty === "medium" && "bg-yellow-500/10 text-yellow-500",
                  currentQuestion.difficulty === "hard"   && "bg-red-500/10 text-red-500",
                )}>
                  {currentQuestion.difficulty}
                </span>
              </div>

              {interviewerState === "asking" ? (
                <TypewriterQuestion question={currentQuestion.question} />
              ) : (
                <p className="text-base leading-relaxed font-medium">{currentQuestion.question}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Time warning */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2",
                  isDanger
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                )}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {isDanger ? "Time almost up — wrap up your answer!" : "30 seconds remaining"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress + answer controls */}
        <div className="flex items-center justify-between gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i < currentIndex  ? "h-2 w-2 bg-primary" :
                  i === currentIndex ? "h-2 w-5 bg-primary" :
                  "h-2 w-2 bg-muted"
                )}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {interviewerState === "thinking" ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                <ThinkingDots />
                <span>Evaluating answer...</span>
              </div>
            ) : !isRecording ? (
              <Button
                onClick={() => setIsRecording(true)}
                disabled={interviewerState === "asking"}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Start Answer
              </Button>
            ) : (
              <Button variant="outline" onClick={handleSubmitAnswer} className="gap-2">
                <ChevronRight className="h-4 w-4" />
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─────── RIGHT: User video + controls ─────── */}
      <div className="lg:col-span-2 space-y-3">

        {/* Video panel */}
        <div className="relative rounded-xl overflow-hidden border border-border bg-black">
          <div className="aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
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
            <span className={cn(
              "h-2 w-2 rounded-full bg-red-500",
              isRecording && "animate-pulse"
            )} />
            <span className="text-xs font-semibold text-white tracking-wide">
              {isRecording ? "REC" : "READY"}
            </span>
          </div>

          {/* Timer ring */}
          <div className="absolute right-3 top-3">
            <TimerRing
              percent={timerPct}
              isWarning={isWarning}
              isDanger={isDanger}
              label={formatTime(timeLeft)}
            />
          </div>
        </div>

        {/* Audio level */}
        {!isMuted && (
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Mic className="h-3 w-3" />
              Microphone level
            </p>
            <SessionAudioBars level={audioLevel} active={isRecording} />
          </div>
        )}

        {/* Controls bar */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleVideo}
              title={isVideoOff ? "Show camera" : "Hide camera"}
            >
              {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            </Button>
          </div>

          {/* End confirm inline */}
          <AnimatePresence mode="wait">
            {showEndConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs text-muted-foreground">End interview?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => { setShowEndConfirm(false); handleEndInterview() }}
                >
                  Yes, end
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowEndConfirm(false)}
                >
                  Cancel
                </Button>
              </motion.div>
            ) : (
              <motion.div key="end-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowEndConfirm(true)}
                >
                  <StopCircle className="h-4 w-4" />
                  End
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick tips */}
        <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 space-y-1.5">
          <p className="text-xs font-medium text-primary">Quick tips</p>
          {["Speak clearly and at a natural pace", "Use concrete examples when possible", "Maintain eye contact with the camera"].map((tip, i) => (
            <p key={i} className="text-xs text-muted-foreground">· {tip}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypewriterQuestion({ question }: { question: string }) {
  const words = question.split(" ")
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
          variants={{
            hidden:  { opacity: 0, y: 4 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
          }}
          className="inline"
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.p>
  )
}

function InterviewerStateLabel({ state }: { state: InterviewerState }) {
  const config = {
    asking:    { text: "Asking…",     cls: "text-primary" },
    listening: { text: "Listening…",  cls: "text-green-500" },
    thinking:  { text: "Evaluating…", cls: "text-yellow-500" },
  }
  const { text, cls } = config[state]
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
          <ThinkingDots />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        )}
        {text}
      </motion.div>
    </AnimatePresence>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          animate={{ y: ["0%", "-55%", "0%"] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function TimerRing({ percent, isWarning, isDanger, label }: {
  percent: number
  isWarning: boolean
  isDanger: boolean
  label: string
}) {
  const size        = 54
  const strokeWidth = 4
  const radius      = (size - strokeWidth) / 2
  const circ        = radius * 2 * Math.PI
  const offset      = circ - (percent / 100) * circ
  const color       = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#ffffff"

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} stroke={color}
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>
      <span className={cn(
        "absolute text-[10px] font-bold tabular-nums",
        isDanger ? "text-red-400" : isWarning ? "text-yellow-400" : "text-white"
      )}>
        {label}
      </span>
    </div>
  )
}

function SessionAudioBars({ level, active }: { level: number; active: boolean }) {
  const COUNT = 20
  return (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: COUNT }).map((_, i) => {
        const mid       = COUNT / 2
        const heightPct = 15 + (i < mid ? i / mid : (COUNT - i) / mid) * 85
        const threshold = (i / COUNT) * 100
        const lit       = active && level > threshold
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-75",
              lit ? "bg-primary" : "bg-muted-foreground/20"
            )}
            style={{ height: `${lit ? heightPct : 15}%` }}
          />
        )
      })}
    </div>
  )
}
