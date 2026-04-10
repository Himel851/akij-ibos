export type BasicInfo = {
  title: string;
  totalCandidates: string;
  totalSlots: string;
  totalQuestionSet: string;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: string;
};

const STORAGE_KEY = "akij-manage-test-basic-info";
const EXAM_DRAFT_ID_KEY = "akij-manage-test-exam-id";

/** @deprecated Basic info lives in Supabase; kept for one-shot migration from old session keys. */
export function saveBasicInfo(data: BasicInfo): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** @deprecated Use draft exam id + GET /api/exams/:id */
export function loadBasicInfo(): BasicInfo | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BasicInfo;
  } catch {
    return null;
  }
}

export function clearBasicInfo(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getDraftExamId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(EXAM_DRAFT_ID_KEY);
}

export function setDraftExamId(id: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXAM_DRAFT_ID_KEY, id);
}

export function clearDraftExamId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EXAM_DRAFT_ID_KEY);
}

export function clearManageTestSession(): void {
  clearBasicInfo();
  clearDraftExamId();
}
