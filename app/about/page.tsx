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

export default function AboutPage() {
  return (
    <>
      <LandingHeader />

      <main className="min-h-screen bg-background px-6 py-16">

        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-semibold text-foreground/80">
            About AI Career Coach
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Learn about our Final Year Project and the team behind this innovative AI-powered career development platform
          </p>
        </div>

        {/* Project Overview */}
        <div className="mx-auto mt-10 max-w-5xl">
          <Card className="rounded-xl bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-primary" />
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
        </div>

        {/* Key Innovation */}
        <div className="mx-auto mt-8 max-w-5xl">
          <Card className="rounded-xl bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Key Innovation</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 text-sm text-muted-foreground">
                <div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">AI-Powered</span>
                  <h3 className="font-medium mt-2 text-foreground">CV Analysis</h3>
                  <p className="mt-1">
                    Advanced algorithms analyze CV structure, content quality, and industry relevance to provide comprehensive feedback.
                  </p>
                </div>

                <div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Personalized</span>
                  <h3 className="font-medium mt-2 text-foreground">Interview Prep</h3>
                  <p className="mt-1">
                    Dynamic question generation based on job roles, difficulty levels, and industry standards.
                  </p>
                </div>

                <div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Real-time</span>
                  <h3 className="font-medium mt-2 text-foreground">Feedback</h3>
                  <p className="mt-1">
                    Instant analysis and suggestions eliminate waiting times and improve iteration speed.
                  </p>
                </div>

                <div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Accessible</span>
                  <h3 className="font-medium mt-2 text-foreground">Platform</h3>
                  <p className="mt-1">
                    Web-based solution ensures accessibility across devices and platforms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Team */}
        <div className="mx-auto mt-8 max-w-5xl">
          <Card className="rounded-xl bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Development Team</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Meet the students behind AI Career Coach
              </p>

              <div className="grid gap-6 md:grid-cols-3">

                {["Aqsa Rao", "Paman Shaikh", "Aisha"].map((name, i) => (
                  <div key={i} className="rounded-xl border p-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
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
        </div>

        {/* Supervisor */}
        <div className="mx-auto mt-8 max-w-5xl">
          <Card className="rounded-xl bg-card">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
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
                  <Mail className="h-3 w-3" />
                  abbasmehdi.bscs@iba-suk.edu.pk
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>

      <LandingFooter />
    </>
  )
}