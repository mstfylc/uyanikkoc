// Kurum — Raporlar. apps/web/components/admin/branch/BranchReports.tsx
// Prototip kaynağı: admin/kurum2.jsx (KurumReports).
"use client";

import { Donut, Icon, Legend, RankBars, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { orgStudents } from "@/lib/admin/derive";
import { downloadText } from "@/lib/admin/csv";

export function BranchReports() {
  const { snapshot, activeOrgId, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const students = orgStudents(o);
  const avgNet = Math.round(students.reduce((s, x) => s + x.net, 0) / Math.max(1, students.length));
  const dist = [
    { l: "150+ net", v: students.filter((s) => s.net >= 150).length, color: "var(--success)" },
    { l: "100-149", v: students.filter((s) => s.net >= 100 && s.net < 150).length, color: "var(--primary)" },
    { l: "60-99", v: students.filter((s) => s.net >= 60 && s.net < 100).length, color: "var(--warning)" },
    { l: "60 altı", v: students.filter((s) => s.net < 60).length, color: "var(--danger)" },
  ];
  const subjects = [
    { l: "Türkçe", v: 32 },
    { l: "Matematik", v: 28 },
    { l: "Fen", v: 17 },
    { l: "Sosyal", v: 15 },
  ];

  return (
    <div className="stack rise">
      <UkPageHead
        title="Raporlar"
        sub="Kurum geneli performans ve analitik"
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-primary" onClick={() => { downloadText("kurum-raporu.txt", [o.name + " — KURUM RAPORU", "", "Öğrenci: " + o.seats.used, "Ortalama net: " + avgNet, "Risk altında: " + students.filter((s) => s.status === "risk").length].join("\n")); toast("Rapor indirildi", { icon: "ki-cloud-download" }); }}>
              <Icon name="download" size={16} />PDF rapor
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <StatCard icon="target" tone="success" value={avgNet} label="Ortalama net" delta="+4,1" />
        <StatCard icon="trend" tone="primary" value="+%12" label="3 aylık gelişim" />
        <StatCard icon="checkCircle" tone="info" value={"%" + Math.round(students.reduce((s, x) => s + x.attend, 0) / Math.max(1, students.length))} label="Devam oranı" />
        <StatCard icon="award" tone="warning" value={students.filter((s) => s.net >= 150).length} label="Yüksek başarı" />
      </div>

      <div className="grid col-main">
        <UkSection title="Net dağılımı" sub="Tüm öğrenciler">
          <div className="card-body" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <Donut slices={dist} center={{ v: students.length, l: "öğrenci" }} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <Legend items={dist.map((d) => ({ l: d.l, color: d.color, v: d.v }))} />
            </div>
          </div>
        </UkSection>
        <UkSection title="Branş bazında ortalama net">
          <div className="card-body">
            <RankBars items={subjects} max={40} color={o.tone} />
          </div>
        </UkSection>
      </div>

      {o.type === "franchise" ? (
        <UkSection title="Şube performans karşılaştırması" sub="Ortalama net (örnek veri)">
          <div className="card-body">
            <RankBars items={o.branches.map((b, i) => ({ l: b.name, v: 88 + ((i * 13) % 28) }))} max={120} color="var(--primary)" />
          </div>
        </UkSection>
      ) : null}
    </div>
  );
}
