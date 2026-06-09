import { StudentAssignmentsPanel } from "@/components/student/StudentAssignmentsPanel";
import { StudentResourcesCard } from "@/components/student/StudentResourcesCard";

export default function StudentAssignmentsPage() {
  return <StudentAssignmentsPanel resources={<StudentResourcesCard />} />;
}
