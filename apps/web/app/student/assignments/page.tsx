import { StudentAssignmentList } from "@/components/demo-flow/StudentAssignmentList";

export default function StudentAssignmentsPage() {
  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Odev Listesi</h1>
      <StudentAssignmentList />
    </main>
  );
}
