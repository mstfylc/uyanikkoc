// Süper Admin — Modül Bayrakları (kurum × modül matrisi). apps/web/components/admin/super/SuperModules.tsx
// Prototip kaynağı: admin/superadmin2.jsx (SAModules).
"use client";

import { Icon, OrgLogo } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { canEdit } from "@/components/admin/selectors";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { MODULES, orgPlanById } from "@/lib/admin/pricing";

export function SuperModules() {
  const { snapshot, mutate, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;
  const editable = canEdit(snapshot.viewerAccess);
  const orgs = snapshot.orgs;

  return (
    <div className="stack rise">
      <UkPageHead title="Modül Bayrakları" sub="Hangi kurumda hangi özelliğin açık olduğunu tek tabloda yönet" />

      <UkSection title="Kurum × Modül matrisi" sub={editable ? "Hücreye tıklayarak ilgili kurumun modülünü aç/kapat" : "Salt görüntüleme"}>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 880 }}>
            <thead>
              <tr>
                <th>Kurum</th>
                {MODULES.map((m) => (
                  <th key={m.key} style={{ textAlign: "center", fontSize: 10 }}>{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="name">
                      <OrgLogo name={o.name} tone={o.tone} size={32} />
                      <div>
                        <b>{o.name}</b>
                        <span>{orgPlanById(o.planId).name}</span>
                      </div>
                    </div>
                  </td>
                  {MODULES.map((m) => {
                    const on = !!o.modules[m.key];
                    return (
                      <td key={m.key} style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          disabled={!editable}
                          onClick={() => {
                            void mutate({ kind: "toggleOrgModule", orgId: o.id, moduleKey: m.key });
                            toast(o.name + " · " + m.name + " " + (on ? "kapatıldı" : "açıldı"), { icon: "ki-flash" });
                          }}
                          className="icon-btn"
                          style={{
                            width: 30,
                            height: 30,
                            margin: "0 auto",
                            color: on ? "var(--success)" : "var(--faint)",
                            borderColor: on ? "color-mix(in srgb, var(--success) 35%, transparent)" : "var(--border)",
                            background: on ? "var(--success-soft)" : "transparent",
                            cursor: editable ? "pointer" : "default",
                          }}
                          title={on ? "Açık" : "Kapalı"}
                        >
                          <Icon name={on ? "check" : "plus"} size={15} style={on ? undefined : { transform: "rotate(45deg)" }} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UkSection>

      <div className="grid g-2">
        {MODULES.map((m) => {
          const cnt = orgs.filter((o) => o.modules[m.key]).length;
          return (
            <div key={m.key} className="card">
              <div className="card-pad" style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span className="mod-ic" style={cnt ? { background: "var(--primary)", color: "#fff" } : undefined}>
                  <Icon name={m.icon} size={20} />
                </span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 13.5 }}>
                    {m.name}
                    {m.premium ? <span className="mod-prem" style={{ marginLeft: 7 }}>Premium</span> : null}
                  </b>
                  <div className="muted" style={{ fontSize: 12 }}>{cnt}/{orgs.length} kurumda açık</div>
                </div>
                <div className="tnum" style={{ fontWeight: 800, fontSize: 18 }}>{Math.round((cnt / orgs.length) * 100)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
