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

export function saveBasicInfo(data: BasicInfo): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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
