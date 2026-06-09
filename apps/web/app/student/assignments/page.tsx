import { StudentAssignmentList } from "@/components/demo-flow/StudentAssignmentList";
import { StudentResourcesCard } from "@/components/student/StudentResourcesCard";

export default function StudentAssignmentsPage() {
  return (
    <div className="stack">
      <StudentAssignmentList />
      <StudentResourcesCard />
    </div>
  );
}
