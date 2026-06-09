import { CreateAssignmentPanel } from "@/components/demo-flow/CreateAssignmentPanel";
import { UkPageHead } from "@/components/design/UkPageHead";

export default function CoachCreateAssignmentPage() {
  return (
    <div className="stack rise">
      <UkPageHead title="Odev Ata" sub="Ogrenciye yeni calisma, tekrar veya sinav hazirligi tanimla" />
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Yeni Odev</h3>
            <p className="sub">Tur, oncelik, ders ve son tarih bilgilerini doldur</p>
          </div>
        </div>
        <div className="card-body">
          <CreateAssignmentPanel />
        </div>
      </div>
    </div>
  );
}
