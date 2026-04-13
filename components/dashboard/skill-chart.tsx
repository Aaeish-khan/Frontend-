"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userStats } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export function SkillChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Skills Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userStats.skillProgress.map((skill) => (
          <div key={skill.skill} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{skill.skill}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{skill.score}%</span>
                {skill.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {skill.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                {skill.trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  skill.score >= 80 ? "bg-green-500" : 
                  skill.score >= 60 ? "bg-primary" : 
                  "bg-yellow-500"
                )}
                style={{ width: `${skill.score}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
