import { CoachExamEntryForm } from "@/components/coach/CoachExamEntryForm";

export default function CoachExamsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-mono">Deneme Girisi</h1>
        <p className="text-sm text-muted-foreground">Ogrenci adina TYT/AYT sonucu kaydet</p>
      </div>
      <CoachExamEntryForm />
    </div>
  );
}
