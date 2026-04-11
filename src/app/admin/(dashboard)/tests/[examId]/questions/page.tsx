import { QuestionsStep } from "@/components/admin/manage-test/questions-step";

type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function ExamQuestionsPage({ params }: PageProps) {
  const { examId } = await params;
  return <QuestionsStep examId={examId} />;
}
