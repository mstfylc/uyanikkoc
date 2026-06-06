// Kurum — Yöneticiler (çoklu yönetici). apps/web/components/admin/branch/BranchManagers.tsx
// Yeni ekran: tek kuruma birden fazla yönetici atama (Sahip / Yönetici rolleri).
"use client";

import { useState } from "react";

import { ConfirmModal, Icon, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { InvitePersonDialog } from "@/components/admin/dialogs";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort } from "@/lib/admin/format";
import type { OrgManagerRole } from "@/lib/admin/types";

export function BranchManagers() {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeFor, setRemoveFor] = useState<{ id: string; name: string } | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const owners = o.managers.filter((m) => m.role === "owner").length;

  return (
    <div className="stack rise">
      <UkPageHead
        title="Yöneticiler"
        sub={`${o.name} · ${o.managers.length} yönetici · tek kuruma birden fazla yönetici atayabilirsiniz`}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(true)}>
              <Icon name="plus" size={16} />Yönetici davet et
            </button>
          </div>
        }
      />

      <div className="grid g-3">
        <StatCard icon="users" tone="primary" value={o.managers.length} label="Toplam yönetici" />
        <StatCard icon="shield" tone="warning" value={owners} label="Sahip yetkisi" />
        <StatCard icon="checkCircle" tone="success" value={o.managers.filter((m) => m.status === "active").length} label="Aktif" />
      </div>

      <UkSection title="Kurum yöneticileri" sub="Sahip: lisans + faturalama dahil tüm yetkiler · Yönetici: operasyonel ekranlar">
        <div className="card-body" style={{ padding: 0 }}>
          {o.managers.map((m) => (
            <div key={m.id} className="list-row">
              <UkAvatar name={m.name} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 13.5, display: "block" }}>
                  {m.name}
                  {m.status === "invited" ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Davet bekliyor</span> : null}
                </b>
                <span className="muted" style={{ fontSize: 12 }}>{m.email} · {fmtShort(m.addedAt)} eklendi</span>
              </div>
              <select
                className="input"
                style={{ width: 140, height: 34, fontSize: 12.5 }}
                value={m.role}
                onChange={async (e) => { await mutate({ kind: "setOrgManagerRole", orgId: o.id, managerId: m.id, role: e.target.value as OrgManagerRole }); toast("Rol güncellendi", { icon: "ki-shield-tick" }); }}
              >
                <option value="owner">Sahip</option>
                <option value="manager">Yönetici</option>
              </select>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 34, height: 34, color: "var(--danger)" }}
                title="Kaldır"
                disabled={m.role === "owner" && owners <= 1}
                onClick={() => setRemoveFor({ id: m.id, name: m.name })}
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          ))}
        </div>
      </UkSection>

      <div className="alert-strip">
        <span className="as-ic"><Icon name="shield" size={16} /></span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 13 }}>Rol yetkileri</b>
          <div className="muted" style={{ fontSize: 12 }}>
            <b>Sahip</b>: lisans, faturalama, yönetici ekleme dahil her şey. <b>Yönetici</b>: koç, öğrenci, şube, rapor ekranları (lisans/faturalama hariç).
          </div>
        </div>
      </div>

      {inviteOpen ? (
        <InvitePersonDialog
          title="Kuruma yönetici davet et"
          roleMode="orgManager"
          onClose={() => setInviteOpen(false)}
          onSubmit={async ({ name, email, value }) => {
            await mutate({ kind: "inviteOrgManager", orgId: o.id, name, email, role: value as OrgManagerRole });
            toast("Yönetici davet edildi", { icon: "ki-send" });
          }}
        />
      ) : null}
      <ConfirmModal
        open={!!removeFor}
        title="Yöneticiyi kaldır?"
        tone="danger"
        body={`${removeFor?.name} bu kurumun yönetici listesinden çıkarılacak ve panel erişimi kalkacak.`}
        confirmLabel="Kaldır"
        onConfirm={async () => {
          if (removeFor) {
            await mutate({ kind: "removeOrgManager", orgId: o.id, managerId: removeFor.id });
            toast(removeFor.name + " kaldırıldı", { icon: "ki-information-2", tone: "warning" });
          }
        }}
        onClose={() => setRemoveFor(null)}
      />
    </div>
  );
}
