export type ExamCandidateStatus = "completed" | "in_progress" | "not_started";

export type ExamCandidateRow = {
  id: string;
  name: string;
  email: string;
  status: ExamCandidateStatus;
  /** Percentage 0–100 when completed; null otherwise */
  scorePercent: number | null;
  lastActivityAt: string;
  /** Set when status is completed (from DB after submit). */
  correctCount: number | null;
  wrongCount: number | null;
  skippedCount: number | null;
  totalPoints: number | null;
  maxPoints: number | null;
};
