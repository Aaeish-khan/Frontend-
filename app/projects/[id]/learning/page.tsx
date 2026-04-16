"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectLearningPlanRequest } from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LearningPlan = {
  objectives: string[];
  modules: {
    moduleId: string;
    title: string;
    type: string;
    status: string;
    estimatedMinutes: number;
  }[];
  overallProgress: number;
};

export default function ProjectLearningPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProjectLearningPlanRequest(projectId)
      .then(setPlan)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load learning plan"))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <AppShell title="Learning Mode" description="Personalized plan for this job application">
      {loading ? <p className="text-sm text-muted-foreground">Loading learning plan...</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {plan ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {plan.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No modules yet.</p>
              ) : (
                plan.modules.map((module) => (
                  <div key={module.moduleId} className="rounded-xl border p-3">
                    <p className="font-medium">{module.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {module.type} • {module.estimatedMinutes} min • {module.status}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}