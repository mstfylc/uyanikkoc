"use client";

import { KiIcon } from "@/components/design/KiIcon";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import {
  PROFILE_AVATAR_ICONS,
  loadProfileAvatarIcon,
  profileAvatarGlyph,
  saveProfileAvatarIcon,
} from "@/lib/design/profile-icons";
import { studentSinav } from "@/lib/design/student-exam";

type ProfilePanelProps = {
  role: "student" | "coach" | "parent";
};

const ROLE_LABELS: Record<ProfilePanelProps["role"], string> = {
  student: "Öğrenci",
  coach: "Koç",
  parent: "Veli",
};

const ROLE_SUB: Record<ProfilePanelProps["role"], string> = {
  student: "11. Sınıf · Sayısal",
  coach: "YKS & LGS Koçu",
  parent: "Veli · Elif'in annesi",
};

function roleSub(role: ProfilePanelProps["role"], email?: string | null): string {
  if (role === "student") {
    return studentSinav({ email }).label;
  }
  return ROLE_SUB[role];
}

const ROLE_STATS: Record<ProfilePanelProps["role"], Array<{ icon: string; text: string }>> = {
  coach: [
    { icon: "ki-people", text: "18 ogrenci" },
    { icon: "ki-chart-simple", text: "%74 ort. tamamlama" },
    { icon: "ki-calendar", text: "Üye: Eyl 2024" },
  ],
  student: [
    { icon: "ki-book", text: "11. Sınıf · Sayısal" },
    { icon: "ki-chart-simple", text: "Hedef: YKS 2026" },
    { icon: "ki-flame", text: "12 gün seri" },
  ],
  parent: [
    { icon: "ki-profile-circle", text: "Elif Yildiz · Öğrenci" },
    { icon: "ki-chart-simple", text: "Son deneme: 78 net" },
    { icon: "ki-calendar-tick", text: "3 yaklaşan randevu" },
  ],
};

function ProfileToast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="toast" role="status">
      <span className="lr-icon" style={{ width: 34, height: 34, background: "var(--success-soft)", color: "var(--success)" }}>
        <KiIcon name="ki-check" size={16} />
      </span>
      <div>
        <div className="fw7" style={{ fontSize: 13.5 }}>
          {message}
        </div>
        <div className="muted fz12">Hesap bilgileri güncellendi</div>
      </div>
    </div>
  );
}

export function ProfilePanel({ role }: ProfilePanelProps) {
  const { data: session } = useSession();
  const sessionEmail = session?.user?.email ?? "";
  const sessionName = session?.user?.name ?? sessionEmail.split("@")[0] ?? "Kullanici";

  const [name, setName] = useState(sessionName);
  const [email, setEmail] = useState(sessionEmail || "—");
  const [phone, setPhone] = useState(role === "coach" ? "0532 000 00 00" : "0533 000 00 00");
  const [saved, setSaved] = useState(false);
  const [avatarIcon, setAvatarIcon] = useState("rocket");

  useEffect(() => {
    setAvatarIcon(loadProfileAvatarIcon());
  }, []);

  useEffect(() => {
    setName(sessionName);
    setEmail(sessionEmail || "—");
  }, [sessionEmail, sessionName]);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  const badgeTone = role === "coach" ? "primary" : role === "parent" ? "info" : "success";
  const badgeIcon = role === "coach" ? "ki-people" : role === "parent" ? "ki-heart" : "ki-book";

  return (
    <div className="stack rise" data-testid="profile-panel">
      <UkPageHead title="Profil" sub="Hesap bilgilerin ve tercihlerin" />

      <div className="grid col-rail">
        <div className="card" style={{ alignSelf: "start", overflow: "hidden" }}>
          <div style={{ height: 84, background: "linear-gradient(135deg, var(--primary), var(--primary-700))" }} />
          <div className="card-pad" style={{ paddingTop: 0, textAlign: "center" }}>
            <div style={{ marginTop: -38, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  border: "4px solid var(--surface)",
                  borderRadius: "50%",
                  width: 84,
                  height: 84,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--surface-2)",
                  fontSize: 36,
                }}
                aria-hidden
              >
                {profileAvatarGlyph(avatarIcon)}
              </div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{name}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              {roleSub(role, sessionEmail)}
            </div>
            <div className="row" style={{ justifyContent: "center", marginTop: 10, gap: 6 }}>
              <UkBadge tone={badgeTone}>
                <span className="row" style={{ gap: 5 }}>
                  <KiIcon name={badgeIcon} size={13} />
                  {ROLE_LABELS[role]}
                </span>
              </UkBadge>
            </div>
            <hr className="hr" style={{ margin: "16px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
              {ROLE_STATS[role].map((stat) => (
                <div className="row" key={stat.text} style={{ gap: 10, fontSize: 13, alignItems: "center" }}>
                  <KiIcon name={stat.icon} size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{stat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack">
          <UkSection
            title="Hesap Bilgileri"
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
                <KiIcon name={saved ? "ki-check" : "ki-setting-2"} size={15} />
                {saved ? "Kaydedildi" : "Kaydet"}
              </button>
            }
          >
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="field">
                  <label className="label">Ad Soyad</label>
                  <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="field">
                  <label className="label">Telefon</label>
                  <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="label">E-posta</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              {role === "student" ? (
                <div className="field">
                  <label className="label">Koç</label>
                  <input className="input" value="Dilek Emen" disabled />
                </div>
              ) : null}
            </div>
          </UkSection>

          <UkSection title="Profil Fotoğrafı" sub="Hazır bir ikon seç ya da kendi fotoğrafını yükle">
            <div className="card-body">
              <div className="grid g-4" style={{ gap: 10 }}>
                {PROFILE_AVATAR_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    className={`user-card${avatarIcon === icon.id ? " on" : ""}`}
                    style={{
                      borderRadius: 12,
                      padding: 10,
                      background: avatarIcon === icon.id ? "var(--primary-soft)" : "var(--surface-2)",
                      border: avatarIcon === icon.id ? "1px solid var(--primary-300)" : "1px solid var(--border)",
                    }}
                    onClick={() => {
                      setAvatarIcon(icon.id);
                      saveProfileAvatarIcon(icon.id);
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{icon.glyph}</span>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{icon.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </UkSection>

          <UkSection title="Tercihler">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Link href={`/${role}/settings`} className="lrow" style={{ textDecoration: "none", color: "inherit" }}>
                <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                  <KiIcon name="ki-setting-2" />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="lr-title">Ayarlar</div>
                  <div className="lr-meta">
                    <span className="d">Bildirim ve gorunum tercihleri</span>
                  </div>
                </div>
                <KiIcon name="ki-arrow-right muted" />
              </Link>
            </div>
          </UkSection>

          <UkSection title="Hesap">
            <div className="card-body">
              <button
                type="button"
                className="btn btn-light"
                style={{ width: "100%", color: "var(--danger)", justifyContent: "center" }}
                onClick={() => void signOut({ callbackUrl: "/login" })}
              >
                <KiIcon name="ki-exit-right" size={17} />
                Çıkış Yap
              </button>
            </div>
          </UkSection>
        </div>
      </div>

      <ProfileToast message={saved ? "Profil kaydedildi" : null} />
    </div>
  );
}
