import { UserProfileAttemptsTable } from "@/components/user/user-profile-attempts-table";
import { listExamAttemptsForUserPersisted } from "@/lib/exam-attempts-persistence";
import { hasSupabaseServiceConfig } from "@/lib/supabase/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserProfilePage() {
  let userId: string;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      redirect("/user/login");
    }
    userId = user.id;
  } catch {
    redirect("/user/login");
  }

  let attempts: Awaited<ReturnType<typeof listExamAttemptsForUserPersisted>> = [];
  if (hasSupabaseServiceConfig()) {
    try {
      attempts = await listExamAttemptsForUserPersisted(userId);
    } catch {
      attempts = [];
    }
  }

  return (
    <div className="mx-auto w-full max-w-container flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/user"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Online Tests
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
             My results
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Tests you have submitted.
          </p>
        </div>

        <UserProfileAttemptsTable attempts={attempts} dbConfigured={hasSupabaseServiceConfig()} />
      </div>
    </div>
  );
}
