import type { ExamScoreResult } from "@/lib/exam-scoring";
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
  correct_count?: number | null;
  wrong_count?: number | null;
  skipped_count?: number | null;
  total_points?: number | string | null;
  max_points?: number | string | null;
};

function numOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

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
    correctCount:
      row.correct_count !== undefined && row.correct_count !== null
        ? row.correct_count
        : null,
    wrongCount:
      row.wrong_count !== undefined && row.wrong_count !== null ? row.wrong_count : null,
    skippedCount:
      row.skipped_count !== undefined && row.skipped_count !== null
        ? row.skipped_count
        : null,
    totalPoints: numOrNull(row.total_points ?? null),
    maxPoints: numOrNull(row.max_points ?? null),
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

const SELECT_EXAM_CANDIDATES_FULL =
  "id, exam_id, user_id, email, full_name, status, score_percent, last_activity_at, created_at, correct_count, wrong_count, skipped_count, total_points, max_points";

const SELECT_EXAM_CANDIDATES_CORE =
  "id, exam_id, user_id, email, full_name, status, score_percent, last_activity_at, created_at";

export async function listExamCandidatesPersisted(examId: string): Promise<ExamCandidateRow[]> {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }
  const supabase = createSupabaseServiceClient();
  const first = await supabase
    .from("exam_candidates")
    .select(SELECT_EXAM_CANDIDATES_FULL)
    .eq("exam_id", examId)
    .order("last_activity_at", { ascending: false });

  const second =
    first.error && isMissingColumnError(first.error)
      ? await supabase
          .from("exam_candidates")
          .select(SELECT_EXAM_CANDIDATES_CORE)
          .eq("exam_id", examId)
          .order("last_activity_at", { ascending: false })
      : null;

  const data = (second ?? first).data as ExamCandidateDbRow[] | null;
  const error = (second ?? first).error;

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

function clampScorePercent(raw: number | null): number | null {
  if (raw === null || Number.isNaN(raw)) return null;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function computeScorePercentValue(score: ExamScoreResult): number | null {
  if (score.maxPossiblePoints <= 0) return null;
  const pct = (score.totalPoints / score.maxPossiblePoints) * 100;
  return clampScorePercent(pct);
}

function isMissingColumnError(e: { code?: string; message?: string }): boolean {
  if (e.code === "42703") return true;
  const m = typeof e.message === "string" ? e.message.toLowerCase() : "";
  if (m.includes("could not find") && m.includes("column")) return true;
  return m.includes("does not exist") && m.includes("column");
}

/** Save or update a row when a user finishes an exam (service role). */
export async function upsertExamCandidateResult(params: {
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
  const scorePercent = computeScorePercentValue(params.score);

  const now = new Date().toISOString();

  const { data: existingRows, error: selErr } = await supabase
    .from("exam_candidates")
    .select("id")
    .eq("exam_id", params.examId)
    .eq("email", email)
    .limit(1);

  if (selErr) throw selErr;
  const existing = existingRows?.[0] ?? null;

  const resultFieldsFull = {
    user_id: params.userId,
    full_name: params.fullName,
    status: "completed" as const,
    score_percent: scorePercent,
    correct_count: params.score.correctCount,
    wrong_count: params.score.wrongCount,
    skipped_count: params.score.skippedCount,
    total_points: params.score.totalPoints,
    max_points: params.score.maxPossiblePoints,
    last_activity_at: now,
    updated_at: now,
  };

  const resultFieldsCore = {
    user_id: params.userId,
    full_name: params.fullName,
    status: "completed" as const,
    score_percent: scorePercent,
    last_activity_at: now,
    updated_at: now,
  };

  async function applyUpdate(
    fields: typeof resultFieldsFull | typeof resultFieldsCore,
  ) {
    if (existing) {
      const { error } = await supabase
        .from("exam_candidates")
        .update(fields)
        .eq("id", (existing as { id: string }).id);
      if (error) throw error;
      return;
    }
    const { error: insErr } = await supabase.from("exam_candidates").insert({
      exam_id: params.examId,
      email,
      ...fields,
    });
    if (insErr) {
      if (insErr.code === "23505") {
        const { error: upErr } = await supabase
          .from("exam_candidates")
          .update(fields)
          .eq("exam_id", params.examId)
          .eq("email", email);
        if (upErr) throw upErr;
        return;
      }
      throw insErr;
    }
  }

  try {
    await applyUpdate(resultFieldsFull);
  } catch (first: unknown) {
    const err = first as { code?: string; message?: string };
    if (isMissingColumnError(err)) {
      await applyUpdate(resultFieldsCore);
      return;
    }
    throw first;
  }
}
