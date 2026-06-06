// Kurum yöneticisinin yönettiği kurumu seçer (demo: çoklu kurum arası geçiş).
// apps/web/components/admin/branch/OrgSwitcher.tsx
"use client";

import { Icon } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";

export function OrgSwitcher() {
  const { snapshot, activeOrgId, setActiveOrgId } = useAdminStore();
  if (!snapshot || snapshot.orgs.length <= 1) return null;
  return (
    <div className="searchbox" style={{ maxWidth: 240, marginLeft: 0 }}>
      <Icon name="building" size={16} />
      <select
        value={activeOrgId}
        onChange={(e) => setActiveOrgId(e.target.value)}
        style={{ border: "none", background: "transparent", font: "inherit", fontSize: 13, fontWeight: 600, color: "var(--text)", width: "100%", outline: "none", cursor: "pointer" }}
      >
        {snapshot.orgs.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}
