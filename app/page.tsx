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

export default function HomePage() {
  return (
    <>
      <LandingHeader />

      <main className="min-h-screen bg-background text-foreground">
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl font-bold text-foreground/80 md:text-6xl">
              Your AI Career Coach
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Analyze your CV and prepare for interviews with AI-powered insights
              that help you land your dream job.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="inline-flex min-w-[180px] items-center justify-center">
                  Login
                </Button>
              </Link>

              <Link href="/signup">
                <Button size="lg" variant="outline" className="inline-flex min-w-[180px] items-center justify-center">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-bold text-foreground/80 md:text-5xl">
              Powerful AI-Driven Features
            </h2>

            <p className="mt-6 text-lg text-muted-foreground">
              Every job application becomes its own smart project.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold">Resume Analyzer</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Upload your resume and compare it against each specific job.
                </p>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Project-specific matching
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Missing keyword detection
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ATS improvement tips
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold">Project-Based Interview Prep</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Practice interviews and learning plans tailored to each job you apply for.
                </p>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Job-specific questions
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Personalized learning mode
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Track multiple job applications
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-bold text-foreground/80 md:text-5xl">
              Why Choose InterMate?
            </h2>

            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Instant Results</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get immediate job-specific AI analysis.
                </p>
              </div>

              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Personalized</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every project is built around the exact job you want.
                </p>
              </div>

              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Multi-Project Ready</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Apply to multiple jobs and switch between them anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  )
}