"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userStats } from "@/lib/mock-data"

export function WeeklyChart() {
  const maxValue = Math.max(
    ...userStats.weeklyProgress.map(d => Math.max(d.interviews, d.practice))
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-40">
          {userStats.weeklyProgress.map((day) => (
            <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-col items-center gap-1">
                <div 
                  className="w-full max-w-8 rounded-t bg-primary/30 transition-all"
                  style={{ height: `${(day.practice / maxValue) * 100}px` }}
                />
                <div 
                  className="w-full max-w-8 rounded-t bg-primary transition-all"
                  style={{ height: `${(day.interviews / maxValue) * 100}px` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {day.day}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            <span className="text-xs text-muted-foreground">Interviews</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary/30" />
            <span className="text-xs text-muted-foreground">Practice (hrs)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
