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

/** Candidate dashboard — draft or published exams with a title */
export type UserExamListItem = {
  id: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
  negativeMarkingLabel: string;
};

/** Logged-in user's own submit history (profile / my attempts). */
export type UserOwnAttemptRow = {
  id: string;
  examId: string;
  examTitle: string;
  scorePercent: number | null;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalPoints: number | null;
  maxPoints: number | null;
  submittedAt: string;
};
