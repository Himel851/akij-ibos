/**
 * Client-only: timer, answers draft, proctoring events (tab blur, fullscreen exit).
 * Add Zustand when implementing user exam screen.
 */
export type ProctoringEvent = {
  type: "visibility" | "fullscreen";
  at: string;
};
