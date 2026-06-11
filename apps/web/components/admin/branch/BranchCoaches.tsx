// Kurum — Koçlar. apps/web/components/admin/branch/BranchCoaches.tsx
// Prototip kaynağı: admin/kurum.jsx (KurumCoaches). Yeni: görev ata, sistemden çıkar, koç detayına git.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmModal, EmptyState, Icon, StatCard, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { AssignTaskDialog, InviteCoachDialog } from "@/components/admin/dialogs";
import { getActiveOrg, visibleOrgCoaches } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { downloadCSV } from "@/lib/admin/csv";

export function BranchCoaches() {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<{ id: string; name: string } | null>(null);
  const [removeFor, setRemoveFor] = useState<{ id: string; name: string } | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const coaches = visibleOrgCoaches(snapshot, o);
  const removedCount = snapshot.removedCoachIds.length;
  const list = coaches.filter((c) => (branch === "all" || c.branchId === branch) && c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="stack rise">
      <UkPageHead
        title="Koçlar"
        sub={`${coaches.length} koç · ${o.coaches.total} kapasite`}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-light" onClick={() => { downloadCSV("koclar.csv", [["Koç", "Şube", "Öğrenci", "Puan", "Doluluk"], ...coaches.map((c) => [c.name, c.branch, c.students, c.rating, c.load + "%"])]); toast("Liste indirildi", { icon: "ki-cloud-download" }); }}>
              <Icon name="download" size={16} />Dışa aktar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(true)}>
              <Icon name="plus" size={16} />Koç davet et
            </button>
          </div>
        }
      />

      <div className="grid g-3">
        <StatCard icon="users" tone="primary" value={coaches.length} label="Toplam koç" />
        <StatCard icon="star" tone="warning" value={(coaches.reduce((s, c) => s + parseFloat(c.rating), 0) / Math.max(1, coaches.length)).toFixed(1)} label="Ortalama puan" />
        <StatCard icon="cap" tone="success" value={Math.round(coaches.reduce((s, c) => s + c.students, 0) / Math.max(1, coaches.length))} label="Koç başına öğrenci" />
      </div>

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        {o.type === "franchise" ? (
          <div className="seg" style={{ flexWrap: "wrap" }}>
            <button type="button" className={branch === "all" ? "on" : ""} onClick={() => setBranch("all")}>Tüm şubeler</button>
            {o.branches.map((b) => (
              <button key={b.id} type="button" className={branch === b.id ? "on" : ""} onClick={() => setBranch(b.id)}>{b.name.replace(" Şubesi", "")}</button>
            ))}
          </div>
        ) : <div />}
        <div className="searchbox" style={{ maxWidth: 260 }}>
          <Icon name="search" size={17} />
          <input placeholder="Koç ara..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Koç</th>
                {o.type === "franchise" ? <th>Şube</th> : null}
                <th>Öğrenci</th>
                <th>Puan</th>
                <th>Doluluk</th>
                <th>Durum</th>
                <th style={{ textAlign: "right" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="name" style={{ cursor: "pointer" }} onClick={() => router.push(`/yonetim/coaches/${c.id}`)}>
                      <UkAvatar name={c.name} size={34} />
                      <div><b>{c.name}</b><span>Koç</span></div>
                    </div>
                  </td>
                  {o.type === "franchise" ? <td><span className="muted" style={{ fontSize: 12.5 }}>{c.branch}</span></td> : null}
                  <td><span className="tnum" style={{ fontWeight: 700 }}>{c.students}</span></td>
                  <td><span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span></td>
                  <td style={{ minWidth: 120 }}>
                    <div className="meter-bar" style={{ width: 100 }}>
                      <span style={{ width: c.load + "%", background: c.load > 90 ? "var(--danger)" : c.load > 75 ? "var(--warning)" : "var(--success)" }} />
                    </div>
                  </td>
                  <td><StatusBadge status={c.status} sm /></td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-light btn-sm" onClick={() => setAssignFor({ id: c.id, name: c.name })}>
                        <Icon name="flag" size={14} />Görev ata
                      </button>
                      <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} title="Detay" onClick={() => router.push(`/yonetim/coaches/${c.id}`)}>
                        <Icon name="chevronRight" size={16} />
                      </button>
                      <button type="button" className="icon-btn" style={{ width: 32, height: 32, color: "var(--danger)" }} title="Sistemden çıkar" onClick={() => setRemoveFor({ id: c.id, name: c.name })}>
                        <Icon name="logout" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {list.length === 0 ? <EmptyState icon="users" title="Koç bulunamadı" /> : null}

      {removedCount > 0 ? (
        <div className="alert-strip">
          <span className="as-ic"><Icon name="logout" size={16} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13 }}>{removedCount} koç sistemden çıkarıldı</b>
            <div className="muted" style={{ fontSize: 12 }}>Çıkarılan koçlar listede görünmez; geri almak için aşağıdan etkinleştir.</div>
          </div>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={async () => {
              for (const id of snapshot.removedCoachIds) await mutate({ kind: "restoreOrgCoach", coachId: id });
              toast("Çıkarılan koçlar geri alındı", { icon: "ki-arrows-circle" });
            }}
          >
            Tümünü geri al
          </button>
        </div>
      ) : null}

      {assignFor ? (
        <AssignTaskDialog orgId={o.id} coachId={assignFor.id} coachName={assignFor.name} onClose={() => setAssignFor(null)} />
      ) : null}
      {inviteOpen ? <InviteCoachDialog orgId={o.id} branches={o.branches} onClose={() => setInviteOpen(false)} /> : null}
      <ConfirmModal
        open={!!removeFor}
        title="Koçu sistemden çıkar?"
        tone="danger"
        body={`${removeFor?.name} kurumdan çıkarılacak ve listede görünmeyecek. Öğrenci atamaları serbest kalır. İstediğin zaman geri alabilirsin.`}
        confirmLabel="Çıkar"
        onConfirm={async () => {
          if (removeFor) {
            await mutate({ kind: "removeOrgCoach", coachId: removeFor.id });
            toast(removeFor.name + " sistemden çıkarıldı", { icon: "ki-information-2", tone: "danger" });
          }
        }}
        onClose={() => setRemoveFor(null)}
      />
    </div>
  );
}
