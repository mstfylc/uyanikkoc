import { StudentAssignmentList } from "@/components/demo-flow/StudentAssignmentList";
import { UkPageHead } from "@/components/design/UkPageHead";
import { StudentResourcesCard } from "@/components/student/StudentResourcesCard";

export default function StudentAssignmentsPage() {
  return (
    <div className="stack rise">
      <UkPageHead title="Odevlerim" sub="Kocun tarafindan atanan calismalari takip et" />
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Aktif Odevler</h3>
            <p className="sub">Tamamlanan ve bekleyen gorevlerin</p>
          </div>
        </div>
        <div className="card-body">
          <StudentAssignmentList />
        </div>
      </div>
      <StudentResourcesCard />
    </div>
  );
}
