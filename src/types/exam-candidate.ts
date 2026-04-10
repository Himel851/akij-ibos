export type ExamCandidateStatus = "completed" | "in_progress" | "not_started";

export type ExamCandidateRow = {
  id: string;
  name: string;
  email: string;
  status: ExamCandidateStatus;
  /** Percentage 0–100 when completed; null otherwise */
  scorePercent: number | null;
  lastActivityAt: string;
};
