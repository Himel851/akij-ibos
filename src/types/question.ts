export type QuestionType = "checkbox" | "radio" | "text";

export type Question = {
  id: string;
  title: string;
  type: QuestionType;
  options?: string[];
};
