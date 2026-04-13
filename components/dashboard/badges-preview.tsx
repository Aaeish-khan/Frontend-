"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { badges } from "@/lib/mock-data"
import { 
  Rocket, 
  Play, 
  Zap, 
  Award, 
  Flame, 
  FileCheck, 
  Heart, 
  Star, 
  Crown, 
  GraduationCap,
  LucideIcon,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const badgeIcons: Record<string, LucideIcon> = {
  rocket: Rocket,
  play: Play,
  zap: Zap,
  award: Award,
  flame: Flame,
  "file-check": FileCheck,
  heart: Heart,
  star: Star,
  crown: Crown,
  "graduation-cap": GraduationCap,
}

export function BadgesPreview() {
  const earnedBadges = badges.filter(b => b.earned).slice(0, 4)
  const nextBadge = badges.find(b => !b.earned)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">Badges</CardTitle>
        <Link href="/gamification">
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-3">
          {earnedBadges.map((badge) => {
            const Icon = badgeIcons[badge.icon] || Award
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1.5"
                title={badge.description}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-center leading-tight max-w-[60px] truncate">
                  {badge.name}
                </span>
              </div>
            )
          })}
        </div>

        {nextBadge && (
          <div className="rounded-lg border border-dashed border-border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {(() => {
                  const Icon = badgeIcons[nextBadge.icon] || Award
                  return <Icon className="h-5 w-5 text-muted-foreground" />
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Next: {nextBadge.name}</p>
                <p className="text-xs text-muted-foreground">{nextBadge.description}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-primary">{nextBadge.progress}%</span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${nextBadge.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
