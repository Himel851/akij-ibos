import type { AuthRole } from "@/types/user";

export const RESERVED_EMPLOYER_EMAIL = "admin@gmail.com";

export function isReservedEmployerEmail(email: string): boolean {
  return email.trim().toLowerCase() === RESERVED_EMPLOYER_EMAIL;
}

export type SessionPayload = {
  role: AuthRole;
  email: string;
};
