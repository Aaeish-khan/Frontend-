"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { currentUser, badges, userStats } from "@/lib/mock-data"
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
  Trophy,
  TrendingUp,
  Target,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem, cardVariants, viewportOnce } from "@/lib/animations"

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

const levels = [
  { level: 1, title: "Beginner", minXp: 0, maxXp: 500 },
  { level: 5, title: "Novice", minXp: 500, maxXp: 1500 },
  { level: 10, title: "Explorer", minXp: 1500, maxXp: 3000 },
  { level: 15, title: "Achiever", minXp: 3000, maxXp: 5000 },
  { level: 20, title: "Expert", minXp: 5000, maxXp: 8000 },
  { level: 25, title: "Master", minXp: 8000, maxXp: 12000 },
  { level: 30, title: "Legend", minXp: 12000, maxXp: 20000 },
]

const weeklyChallenge = {
  title: "Interview Marathon",
  description: "Complete 5 mock interviews this week",
  progress: 3,
  target: 5,
  xpReward: 500,
  endsIn: "3 days",
}

const dailyChallenges = [
  { id: "d1", title: "Daily Practice", description: "Complete 1 learning module", xp: 50, completed: true },
  { id: "d2", title: "Quick Interview", description: "Do a 10-min mock interview", xp: 75, completed: false },
  { id: "d3", title: "Peer Helper", description: "Give feedback to a peer", xp: 100, completed: false },
]

export default function GamificationPage() {
  const xpProgress = (currentUser.xp / currentUser.xpToNextLevel) * 100
  const currentLevelData = levels.find(l => l.level <= currentUser.level) || levels[0]
  const earnedBadges = badges.filter(b => b.earned)
  const inProgressBadges = badges.filter(b => !b.earned)

  return (
    <AppShell 
      title="Gamification"
      description="Track your progress, earn badges, and level up"
    >
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Level & XP Overview */}
        <motion.div variants={staggerItem}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <ProgressRing progress={xpProgress} size={140} strokeWidth={12}>
                <div className="text-center">
                  <span className="text-4xl font-bold">{currentUser.level}</span>
                  <p className="text-sm text-muted-foreground">Level</p>
                </div>
              </ProgressRing>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{currentLevelData.title}</h2>
                <p className="text-muted-foreground mt-1">
                  {currentUser.xp.toLocaleString()} / {currentUser.xpToNextLevel.toLocaleString()} XP
                </p>
                <div className="mt-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-muted">
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {currentUser.xpToNextLevel - currentUser.xp} XP to reach Level {currentUser.level + 1}
                </p>
              </div>
              <div className="flex gap-6 md:gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500">
                    <Flame className="h-6 w-6" />
                    <span className="text-3xl font-bold">{currentUser.streak}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary">
                    <Trophy className="h-6 w-6" />
                    <span className="text-3xl font-bold">{earnedBadges.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        </motion.div>

        {/* Challenges */}
        <motion.div variants={staggerItem} className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{weeklyChallenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{weeklyChallenge.description}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    +{weeklyChallenge.xpReward} XP
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{weeklyChallenge.progress}/{weeklyChallenge.target} completed</span>
                    <span className="text-muted-foreground">Ends in {weeklyChallenge.endsIn}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Daily Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 transition-all",
                    challenge.completed ? "border-green-500/30 bg-green-500/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      challenge.completed ? "bg-green-500/10" : "bg-muted"
                    )}>
                      {challenge.completed ? (
                        <Award className="h-4 w-4 text-green-500" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "font-medium",
                        challenge.completed && "line-through text-muted-foreground"
                      )}>
                        {challenge.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    challenge.completed ? "text-green-500" : "text-primary"
                  )}>
                    +{challenge.xp} XP
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges Section */}
        <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges ({earnedBadges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {earnedBadges.map((badge) => {
                const Icon = badgeIcons[badge.icon] || Award
                return (
                  <motion.div
                    key={badge.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="flex flex-col items-center gap-2 rounded-lg border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-4 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {badge.description}
                      </p>
                    </div>
                    <p className="text-xs text-primary">
                      Earned {new Date(badge.earnedAt!).toLocaleDateString()}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* In Progress Badges */}
        <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>Badges In Progress ({inProgressBadges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressBadges.map((badge) => {
                const Icon = badgeIcons[badge.icon] || Award
                return (
                  <motion.div
                    key={badge.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="flex items-center gap-4 rounded-lg border border-white/8 bg-white/3 p-4 hover:border-primary/30"
                  >
                    <div className="icon-box flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {badge.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div 
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{badge.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Sarah Ahmed", xp: 4250, avatar: "SA" },
                { rank: 2, name: "Ali Hassan", xp: 3890, avatar: "AH" },
                { rank: 3, name: currentUser.name, xp: currentUser.xp, avatar: "AS", isYou: true },
                { rank: 4, name: "Fatima Khan", xp: 2650, avatar: "FK" },
                { rank: 5, name: "Omar Malik", xp: 2400, avatar: "OM" },
              ].map((user) => (
                <motion.div
                  key={user.rank}
                  variants={staggerItem}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-3 transition-all",
                    user.isYou ? "border-primary/40 bg-gradient-to-r from-primary/10 to-purple-500/5" : "border-white/8 hover:border-white/15"
                  )}
                >
                  <span className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    user.rank === 1 && "bg-yellow-500/10 text-yellow-500",
                    user.rank === 2 && "bg-gray-400/10 text-gray-400",
                    user.rank === 3 && "bg-orange-500/10 text-orange-500",
                    user.rank > 3 && "bg-muted text-muted-foreground"
                  )}>
                    {user.rank}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {user.name}
                      {user.isYou && <span className="ml-2 text-xs text-primary">(You)</span>}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">{user.xp.toLocaleString()} XP</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>

      </motion.div>
    </AppShell>
  )
}
