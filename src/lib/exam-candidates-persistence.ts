import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service-role";
import type { ExamCandidateRow, ExamCandidateStatus } from "@/types/exam-candidate";

type ExamCandidateDbRow = {
  id: string;
  exam_id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  status: string;
  score_percent: number | null;
  last_activity_at: string;
  created_at: string;
};

function normalizeStatus(raw: string): ExamCandidateStatus {
  if (raw === "completed" || raw === "in_progress" || raw === "not_started") {
    return raw;
  }
  return "not_started";
}

function rowToCandidate(row: ExamCandidateDbRow): ExamCandidateRow {
  return {
    id: row.id,
    name: (row.full_name ?? "").trim() || "—",
    email: row.email.trim(),
    status: normalizeStatus(row.status),
    scorePercent: row.score_percent,
    lastActivityAt: row.last_activity_at || row.created_at,
  };
}

/** PostgREST: relation missing from schema (migration not applied yet). */
function isMissingExamCandidatesTable(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST205") return true;
  const msg = typeof error.message === "string" ? error.message : "";
  return (
    msg.includes("exam_candidates") &&
    (msg.includes("Could not find") || msg.includes("schema cache"))
  );
}

export async function listExamCandidatesPersisted(examId: string): Promise<ExamCandidateRow[]> {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("exam_candidates")
    .select(
      "id, exam_id, user_id, email, full_name, status, score_percent, last_activity_at, created_at",
    )
    .eq("exam_id", examId)
    .order("last_activity_at", { ascending: false });
  if (error) {
    if (isMissingExamCandidatesTable(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[exam_candidates] Table not found — apply migration supabase/migrations/20260411130000_create_exam_candidates.sql",
        );
      }
      return [];
    }
    throw error;
  }
  if (!data?.length) return [];
  return (data as ExamCandidateDbRow[]).map(rowToCandidate);
}
