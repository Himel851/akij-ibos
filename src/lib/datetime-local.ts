/** Helpers for `<input type="datetime-local" />` ↔ ISO strings in storage. */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Convert ISO or empty string to `YYYY-MM-DDTHH:mm` for datetime-local input. */
export function isoToDatetimeLocal(iso: string): string {
  if (!iso.trim()) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local value to ISO string for persistence. */
export function datetimeLocalToIso(local: string): string {
  if (!local.trim()) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

/** Minutes between two datetime-local strings; empty if invalid or end ≤ start. */
export function minutesBetweenDatetimeLocal(
  startLocal: string,
  endLocal: string,
): string {
  if (!startLocal || !endLocal) return "";
  const a = new Date(startLocal).getTime();
  const b = new Date(endLocal).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return "";
  return String(Math.round((b - a) / 60_000));
}

/** Human-readable label for an ISO date string. */
export function formatIsoForDisplay(iso: string, locale = "en-GB"): string {
  if (!iso.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
