"use client";

import { useSession } from "next-auth/react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UK_ROLE_CRUMB } from "@/lib/navigation/uk-nav";

export function YonetimProfilePanel() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const name = session?.user?.name ?? session?.user?.email ?? "Kullanici";

  if (!role || (role !== "admin" && role !== "branch")) {
    return <div className="card card-pad muted">Profil yukleniyor…</div>;
  }

  return (
    <div className="stack rise" data-testid="yonetim-profile">
      <UkPageHead title="Profil" sub={UK_ROLE_CRUMB[role]} />

      <UkSection title="Hesap bilgileri">
        <div className="card-body row" style={{ gap: 14, alignItems: "center" }}>
          <UkAvatar name={name} size={52} />
          <div>
            <b style={{ fontSize: 15, display: "block" }}>{name}</b>
            <span className="muted" style={{ fontSize: 12.5 }}>
              {session?.user?.email}
            </span>
          </div>
        </div>
      </UkSection>

      <UkSection title="Kurum baglami">
        <div className="card-body stack" style={{ gap: 8, fontSize: 13 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted">Rol</span>
            <span>{UK_ROLE_CRUMB[role]}</span>
          </div>
          {session?.user?.organizationId ? (
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Kurum ID</span>
              <span>{session.user.organizationId}</span>
            </div>
          ) : null}
          {session?.user?.branchId ? (
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Sube ID</span>
              <span>{session.user.branchId}</span>
            </div>
          ) : null}
        </div>
      </UkSection>
    </div>
  );
}
