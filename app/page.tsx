"use client"

import { LandingHeader } from "@/components/layout/landing-header"
import { LandingFooter } from "@/components/layout/landing-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  MessageSquare,
  Zap,
  Target,
  Users,
  CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  staggerContainer,
  staggerItem,
  heroTitle,
  heroSubtitle,
  heroCta,
  cardVariants,
  viewportOnce,
} from "@/lib/animations"

export default function HomePage() {
  return (
    <>
      <LandingHeader />

      <main className="min-h-screen bg-background text-foreground overflow-hidden">
        {/* ── Hero Section ───────────────────────────────────── */}
        <section className="relative px-6 py-24">
          {/* Ambient background orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="orb orb-blue absolute -top-20 left-1/4 w-[600px] h-[600px] opacity-[0.07]" />
            <div className="orb orb-purple absolute top-20 right-1/4 w-[500px] h-[500px] opacity-[0.06]" />
            <div className="orb orb-cyan absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-[0.05]" />
          </div>

          {/* Gradient grid overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          <motion.div
            className="relative mx-auto max-w-5xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={heroTitle} className="mb-6 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
                <Zap className="h-3 w-3" />
                AI-Powered Career Coach 2026
              </span>
            </motion.div>

            <motion.h1
              variants={heroTitle}
              className="text-5xl font-bold md:text-6xl lg:text-7xl tracking-tight"
            >
              <span className="gradient-text">Your AI Career</span>
              <br />
              <span className="text-foreground/90">Coach</span>
            </motion.h1>

            <motion.p
              variants={heroSubtitle}
              className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl max-w-2xl mx-auto"
            >
              Analyze your CV and prepare for interviews with AI-powered insights
              that help you land your dream job.
            </motion.p>

            <motion.div
              variants={heroCta}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="inline-flex min-w-[180px] items-center justify-center shadow-xl shadow-primary/30">
                  Login
                </Button>
              </Link>

              <Link href="/signup">
                <Button size="lg" variant="outline" className="inline-flex min-w-[180px] items-center justify-center">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Features Section ───────────────────────────────── */}
        <section className="px-6 py-16">
          <motion.div
            className="mx-auto max-w-6xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            <motion.h2 variants={staggerItem} className="text-4xl font-bold md:text-5xl tracking-tight">
              <span className="gradient-text">Powerful AI-Driven</span>{" "}
              <span className="text-foreground/90">Features</span>
            </motion.h2>

            <motion.p variants={staggerItem} className="mt-6 text-lg text-muted-foreground">
              Every job application becomes its own smart project.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="rounded-2xl h-full">
                <CardContent className="p-8">
                  <div className="mb-4 icon-box flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-primary/20">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold">Resume Analyzer</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Upload your resume and compare it against each specific job.
                  </p>

                  <div className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Project-specific matching
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Missing keyword detection
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      ATS improvement tips
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="rounded-2xl h-full">
                <CardContent className="p-8">
                  <div className="mb-4 icon-box flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
                    <MessageSquare className="h-6 w-6 text-cyan-400" />
                  </div>

                  <h3 className="text-xl font-semibold">Project-Based Interview Prep</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Practice interviews and learning plans tailored to each job you apply for.
                  </p>

                  <div className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Job-specific questions
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Personalized learning mode
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Track multiple job applications
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Why Section ───────────────────────────────────── */}
        <section className="relative px-6 py-20">
          {/* Section background accent */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="orb orb-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] opacity-[0.04]" />
          </div>

          <motion.div
            className="mx-auto max-w-6xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            <motion.h2 variants={staggerItem} className="text-4xl font-bold md:text-5xl tracking-tight">
              Why Choose{" "}
              <span className="gradient-text-warm">InterMate?</span>
            </motion.h2>

            <motion.div
              className="mt-12 grid gap-10 md:grid-cols-3"
              variants={staggerContainer}
            >
              {[
                {
                  icon: Zap,
                  title: "Instant Results",
                  desc: "Get immediate job-specific AI analysis.",
                  color: "from-yellow-500/20 to-orange-500/10",
                  iconColor: "text-yellow-400",
                  border: "border-yellow-500/20",
                },
                {
                  icon: Target,
                  title: "Personalized",
                  desc: "Every project is built around the exact job you want.",
                  color: "from-primary/20 to-purple-500/10",
                  iconColor: "text-primary",
                  border: "border-primary/20",
                },
                {
                  icon: Users,
                  title: "Multi-Project Ready",
                  desc: "Apply to multiple jobs and switch between them anytime.",
                  color: "from-cyan-500/20 to-blue-500/10",
                  iconColor: "text-cyan-400",
                  border: "border-cyan-500/20",
                },
              ].map((item) => (
                <motion.div key={item.title} variants={staggerItem}>
                  <div className={`mx-auto icon-box flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} border ${item.border}`}>
                    <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </>
  )
}