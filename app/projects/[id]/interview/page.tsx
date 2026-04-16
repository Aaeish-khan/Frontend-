"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  getProjectInterviewHistoryRequest,
  startProjectInterviewRequest,
  answerProjectInterviewRequest,
} from "@/lib/api-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InterviewSession = {
  _id: string;
  title: string;
  questions: {
    question: string;
    userAnswer?: string;
    aiFeedback?: string;
    score?: number;
  }[];
  overallScore?: number;
  completedAt?: string | null;
};

export default function ProjectInterviewPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      const sessions = await getProjectInterviewHistoryRequest(projectId);
      setHistory(sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  async function handleStart() {
    try {
      setError("");
      const session = await startProjectInterviewRequest(projectId);
      setCurrentSession(session);
      setCurrentIndex(0);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    }
  }

  async function handleSubmitAnswer() {
    if (!currentSession) return;

    const isLast = currentIndex === currentSession.questions.length - 1;

    try {
      setSubmitting(true);
      const updated = await answerProjectInterviewRequest(projectId, currentSession._id, {
        index: currentIndex,
        answer,
        isLast,
      });

      setCurrentSession(updated);
      setAnswer("");

      if (!isLast) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        await loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  const currentQuestion = currentSession?.questions[currentIndex];

  return (
    <AppShell title="Mock Interview" description="Practice interview questions for this project">
      <div className="space-y-6">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!currentSession ? (
          <Card>
            <CardHeader>
              <CardTitle>Start a new interview</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStart}>Start Interview</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Current Interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">{currentQuestion?.question}</p>
              <textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here"
                className="w-full rounded-xl border px-3 py-2"
              />
              <Button onClick={handleSubmitAnswer} disabled={submitting}>
                {submitting ? "Submitting..." : currentIndex === (currentSession.questions.length - 1) ? "Finish Interview" : "Next Answer"}
              </Button>

              {currentSession.completedAt ? (
                <div className="rounded-xl border p-3">
                  <p className="font-medium">Interview Complete</p>
                  <p className="text-sm text-muted-foreground">
                    Overall Score: {currentSession.overallScore ?? 0}/10
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-sm text-muted-foreground">Loading history...</p> : null}
            {!loading && history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interview sessions yet.</p>
            ) : null}
            {history.map((session) => (
              <div key={session._id} className="rounded-xl border p-3">
                <p className="font-medium">{session.title}</p>
                <p className="text-sm text-muted-foreground">
                  Score: {session.overallScore ?? 0}/10
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}