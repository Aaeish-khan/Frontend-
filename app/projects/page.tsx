"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectsRequest, type Project } from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building2, Briefcase, Plus, Sparkles } from "lucide-react";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProjectsRequest()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Projects" description="Track your job applications, resumes, and interview prep">
      {loading ? <p className="text-sm text-muted-foreground animate-pulse">Loading projects...</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {!loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
            <Link href="/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>

          {projects.length === 0 && !error ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No projects yet</p>
                  <p className="text-sm text-muted-foreground">Create your first project to start tracking a job application.</p>
                </div>
                <Link href="/projects/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const score = project.aiInsights?.resumeMatchScore;
                const hasDoneAnalysis = project.aiInsights?.processingStatus === "done";

                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className="h-full transition-colors hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1 text-base">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{project.companyName || "No company"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{project.jobRole || "No role"}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                            {project.outcome?.status || "applied"}
                          </span>
                          {hasDoneAnalysis && score !== undefined ? (
                            <span className={cn("text-sm font-semibold", scoreColor(score))}>
                              {score}% match
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No analysis</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
