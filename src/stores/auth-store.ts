import type { User } from "@/types/user";

/**
 * Add Zustand: pnpm add zustand
 * Persist session (e.g. localStorage) for reloads.
 */
export type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
};
