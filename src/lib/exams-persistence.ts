import {
  createDraftExam as createDraftExamMock,
  createExam as createExamMock,
  deleteExam as deleteExamMock,
  getExamDetail as getExamDetailMock,
  listExamSummaries as listExamSummariesMock,
  updateExam as updateExamMock,
} from "@/lib/mock/exams-repository";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service-role";
import type { Exam, ExamSummary } from "@/types/exam";
import type { Question } from "@/types/question";

type ExamRow = {
  id: string;
  title: string;
  total_users: number | null;
  total_slots: number | null;
  question_sets_count: number | null;
  question_type: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  questions: unknown;
  status: string;
};

function isQuestionArray(v: unknown): v is Question[] {
  return Array.isArray(v) && v.every((x) => x && typeof x === "object");
}

function rowToStoredShape(row: ExamRow): Exam {
  const questions: Question[] = isQuestionArray(row.questions) ? row.questions : [];
  return {
    id: row.id,
    title: row.title,
    totalUsers: row.total_users ?? 0,
    totalSlots: row.total_slots ?? 0,
    questionSetsCount: row.question_sets_count ?? 0,
    questionType: row.question_type ?? undefined,
    startTime: row.start_time ?? "",
    endTime: row.end_time ?? "",
    durationMinutes: row.duration_minutes ?? 0,
    questions,
  };
}

function rowToSummary(row: ExamRow): ExamSummary {
  const e = rowToStoredShape(row);
  const fmt = (n: number | null | undefined) => {
    if (n === null || n === undefined) return "Not Set";
    return n.toLocaleString("en-US");
  };
  return {
    id: e.id,
    title: e.title || "Untitled draft",
    candidatesLabel: fmt(row.total_users),
    questionSetLabel: fmt(row.question_sets_count),
    examSlotsLabel: fmt(row.total_slots),
  };
}

export async function listExamSummariesPersisted(): Promise<ExamSummary[]> {
  if (!hasSupabaseServiceConfig()) {
    return listExamSummariesMock();
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ExamRow[]).map(rowToSummary);
}

export async function getExamDetailPersisted(id: string): Promise<Exam | null> {
  if (!hasSupabaseServiceConfig()) {
    return getExamDetailMock(id);
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("exams").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToStoredShape(data as ExamRow);
}

export async function createDraftExamPersisted(): Promise<{ id: string }> {
  if (!hasSupabaseServiceConfig()) {
    const s = createDraftExamMock();
    return { id: s.id };
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("exams")
    .insert({
      status: "draft",
      title: "",
      questions: [],
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}

type CreateExamBody = {
  title: string;
  totalUsers?: number | null;
  totalSlots?: number | null;
  questionSetsCount?: number | null;
  questionType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
};

export async function createExamPersisted(body: CreateExamBody): Promise<ExamSummary> {
  if (!hasSupabaseServiceConfig()) {
    return createExamMock({
      title: body.title,
      totalUsers: body.totalUsers ?? null,
      totalSlots: body.totalSlots ?? null,
      questionSetsCount: body.questionSetsCount ?? null,
      questionType: body.questionType,
      startTime: body.startTime ?? "",
      endTime: body.endTime ?? "",
      durationMinutes: body.durationMinutes ?? 0,
      questions: [],
    });
  }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("exams")
    .insert({
      title: body.title.trim(),
      total_users: body.totalUsers ?? null,
      total_slots: body.totalSlots ?? null,
      question_sets_count: body.questionSetsCount ?? null,
      question_type: body.questionType ?? null,
      start_time: body.startTime?.trim() ? body.startTime.trim() : null,
      end_time: body.endTime?.trim() ? body.endTime.trim() : null,
      duration_minutes: body.durationMinutes ?? 0,
      questions: [],
      status: "published",
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToSummary(data as ExamRow);
}

type ExamPatch = {
  title?: string;
  totalUsers?: number | null;
  totalSlots?: number | null;
  questionSetsCount?: number | null;
  questionType?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  questions?: Question[];
};

export async function updateExamPersisted(id: string, patch: ExamPatch): Promise<Exam | null> {
  if (!hasSupabaseServiceConfig()) {
    const updated = updateExamMock(id, {
      title: patch.title,
      totalUsers: patch.totalUsers,
      totalSlots: patch.totalSlots,
      questionSetsCount: patch.questionSetsCount,
      questionType: patch.questionType,
      startTime: patch.startTime,
      endTime: patch.endTime,
      durationMinutes: patch.durationMinutes,
      questions: patch.questions,
    });
    return updated ? getExamDetailMock(id) : null;
  }
  const supabase = createSupabaseServiceClient();
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.totalUsers !== undefined) row.total_users = patch.totalUsers;
  if (patch.totalSlots !== undefined) row.total_slots = patch.totalSlots;
  if (patch.questionSetsCount !== undefined) row.question_sets_count = patch.questionSetsCount;
  if (patch.questionType !== undefined) row.question_type = patch.questionType;
  if (patch.startTime !== undefined) row.start_time = patch.startTime || null;
  if (patch.endTime !== undefined) row.end_time = patch.endTime || null;
  if (patch.durationMinutes !== undefined) row.duration_minutes = patch.durationMinutes;
  if (patch.questions !== undefined) row.questions = patch.questions;
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("exams")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToStoredShape(data as ExamRow);
}

export async function deleteExamPersisted(id: string): Promise<boolean> {
  if (!hasSupabaseServiceConfig()) {
    return deleteExamMock(id);
  }
  const supabase = createSupabaseServiceClient();
  const { data: existing, error: selErr } = await supabase
    .from("exams")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!existing) return false;
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;
  return true;
}
