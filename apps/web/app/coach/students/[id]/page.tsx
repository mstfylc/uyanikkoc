import { CoachStudentDetail } from "@/components/coach/CoachStudentDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CoachStudentPage({ params }: PageProps) {
  const { id } = await params;
  return <CoachStudentDetail studentId={id} />;
}
