export type AuthRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  role: AuthRole;
  name?: string;
};
