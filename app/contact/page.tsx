"use client"

import { LandingHeader } from "@/components/layout/landing-header"
import { LandingFooter } from "@/components/layout/landing-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Github,
  Linkedin,
  Twitter,
  ChevronDown,
} from "lucide-react"

export default function ContactPage() {
  return (
    <>
      <LandingHeader />

      <main className="min-h-screen bg-background px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-semibold text-foreground/80">Contact Us</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Have questions about AI Career Coach? We&apos;d love to hear from you.
            Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-7xl gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left side */}
          <Card className="rounded-xl bg-card">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-foreground/80">Send us a Message</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              <form className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Full Name *</label>
                    <Input placeholder="Your full name" className="h-12" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Email Address *</label>
                    <Input placeholder="your.email@example.com" className="h-12" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <div className="relative max-w-xs">
                    <select className="h-12 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                      <option>Select a category</option>
                      <option>General Inquiry</option>
                      <option>Project Feedback</option>
                      <option>Technical Question</option>
                      <option>Collaboration</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Subject *</label>
                  <Input placeholder="Brief description of your inquiry" className="h-12" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Message *</label>
                  <Textarea
                    placeholder="Please provide details about your inquiry, feedback, or question..."
                    className="min-h-[180px] resize-none"
                  />
                </div>

                <Button className="h-14 w-full text-base font-semibold">
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  * Required fields. We&apos;ll respond to your message within 24 hours.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Right side */}
          <div className="space-y-6">
            <Card className="rounded-xl bg-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-foreground/80">Get in Touch</h2>
                <p className="mt-2 text-sm text-muted-foreground">Reach out to us directly</p>

                <div className="mt-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">team.aicareercoach@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Phone</h3>
                      <p className="text-sm text-muted-foreground">03123456789</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        Computer Science Department
                        <br />
                        Sukkur IBA University, Sindh, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Response Time</h3>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-foreground/80">Follow Our Journey</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Stay updated with our project development
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <span className="text-base">View on GitHub</span>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-base">LinkedIn Page</span>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Twitter className="h-5 w-5 text-muted-foreground" />
                    <span className="text-base">Twitter Updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full-width Quick Questions */}
        <div className="mx-auto mt-8 max-w-7xl">
          <Card className="rounded-xl bg-card">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-foreground/80">Quick Questions?</h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">What does AI Career Coach do?</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    AI Career Coach helps users improve their resumes and prepare for interviews
                    through CV analysis, tailored interview practice, and AI-based feedback.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Is this a real product or a university project?</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    This is a Final Year Project prototype developed to demonstrate how AI can be
                    applied to career coaching, interview preparation, and resume improvement.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">How does the CV Analyzer help?</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    It reviews resume structure, clarity, and content quality, then provides
                    suggestions to make the CV stronger and more aligned with job expectations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">How does Interview Prep work?</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    The system generates interview questions based on role and context, then helps
                    users practice with structured preparation and feedback-focused flow.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Who can use this project?</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Students, fresh graduates, and job seekers can all use AI Career Coach to build
                    confidence, strengthen their resume, and improve interview readiness.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Can I contact the team for feedback or collaboration?</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Yes. You can use the contact form on this page to send project feedback,
                    questions, or collaboration ideas, and the team will respond as soon as possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <LandingFooter />
    </>
  )
}