"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
} from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  LogIn,
  Mic,
  Sparkles,
  Target,
} from "lucide-react"

import { TextRotate } from "@/components/ui/text-rotate"
import { cn } from "@/lib/utils"

const MotionLink = motion(Link)

const rotatingWords = [
  "interviews",
  "resumes",
  "feedback",
  "learning",
  "readiness",
  "confidence",
]

const trustHighlights = [
  { label: "ATS-ready resumes", icon: FileText },
  { label: "AI mock interviews", icon: Mic },
  { label: "Readiness reports", icon: BriefcaseBusiness },
]

const visualSlides = [
  {
    icon: Target,
    title: "Job description mapped",
    subtitle: "Role signals detected",
    metric: "92%",
    metricLabel: "Role fit map",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Student reviewing a target job description on a laptop",
    chips: ["Skills", "Keywords", "Role fit"],
    accent: "from-indigo-500/25 via-purple-500/15 to-violet-600/10",
  },
  {
    icon: Mic,
    title: "AI mock interview",
    subtitle: "Speech clarity improved",
    metric: "82%",
    metricLabel: "Answer readiness",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Early-career candidate practicing interview answers with a laptop",
    chips: ["Transcript", "Clarity", "Confidence"],
    accent: "from-purple-500/25 via-indigo-500/15 to-violet-600/10",
  },
  {
    icon: FileText,
    title: "ATS resume review",
    subtitle: "Resume aligned to the role",
    metric: "76%",
    metricLabel: "ATS match",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Resume and notes prepared for ATS optimization",
    chips: ["Impact", "Evidence", "Keywords"],
    accent: "from-violet-500/25 via-purple-500/15 to-indigo-500/10",
  },
  {
    icon: BookOpen,
    title: "Personalized learning plan",
    subtitle: "3 skills to practice",
    metric: "3",
    metricLabel: "Skill gaps",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Online learning workspace for building career skills",
    chips: ["Practice", "Topics", "Milestones"],
    accent: "from-indigo-500/20 via-violet-500/15 to-purple-600/10",
  },
  {
    icon: BarChart3,
    title: "Readiness report",
    subtitle: "Mentor feedback received",
    metric: "Ready",
    metricLabel: "Report status",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Career readiness dashboard and report analytics on a laptop",
    chips: ["Scores", "Feedback", "Export"],
    accent: "from-purple-500/20 via-violet-500/15 to-indigo-600/10",
  },
]

function HeroVisualCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSlide = visualSlides[activeIndex]

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visualSlides.length)
    }, 3500)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="pointer-events-none relative z-10 mx-auto w-full max-w-xl lg:max-w-none"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-violet-600/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-400/20 bg-card/45 p-3 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:p-5">
        <div className="relative h-[260px] overflow-hidden rounded-[1.5rem] border border-indigo-400/20 bg-background/40 sm:h-[330px] lg:h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.title}
              className="absolute inset-0"
              initial={{ x: 40, opacity: 0, scale: 0.96, rotate: 1 }}
              animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ x: -30, opacity: 0, scale: 0.96, rotate: -1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <motion.img
                src={activeSlide.image}
                alt={activeSlide.imageAlt}
                draggable={false}
                className="h-full w-full object-cover"
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 3.5, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              <div className={cn("absolute inset-0 bg-gradient-to-br", activeSlide.accent)} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-1 pb-1 pt-4 sm:pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSlide.title}-content`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <activeSlide.icon className="h-4 w-4" />
                    {activeSlide.subtitle}
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                    {activeSlide.title}
                  </h3>
                </div>
                <div className="w-fit rounded-2xl border border-indigo-400/25 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-600/10 px-3 py-2 text-left sm:text-right">
                  <p className="text-[11px] text-muted-foreground">
                    {activeSlide.metricLabel}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {activeSlide.metric}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeSlide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-indigo-400/20 bg-background/45 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/70">
            <motion.div
              key={activeIndex}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.3, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function LandingHero() {
  return (
    <section className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden px-6 pt-20 pb-16 lg:px-12 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(168,85,247,0.14),transparent_32%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
        <motion.div
          className="relative z-20 flex flex-col items-center text-center lg:items-start lg:text-left"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
        

          <LayoutGroup>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl xl:text-7xl"
            >
              <span className="block">
                Prepare for your next role with AI-guided
              </span>
              <TextRotate
                texts={rotatingWords}
                splitBy="characters"
                rotationInterval={1850}
                staggerDuration={0.018}
                staggerFrom="center"
                mainClassName="mt-3 inline-flex min-h-[1.1em] overflow-hidden rounded-2xl border border-indigo-400/25 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-600/10 px-3 py-1 text-primary shadow-[0_18px_60px_rgba(99,102,241,0.22)] backdrop-blur-sm sm:px-4"
                splitLevelClassName="leading-[1.05]"
                elementLevelClassName="leading-[1.05]"
                transition={{ type: "spring", damping: 26, stiffness: 360 }}
              />
            </motion.h1>
          </LayoutGroup>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          >
            One connected journey from uncertainty to readiness.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:items-start"
          >
            <MotionLink
              href="/signup"
              className="pointer-events-auto inline-flex h-14 w-full min-w-48 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 px-7 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 sm:w-auto"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Preparing
              <ArrowRight className="h-4 w-4" />
            </MotionLink>
            <MotionLink
              href="/login"
              className="pointer-events-auto inline-flex h-14 w-full min-w-48 items-center justify-center gap-2 rounded-full border border-border/70 bg-card/70 px-7 text-sm font-semibold text-foreground shadow-lg backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-card/90 sm:w-auto"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </MotionLink>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            {trustHighlights.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-card/60 px-3.5 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-md"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <HeroVisualCarousel />
      </div>
    </section>
  )
}
