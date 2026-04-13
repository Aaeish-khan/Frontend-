"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, BarChart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModuleCardProps {
  module: {
    id: string
    title: string
    description: string
    category: string
    progress: number
    lessons: number
    completedLessons: number
    estimatedTime: string
    difficulty: string
    topics: string[]
  }
  onSelect: (moduleId: string) => void
}

export function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const difficultyColors = {
    beginner: "bg-green-500/10 text-green-500",
    intermediate: "bg-yellow-500/10 text-yellow-500",
    advanced: "bg-red-500/10 text-red-500",
  }

  return (
    <Card className="group hover:border-primary/50 transition-all cursor-pointer" onClick={() => onSelect(module.id)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                difficultyColors[module.difficulty as keyof typeof difficultyColors]
              )}>
                {module.difficulty}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {module.category}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {module.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {module.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {topic}
                </span>
              ))}
              {module.topics.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{module.topics.length - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {module.completedLessons}/{module.lessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {module.estimatedTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{module.progress}%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
            {module.progress === 0 ? "Start Learning" : module.progress === 100 ? "Review" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
