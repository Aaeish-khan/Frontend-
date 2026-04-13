"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { InterviewSetup } from "@/components/interview/interview-setup"
import { InterviewSession, InterviewResults as IResults } from "@/components/interview/interview-session"
import { InterviewResults } from "@/components/interview/interview-results"

type Stage = "setup" | "session" | "results"

interface InterviewConfig {
  category: string
  role: string
  company: string
}

export default function InterviewPage() {
  const [stage, setStage] = useState<Stage>("setup")
  const [config, setConfig] = useState<InterviewConfig | null>(null)
  const [results, setResults] = useState<IResults | null>(null)

  const handleStart = (interviewConfig: InterviewConfig) => {
    setConfig(interviewConfig)
    setStage("session")
  }

  const handleComplete = (interviewResults: IResults) => {
    setResults(interviewResults)
    setStage("results")
  }

  const handleRetry = () => {
    setStage("setup")
    setConfig(null)
    setResults(null)
  }

  return (
    <AppShell 
      title="Mock Interview"
      description={
        stage === "setup" ? "Practice interviews with AI-powered feedback" :
        stage === "session" ? "Interview in progress" :
        "Review your interview performance"
      }
    >
      {stage === "setup" && <InterviewSetup onStart={handleStart} />}
      {stage === "session" && config && (
        <InterviewSession config={config} onComplete={handleComplete} />
      )}
      {stage === "results" && results && (
        <InterviewResults results={results} onRetry={handleRetry} />
      )}
    </AppShell>
  )
}
