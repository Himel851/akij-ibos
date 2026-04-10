import { NEGATIVE_MARK_PER_WRONG } from "@/lib/exam-display";
import type { ExamQuestion } from "@/types/question";

export type UserAnswer =
  | { kind: "radio"; optionId: string }
  | { kind: "checkbox"; optionIds: string[] }
  | { kind: "text"; text: string };

export type ExamScoreResult = {
  earnedPoints: number;
  penaltyPoints: number;
  /** max(0, earned - penalty) */
  totalPoints: number;
  maxPossiblePoints: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
};

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export function computeExamScore(
  questions: ExamQuestion[],
  answers: Record<string, UserAnswer | undefined>,
  skippedIds: Set<string>,
): ExamScoreResult {
  let earnedPoints = 0;
  let penaltyPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  const maxPossiblePoints = questions.reduce((s, q) => s + (q.score || 0), 0);

  for (const q of questions) {
    if (skippedIds.has(q.id)) {
      skippedCount += 1;
      continue;
    }

    const ans = answers[q.id];
    const correctIds = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));

    if (q.type === "text") {
      const text = ans?.kind === "text" ? ans.text.trim() : "";
      if (text.length > 0) {
        earnedPoints += q.score || 0;
        correctCount += 1;
      }
      continue;
    }

    if (q.type === "radio") {
      if (!ans || ans.kind !== "radio") {
        penaltyPoints += NEGATIVE_MARK_PER_WRONG;
        wrongCount += 1;
        continue;
      }
      const picked = ans.optionId;
      const correctArr = [...correctIds];
      const ok = correctArr.length === 1 && picked === correctArr[0];
      if (ok) {
        earnedPoints += q.score || 0;
        correctCount += 1;
      } else {
        penaltyPoints += NEGATIVE_MARK_PER_WRONG;
        wrongCount += 1;
      }
      continue;
    }

    if (q.type === "checkbox") {
      if (!ans || ans.kind !== "checkbox") {
        penaltyPoints += NEGATIVE_MARK_PER_WRONG;
        wrongCount += 1;
        continue;
      }
      const picked = new Set<string>(ans.optionIds);
      if (setsEqual(picked, correctIds)) {
        earnedPoints += q.score || 0;
        correctCount += 1;
      } else {
        penaltyPoints += NEGATIVE_MARK_PER_WRONG;
        wrongCount += 1;
      }
    }
  }

  const totalPoints = Math.max(0, earnedPoints - penaltyPoints);

  return {
    earnedPoints,
    penaltyPoints,
    totalPoints,
    maxPossiblePoints,
    correctCount,
    wrongCount,
    skippedCount,
  };
}
