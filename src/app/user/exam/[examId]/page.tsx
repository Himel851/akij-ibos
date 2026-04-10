type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function UserExamPage({ params }: PageProps) {
  const { examId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Exam</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Exam ID: {examId} — timer, questions, submit — implement here.
      </p>
    </div>
  );
}
