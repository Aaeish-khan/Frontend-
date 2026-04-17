"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, FileText, BookOpen, Trophy, Users, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { recentActivity } from "@/lib/mock-data"

const iconMap: Record<string, LucideIcon> = {
  video: Video,
  file: FileText,
  book: BookOpen,
  trophy: Trophy,
  users: Users,
}

const typeColors: Record<string, string> = {
  interview: "bg-blue-500/10 text-blue-500",
  resume: "bg-green-500/10 text-green-500",
  learning: "bg-purple-500/10 text-purple-500",
  badge: "bg-yellow-500/10 text-yellow-500",
  peer: "bg-pink-500/10 text-pink-500",
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return "Just now"
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.map((activity, index) => {
          const Icon = iconMap[activity.icon] || FileText
          return (
            <div key={activity.id} className="flex gap-4">
              <div className={cn(
                "icon-box flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/8",
                typeColors[activity.type]
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  {activity.score && (
                    <span className="text-sm font-semibold text-primary">
                      {activity.score}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground/60">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
