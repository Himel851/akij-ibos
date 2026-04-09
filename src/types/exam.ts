import type { Question } from "./question";

export type Exam = {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSetsCount: number;
  questionType?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  questions: Question[];
};
