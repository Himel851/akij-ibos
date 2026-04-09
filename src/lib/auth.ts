import type { AuthRole } from "@/types/user";

export type SessionPayload = {
  role: AuthRole;
  email: string;
};
