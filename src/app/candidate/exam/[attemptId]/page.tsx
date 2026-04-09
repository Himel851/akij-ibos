type PageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function CandidateExamPage({ params }: PageProps) {
  const { attemptId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Exam</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Attempt ID: {attemptId} — timer, questions, submit — implement here.
      </p>
    </div>
  );
}
