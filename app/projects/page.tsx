"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectsRequest, type Project } from "@/lib/api-projects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Building2, Briefcase, Sparkles, FolderOpen } from "lucide-react";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

const statusStyles: Record<string, string> = {
  active: "bg-green-500/10 text-green-500",
  archived: "bg-muted text-muted-foreground",
  applied: "bg-blue-500/10 text-blue-500",
};

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
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your Job Projects</h2>
            <p className="text-sm text-muted-foreground">
              Each project tracks a specific job application end-to-end
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="btn-glow gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-futuristic animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="h-5 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-4 w-1/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="card-futuristic border-destructive/30">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" className="mt-4 hover-glow" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <Card className="card-futuristic">
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">No projects yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first project to start tracking a job application
                </p>
              </div>
              <Link href="/projects/new">
                <Button className="btn-glow gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Projects grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => {
              const matchScore = project.aiInsights?.resumeMatchScore;
              const hasScore = project.aiInsights?.processingStatus === "done" && matchScore != null;
              const delayClass = ["", "delay-75", "delay-150", "delay-225", "delay-300"][Math.min(i, 4)];
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                  <Card className={cn("card-futuristic hover-lift overflow-hidden animate-fade-in-up relative", delayClass)}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-110">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusStyles[project.status] ?? statusStyles.active)}>
                          {project.status}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h3 className="font-semibold leading-snug line-clamp-1">{project.title}</h3>
                        {project.companyName && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{project.companyName}</span>
                          </div>
                        )}
                        {project.jobRole && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{project.jobRole}</span>
                          </div>
                        )}
                      </div>

                      {hasScore && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">ATS Match</span>
                            <span className={cn("font-bold", scoreColor(matchScore!))}>{matchScore}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                matchScore! >= 80 ? "bg-green-500" :
                                matchScore! >= 60 ? "bg-yellow-500" :
                                matchScore! >= 40 ? "bg-orange-400" : "bg-red-500"
                              )}
                              style={{ width: `${matchScore}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
