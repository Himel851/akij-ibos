export type AuthRole = "employer" | "candidate";

export type User = {
  id: string;
  email: string;
  role: AuthRole;
  name?: string;
};
