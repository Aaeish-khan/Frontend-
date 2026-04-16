"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { getProjectsRequest, type Project } from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Trophy, Users, FileBarChart, Plus } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjectsRequest();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
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

                  <div className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span className="font-medium">Gamification</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Global XP and badges will aggregate across all projects.
                    </p>
                  </div>

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