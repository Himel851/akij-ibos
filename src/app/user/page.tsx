import { UserExamsDashboard } from "@/components/user/user-exams-dashboard";
import { listPublishedExamsForCandidate } from "@/lib/exams-persistence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserDashboardPage() {
  let exams: Awaited<ReturnType<typeof listPublishedExamsForCandidate>> = [];
  try {
    exams = await listPublishedExamsForCandidate();
  } catch {
    exams = [];
  }

  return <UserExamsDashboard exams={exams} />;
}
