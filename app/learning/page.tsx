"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModuleCard } from "@/components/learning/module-card"
import { LearningDetail } from "@/components/learning/learning-detail"
import { learningModules, learningRecommendations } from "@/lib/mock-data"
import { Search, Filter, BookOpen, Target, TrendingUp, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type View = "list" | "detail"

export default function LearningPage() {
  const [view, setView] = useState<View>("list")
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const filters = [
    { id: "all", label: "All Modules" },
    { id: "technical", label: "Technical" },
    { id: "soft", label: "Soft Skills" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ]

  const filteredModules = learningModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(search.toLowerCase()) ||
      module.description.toLowerCase().includes(search.toLowerCase())
    
    if (!matchesSearch) return false
    if (activeFilter === "all") return true
    if (activeFilter === "technical") return module.category === "Technical"
    if (activeFilter === "soft") return module.category === "Soft Skills"
    if (activeFilter === "in-progress") return module.progress > 0 && module.progress < 100
    if (activeFilter === "completed") return module.progress === 100
    return true
  })

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setView("detail")
  }

  const handleBack = () => {
    setView("list")
    setSelectedModuleId(null)
  }

  const totalProgress = Math.round(
    learningModules.reduce((acc, m) => acc + m.progress, 0) / learningModules.length
  )
  const completedModules = learningModules.filter(m => m.progress === 100).length
  const totalLessons = learningModules.reduce((acc, m) => acc + m.lessons, 0)
  const completedLessons = learningModules.reduce((acc, m) => acc + m.completedLessons, 0)

  if (view === "detail" && selectedModuleId) {
    return (
      <AppShell title="Learning Mode" description="Personalized learning path">
        <LearningDetail moduleId={selectedModuleId} onBack={handleBack} />
      </AppShell>
    )
  }

  return (
    <AppShell 
      title="Learning Mode"
      description="Diagnose, learn, and practice to improve your interview skills"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalProgress}%</p>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedModules}/{learningModules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedLessons}/{totalLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">35h</p>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {learningRecommendations.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recommended for You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {learningRecommendations.map((rec) => {
                  const module = learningModules.find(m => m.id === rec.moduleId)
                  if (!module) return null
                  return (
                    <button
                      key={rec.moduleId}
                      onClick={() => handleSelectModule(rec.moduleId)}
                      className="flex items-start gap-3 rounded-lg bg-background/80 p-4 text-left transition-all hover:bg-background"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{module.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{rec.reason}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div 
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{module.progress}%</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onSelect={handleSelectModule}
            />
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No modules found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
