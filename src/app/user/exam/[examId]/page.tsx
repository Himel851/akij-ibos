import { UserExamRunner } from "@/components/user/exam/user-exam-runner";
import { getExamDetailPersisted } from "@/lib/exams-persistence";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function UserExamPage({ params }: PageProps) {
  const { examId } = await params;
  const exam = await getExamDetailPersisted(examId);
  if (!exam || !exam.title.trim()) {
    notFound();
  }

  return <UserExamRunner exam={exam} />;
}
