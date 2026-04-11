import type { ExamCandidateRow, ExamCandidateStatus } from "@/types/exam-candidate";

const FIRST = [
  "Ayesha",
  "Rafiq",
  "Nusrat",
  "Karim",
  "Sumaiya",
  "Tanvir",
  "Farhana",
  "Imran",
  "Shuvo",
  "Maliha",
];
const LAST = [
  "Rahman",
  "Chowdhury",
  "Islam",
  "Hossain",
  "Ahmed",
  "Begum",
  "Khan",
  "Ali",
  "Das",
  "Talukder",
];

function hashExamId(examId: string): number {
  let h = 0;
  for (let i = 0; i < examId.length; i += 1) {
    h = (h * 31 + examId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickStatus(seed: number, index: number): ExamCandidateStatus {
  const r = (seed + index * 17) % 100;
  if (r < 45) return "completed";
  if (r < 78) return "in_progress";
  return "not_started";
}

function formatActivityIso(seed: number, index: number): string {
  const daysAgo = (seed + index * 3) % 14;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(9 + (index % 8), (seed + index) % 60, 0, 0);
  return d.toISOString();
}

/**
 * Deterministic demo rows for employer “View candidates”. Replace with DB when available.
 * Caps row count so huge `totalUsers` values stay usable in the UI.
 */
export function buildMockCandidatesForExam(
  examId: string,
  totalUsers: number,
  maxRows = 40,
): ExamCandidateRow[] {
  if (totalUsers <= 0) return [];
  const n = Math.min(totalUsers, maxRows);
  const seed = hashExamId(examId);
  const rows: ExamCandidateRow[] = [];
  for (let i = 0; i < n; i += 1) {
    const fi = (seed + i * 5) % FIRST.length;
    const li = (seed + i * 7) % LAST.length;
    const status = pickStatus(seed, i);
    const scorePercent =
      status === "completed" ? 55 + ((seed + i * 11) % 46) : null;
    const correctCount = status === "completed" ? 2 + ((seed + i * 3) % 6) : null;
    const wrongCount = status === "completed" ? (seed + i) % 4 : null;
    const skippedCount = status === "completed" ? (i % 3) : null;
    const maxPoints = status === "completed" ? 20 : null;
    const totalPoints =
      status === "completed" && maxPoints !== null
        ? Math.round((scorePercent ?? 0) / 100 * maxPoints * 100) / 100
        : null;
    rows.push({
      id: `${examId}-cand-${i + 1}`,
      name: `${FIRST[fi]} ${LAST[li]}`,
      email: `candidate.${examId.slice(0, 8)}.${i + 1}@example.com`,
      status,
      scorePercent,
      lastActivityAt: formatActivityIso(seed, i),
      correctCount,
      wrongCount,
      skippedCount,
      totalPoints,
      maxPoints,
    });
  }
  return rows;
}
