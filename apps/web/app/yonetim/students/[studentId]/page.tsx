import { BranchStudentDetail } from "@/components/admin/branch/BranchStudentDetail";

export default async function YonetimStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <BranchStudentDetail studentId={studentId} />;
}
