export type QuestionType = "checkbox" | "radio" | "text";

export type McqOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

/** Stored in `exams.questions` (jsonb) — wizard + API detail. */
export type ExamQuestion = {
  id: string;
  score: number;
  type: QuestionType;
  prompt: string;
  options: McqOption[];
};

/** Alias — same as `ExamQuestion` (legacy name). */
export type Question = ExamQuestion;
