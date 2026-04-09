import type { Exam, ExamSummary } from "@/types/exam";

/**
 * Internal shape allowing "Not Set" for list display — in-memory mock DB.
 * Swap this module for Prisma/Drizzle later; keep API route signatures stable.
 */
export type StoredExam = {
  id: string;
  title: string;
  totalUsers: number | null;
  totalSlots: number | null;
  questionSetsCount: number | null;
  questionType?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  questions: Exam["questions"];
};

function fmtCount(n: number | null): string {
  if (n === null) return "Not Set";
  return n.toLocaleString("en-US");
}

function toSummary(e: StoredExam): ExamSummary {
  return {
    id: e.id,
    title: e.title,
    candidatesLabel: fmtCount(e.totalUsers),
    questionSetLabel: fmtCount(e.questionSetsCount),
    examSlotsLabel: fmtCount(e.totalSlots),
  };
}

function toExamDetail(e: StoredExam): Exam {
  return {
    id: e.id,
    title: e.title,
    totalUsers: e.totalUsers ?? 0,
    totalSlots: e.totalSlots ?? 0,
    questionSetsCount: e.questionSetsCount ?? 0,
    questionType: e.questionType,
    startTime: e.startTime,
    endTime: e.endTime,
    durationMinutes: e.durationMinutes,
    questions: e.questions,
  };
}

const initial: StoredExam[] = [
  {
    id: "1",
    title: "Psychometric Test for Management Trainee Officer",
    totalUsers: 10000,
    totalSlots: 3,
    questionSetsCount: 3,
    questionType: "MCQ",
    startTime: "2026-04-01T09:00:00",
    endTime: "2026-04-30T18:00:00",
    durationMinutes: 60,
    questions: [],
  },
  {
    id: "2",
    title: "Psychometric Test for Management Trainee Officer",
    totalUsers: null,
    totalSlots: null,
    questionSetsCount: null,
    startTime: "",
    endTime: "",
    durationMinutes: 0,
    questions: [],
  },
  {
    id: "3",
    title: "Psychometric Test for Management Trainee Officer",
    totalUsers: 10000,
    totalSlots: 3,
    questionSetsCount: 3,
    questionType: "MCQ",
    startTime: "2026-05-01T09:00:00",
    endTime: "2026-05-31T18:00:00",
    durationMinutes: 60,
    questions: [],
  },
  {
    id: "4",
    title: "Psychometric Test for Management Trainee Officer",
    totalUsers: null,
    totalSlots: 3,
    questionSetsCount: 3,
    questionType: "MCQ",
    startTime: "2026-06-01T09:00:00",
    endTime: "2026-06-30T18:00:00",
    durationMinutes: 45,
    questions: [],
  },
];

let exams: StoredExam[] = initial.map((e) => ({ ...e, questions: [...e.questions] }));

export function listExamSummaries(): ExamSummary[] {
  return exams.map(toSummary);
}

export function getExamById(id: string): StoredExam | undefined {
  return exams.find((e) => e.id === id);
}

export function getExamDetail(id: string): Exam | null {
  const e = getExamById(id);
  return e ? toExamDetail(e) : null;
}

export function createExam(
  payload: Pick<StoredExam, "title"> &
    Partial<
      Omit<StoredExam, "id" | "title" | "questions"> & {
        questions?: Exam["questions"];
      }
    >,
): ExamSummary {
  const id = String(
    Math.max(0, ...exams.map((e) => Number.parseInt(e.id, 10) || 0)) + 1,
  );
  const row: StoredExam = {
    id,
    title: payload.title,
    totalUsers: payload.totalUsers ?? null,
    totalSlots: payload.totalSlots ?? null,
    questionSetsCount: payload.questionSetsCount ?? null,
    questionType: payload.questionType,
    startTime: payload.startTime ?? "",
    endTime: payload.endTime ?? "",
    durationMinutes: payload.durationMinutes ?? 0,
    questions: payload.questions ?? [],
  };
  exams = [...exams, row];
  return toSummary(row);
}

export function updateExam(
  id: string,
  patch: Partial<Omit<StoredExam, "id" | "questions">> & {
    questions?: Exam["questions"];
  },
): StoredExam | null {
  const idx = exams.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const next = { ...exams[idx], ...patch, id };
  if (patch.questions) next.questions = patch.questions;
  exams = [...exams.slice(0, idx), next, ...exams.slice(idx + 1)];
  return next;
}

export function deleteExam(id: string): boolean {
  const before = exams.length;
  exams = exams.filter((e) => e.id !== id);
  return exams.length < before;
}
