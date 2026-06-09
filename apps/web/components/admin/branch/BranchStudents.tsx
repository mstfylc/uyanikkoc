// Kurum — Öğrenciler. apps/web/components/admin/branch/BranchStudents.tsx
// Prototip kaynağı: admin/kurum.jsx (KurumStudents). Yeni: öğrenci detayına git.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { orgStudents } from "@/lib/admin/derive";
import { downloadCSV } from "@/lib/admin/csv";

const PER = 12;

export function BranchStudents() {
  const { snapshot, activeOrgId, toast } = useAdminStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [page, setPage] = useState(0);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const students = orgStudents(o);
  const branchName = o.branches.find((b) => b.id === branch)?.name;
  const filtered = students.filter(
    (s) => (branch === "all" || s.branch === branchName) && s.name.toLowerCase().includes(q.toLowerCase()),
  );
  const pages = Math.ceil(filtered.length / PER);
  const shown = filtered.slice(page * PER, page * PER + PER);
  const risk = students.filter((s) => s.status === "risk").length;

  return (
    <div className="stack rise">
      <UkPageHead
        title="Öğrenciler"
        sub={`${students.length} öğrenci · ${o.seats.total - students.length} koltuk boş`}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-light" onClick={() => { downloadCSV("ogrenciler.csv", [["Öğrenci", "Sınıf", "Şube", "Koç", "Net", "Devam"], ...students.map((s) => [s.name, s.grade, s.branch, s.coach, s.net, s.attend + "%"])]); toast("Liste indirildi", { icon: "ki-cloud-download" }); }}>
              <Icon name="download" size={16} />Dışa aktar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => toast("Öğrenci ekleme akışı", { icon: "ki-plus" })}>
              <Icon name="plus" size={16} />Öğrenci ekle
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={students.length} label="Toplam öğrenci" />
        <StatCard icon="target" tone="success" value={Math.round(students.reduce((s, x) => s + x.net, 0) / Math.max(1, students.length))} label="Ortalama net" />
        <StatCard icon="checkCircle" tone="info" value={"%" + Math.round(students.reduce((s, x) => s + x.attend, 0) / Math.max(1, students.length))} label="Ortalama devam" />
        <StatCard icon="alert" tone="danger" value={risk} label="Risk altında" />
      </div>

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        {o.type === "franchise" ? (
          <div className="seg" style={{ flexWrap: "wrap" }}>
            <button type="button" className={branch === "all" ? "on" : ""} onClick={() => { setBranch("all"); setPage(0); }}>Tümü</button>
            {o.branches.map((b) => (
              <button key={b.id} type="button" className={branch === b.id ? "on" : ""} onClick={() => { setBranch(b.id); setPage(0); }}>{b.name.replace(" Şubesi", "")}</button>
            ))}
          </div>
        ) : <div />}
        <div className="searchbox" style={{ maxWidth: 260 }}>
          <Icon name="search" size={17} />
          <input placeholder="Öğrenci ara..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Sınıf</th>
                {o.type === "franchise" ? <th>Şube</th> : null}
                <th>Koç</th>
                <th>Net</th>
                <th>Devam</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/branch/students/${s.id}`)}>
                  <td>
                    <div className="name">
                      <UkAvatar name={s.name} size={34} />
                      <div><b>{s.name}{s.status === "risk" ? <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Risk</span> : null}</b><span>Öğrenci</span></div>
                    </div>
                  </td>
                  <td><span className="muted" style={{ fontSize: 12.5 }}>{s.grade}</span></td>
                  {o.type === "franchise" ? <td><span className="muted" style={{ fontSize: 12.5 }}>{s.branch.replace(" Şubesi", "")}</span></td> : null}
                  <td><span style={{ fontSize: 12.5 }}>{s.coach}</span></td>
                  <td><span className="tnum" style={{ fontWeight: 700 }}>{s.net}</span></td>
                  <td><span className="tnum" style={{ color: s.attend < 80 ? "var(--warning)" : "var(--text-2)" }}>%{s.attend}</span></td>
                  <td style={{ textAlign: "right" }}><Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 ? (
          <div className="between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            <span className="muted" style={{ fontSize: 12.5 }}>{filtered.length} öğrenci · sayfa {page + 1}/{pages}</span>
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="btn btn-light btn-sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Önceki</button>
              <button type="button" className="btn btn-light btn-sm" disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>Sonraki</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
