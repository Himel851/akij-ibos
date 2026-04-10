import type { BasicInfo } from "@/lib/manage-test-storage";
import type { Exam } from "@/types/exam";

function parseIntOrNull(s: string): number | null {
  const n = Number.parseInt(s.trim(), 10);
  return Number.isFinite(n) ? n : null;
}

export function examToBasicInfo(exam: Exam): BasicInfo {
  return {
    title: exam.title,
    totalCandidates:
      exam.totalUsers !== undefined && exam.totalUsers !== null
        ? String(exam.totalUsers)
        : "",
    totalSlots:
      exam.totalSlots !== undefined && exam.totalSlots !== null
        ? String(exam.totalSlots)
        : "",
    totalQuestionSet:
      exam.questionSetsCount !== undefined && exam.questionSetsCount !== null
        ? String(exam.questionSetsCount)
        : "",
    questionType: exam.questionType ?? "",
    startTime: exam.startTime ?? "",
    endTime: exam.endTime ?? "",
    duration:
      exam.durationMinutes !== undefined && exam.durationMinutes !== null
        ? String(exam.durationMinutes)
        : "",
  };
}

export function basicInfoToExamPatch(data: BasicInfo) {
  return {
    title: data.title.trim(),
    totalUsers: parseIntOrNull(data.totalCandidates),
    totalSlots: parseIntOrNull(data.totalSlots),
    questionSetsCount: parseIntOrNull(data.totalQuestionSet),
    questionType: data.questionType.trim() || undefined,
    startTime: data.startTime.trim(),
    endTime: data.endTime.trim(),
    durationMinutes: parseIntOrNull(data.duration) ?? 0,
  };
}
