type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function ExamUsersPage({ params }: PageProps) {
  const { examId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Users</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Exam ID: {examId} — implement list here.
      </p>
    </div>
  );
}
