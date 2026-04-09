import type { Question } from "./question";

/** Full exam — detail API / editor. */
export type Exam = {
  id: string;
  title: string;
  totalUsers: number;
  totalSlots: number;
  questionSetsCount: number;
  questionType?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  questions: Question[];
};

/** Admin dashboard card row — returned by GET /api/exams */
export type ExamSummary = {
  id: string;
  title: string;
  candidatesLabel: string;
  questionSetLabel: string;
  examSlotsLabel: string;
};
