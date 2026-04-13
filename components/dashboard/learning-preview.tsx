"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { learningModules, learningRecommendations } from "@/lib/mock-data"
import { ArrowRight, BookOpen, Clock, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function LearningPreview() {
  const recommended = learningRecommendations
    .map(rec => ({
      ...learningModules.find(m => m.id === rec.moduleId)!,
      reason: rec.reason,
      priority: rec.priority,
    }))
    .slice(0, 2)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
        <Link href="/learning">
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommended.map((module) => (
          <div 
            key={module.id} 
            className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{module.title}</h4>
                  {module.priority === "high" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{module.reason}</p>
                <div className="flex items-center gap-4 pt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    {module.completedLessons}/{module.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {module.estimatedTime}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-lg font-bold text-primary">{module.progress}%</span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div 
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
