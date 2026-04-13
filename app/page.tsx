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

        {/* HERO */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground/80">
              Your AI Career Coach
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              Analyze your CV & Prepare for Interviews with AI-powered insights
              that help you land your dream job
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
  <Link href="/signup">
    <Button
      size="lg"
      className="inline-flex min-w-[180px] items-center justify-center"
    >
      Get Started
    </Button>
  </Link>

  <Link href="/about">
    <Button
      size="lg"
      variant="outline"
      className="inline-flex min-w-[180px] items-center justify-center"
    >
      Learn More
    </Button>
  </Link>
</div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground/80">
              Powerful AI-Driven Features
            </h2>

            <p className="mt-6 text-lg text-muted-foreground">
              Our advanced AI technology provides personalized insights to boost
              your career prospects
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">

            {/* CV Analyzer */}
            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold">
                  CV Analyzer
                </h3>

                <p className="mt-3 text-sm text-muted-foreground">
                  Upload your CV and get instant AI-powered feedback on strengths,
                  weaknesses, and improvement suggestions
                </p>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Instant analysis and scoring
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Personalized improvement tips
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Industry-specific recommendations
                  </div>
                </div>

                <Link href="/resume">
                  <Button className="mt-6 w-full h-10 text-sm">
                    Analyze Your CV
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Interview */}
            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold">
                  Interview Preparation
                </h3>

                <p className="mt-3 text-sm text-muted-foreground">
                  Practice with AI-generated interview questions tailored to your
                  target role and industry
                </p>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Role-specific questions
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Real-time feedback
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Confidence building exercises
                  </div>
                </div>

                <Link href="/interview">
                  <Button className="mt-6 w-full h-10 text-sm">
                    Start Practicing
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* WHY CHOOSE */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground/80">
              Why Choose InterMate?
            </h2>

            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Instant Results
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get immediate feedback and insights without waiting
                </p>
              </div>

              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Personalized
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tailored recommendations based on your career goals
                </p>
              </div>

              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Proven Success
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Trusted by thousands of job seekers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-card px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground/80">
              Ready to Boost Your Career?
            </h2>

            <p className="mt-4 text-lg text-muted-foreground">
              Start your journey to career success with our AI-powered tools
            </p>

            <Link href="/signup">
              <Button className="mt-6 h-12 px-6 text-base font-semibold">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <LandingFooter />
    </>
  )
}