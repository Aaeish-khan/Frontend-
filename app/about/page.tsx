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

      <main className="relative min-h-screen bg-transparent px-6 py-16 overflow-hidden">
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
            <span className="gradient-text">About InterMate</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="mt-4 text-base text-muted-foreground leading-relaxed">
            Learn about InterMate, an AI-powered career preparation platform that helps students and early-career professionals prepare for real hiring workflows.
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
                  InterMate is an AI-powered career preparation platform built to help students, fresh graduates, and early-career professionals prepare for competitive hiring processes. Instead of treating resume improvement, interview practice, learning, peer review, and progress tracking as separate tasks, InterMate connects them into one role-specific preparation workflow.
                </p>

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Users can provide a target job description, upload their resume, practice mock interviews, receive ATS-focused resume feedback, follow personalized learning recommendations, track readiness through gamified progress, and generate performance reports. The goal is to make career preparation more structured, measurable, and accessible.
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
                    { tag: "Job-Description Driven", title: "Unified Preparation", desc: "InterMate uses the target job description to guide resume analysis, interview questions, learning recommendations, and readiness tracking." },
                    { tag: "ATS-Focused", title: "Resume Optimization", desc: "The platform compares resumes with the target role to identify missing keywords, weak skills, and improvement opportunities." },
                    { tag: "AI-Assisted", title: "Mock Interviews", desc: "Users practice role-specific interviews with transcript-based feedback, delivery insights, and improvement suggestions." },
                    { tag: "Personalized", title: "Learning & Progress", desc: "InterMate turns resume and interview gaps into personalized learning tasks, badges, readiness scores, and downloadable reports." },
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
                  Meet the students behind InterMate
                </p>

                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { name: "Aqsa Shafique", role: "Backend & AI Lead Developer" },
                    { name: "Aisha Khan", role: "Frontend Developer & Backend Contributor" },
                    { name: "Paman Shaikh", role: "UI/UX Designer & Database Developer" },
                  ].map((member) => (
                    <div key={member.name} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center hover:border-primary/30 transition-colors duration-200">
                      <div className="mx-auto icon-box flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 text-sm font-medium">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
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
