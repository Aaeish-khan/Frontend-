"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Download,
  FileText,
  Gauge,
  Layers,
  LogIn,
  Mic,
  Search,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react"
import { motion } from "framer-motion"

import { LandingHero } from "@/components/home/landing-hero"
import { cn } from "@/lib/utils"

const MotionLink = motion(Link)

const viewport = { once: true, margin: "-80px" }

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const problemCards = [
  {
    icon: Layers,
    title: "Preparation is scattered",
    text: "Job descriptions, resume edits, interview notes, and learning resources often live in separate places with no shared direction.",
  },
  {
    icon: Search,
    title: "Progress is hard to measure",
    text: "Candidates know they are practicing, but not whether their answers, resume, and skills are moving closer to the role.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence arrives too late",
    text: "Without feedback loops and readiness signals, preparation can feel stressful until the interview is already on the calendar.",
  },
]

const workflowSteps = [
  {
    icon: Target,
    title: "Paste the target role",
    text: "Start with the job description so InterMate can understand the role, keywords, responsibilities, and skill gaps.",
    metric: "Role signal mapped",
  },
  {
    icon: FileText,
    title: "Align your resume",
    text: "Improve ATS fit, keyword coverage, evidence strength, and clarity for the specific position.",
    metric: "ATS gaps surfaced",
  },
  {
    icon: Mic,
    title: "Practice realistic interviews",
    text: "Use AI-assisted mock interviews, answer coaching, and review moments tied to the same role.",
    metric: "Answers refined",
  },
  {
    icon: BarChart3,
    title: "Track readiness",
    text: "Bring resume, interview, learning, peer feedback, achievements, and reports into one measurable journey.",
    metric: "Readiness proven",
  },
]

const featureCards = [
  {
    icon: Mic,
    title: "AI mock interviews",
    text: "Practice role-specific questions with structured feedback on clarity, completeness, confidence, and technical depth.",
    signal: "Interview readiness",
    value: "82%",
    progress: 82,
    color: "bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600",
  },
  {
    icon: FileText,
    title: "ATS resume analysis",
    text: "Compare your resume against the job description and improve keywords, impact statements, and missing evidence.",
    signal: "Resume alignment",
    value: "76%",
    progress: 76,
    color: "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500",
  },
  {
    icon: BookOpen,
    title: "Adaptive learning plans",
    text: "Turn gaps into a focused learning path with prioritized topics, skill checkpoints, and next best actions.",
    signal: "Skill coverage",
    value: "68%",
    progress: 68,
    color: "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500",
  },
  {
    icon: Users,
    title: "Peer and mentor review",
    text: "Collect feedback on answers, resume decisions, and confidence signals from people who can sharpen your preparation.",
    signal: "Feedback loop",
    value: "Active",
    progress: 72,
    color: "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600",
  },
  {
    icon: Trophy,
    title: "Gamified readiness",
    text: "Build momentum with achievements, streaks, milestones, and visible progress toward interview readiness.",
    signal: "Momentum",
    value: "9 badges",
    progress: 88,
    color: "bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-600",
  },
  {
    icon: Gauge,
    title: "Connected dashboard",
    text: "See the whole journey at once: resume score, interview performance, learning progress, feedback, and goals.",
    signal: "Career cockpit",
    value: "Live",
    progress: 91,
    color: "bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600",
  },
  {
    icon: Download,
    title: "Downloadable reports",
    text: "Export interview performance, resume analysis, readiness trends, and improvement recommendations for review.",
    signal: "Proof of progress",
    value: "Ready",
    progress: 84,
    color: "bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600",
  },
]

const dashboardSignals = [
  { label: "Resume ATS alignment", value: "76%", progress: 76 },
  { label: "Mock interview clarity", value: "82%", progress: 82 },
  { label: "Learning path coverage", value: "68%", progress: 68 },
  { label: "Peer feedback applied", value: "5 notes", progress: 72 },
]

function SectionShell({
  id,
  children,
  className,
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={cn("relative px-6 py-20 sm:py-24", className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  )
}

function SectionIntro({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string
  title: string
  text: string
  align?: "center" | "left"
}) {
  return (
    <motion.div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left"
      )}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <p className="text-sm font-semibold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {text}
      </p>
    </motion.div>
  )
}

function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/60 bg-card/65 p-6 shadow-xl shadow-primary/5 backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

function ProgressBar({
  progress,
  className,
}: {
  progress: number
  className?: string
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted/70">
      <motion.div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600",
          className
        )}
        initial={{ width: 0 }}
        whileInView={{ width: `${progress}%` }}
        viewport={viewport}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  )
}

function ProblemSection() {
  return (
    <SectionShell id="problem" className="pt-10">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}>
        <SectionIntro
          eyebrow="The problem"
          title="Career preparation breaks down when every tool tells a different story."
          text="Most candidates prepare with tabs, notes, resume checkers, videos, and feedback threads that never connect back to the exact role they want. InterMate brings those signals into one calm preparation system."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {problemCards.map((item) => (
            <GlassCard key={item.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </SectionShell>
  )
}

function WorkflowSection() {
  return (
    <SectionShell id="workflow">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <SectionIntro
          eyebrow="The InterMate workflow"
          title="One target job description becomes your preparation map."
          text="InterMate starts with the role you care about, then connects your resume, interview practice, learning plan, feedback, and reports to the same destination."
          align="left"
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="relative"
        >
          <div className="absolute left-5 top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-indigo-500/70 via-purple-500/50 to-transparent sm:block" />
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="relative rounded-lg border border-border/60 bg-card/65 p-5 shadow-lg shadow-primary/5 backdrop-blur-xl sm:pl-16"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary sm:absolute sm:left-0 sm:top-5">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-primary">
                    {step.metric}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionShell>
  )
}

function ReadinessLabSection() {
  return (
    <SectionShell id="readiness">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-lg border border-border/60 bg-card/65 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-6"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-5">
            <div>
              <p className="text-sm font-semibold text-primary">Readiness lab</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                Junior Software Engineer
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Resume, interviews, skills, and feedback connected to one role.
              </p>
            </div>
            <div className="hidden rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-right sm:block">
              <p className="text-xs text-muted-foreground">Overall</p>
              <p className="text-2xl font-bold text-primary">79%</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {dashboardSignals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-lg border border-border/50 bg-background/35 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {signal.label}
                  </p>
                  <span className="text-sm font-semibold text-primary">
                    {signal.value}
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar progress={signal.progress} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-indigo-400/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-600/10 p-4">
            <div className="flex items-start gap-3">
              <Brain className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  AI recommendation
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Improve behavioral answer structure and add two measurable
                  resume outcomes before the next mock interview.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <SectionIntro
          eyebrow="From uncertainty to readiness"
          title="A calm dashboard for the work candidates actually need to do."
          text="InterMate does not just store activity. It translates preparation into readiness signals, next actions, and reports that make progress easier to understand."
          align="left"
        />
      </div>
    </SectionShell>
  )
}

function FeaturesSection() {
  return (
    <SectionShell id="features">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}>
        <SectionIntro
          eyebrow="Career readiness system"
          title="Everything needed to prepare, improve, and prove readiness."
          text="Each feature strengthens a different part of the hiring workflow, while the dashboard keeps the full journey connected to the target role."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <GlassCard key={feature.title} className="min-h-[270px]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-semibold text-foreground">
                  {feature.value}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.text}
              </p>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    {feature.signal}
                  </span>
                  <span className="text-foreground">{feature.progress}%</span>
                </div>
                <ProgressBar progress={feature.progress} className={feature.color} />
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </SectionShell>
  )
}

function FinalCtaSection() {
  return (
    <SectionShell className="pb-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative overflow-hidden rounded-lg border border-border/60 bg-card/70 px-6 py-14 text-center shadow-2xl shadow-primary/10 backdrop-blur-xl sm:px-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(99,102,241,0.18),transparent_40%,rgba(139,92,246,0.14))]" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase text-primary">
            Your next role deserves a better preparation system
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-5xl">
            Turn scattered practice into confident, measurable progress.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start with the job you want. InterMate will help you prepare your
            resume, practice interviews, close skill gaps, collect feedback, and
            prove readiness with downloadable reports.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MotionLink
              href="/signup"
              className="inline-flex h-14 w-full min-w-48 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 px-7 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 sm:w-auto"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Preparing
              <ArrowRight className="h-4 w-4" />
            </MotionLink>
            <MotionLink
              href="/login"
              className="inline-flex h-14 w-full min-w-48 items-center justify-center gap-2 rounded-full border border-border/70 bg-background/40 px-7 text-sm font-semibold text-foreground shadow-lg backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-background/60 sm:w-auto"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </MotionLink>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  )
}

export function InterMateLandingPage() {
  return (
    <div className="relative overflow-hidden bg-transparent text-foreground">
      <LandingHero />
      <ProblemSection />
      <WorkflowSection />
      <ReadinessLabSection />
      <FeaturesSection />
      <FinalCtaSection />
    </div>
  )
}
