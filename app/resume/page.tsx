"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { ResumeUpload } from "@/components/resume/resume-upload"
import { ResumeAnalysis } from "@/components/resume/resume-analysis"

type Stage = "upload" | "analysis"

export default function ResumePage() {
  const [stage, setStage] = useState<Stage>("upload")
  const [fileName, setFileName] = useState("")

  const handleAnalyze = (file: File, jobDescription: string) => {
    setFileName(file.name)
    setStage("analysis")
  }

  const handleReset = () => {
    setStage("upload")
    setFileName("")
  }

  return (
    <AppShell
      title="Resume Analyzer"
      description={
        stage === "upload"
          ? "Upload your resume for ATS analysis and improvement suggestions"
          : "Review your resume analysis results"
      }
    >
      {stage === "upload" && <ResumeUpload onAnalyze={handleAnalyze} />}
      {stage === "analysis" && (
        <ResumeAnalysis fileName={fileName} onReset={handleReset} />
      )}
    </AppShell>
  )
}
