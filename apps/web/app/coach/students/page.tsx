import { CoachStudentRoster } from "@/components/coach/CoachStudentRoster";

export default function CoachStudentsPage() {
  return (
    <div className="flex flex-col gap-5" data-testid="coach-students-page">
      <div>
        <h1 className="text-xl font-semibold text-mono">Ogrencilerim</h1>
        <p className="text-sm text-muted-foreground">Koç roster — ogrenci detayina gecin</p>
      </div>
      <CoachStudentRoster />
    </div>
  );
}
