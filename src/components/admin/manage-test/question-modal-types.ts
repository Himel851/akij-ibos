import type { QuestionType } from "@/types/question";

export type DraftOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type DraftQuestionPayload = {
  score: number;
  type: QuestionType;
  prompt: string;
  options: DraftOption[];
};
