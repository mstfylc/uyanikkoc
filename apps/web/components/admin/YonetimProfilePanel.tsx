"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Icon } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import {
  PROFILE_AVATAR_ICONS,
  loadProfileAvatarIcon,
  profileAvatarGlyph,
  saveProfileAvatarIcon,
} from "@/lib/design/profile-icons";
import { UK_ROLE_CRUMB } from "@/lib/navigation/uk-nav";

const THEME_KEY = "uk_theme_v1";
type ThemeChoice = "light" | "dark";

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", choice);
}

function loadTheme(): ThemeChoice {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark") return "dark";
  if (stored === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function saveTheme(choice: ThemeChoice) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, choice);
}

const ADMIN_DEFAULTS = {
  name: "Uyanik Koc",
  email: "admin@uyanik.local",
  phone: "0850 000 00 00",
  sub: "Platform yoneticisi",
  tone: "var(--primary)",
  icon: "shield" as const,
};

export function YonetimProfilePanel() {
  const { data: session } = useSession();
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const role = session?.user?.role;

  const org = snapshot ? getActiveOrg(snapshot, activeOrgId) : null;
  const isBranch = role === "branch";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarIcon, setAvatarIcon] = useState("rocket");
  const [theme, setTheme] = useState<ThemeChoice>("light");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setAvatarIcon(loadProfileAvatarIcon());
    const initialTheme = loadTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (isBranch && org) {
      setName(org.owner.name);
      setEmail(org.owner.email);
      setPhone(org.owner.phone);
      return;
    }
    if (role === "admin") {
      setName(session?.user?.name ?? ADMIN_DEFAULTS.name);
      setEmail(session?.user?.email ?? ADMIN_DEFAULTS.email);
      setPhone(ADMIN_DEFAULTS.phone);
    }
  }, [isBranch, org, role, session?.user?.email, session?.user?.name]);

  if (!role || (role !== "admin" && role !== "branch")) {
    return <div className="card card-pad muted">Profil yukleniyor…</div>;
  }

  const tone = isBranch && org ? org.tone : ADMIN_DEFAULTS.tone;
  const sub =
    isBranch && org ? `Kurum yoneticisi · ${org.name}` : ADMIN_DEFAULTS.sub;
  const badgeIcon = isBranch ? "building" : "shield";
  const badgeLabel = UK_ROLE_CRUMB[role];

  async function handleSave() {
    if (isBranch && org) {
      await mutate({
        kind: "updateOrgProfile",
        orgId: org.id,
        name: org.name,
        tone: org.tone,
        email: email.trim(),
        phone: phone.trim(),
        ownerName: name.trim(),
      });
    }
    setSaved(true);
    toast("Profil guncellendi", { icon: "ki-check-circle" });
    window.setTimeout(() => setSaved(false), 1800);
  }

  function toggleTheme() {
    const next: ThemeChoice = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
    applyTheme(next);
  }

  async function handleResetDemo() {
    setResetting(true);
    try {
      await mutate({ kind: "resetDemo" });
      toast("Demo verileri sifirlandi", { icon: "ki-arrows-circle" });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="stack rise" data-testid="yonetim-profile">
      <UkPageHead title="Profil" sub="Hesap bilgilerin, profil fotografin ve tercihlerin" />

      <div className="grid col-rail">
        <div className="card" style={{ alignSelf: "start", overflow: "hidden" }}>
          <div
            style={{
              height: 84,
              background: `linear-gradient(135deg, ${tone}, color-mix(in srgb, ${tone} 60%, #000))`,
            }}
          />
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
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{name || "—"}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{sub}</div>
            <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
              <UkBadge tone="primary">
                <span className="row" style={{ gap: 5 }}>
                  <Icon name={badgeIcon} size={13} />
                  {badgeLabel}
                </span>
              </UkBadge>
            </div>
          </div>
        </div>

        <div className="stack">
          <UkSection title="Profil fotografi" sub="Hazir bir ikon sec">
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
                      border:
                        avatarIcon === icon.id
                          ? "1px solid var(--primary-300)"
                          : "1px solid var(--border)",
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

          <UkSection
            title="Hesap bilgileri"
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleSave()}>
                <Icon name={saved ? "check" : "settings"} size={15} />
                {saved ? "Kaydedildi" : "Kaydet"}
              </button>
            }
          >
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="field">
                  <label className="label">Ad Soyad</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label className="label">Telefon</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="label">E-posta</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </UkSection>

          <UkSection title="Tercihler">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="between" style={{ padding: "10px 0" }}>
                <div className="row" style={{ gap: 12 }}>
                  <span
                    className="lr-icon"
                    style={{ width: 38, height: 38, background: "var(--surface-3)" }}
                  >
                    <Icon name={theme === "dark" ? "moon" : "sun"} size={18} />
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Koyu tema</div>
                    <div className="muted" style={{ fontSize: 12 }}>Goz yorgunlugunu azalt</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`switch${theme === "dark" ? " on" : ""}`}
                  onClick={toggleTheme}
                  aria-label="Tema"
                >
                  <span />
                </button>
              </div>
            </div>
          </UkSection>

          <UkSection title="Hesap">
            <div className="card-body" style={{ gap: 9, display: "flex", flexDirection: "column" }}>
              <button
                type="button"
                className="btn btn-light"
                style={{ justifyContent: "center" }}
                disabled={resetting}
                onClick={() => void handleResetDemo()}
              >
                <Icon name="refresh" size={16} />
                {resetting ? "Sifirlaniyor…" : "Demo verilerini sifirla"}
              </button>
              <button
                type="button"
                className="btn btn-light"
                style={{ width: "100%", color: "var(--danger)", justifyContent: "center" }}
                onClick={() => void signOut({ callbackUrl: "/login" })}
              >
                <KiIcon name="ki-exit-right" size={17} />
                Cikis yap
              </button>
            </div>
          </UkSection>
        </div>
      </div>
    </div>
  );
}
