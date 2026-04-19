"use client"

import { useState } from "react"
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
import { motion } from "framer-motion"
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/animations"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<null | "success" | "error">(null)
  const [responseMessage, setResponseMessage] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    setResponseMessage("")

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

      const res = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to send inquiry")
      }

      setStatus("success")
      setResponseMessage(data.message || "Inquiry sent successfully")
      setFormData({
        fullName: "",
        email: "",
        category: "",
        subject: "",
        message: "",
      })
    } catch (error: any) {
      setStatus("error")
      setResponseMessage(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LandingHeader />

      <main className="relative min-h-screen bg-background px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="orb orb-cyan absolute top-0 right-1/3 w-[500px] h-[500px] opacity-[0.05]" />
          <div className="orb orb-blue absolute bottom-0 left-1/4 w-[400px] h-[400px] opacity-[0.04]" />
        </div>

        <motion.div
          className="mx-auto max-w-5xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 variants={staggerItem} className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">Contact Us</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="mt-4 text-base text-muted-foreground leading-relaxed">
            Have questions about AI Career Coach? We&apos;d love to hear from you.
            Send us a message and we&apos;ll respond as soon as possible.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-10 grid max-w-7xl gap-8 lg:grid-cols-[2fr_1fr]"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold">Send us a Message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground/90">
                        Full Name *
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="h-12"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground/90">
                        Email Address *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground/90">
                      Category
                    </label>
                    <div className="relative max-w-xs">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="h-12 w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 text-sm text-muted-foreground transition-all duration-300 focus:border-primary/60 focus:ring-2 focus:ring-primary/25 focus:outline-none"
                      >
                        <option value="">Select a category</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Project Feedback">Project Feedback</option>
                        <option value="Technical Question">Technical Question</option>
                        <option value="Collaboration">Collaboration</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground/90">
                      Subject *
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your inquiry"
                      className="h-12"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground/90">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry, feedback, or question..."
                      className="min-h-[180px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-14 w-full text-base font-semibold"
                    disabled={loading}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>

                  {status === "success" && (
                    <p className="text-center text-sm text-green-500">
                      {responseMessage}
                    </p>
                  )}

                  {status === "error" && (
                    <p className="text-center text-sm text-red-500">
                      {responseMessage}
                    </p>
                  )}

                  <p className="text-center text-sm text-muted-foreground">
                    * Required fields. We&apos;ll respond to your message within 24 hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            <motion.div variants={staggerItem}>
              <Card className="rounded-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">Get in Touch</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Reach out to us directly</p>

                  <div className="mt-6 space-y-6">
                    {[
                      {
                        icon: Mail,
                        label: "Email",
                        value: "intermate.ai.fyp@gmail.com",
                        color: "from-primary/20 to-purple-500/10 border-primary/20",
                        iconColor: "text-primary",
                      },
                      {
                        icon: Phone,
                        label: "Phone",
                        value: "03123456789",
                        color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20",
                        iconColor: "text-cyan-400",
                      },
                      {
                        icon: MapPin,
                        label: "Location",
                        value: "Computer Science Department, Sukkur IBA University, Sindh, Pakistan",
                        color: "from-green-500/20 to-emerald-500/10 border-green-500/20",
                        iconColor: "text-green-400",
                      },
                      {
                        icon: Clock,
                        label: "Response Time",
                        value: "Within 24 hours",
                        color: "from-yellow-500/20 to-orange-500/10 border-yellow-500/20",
                        iconColor: "text-yellow-400",
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-4">
                        <div
                          className={`icon-box flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} border`}
                        >
                          <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="text-base font-medium">{item.label}</h3>
                          <p className="text-sm text-muted-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="rounded-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold">Follow Our Journey</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stay updated with our project development
                  </p>

                  <div className="mt-6 space-y-4">
                    {[
                      { icon: Github, label: "View on GitHub" },
                      { icon: Linkedin, label: "LinkedIn Page" },
                      { icon: Twitter, label: "Twitter Updates" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 rounded-lg border border-white/8 bg-white/3 p-4 hover:border-primary/30 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-base">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 max-w-7xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerItem}
        >
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold">Quick Questions?</h2>

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
        </motion.div>
      </main>

      <LandingFooter />
    </>
  )
}