import type {
  ExamAdminTableRow,
  ExamCandidateRow,
  ExamCandidateStatus,
} from "@/types/exam-candidate";

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

/** Demo: multiple table rows per user when they have several completed attempts. */
export function buildMockExamAdminTableRowsForExam(
  examId: string,
  totalUsers: number,
  maxRows = 40,
): ExamAdminTableRow[] {
  const base = buildMockCandidatesForExam(examId, totalUsers, maxRows);
  const seed = hashExamId(examId);
  const out: ExamAdminTableRow[] = [];
  for (let i = 0; i < base.length; i += 1) {
    const c = base[i];
    if (c.status === "not_started") continue;
    const nAttempts =
      c.status === "completed" ? 1 + ((seed + i * 13) % 3) : 1;
    for (let a = 0; a < nAttempts; a += 1) {
      const t = new Date(c.lastActivityAt);
      t.setUTCHours(t.getUTCHours() - a * 2);
      const jitter = (seed + i * 11 + a * 7) % 20;
      const correct =
        c.correctCount !== null ? Math.max(0, c.correctCount - a + (jitter % 3)) : null;
      const wrong =
        c.wrongCount !== null ? Math.max(0, c.wrongCount + (a % 2)) : null;
      const skipped = c.skippedCount;
      const maxPts = c.maxPoints;
      const totalPts =
        correct !== null &&
        wrong !== null &&
        skipped !== null &&
        maxPts !== null
          ? Math.round(
              (correct / Math.max(1, correct + wrong + skipped)) * maxPts * 100,
            ) / 100
          : c.totalPoints;
      const pct =
        totalPts !== null && maxPts !== null && maxPts > 0
          ? Math.min(100, Math.round((totalPts / maxPts) * 100))
          : c.scorePercent;
      out.push({
        id: `${c.id}-att-${a}`,
        name: c.name,
        email: c.email,
        status: c.status === "in_progress" && a === 0 ? "in_progress" : "completed",
        scorePercent: pct,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        totalPoints: totalPts,
        maxPoints: maxPts,
        submittedAt: t.toISOString(),
      });
    }
  }
  return out;
}
