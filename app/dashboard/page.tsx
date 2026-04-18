"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { getProjectsRequest, type Project } from "@/lib/api-projects";
import { getGamificationSummary, type GamificationSummary } from "@/lib/api-gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Trophy, Users, FileBarChart, Plus, Flame, CheckCircle2, Circle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [data, gam] = await Promise.all([
          getProjectsRequest(),
          getGamificationSummary().catch(() => null),
        ]);
        setProjects(data);
        setGamification(gam);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const displayName = user?.name?.split(" ")[0] ?? "User";

  return (
    <AppShell
      title={`Welcome back, ${displayName}`}
      description="Manage your job application projects and overall progress"
    >
      <div className="space-y-6">
        {loading ? <p className="text-sm text-muted-foreground">Loading dashboard...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!loading && !error && projects.length === 0 ? (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardHeader>
              <CardTitle>Create your first project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A project means one job you are applying for. Add the job description and your resume,
                and InterMate will personalize interview prep, resume analysis, and learning mode for that job.
              </p>
              <Link href="/projects/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {project.companyName || "No company name"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.jobRole || "No role set"}
                    </p>
                    <p className="text-sm">
                      Match Score: <span className="font-semibold">{project.aiInsights?.resumeMatchScore ?? 0}%</span>
                    </p>
                    <p className="text-sm">
                      Outcome: <span className="font-semibold capitalize">{project.outcome?.status || "applied"}</span>
                    </p>
                    <div className="pt-2">
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm">Open Project</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Global Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" />
                      <span className="font-medium">Projects</span>
                    </div>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>

                  <Link href="/gamification" className="block">
                    <div className="rounded-xl border p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="mb-2 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-medium">Gamification</span>
                        {gamification && (
                          <span className="ml-auto text-xs font-semibold text-primary">Lv {gamification.level}</span>
                        )}
                      </div>
                      {gamification ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{gamification.levelName}</span>
                            <span className="font-semibold">{gamification.xp.toLocaleString()} XP</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: gamification.xpToNextLevel
                                  ? `${Math.min(100, 100 - (gamification.xpToNextLevel / (gamification.xp + gamification.xpToNextLevel)) * 100)}%`
                                  : "100%",
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {gamification.learningStreak}d streak
                            </span>
                            <span>{gamification.badgeCount} badges</span>
                            {gamification.todayXP > 0 && (
                              <span className="text-primary font-medium">+{gamification.todayXP} today</span>
                            )}
                          </div>
                          {gamification.dailyMissions.length > 0 && (
                            <div className="pt-1 space-y-1">
                              {gamification.dailyMissions.slice(0, 2).map((m) => (
                                <div key={m.id} className="flex items-center gap-1.5 text-xs">
                                  {m.completed
                                    ? <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                                    : <Circle className="h-3 w-3 shrink-0 text-muted-foreground" />}
                                  <span className={m.completed ? "line-through text-muted-foreground" : ""}>
                                    {m.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Track XP, badges, and streaks.</p>
                      )}
                    </div>
                  </Link>

                  <div className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Peer Review</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reviews will work across all public mock interviews.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Link href="/projects/new">
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Another Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shared Areas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Link href="/gamification">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Trophy className="h-4 w-4" />
                    Gamification
                  </Button>
                </Link>
                <Link href="/peer-review">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Peer Review
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileBarChart className="h-4 w-4" />
                    Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}devicePixelRatio