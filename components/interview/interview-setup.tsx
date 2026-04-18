"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { interviewCategories } from "@/lib/mock-data"
import {
  Code, Users, Briefcase, Lightbulb, LucideIcon,
  ArrowRight, Camera, Mic, Check, X, ChevronDown, ChevronUp,
  Clock, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAudioLevel } from "@/hooks/use-audio-level"
import { motion, AnimatePresence } from "framer-motion"

// ── Icon map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, LucideIcon> = {
  code:       Code,
  users:      Users,
  briefcase:  Briefcase,
  lightbulb:  Lightbulb,
}

// ── Persona data ──────────────────────────────────────────────────────────────

const PERSONAS: Record<string, { name: string; title: string; style: string }> = {
  tech:       { name: "Alex Chen",      title: "Senior Engineer · 12 yrs exp",       style: "Direct and technical — expects depth, precision, and edge-case thinking" },
  behavioral: { name: "Sarah Mitchell", title: "HR Director · Fortune 500",           style: "Evaluative but warm — values authentic stories and clear growth mindset" },
  hr:         { name: "James Park",     title: "Talent Acquisition Lead",             style: "Professional — focused on culture fit, motivation, and career trajectory" },
  case:       { name: "Priya Sharma",   title: "Strategy Consultant · McKinsey",      style: "Structured thinker — tests your frameworks, logic, and business intuition" },
}

// ── Interview tips ────────────────────────────────────────────────────────────

const TIPS = [
  { icon: "💡", text: "Use the STAR method: Situation, Task, Action, Result" },
  { icon: "🎯", text: "Be specific — vague answers always score lower than concrete ones" },
  { icon: "⏱", text: "Aim to use 70–80% of your allotted time per question" },
  { icon: "👁", text: "Look directly at the camera lens, not at your own preview" },
  { icon: "🎤", text: "Speak at a moderate, clear pace — the AI evaluates clarity" },
  { icon: "🧠", text: "Pause briefly to structure your answer before you start speaking" },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type PermissionStatus = "idle" | "checking" | "granted" | "denied"

interface InterviewSetupProps {
  onStart: (config: { category: string; role: string; company: string }) => void
}

// ── Main component ────────────────────────────────────────────────────────────

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [role, setRole]                         = useState("")
  const [company, setCompany]                   = useState("")
  const [cameraStatus, setCameraStatus]         = useState<PermissionStatus>("idle")
  const [micStatus, setMicStatus]               = useState<PermissionStatus>("idle")
  const [showTips, setShowTips]                 = useState(false)
  const [stream, setStream]                     = useState<MediaStream | null>(null)

  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioLevel = useAudioLevel(stream)

  // Wire stream to video element whenever it changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Stop tracks on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const checkPermissions = async () => {
    setCameraStatus("checking")
    setMicStatus("checking")
    streamRef.current?.getTracks().forEach(t => t.stop())
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = s
      setStream(s)
      setCameraStatus("granted")
      setMicStatus("granted")
    } catch {
      setCameraStatus("denied")
      setMicStatus("denied")
    }
  }

  const canStart = !!(selectedCategory && role.trim() && cameraStatus === "granted")
  const persona  = selectedCategory ? PERSONAS[selectedCategory] : null
  const catData  = interviewCategories.find(c => c.id === selectedCategory)
  const estMins  = catData ? Math.min(catData.count * 3, 25) : 15

  const startHint =
    !selectedCategory   ? "Select an interview type to continue" :
    !role.trim()        ? "Enter your target role to continue" :
    cameraStatus !== "granted" ? "Check your devices to continue" : ""

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* ── Category ── */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {interviewCategories.map((cat) => {
              const Icon       = iconMap[cat.icon] ?? Code
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                    isSelected
                      ? "border-primary/60 bg-gradient-to-br from-primary/10 to-purple-500/5 shadow-[0_0_18px_rgba(99,102,241,0.12)]"
                      : "border-white/8 hover:border-white/20 hover:bg-white/3"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                    isSelected
                      ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30"
                      : "bg-white/5 border border-white/10 text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.count} questions</p>
                </button>
              )
            })}
          </div>

          {/* Persona preview */}
          <AnimatePresence>
            {persona && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                    {persona.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{persona.name}</p>
                    <p className="text-xs text-muted-foreground">{persona.title}</p>
                    <p className="text-xs text-primary/80 mt-1 flex items-start gap-1">
                      <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{persona.style}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Est. duration</p>
                    <p className="text-sm font-semibold flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="h-3 w-3" />
                      ~{estMins} min
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Details ── */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">
                Target Role{" "}
                <span className="text-xs text-red-400 font-normal">required</span>
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">
                Target Company{" "}
                <span className="text-xs text-muted-foreground font-normal">optional</span>
              </Label>
              <Input
                id="company"
                placeholder="e.g., Google"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Device check ── */}
      <Card>
        <CardHeader>
          <CardTitle>Device Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Camera */}
            <div className={cn(
              "rounded-xl border p-4 space-y-3 transition-all",
              cameraStatus === "granted" ? "border-green-500/30 bg-green-500/5" :
              cameraStatus === "denied"  ? "border-red-500/30 bg-red-500/5"    : "border-border"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className={cn("h-4 w-4",
                    cameraStatus === "granted" ? "text-green-500" :
                    cameraStatus === "denied"  ? "text-red-500"   : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">Camera</span>
                </div>
                <DeviceStatusBadge status={cameraStatus} />
              </div>

              {/* Live preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={cn(
                    "h-full w-full object-cover scale-x-[-1]",
                    cameraStatus !== "granted" && "hidden"
                  )}
                />
                {cameraStatus !== "granted" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                    <Camera className="h-8 w-8 text-muted-foreground/25" />
                  </div>
                )}
                {cameraStatus === "granted" && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-white/80 font-medium">Live</span>
                  </div>
                )}
              </div>

              {cameraStatus === "denied" && (
                <p className="flex items-start gap-1 text-xs text-red-400">
                  <X className="h-3 w-3 mt-0.5 shrink-0" />
                  Enable camera in browser settings, then refresh.
                </p>
              )}
            </div>

            {/* Microphone */}
            <div className={cn(
              "rounded-xl border p-4 space-y-3 transition-all",
              micStatus === "granted" ? "border-green-500/30 bg-green-500/5" :
              micStatus === "denied"  ? "border-red-500/30 bg-red-500/5"    : "border-border"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className={cn("h-4 w-4",
                    micStatus === "granted" ? "text-green-500" :
                    micStatus === "denied"  ? "text-red-500"   : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">Microphone</span>
                </div>
                <DeviceStatusBadge status={micStatus} />
              </div>

              {/* Audio level area */}
              <div className="aspect-video rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-3">
                {micStatus === "granted" ? (
                  <>
                    <AudioLevelBars level={audioLevel} />
                    <p className="text-xs text-muted-foreground">Say something to test your mic</p>
                  </>
                ) : (
                  <Mic className="h-8 w-8 text-muted-foreground/25" />
                )}
              </div>

              {micStatus === "denied" && (
                <p className="flex items-start gap-1 text-xs text-red-400">
                  <X className="h-3 w-3 mt-0.5 shrink-0" />
                  Enable microphone in browser settings, then refresh.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={checkPermissions}
              disabled={cameraStatus === "checking"}
              className="gap-2"
            >
              {cameraStatus === "checking" ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Checking devices...
                </>
              ) : cameraStatus === "granted" ? (
                <><Check className="h-4 w-4 text-green-500" />Re-check Devices</>
              ) : (
                <><Camera className="h-4 w-4" />Check Devices</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tips ── */}
      <Card>
        <button
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          onClick={() => setShowTips(v => !v)}
        >
          <span className="font-semibold text-sm">Interview Tips &amp; Rules</span>
          {showTips
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-5 pb-5 pt-4 grid gap-2.5 sm:grid-cols-2">
                {TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-base leading-none mt-0.5">{tip.icon}</span>
                    <span className="text-muted-foreground">{tip.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* ── Start CTA ── */}
      <div className="flex flex-col items-end gap-2 pb-4">
        {startHint && (
          <p className="text-xs text-muted-foreground">{startHint}</p>
        )}
        <Button
          size="lg"
          className="gap-2 min-w-[160px]"
          disabled={!canStart}
          onClick={() => onStart({
            category: selectedCategory!,
            role:     role.trim(),
            company:  company.trim(),
          })}
        >
          Start Interview
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeviceStatusBadge({ status }: { status: PermissionStatus }) {
  if (status === "granted")
    return <span className="flex items-center gap-1 text-xs font-medium text-green-500"><Check className="h-3 w-3" />Ready</span>
  if (status === "denied")
    return <span className="flex items-center gap-1 text-xs font-medium text-red-500"><X className="h-3 w-3" />Denied</span>
  if (status === "checking")
    return <span className="text-xs text-muted-foreground">Checking...</span>
  return <span className="text-xs text-muted-foreground">Not checked</span>
}

function AudioLevelBars({ level }: { level: number }) {
  const COUNT = 14
  return (
    <div className="flex items-end gap-0.5 h-12">
      {Array.from({ length: COUNT }).map((_, i) => {
        const threshold = (i / COUNT) * 100
        const active    = level > threshold
        return (
          <div
            key={i}
            className={cn(
              "w-3 rounded-sm transition-colors duration-75",
              active
                ? i < COUNT * 0.5  ? "bg-green-500"
                : i < COUNT * 0.75 ? "bg-yellow-500"
                : "bg-red-500"
                : "bg-muted-foreground/15"
            )}
            style={{ height: `${20 + (i / COUNT) * 80}%` }}
          />
        )
      })}
    </div>
  )
}
