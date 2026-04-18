"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { InterviewSetup } from "@/components/interview/interview-setup"
import { InterviewSession, InterviewResults as IResults } from "@/components/interview/interview-session"
import { InterviewResults } from "@/components/interview/interview-results"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Stage = "setup" | "preparing" | "session" | "results"

interface InterviewConfig {
  category: string
  role: string
  company: string
}

const DISPLAY_STAGES = [
  { key: "setup",   label: "Setup" },
  { key: "session", label: "Interview" },
  { key: "results", label: "Results" },
]

function StageHeader({ stage }: { stage: Stage }) {
  const activeIndex =
    stage === "setup"      ? 0 :
    stage === "preparing"  ? 1 :
    stage === "session"    ? 1 : 2

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {DISPLAY_STAGES.map((s, i) => (
        <div key={s.key} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
              i < activeIndex
                ? "bg-primary text-primary-foreground"
                : i === activeIndex
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"
            )}>
              {i < activeIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors hidden sm:inline",
              i === activeIndex ? "text-foreground" : "text-muted-foreground"
            )}>
              {s.label}
            </span>
          </div>
          {i < DISPLAY_STAGES.length - 1 && (
            <div className={cn(
              "h-px w-12 transition-all duration-500",
              i < activeIndex ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

const COUNTDOWN_PHASES = ["3", "2", "1", "Begin"]

function PreparingOverlay({ onReady }: { onReady: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (phase >= COUNTDOWN_PHASES.length - 1) {
      const id = setTimeout(onReady, 500)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setPhase(p => p + 1), 1000)
    return () => clearTimeout(id)
  }, [phase, onReady])

  const isBegin = COUNTDOWN_PHASES[phase] === "Begin"

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-8">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
        Interview starting in
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={COUNTDOWN_PHASES[phase]}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={cn(
            "font-bold select-none",
            isBegin ? "text-5xl text-primary" : "text-8xl gradient-text"
          )}
        >
          {COUNTDOWN_PHASES[phase]}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <p>Sit up straight · Look at the camera · Speak clearly</p>
      </div>

      <div className="flex gap-2">
        {COUNTDOWN_PHASES.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < phase  ? "w-4 bg-primary" :
              i === phase ? "w-6 bg-primary" :
              "w-1.5 bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
}

export default function InterviewPage() {
  const [stage, setStage]     = useState<Stage>("setup")
  const [config, setConfig]   = useState<InterviewConfig | null>(null)
  const [results, setResults] = useState<IResults | null>(null)

  return (
    <AppShell
      title="Mock Interview"
      description={
        stage === "setup"     ? "AI-powered interview practice with real-time evaluation" :
        stage === "preparing" ? "Preparing your interview..." :
        stage === "session"   ? "Interview in progress — stay focused" :
        "Review your performance"
      }
    >
      <StageHeader stage={stage} />

      <AnimatePresence mode="wait">
        {stage === "setup" && (
          <motion.div key="setup" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <InterviewSetup onStart={(cfg) => { setConfig(cfg); setStage("preparing") }} />
          </motion.div>
        )}

        {stage === "preparing" && (
          <motion.div key="preparing" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <PreparingOverlay onReady={() => setStage("session")} />
          </motion.div>
        )}

        {stage === "session" && config && (
          <motion.div key="session" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <InterviewSession
              config={config}
              onComplete={(r) => { setResults(r); setStage("results") }}
            />
          </motion.div>
        )}

        {stage === "results" && results && (
          <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <InterviewResults
              results={results}
              onRetry={() => { setConfig(null); setResults(null); setStage("setup") }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
