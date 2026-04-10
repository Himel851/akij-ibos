import { ADMIN_SESSION_COOKIE } from "@/lib/auth-session";

export function isAdminSessionRequest(request: Request): boolean {
  const raw = request.headers.get("cookie");
  if (!raw) return false;
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_SESSION_COOKIE && rest.join("=") === "1") return true;
  }
  return false;
}
