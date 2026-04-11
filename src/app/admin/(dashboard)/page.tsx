import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { fetchExamSummariesFromApi } from "@/lib/data/exams";

/** Always read exams from DB on each request (avoid static snapshot on Vercel). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let tests: Awaited<ReturnType<typeof fetchExamSummariesFromApi>> = [];
  try {
    tests = await fetchExamSummariesFromApi();
  } catch {
    tests = [];
  }

  return <AdminDashboardClient tests={tests} />;
}
