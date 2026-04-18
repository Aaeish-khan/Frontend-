import { getToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type GamificationSummary = {
  xp: number;
  todayXP: number;
  level: number;
  levelName: string;
  xpToNextLevel: number;
  nextLevelName: string | null;
  learningStreak: number;
  practiceStreak: number;
  badgeCount: number;
  careerQuestStage: number;
  dailyMissions: Mission[];
  allDailyDone: boolean;
};

export type Mission = {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
  claimedAt: string | null;
};

export type Badge = {
  id: string;
  name: string;
  category: string;
  description: string;
  earnedAt?: string | null;
  isEarned?: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  xp: number;
  level: number;
  levelName: string;
  badgeCount: number;
};

export type GamificationStats = {
  modulesCompleted: number;
  quizzesPassed: number;
  quizPerfectScores: number;
  interviewsCompleted: number;
  interviewsImproved: number;
  labsCompleted: number;
  peerReviewsGiven: number;
  highestAtsScore: number;
  bestInterviewScore: number;
  resumeUploads: number;
  projectsCreated: number;
  hadQuizRetryPass: boolean;
};

export type SkillTreeNode = {
  nodeId: string;
  status: "locked" | "unlocked" | "in_progress" | "completed" | "mastered";
  completedAt?: string;
  masteredAt?: string;
};

export type SkillTree = {
  frontend?: SkillTreeNode[];
  backend?: SkillTreeNode[];
  databases?: SkillTreeNode[];
  dsa?: SkillTreeNode[];
  cloud_devops?: SkillTreeNode[];
  testing?: SkillTreeNode[];
  behavioral?: SkillTreeNode[];
  cs_fundamentals?: SkillTreeNode[];
};

export type GamificationProfile = {
  xp: { total: number; todayXP: number; weekXP: number };
  level: number;
  levelName: string;
  xpToNextLevel: number;
  progressPercent: number;
  nextLevelName: string | null;
  badges: Badge[];
  streaks: {
    learning: { current: number; longest: number; freezesAvailable: number };
    practice: { current: number; longest: number; freezesAvailable: number };
  };
  missions: { daily: { date: string; missions: Mission[]; bonusClaimed: boolean }; weekly: { weekStart: string; missions: Mission[] } };
  careerQuest: { currentStage: number; stages: unknown[] };
  stats: GamificationStats;
  xpLog: { action: string; xp: number; description: string; timestamp: string }[];
};

// ── BADGE PROGRESS helpers (client-side from stats) ───────────────────────────

const BADGE_PROGRESS_MAP: Record<string, (s: GamificationStats) => number> = {
  first_upload:       (s) => Math.min(100, s.resumeUploads        >= 1  ? 100 : 0),
  ats_starter:        (s) => Math.min(100, (s.highestAtsScore     / 50)  * 100),
  ats_optimizer:      (s) => Math.min(100, (s.highestAtsScore     / 70)  * 100),
  ats_master:         (s) => Math.min(100, (s.highestAtsScore     / 90)  * 100),
  first_module:       (s) => Math.min(100, s.modulesCompleted     >= 1  ? 100 : 0),
  modules_5:          (s) => Math.min(100, (s.modulesCompleted    / 5)   * 100),
  modules_25:         (s) => Math.min(100, (s.modulesCompleted    / 25)  * 100),
  first_lab:          (s) => Math.min(100, s.labsCompleted        >= 1  ? 100 : 0),
  labs_5:             (s) => Math.min(100, (s.labsCompleted       / 5)   * 100),
  first_quiz:         (s) => Math.min(100, s.quizzesPassed        >= 1  ? 100 : 0),
  quiz_perfect:       (s) => Math.min(100, s.quizPerfectScores    >= 1  ? 100 : 0),
  quiz_retry:         (s) => Math.min(100, s.hadQuizRetryPass            ? 100 : 0),
  quiz_10:            (s) => Math.min(100, (s.quizzesPassed       / 10)  * 100),
  first_interview:    (s) => Math.min(100, s.interviewsCompleted  >= 1  ? 100 : 0),
  interviews_10:      (s) => Math.min(100, (s.interviewsCompleted / 10)  * 100),
  interviews_25:      (s) => Math.min(100, (s.interviewsCompleted / 25)  * 100),
  first_peer:         (s) => Math.min(100, s.peerReviewsGiven     >= 1  ? 100 : 0),
  peer_5:             (s) => Math.min(100, (s.peerReviewsGiven    / 5)   * 100),
  perfectionist:      (s) => Math.min(100, (s.quizPerfectScores   / 3)   * 100),
  quiz_25:            (s) => Math.min(100, (s.quizzesPassed       / 25)  * 100),
  comeback_kid:       (s) => Math.min(100, (s.interviewsImproved  ?? 0) >= 1 ? 100 : 0),
  communication_pro:  (s) => Math.min(100, (s.bestInterviewScore  / 90)  * 100),
  peer_mentor:        (s) => Math.min(100, (s.peerReviewsGiven    / 10)  * 100),
  resume_reviser:     (s) => Math.min(100, (s.resumeUploads       / 5)   * 100),
  streak_14:          (s) => Math.min(100, s.modulesCompleted     >= 1  ? 50 : 0),
};

export function getBadgeProgress(badgeId: string, stats: GamificationStats): number {
  const fn = BADGE_PROGRESS_MAP[badgeId];
  return fn ? Math.round(fn(stats)) : 0;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getGamificationSummary(): Promise<GamificationSummary> {
  return authFetch(`${API_URL}/gamification/summary`);
}

export async function getGamificationProfile(): Promise<GamificationProfile> {
  return authFetch(`${API_URL}/gamification/profile`);
}

export async function getGamificationMissions(): Promise<{
  daily: GamificationProfile["missions"]["daily"];
  weekly: GamificationProfile["missions"]["weekly"];
}> {
  return authFetch(`${API_URL}/gamification/missions`);
}

export async function getGamificationBadges(): Promise<{
  earned: Badge[];
  all: (Badge & { isEarned: boolean })[];
}> {
  return authFetch(`${API_URL}/gamification/badges`);
}

export async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return authFetch(`${API_URL}/gamification/leaderboard`);
}

export async function getGamificationStats(): Promise<{ stats: GamificationStats; xp: unknown; level: number; levelName: string }> {
  return authFetch(`${API_URL}/gamification/stats`);
}

export async function useStreakFreeze(): Promise<{ freezesRemaining: number }> {
  return authFetch(`${API_URL}/gamification/streak/freeze`, { method: "POST" });
}

export async function getXPLog(limit = 20): Promise<{ log: GamificationProfile["xpLog"] }> {
  return authFetch(`${API_URL}/gamification/xp-log?limit=${limit}`);
}

export async function getSkillTree(): Promise<SkillTree> {
  return authFetch(`${API_URL}/gamification/skill-tree`);
}

export async function updateSkillTreeNode(
  category: string,
  nodeId: string,
  status: SkillTreeNode["status"],
): Promise<{ nodeId: string; category: string; status: string }> {
  return authFetch(`${API_URL}/gamification/skill-tree/${category}/${nodeId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
