"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { CurriculumEditor } from "@/components/coach/CurriculumEditor";
import { BillingPanel } from "@/components/shared/BillingPanel";
import { NotificationSettingsPanel } from "@/components/shared/NotificationSettingsPanel";
import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { TOPIC_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type { CurriculumRecord, TopicExamType } from "@uyanik/database";

type SettingsPanelProps = {
  role: "student" | "coach" | "parent";
};

type SettingsTab = "mufredat" | "profil" | "gorunum" | "bildirimler" | "gizlilik" | "odeme";

const THEME_KEY = "uk_theme_v1";
type ThemeChoice = "light" | "dark" | "system";

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (choice === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    return;
  }
  root.setAttribute("data-theme", choice);
}

const EXAM_TYPES: TopicExamType[] = ["TYT", "AYT", "LGS", "GENEL"];

function SettingsToast({ message }: { message: string | null }) {
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
        <div className="muted fz12">Tercihler güncellendi</div>
      </div>
    </div>
  );
}

export function SettingsPanel({ role }: SettingsPanelProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<SettingsTab>(role === "coach" ? "mufredat" : "profil");
  const [curriculum, setCurriculum] = useState<CurriculumRecord | null>(null);
  const [isLoading, setIsLoading] = useState(role === "coach");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [passwordDraft, setPasswordDraft] = useState({ current: "", next: "", confirm: "" });
  const [visibility, setVisibility] = useState({ coachStreak: true, parentProgress: true });

  const email = session?.user?.email ?? "—";
  const name = session?.user?.name ?? email.split("@")[0] ?? "Kullanici";

  const tabs: Array<{ key: SettingsTab; label: string; icon: string }> =
    role === "coach"
      ? [
          { key: "mufredat", label: "Müfredat", icon: "ki-book-open" },
          { key: "profil", label: "Hesap", icon: "ki-profile-circle" },
          { key: "gorunum", label: "Görünüm", icon: "ki-setting-2" },
          { key: "bildirimler", label: "Bildirimler", icon: "ki-notification-on" },
          { key: "gizlilik", label: "Gizlilik & Güvenlik", icon: "ki-lock" },
        ]
      : [
          { key: "profil", label: "Hesap", icon: "ki-profile-circle" },
          { key: "gorunum", label: "Görünüm", icon: "ki-setting-2" },
          { key: "odeme", label: "Abonelik", icon: "ki-wallet" },
          { key: "bildirimler", label: "Bildirimler", icon: "ki-notification-on" },
          { key: "gizlilik", label: "Gizlilik & Güvenlik", icon: "ki-lock" },
        ];

  const load = useCallback(async () => {
    if (role !== "coach") {
      return;
    }

    const response = await fetch("/api/coach/curriculum", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { curriculum: CurriculumRecord };
      setCurriculum(data.curriculum);
    }
    setIsLoading(false);
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const requested = searchParams?.get("tab");
    if (
      requested === "bildirimler" ||
      requested === "profil" ||
      requested === "odeme" ||
      requested === "mufredat" ||
      requested === "gorunum" ||
      requested === "gizlilik"
    ) {
      setTab(requested);
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeChoice | null) ?? "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  async function handleExamTypeChange(examType: TopicExamType) {
    if (!curriculum) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    const response = await fetch("/api/coach/curriculum", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examType }),
    });
    setIsSaving(false);

    if (response.ok) {
      setSuccess("Sınav türü güncellendi.");
      await load();
    } else {
      setError("Sınav türü kaydedilemedi.");
    }
  }

  async function saveSubjects(subjects: CurriculumRecord["subjects"]): Promise<boolean> {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    const response = await fetch("/api/coach/curriculum", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects }),
    });
    setIsSaving(false);

    if (!response.ok) {
      setError("Müfredat kaydedilemedi.");
      return false;
    }

    const data = (await response.json()) as { curriculum: CurriculumRecord };
    setCurriculum(data.curriculum);
    setSuccess("Müfredat güncellendi.");
    return true;
  }

  async function resetSubjects(): Promise<boolean> {
    if (!confirm("Müfredat varsayılan değerlere sıfırlansın mı?")) {
      return false;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    const response = await fetch("/api/coach/curriculum", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    setIsSaving(false);

    if (!response.ok) {
      setError("Müfredat sıfırlanamadı.");
      return false;
    }

    await load();
    setSuccess("Müfredat varsayılana sıfırlandı.");
    return true;
  }

  function handleProfileSave() {
    showToast("Profil tercihleri kaydedildi");
  }

  function handleThemeChange(choice: ThemeChoice) {
    setTheme(choice);
    localStorage.setItem(THEME_KEY, choice);
    applyTheme(choice);
    showToast("Tema güncellendi");
  }

  function handlePasswordSave() {
    if (passwordDraft.next.length < 6 || passwordDraft.next !== passwordDraft.confirm) {
      return;
    }
    setPasswordDraft({ current: "", next: "", confirm: "" });
    showToast("Şifre güncellendi (demo)");
  }

  return (
    <div className="stack rise" data-testid={`settings-panel-${role}`}>
      <UkPageHead title="Ayarlar" sub={role === "coach" ? "Hesap, görünüm ve müfredat yapılandırması" : "Hesap ve görünüm ayarların"} />

      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={tab === item.key ? "on" : ""}
            onClick={() => setTab(item.key)}
          >
            <KiIcon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "mufredat" && role === "coach" ? (
        <>
          <UkSection title="Sınav türü">
            <div className="card-body">
              {isLoading ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Yükleniyor...
                </p>
              ) : (
                <div className="seg" style={{ width: "fit-content" }}>
                  {EXAM_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={curriculum?.examType === type ? "on" : ""}
                      disabled={isSaving}
                      onClick={() => void handleExamTypeChange(type)}
                    >
                      {TOPIC_EXAM_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </UkSection>

          <UkSection title="Müfredat & Konu Grupları" sub="Ders, grup ve konu yapısını düzenle">
            {isLoading || !curriculum ? (
              <div className="card-body muted" style={{ fontSize: 13 }}>
                Yükleniyor...
              </div>
            ) : (
              <div className="card-body">
                <CurriculumEditor
                  curriculum={curriculum}
                  isSaving={isSaving}
                  onSave={saveSubjects}
                  onReset={resetSubjects}
                />
              </div>
            )}
            {error ? (
              <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px", margin: "0 16px 16px" }}>
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="badge badge-success" style={{ height: "auto", padding: "10px 12px", margin: "0 16px 16px" }}>
                {success}
              </p>
            ) : null}
          </UkSection>
        </>
      ) : null}

      {tab === "profil" ? (
        <>
        <UkSection
          title="Hesap Bilgileri"
          sub="Profil bilgilerini görüntüle ve düzenle"
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={handleProfileSave}>
              <KiIcon name="ki-check" size={15} />
              Kaydet
            </button>
          }
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="grid g-2" style={{ gap: 12 }}>
              <div className="field">
                <label className="label">Ad Soyad</label>
                <input className="input" value={name} readOnly />
              </div>
              <div className="field">
                <label className="label">E-posta</label>
                <input className="input" type="email" value={email} readOnly />
              </div>
            </div>
            <div className="between" style={{ padding: "10px 0" }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                  <KiIcon name="ki-setting-2" size={18} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Tema</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Görünüm sekmesinden yönet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UkSection>
        <UkSection title="Şifre" sub="Hesap şifreni güncelle">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="grid g-2" style={{ gap: 12 }}>
              <div className="field">
                <label className="label">Mevcut şifre</label>
                <input className="input" type="password" value={passwordDraft.current} onChange={(event) => setPasswordDraft((current) => ({ ...current, current: event.target.value }))} />
              </div>
              <div className="field">
                <label className="label">Yeni şifre</label>
                <input className="input" type="password" value={passwordDraft.next} onChange={(event) => setPasswordDraft((current) => ({ ...current, next: event.target.value }))} />
                <span className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>En az 6 karakter</span>
              </div>
            </div>
            <div className="field">
              <label className="label">Yeni şifre (tekrar)</label>
              <input className="input" type="password" value={passwordDraft.confirm} onChange={(event) => setPasswordDraft((current) => ({ ...current, confirm: event.target.value }))} />
              {passwordDraft.confirm && passwordDraft.next !== passwordDraft.confirm ? (
                <span style={{ fontSize: 11.5, marginTop: 4, color: "var(--danger)" }}>Şifreler eşleşmiyor</span>
              ) : null}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm w-fit"
              onClick={handlePasswordSave}
              disabled={passwordDraft.next.length < 6 || passwordDraft.next !== passwordDraft.confirm}
              style={{ opacity: passwordDraft.next.length >= 6 && passwordDraft.next === passwordDraft.confirm ? 1 : 0.5 }}
            >
              <KiIcon name="ki-check" size={15} />
              Şifreyi güncelle
            </button>
          </div>
        </UkSection>
        <UkSection title="Oturum" sub="Bu cihazdaki oturumunu kapat">
          <div className="card-body">
            <button type="button" className="btn btn-ghost-danger btn-sm w-fit" onClick={() => void signOut({ callbackUrl: "/login" })}>
              Çıkış Yap
            </button>
          </div>
        </UkSection>
        </>
      ) : null}

      {tab === "gorunum" ? (
        <UkSection title="Görünüm" sub="Tema ve arayüz tercihleri">
          <div className="card-body">
            <div className="seg" style={{ width: "fit-content" }}>
              {(["light", "dark", "system"] as ThemeChoice[]).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={theme === choice ? "on" : ""}
                  onClick={() => handleThemeChange(choice)}
                >
                  {choice === "light" ? "Açık" : choice === "dark" ? "Koyu" : "Sistem"}
                </button>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
              Seçimin tarayıcıda kaydedilir ve tüm panellerde uygulanır.
            </p>
          </div>
        </UkSection>
      ) : null}

      {tab === "gizlilik" ? (
        <div className="stack">
          <UkSection title="Oturum & Cihazlar" sub="Hesabının açık olduğu cihazlar">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="lrow">
                <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                  <KiIcon name="ki-shield-tick" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">Bu cihaz · Tarayıcı</div>
                  <div className="lr-meta"><span className="d">Son etkinlik: şimdi</span></div>
                </div>
                <UkBadge tone="success">Bu cihaz</UkBadge>
              </div>
              <button type="button" className="btn btn-light btn-sm w-fit" onClick={() => showToast("Diğer oturumlar kapatıldı")}>
                Diğer oturumları kapat
              </button>
            </div>
          </UkSection>

          <UkSection title="Veri & Gizlilik (KVKK)" sub="Verilerin ve onayların">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-light btn-sm" onClick={() => showToast("Veri indirme talebin alındı")}>
                  <KiIcon name="ki-cloud-download" size={14} />
                  Verilerimi indir
                </button>
                <button type="button" className="btn btn-ghost btn-sm">Açık rıza / aydınlatma metni</button>
              </div>
              <button type="button" className="btn btn-light btn-sm w-fit" style={{ color: "var(--danger)" }} onClick={() => showToast("Hesap silme talebin alındı (KVKK)")}>
                <KiIcon name="ki-trash" size={14} />
                Hesabı sil
              </button>
            </div>
          </UkSection>

          <UkSection title="Görünürlük tercihleri" sub="Profilinin koç/veli tarafından görünürlüğü">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="between">
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Çalışma serisini koça göster</span>
                <button type="button" className={`switch${visibility.coachStreak ? " on" : ""}`} aria-label="Çalışma serisini koça göster" onClick={() => setVisibility((v) => ({ ...v, coachStreak: !v.coachStreak }))}>
                  <span />
                </button>
              </div>
              <div className="between">
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>İlerlememi velime göster</span>
                <button type="button" className={`switch${visibility.parentProgress ? " on" : ""}`} aria-label="İlerlememi velime göster" onClick={() => setVisibility((v) => ({ ...v, parentProgress: !v.parentProgress }))}>
                  <span />
                </button>
              </div>
            </div>
          </UkSection>
        </div>
      ) : null}

      {tab === "odeme" && (role === "student" || role === "parent") ? (
        <BillingPanel role={role} embedded />
      ) : null}

      {tab === "bildirimler" ? (
        <NotificationSettingsPanel role={role} onSaved={showToast} />
      ) : null}

      <SettingsToast message={toast} />
    </div>
  );
}
