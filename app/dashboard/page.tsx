"use client"

import { AppShell } from "@/components/layout/app-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { SkillChart } from "@/components/dashboard/skill-chart"
import { BadgesPreview } from "@/components/dashboard/badges-preview"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { LearningPreview } from "@/components/dashboard/learning-preview"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currentUser, userStats } from "@/lib/mock-data"
import { useAuth } from "@/components/auth/auth-provider"
import { Video, FileText, Target, Award, Flame, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const displayName = user?.name?.split(" ")[0] ?? currentUser.name.split(" ")[0]
  const xpProgress = (currentUser.xp / currentUser.xpToNextLevel) * 100

  return (
    <AppShell 
      title={`Welcome back, ${displayName}`}
      description="Track your progress and continue your interview preparation journey"
    >
      <div className="space-y-6">
        {/* Level Progress Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <ProgressRing progress={xpProgress} size={100} strokeWidth={8}>
                  <div className="text-center">
                    <span className="text-2xl font-bold">{currentUser.level}</span>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                </ProgressRing>
                <div>
                  <h3 className="text-lg font-semibold">Level {currentUser.level} Explorer</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.xp.toLocaleString()} / {currentUser.xpToNextLevel.toLocaleString()} XP to next level
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{currentUser.streak} day streak</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex gap-3">
                <Link href="/interview">
                  <Button className="gap-2">
                    <Video className="h-4 w-4" />
                    Start Interview
                  </Button>
                </Link>
                <Link href="/resume">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Analyze Resume
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Interviews"
            value={userStats.totalInterviews}
            icon={Video}
            trend="up"
            trendValue="+3 this week"
          />
          <StatsCard
            title="Average Score"
            value={`${userStats.averageScore}%`}
            icon={Target}
            trend="up"
            trendValue="+5% from last month"
          />
          <StatsCard
            title="Practice Hours"
            value={userStats.practiceHours}
            icon={Award}
            trend="up"
            trendValue="+8.5 this week"
          />
          <StatsCard
            title="Badges Earned"
            value={userStats.badgesEarned}
            icon={Award}
            trend="stable"
            trendValue="2 in progress"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <LearningPreview />
            <WeeklyChart />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SkillChart />
            <BadgesPreview />
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </AppShell>
  )
}
