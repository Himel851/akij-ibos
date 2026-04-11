import type { ExamScoreResult } from "@/lib/exam-scoring";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service-role";
import type { ExamAdminTableRow } from "@/types/exam-candidate";
import type { UserOwnAttemptRow } from "@/types/exam";

function isMissingExamAttemptsTable(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST205") return true;
  const msg = typeof error.message === "string" ? error.message : "";
  return (
    msg.includes("exam_attempts") &&
    (msg.includes("Could not find") || msg.includes("schema cache"))
  );
}

function computeScorePercent(score: ExamScoreResult): number | null {
  if (score.maxPossiblePoints <= 0) return null;
  const pct = (score.totalPoints / score.maxPossiblePoints) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/** Append-only: each submit adds a row (full attempt history). */
export async function insertExamAttemptPersisted(params: {
  examId: string;
  userId: string;
  email: string;
  fullName: string | null;
  score: ExamScoreResult;
}): Promise<void> {
  if (!hasSupabaseServiceConfig()) {
    throw new Error("Database not configured");
  }
  const supabase = createSupabaseServiceClient();
  const email = params.email.trim().toLowerCase();
  const scorePercent = computeScorePercent(params.score);

  const { error } = await supabase.from("exam_attempts").insert({
    exam_id: params.examId,
    user_id: params.userId,
    email,
    full_name: params.fullName,
    score_percent: scorePercent,
    correct_count: params.score.correctCount,
    wrong_count: params.score.wrongCount,
    skipped_count: params.score.skippedCount,
    total_points: params.score.totalPoints,
    max_points: params.score.maxPossiblePoints,
  });

  if (error) {
    if (isMissingExamAttemptsTable(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[exam_attempts] Table not found — run migration supabase/migrations/20260413120000_create_exam_attempts.sql",
        );
      }
      return;
    }
    throw error;
  }
}

type ExamAttemptDbRow = {
  id: string;
  email: string;
  full_name: string | null;
  score_percent: number | null;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  total_points: number | string;
  max_points: number | string;
  created_at: string;
};

function numOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/** One row per submit, newest first. Empty if table missing or no rows. */
export async function listExamAttemptsForAdminPersisted(
  examId: string,
): Promise<ExamAdminTableRow[]> {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("exam_attempts")
    .select(
      "id, email, full_name, score_percent, correct_count, wrong_count, skipped_count, total_points, max_points, created_at",
    )
    .eq("exam_id", examId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingExamAttemptsTable(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[exam_attempts] Table not found — run migration supabase/migrations/20260413120000_create_exam_attempts.sql",
        );
      }
      return [];
    }
    throw error;
  }

  return (data as ExamAttemptDbRow[] | null)?.map((row) => ({
    id: row.id,
    name: (row.full_name ?? "").trim() || "—",
    email: row.email.trim(),
    status: "completed" as const,
    scorePercent: row.score_percent,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    skippedCount: row.skipped_count,
    totalPoints: numOrNull(row.total_points),
    maxPoints: numOrNull(row.max_points),
    submittedAt: row.created_at,
  })) ?? [];
}

type ExamAttemptWithTitleRow = {
  id: string;
  exam_id: string;
  score_percent: number | null;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  total_points: number | string;
  max_points: number | string;
  created_at: string;
  exams: { title: string | null } | { title: string | null }[] | null;
};

function examTitleFromJoin(row: ExamAttemptWithTitleRow): string {
  const rel = row.exams;
  if (!rel) return "—";
  const one = Array.isArray(rel) ? rel[0] : rel;
  const t = one?.title;
  return typeof t === "string" && t.trim() ? t.trim() : "—";
}

/** Current user's submits, newest first. Empty if table missing or no rows. */
export async function listExamAttemptsForUserPersisted(
  userId: string,
): Promise<UserOwnAttemptRow[]> {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("exam_attempts")
    .select(
      `
      id,
      exam_id,
      score_percent,
      correct_count,
      wrong_count,
      skipped_count,
      total_points,
      max_points,
      created_at,
      exams ( title )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingExamAttemptsTable(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[exam_attempts] Table not found — run migration supabase/migrations/20260413120000_create_exam_attempts.sql",
        );
      }
      return [];
    }
    throw error;
  }

  return ((data ?? []) as ExamAttemptWithTitleRow[]).map((row) => ({
    id: row.id,
    examId: row.exam_id,
    examTitle: examTitleFromJoin(row),
    scorePercent: row.score_percent,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    skippedCount: row.skipped_count,
    totalPoints: numOrNull(row.total_points),
    maxPoints: numOrNull(row.max_points),
    submittedAt: row.created_at,
  }));
}
