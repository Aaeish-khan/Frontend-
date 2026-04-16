"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getProjectRequest, updateProjectOutcomeRequest } from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statuses = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "accepted",
  "withdrawn",
];

export default function ProjectOutcomePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProjectRequest(projectId)
      .then((project) => {
        setStatus(project.outcome?.status || "applied");
        setNotes(project.outcome?.notes || "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load outcome"))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSave() {
    try {
      setSaving(true);
      await updateProjectOutcomeRequest(projectId, { status, notes });
      router.replace(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update outcome");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Job Outcome" description="Track what happened with this application">
      {loading ? <p className="text-sm text-muted-foreground">Loading outcome...</p> : null}

      {!loading ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Update Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the application outcome"
              className="w-full rounded-xl border px-3 py-2"
            />

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Outcome"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}