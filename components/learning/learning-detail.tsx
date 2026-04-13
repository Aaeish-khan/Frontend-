"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { learningModules } from "@/lib/mock-data"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  Lock,
  Lightbulb,
  Code,
  FileText,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LearningDetailProps {
  moduleId: string
  onBack: () => void
}

// Mock lessons data
const mockLessons = [
  { id: "l1", title: "Introduction to the Topic", type: "video", duration: "10 min", completed: true },
  { id: "l2", title: "Core Concepts Explained", type: "reading", duration: "15 min", completed: true },
  { id: "l3", title: "Practical Examples", type: "video", duration: "20 min", completed: true },
  { id: "l4", title: "Hands-on Exercise", type: "practice", duration: "25 min", completed: false, current: true },
  { id: "l5", title: "Advanced Techniques", type: "video", duration: "18 min", completed: false },
  { id: "l6", title: "Best Practices", type: "reading", duration: "12 min", completed: false },
  { id: "l7", title: "Quiz: Test Your Knowledge", type: "quiz", duration: "15 min", completed: false },
  { id: "l8", title: "Summary & Next Steps", type: "reading", duration: "8 min", completed: false },
]

const lessonTypeIcons = {
  video: PlayCircle,
  reading: FileText,
  practice: Code,
  quiz: HelpCircle,
}

export function LearningDetail({ moduleId, onBack }: LearningDetailProps) {
  const module = learningModules.find(m => m.id === moduleId)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Module not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const currentLessonIndex = mockLessons.findIndex(l => l.current)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              module.difficulty === "beginner" && "bg-green-500/10 text-green-500",
              module.difficulty === "intermediate" && "bg-yellow-500/10 text-yellow-500",
              module.difficulty === "advanced" && "bg-red-500/10 text-red-500"
            )}>
              {module.difficulty}
            </span>
            <span className="text-sm text-muted-foreground">{module.category}</span>
          </div>
          <h1 className="text-2xl font-bold">{module.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{module.progress}%</p>
          <p className="text-sm text-muted-foreground">Complete</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lesson List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lessons</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {module.completedLessons}/{module.lessons} completed
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockLessons.map((lesson, index) => {
                const Icon = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] || BookOpen
                const isLocked = !lesson.completed && !lesson.current && index > currentLessonIndex
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && setActiveLesson(lesson.id)}
                    disabled={isLocked}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all",
                      lesson.current && "border-primary bg-primary/5",
                      activeLesson === lesson.id && "border-primary",
                      isLocked ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      lesson.completed ? "bg-green-500/10" : 
                      lesson.current ? "bg-primary/10" : 
                      "bg-muted"
                    )}>
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Icon className={cn(
                          "h-5 w-5",
                          lesson.current ? "text-primary" : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium",
                          lesson.completed && "text-muted-foreground"
                        )}>
                          {lesson.title}
                        </p>
                        {lesson.current && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="capitalize">{lesson.type}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                    {!isLocked && !lesson.completed && (
                      <Button size="sm" variant={lesson.current ? "default" : "outline"}>
                        {lesson.current ? "Continue" : "Start"}
                      </Button>
                    )}
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{module.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{module.completedLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons Done</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{module.lessons - module.completedLessons}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Topics Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {module.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Learning Tip</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Take notes while watching videos and practice immediately after each concept for better retention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
