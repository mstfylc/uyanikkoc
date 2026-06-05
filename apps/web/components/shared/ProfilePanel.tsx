"use client";

import { KiIcon } from "@/components/design/KiIcon";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";

type ProfilePanelProps = {
  role: "student" | "coach" | "parent";
};

const ROLE_LABELS: Record<ProfilePanelProps["role"], string> = {
  student: "Ogrenci",
  coach: "Koc",
  parent: "Veli",
};

export function ProfilePanel({ role }: ProfilePanelProps) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "—";
  const name = session?.user?.name ?? email.split("@")[0] ?? "Kullanici";

  return (
    <div className="stack rise" data-testid="profile-panel">
      <UkPageHead title="Profil" sub="Hesap bilgilerin" />

      <div className="card">
        <div className="card-pad row" style={{ gap: 16, alignItems: "center" }}>
          <UkAvatar name={name} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
            <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
              {email}
            </div>
            <div style={{ marginTop: 8 }}>
              <UkBadge tone="primary">{ROLE_LABELS[role]}</UkBadge>
            </div>
          </div>
        </div>
      </div>

      <UkSection title="Hesap">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href={`/${role}/settings`} className="lrow" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
              <KiIcon name="ki-setting-2" />
            </span>
            <div style={{ flex: 1 }}>
              <div className="lr-title">Ayarlar</div>
              <div className="lr-meta">
                <span className="d">Profil ve tercihler</span>
              </div>
            </div>
            <KiIcon name="ki-arrow-right muted" />
          </Link>

          <button
            type="button"
            className="lrow"
            style={{ border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            <span className="lr-icon" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
              <KiIcon name="ki-exit-right" />
            </span>
            <div style={{ flex: 1 }}>
              <div className="lr-title">Cikis yap</div>
              <div className="lr-meta">
                <span className="d">Oturumu kapat</span>
              </div>
            </div>
          </button>
        </div>
      </UkSection>
    </div>
  );
}
