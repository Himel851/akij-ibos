import { insertExamAttemptPersisted } from "@/lib/exam-attempts-persistence";
import { upsertExamCandidateResult } from "@/lib/exam-candidates-persistence";
import { parseExamSubmissionAnswers, parseSkippedIds } from "@/lib/exam-submission-parse";
import { computeExamScore } from "@/lib/exam-scoring";
import { getExamDetailPersisted } from "@/lib/exams-persistence";
import { hasSupabaseServiceConfig } from "@/lib/supabase/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SubmitBody = {
  answers?: unknown;
  skippedIds?: unknown;
};

function formatPersistError(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    const bits = [o.message, o.code, o.details, o.hint].filter(
      (x) => x !== undefined && x !== null && String(x).length > 0,
    );
    if (bits.length) return bits.map(String).join(" | ");
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

export async function POST(request: Request, context: RouteContext) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { ok: false, error: "Results storage is not configured" },
      { status: 503 },
    );
  }

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabaseAuth.auth.getUser();

  if (authErr || !user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: examId } = await context.params;
  const exam = await getExamDetailPersisted(examId);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "Exam not found" }, { status: 404 });
  }

  if (exam.questions.length === 0) {
    return NextResponse.json({ ok: false, error: "Exam has no questions" }, { status: 400 });
  }

  const skipped = parseSkippedIds(body.skippedIds);
  for (const sid of skipped) {
    if (!exam.questions.some((q) => q.id === sid)) {
      return NextResponse.json({ ok: false, error: "Invalid skipped question id" }, { status: 400 });
    }
  }

  const answers = parseExamSubmissionAnswers(exam, body.answers, skipped);
  const score = computeExamScore(exam.questions, answers, skipped);

  const meta = (user.user_metadata ?? {}) as { name?: string };
  const fullName =
    typeof meta.name === "string" && meta.name.trim() ? meta.name.trim() : null;

  try {
    await upsertExamCandidateResult({
      examId,
      userId: user.id,
      email: user.email,
      fullName,
      score,
    });
  } catch (e) {
    console.error("[submit exam result]", e);
    const detail = formatPersistError(e);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to save result",
        detail,
      },
      { status: 500 },
    );
  }

  try {
    await insertExamAttemptPersisted({
      examId,
      userId: user.id,
      email: user.email,
      fullName,
      score,
    });
  } catch (e) {
    console.error("[exam_attempts] history row not saved (latest result still saved)", e);
  }

  return NextResponse.json({
    ok: true,
    score: {
      totalPoints: score.totalPoints,
      maxPossiblePoints: score.maxPossiblePoints,
      correctCount: score.correctCount,
      wrongCount: score.wrongCount,
      skippedCount: score.skippedCount,
      scorePercent:
        score.maxPossiblePoints > 0
          ? Math.round((score.totalPoints / score.maxPossiblePoints) * 100)
          : null,
    },
  });
}
