"use client"

import { LandingHeader } from "@/components/layout/landing-header"
import { LandingFooter } from "@/components/layout/landing-footer"
import { Card, CardContent } from "@/components/ui/card"
import {
  Target,
  Lightbulb,
  Users,
  GraduationCap,
  Mail,
} from "lucide-react"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/animations"

export default function AboutPage() {
  return (
    <>
      <LandingHeader />

      <main className="relative min-h-screen bg-background px-6 py-16 overflow-hidden">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="orb orb-blue absolute top-0 left-1/3 w-[500px] h-[500px] opacity-[0.05]" />
          <div className="orb orb-purple absolute bottom-1/4 right-1/4 w-[400px] h-[400px] opacity-[0.04]" />
        </div>

        {/* Heading */}
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 variants={staggerItem} className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">About AI Career Coach</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="mt-4 text-base text-muted-foreground leading-relaxed">
            Learn about our Final Year Project and the team behind this innovative AI-powered career development platform
          </motion.p>
        </motion.div>

        {/* Project Overview */}
        <motion.div
          className="mx-auto mt-10 max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-box flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Project Overview</h2>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI Career Coach is our Final Year Project (FYP) that addresses the growing need for personalized career guidance in today's competitive job market.
                  Our platform leverages artificial intelligence to provide instant, actionable feedback on CVs and offers tailored interview preparation to help job seekers improve their prospects.
                </p>

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  The project combines machine learning algorithms for CV analysis with natural language processing for generating relevant interview questions.
                  Our goal is to democratize access to career coaching by making professional-grade guidance available to everyone.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Key Innovation */}
        <motion.div
          className="mx-auto mt-8 max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="icon-box flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h2 className="text-lg font-semibold">Key Innovation</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 text-sm text-muted-foreground">
                  {[
                    { tag: "AI-Powered", title: "CV Analysis", desc: "Advanced algorithms analyze CV structure, content quality, and industry relevance to provide comprehensive feedback." },
                    { tag: "Personalized", title: "Interview Prep", desc: "Dynamic question generation based on job roles, difficulty levels, and industry standards." },
                    { tag: "Real-time", title: "Feedback", desc: "Instant analysis and suggestions eliminate waiting times and improve iteration speed." },
                    { tag: "Accessible", title: "Platform", desc: "Web-based solution ensures accessibility across devices and platforms." },
                  ].map((item) => (
                    <div key={item.title}>
                      <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-md">{item.tag}</span>
                      <h3 className="font-medium mt-2 text-foreground">{item.title}</h3>
                      <p className="mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Development Team */}
        <motion.div
          className="mx-auto mt-8 max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-box flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
                    <Users className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-semibold">Development Team</h2>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Meet the students behind AI Career Coach
                </p>

                <div className="grid gap-6 md:grid-cols-3">
                  {["Aqsa Rao", "Paman Shaikh", "Aisha"].map((name, i) => (
                    <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center hover:border-primary/30 transition-colors duration-200">
                      <div className="mx-auto icon-box flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 text-sm font-medium">{name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? "Lead Developer" : i === 1 ? "AI/ML Specialist" : "UI/UX"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Supervisor */}
        <motion.div
          className="mx-auto mt-8 max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerItem}
        >
          <Card className="rounded-xl">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="icon-box flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Project Supervisor</h2>
                <p className="text-sm font-medium">Sir. Abbas Mehdi</p>
                <p className="text-xs text-muted-foreground">
                  Professor of Computer Science
                </p>
                <p className="text-xs text-muted-foreground">
                  Department of Computer Science & Engineering
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 text-primary" />
                  abbasmehdi.bscs@iba-suk.edu.pk
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </main>

      <LandingFooter />
    </>
  )
}
