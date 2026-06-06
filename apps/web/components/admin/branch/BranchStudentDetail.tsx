// Kurum — Öğrenci detay / rapor. apps/web/components/admin/branch/BranchStudentDetail.tsx
// Yeni ekran: öğrenci gelişim raporu (net trend, branş, devam, koç).
"use client";

import Link from "next/link";

import { Icon, RankBars, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { orgStudents } from "@/lib/admin/derive";

function hashNum(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function BranchStudentDetail({ studentId }: { studentId: string }) {
  const { snapshot, activeOrgId } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const student = orgStudents(o).find((s) => s.id === studentId);
  if (!student) {
    return (
      <div className="stack rise">
        <Link href="/yonetim/students" className="link-btn">
          <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Öğrencilere dön
        </Link>
        <div className="empty-state">
          <Icon name="cap" size={26} style={{ color: "var(--faint)" }} />
          <div style={{ fontWeight: 700 }}>Öğrenci bulunamadı</div>
        </div>
      </div>
    );
  }

  const h = hashNum(student.id);
  const trend = Array.from({ length: 10 }, (_, i) => Math.round(student.net * (0.74 + i * 0.03) + ((h >> i) % 7)));
  const subjects = [
    { l: "Türkçe", v: 28 + (h % 12) },
    { l: "Matematik", v: 22 + ((h >> 2) % 16) },
    { l: "Fen", v: 12 + ((h >> 3) % 8) },
    { l: "Sosyal", v: 11 + ((h >> 4) % 8) },
  ];

  return (
    <div className="stack rise">
      <Link href="/yonetim/students" className="link-btn" style={{ alignSelf: "flex-start" }}>
        <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Öğrencilere dön
      </Link>

      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <UkAvatar name={student.name} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{student.name}</h1>
            {student.status === "risk" ? <span className="badge badge-danger" style={{ height: 22 }}><Icon name="alert" size={12} />Risk altında</span> : <span className="badge badge-success" style={{ height: 22 }}><span className="dot-live" />Aktif</span>}
          </div>
          <p className="muted" style={{ fontSize: 13 }}>{student.grade} · {student.branch} · Koç: {student.coach}</p>
        </div>
      </div>

      <div className="grid g-4">
        <StatCard icon="target" tone="primary" value={student.net} label="Güncel net (TYT)" delta="+6,2" />
        <StatCard icon="checkCircle" tone="info" value={`%${student.attend}`} label="Devam oranı" />
        <StatCard icon="trend" tone="success" value="+%14" label="3 aylık gelişim" />
        <StatCard icon="award" tone="warning" value={student.net >= 110 ? "Yüksek" : "Orta"} label="Başarı seviyesi" />
      </div>

      <div className="grid col-main">
        <UkSection title="Net gelişimi" sub="Son 10 deneme" action={<span className="badge badge-success"><Icon name="trend" size={13} />Yükseliş</span>}>
          <div className="card-body">
            <UkSparkline data={trend} width={640} height={130} color={o.tone} />
          </div>
        </UkSection>
        <UkSection title="Branş bazında net">
          <div className="card-body">
            <RankBars items={subjects} max={40} color={o.tone} />
          </div>
        </UkSection>
      </div>

      <UkSection title="Öğrenci bilgileri">
        <div className="card-body" style={{ padding: 0 }}>
          {[
            ["Sınıf", student.grade],
            ["Şube", student.branch],
            ["Koç", student.coach],
            ["Devam oranı", `%${student.attend}`],
            ["Durum", student.status === "risk" ? "Risk altında" : "Aktif"],
          ].map(([k, v]) => (
            <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}>
              <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
              <b style={{ fontSize: 13 }}>{v}</b>
            </div>
          ))}
        </div>
      </UkSection>
    </div>
  );
}
