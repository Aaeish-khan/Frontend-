export const JOB_CATEGORY_OPTIONS = [
  "Software / IT",
  "Data / AI",
  "Business / Management",
  "Marketing / Sales",
  "Finance / Accounting",
  "Human Resources",
  "Education / Teaching",
  "Healthcare",
  "Design / Creative",
  "Engineering",
  "Operations / Administration",
  "Customer Support",
  "Legal / Compliance",
  "Other",
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  "Internship",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
  "Manager / Lead",
  "Other",
] as const;

export const APPLICATION_STATUS_OPTIONS = [
  {
    value: "applied",
    label: "I have applied",
    display: "Applied",
  },
  {
    value: "checking_eligibility",
    label: "I am checking eligibility",
    display: "Checking Eligibility",
  },
  {
    value: "planning_to_apply",
    label: "I plan to apply later",
    display: "Planning to Apply",
  },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_OPTIONS)[number]["value"];
export type JobDescriptionExtractionSource = "manual" | "upload" | "manual_edited_after_upload";

export function getApplicationStatusLabel(status?: string | null) {
  const option = APPLICATION_STATUS_OPTIONS.find((item) => item.value === status);
  if (option) return option.display;
  if (!status) return "Applied";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getProjectApplicationStatus(project: {
  applicationStatus?: string | null;
  outcome?: { status?: string | null } | null;
  status?: string | null;
}) {
  if (project.applicationStatus) return project.applicationStatus;
  if (project.outcome?.status) return project.outcome.status;
  if (project.status && !["active", "archived"].includes(project.status)) return project.status;
  return "applied";
}

export function getProjectCategoryLabel(project: {
  jobCategory?: string | null;
  customJobCategory?: string | null;
}) {
  if (project.jobCategory === "Other" && project.customJobCategory) {
    return project.customJobCategory;
  }

  return project.customJobCategory || project.jobCategory || "";
}
