"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { interviewCategories } from "@/lib/mock-data"
import { Code, Users, Briefcase, Lightbulb, LucideIcon, ArrowRight, Camera, Mic, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  users: Users,
  briefcase: Briefcase,
  lightbulb: Lightbulb,
}

interface InterviewSetupProps {
  onStart: (config: { category: string; role: string; company: string }) => void
}

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [cameraAccess, setCameraAccess] = useState<boolean | null>(null)
  const [micAccess, setMicAccess] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  const checkPermissions = async () => {
    setChecking(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setCameraAccess(true)
      setMicAccess(true)
      stream.getTracks().forEach(track => track.stop())
    } catch {
      setCameraAccess(false)
      setMicAccess(false)
    }
    setChecking(false)
  }

  const canStart = selectedCategory && role && cameraAccess && micAccess

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Interview Type</CardTitle>
          <CardDescription>Choose the type of interview you want to practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {interviewCategories.map((category) => {
              const Icon = iconMap[category.icon] || Code
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200 hover:border-primary/50",
                    isSelected ? "border-primary/60 bg-gradient-to-br from-primary/10 to-purple-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "border-white/8 hover:bg-white/3"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                    isSelected ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30" : "bg-white/5 border border-white/10"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{category.count} questions</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role & Company */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>Enter the role and company you are preparing for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Target Role</Label>
              <Input 
                id="role"
                placeholder="e.g., Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Target Company (Optional)</Label>
              <Input 
                id="company"
                placeholder="e.g., Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Check */}
      <Card>
        <CardHeader>
          <CardTitle>Device Check</CardTitle>
          <CardDescription>We need access to your camera and microphone for the interview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  cameraAccess === true ? "bg-green-500/10 text-green-500" :
                  cameraAccess === false ? "bg-red-500/10 text-red-500" :
                  "bg-muted text-muted-foreground"
                )}>
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Camera</p>
                  <p className="text-xs text-muted-foreground">
                    {cameraAccess === true ? "Ready" : cameraAccess === false ? "Denied" : "Not checked"}
                  </p>
                </div>
                {cameraAccess === true && <Check className="h-4 w-4 text-green-500" />}
                {cameraAccess === false && <X className="h-4 w-4 text-red-500" />}
              </div>

              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  micAccess === true ? "bg-green-500/10 text-green-500" :
                  micAccess === false ? "bg-red-500/10 text-red-500" :
                  "bg-muted text-muted-foreground"
                )}>
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Microphone</p>
                  <p className="text-xs text-muted-foreground">
                    {micAccess === true ? "Ready" : micAccess === false ? "Denied" : "Not checked"}
                  </p>
                </div>
                {micAccess === true && <Check className="h-4 w-4 text-green-500" />}
                {micAccess === false && <X className="h-4 w-4 text-red-500" />}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={checkPermissions}
              disabled={checking}
            >
              {checking ? "Checking..." : "Check Devices"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          className="gap-2"
          disabled={!canStart}
          onClick={() => onStart({ 
            category: selectedCategory!, 
            role, 
            company 
          })}
        >
          Start Interview
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
