"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { CurriculumEditor } from "@/components/coach/CurriculumEditor";
import { BillingPanel } from "@/components/shared/BillingPanel";
import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { TOPIC_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type { CurriculumRecord, TopicExamType } from "@uyanik/database";

type SettingsPanelProps = {
  role: "student" | "coach" | "parent";
};

type SettingsTab = "mufredat" | "profil" | "bildirimler" | "odeme";

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
        <div className="muted fz12">Tercihler guncellendi</div>
      </div>
    </div>
  );
}

export function SettingsPanel({ role }: SettingsPanelProps) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<SettingsTab>(role === "coach" ? "mufredat" : "profil");
  const [curriculum, setCurriculum] = useState<CurriculumRecord | null>(null);
  const [isLoading, setIsLoading] = useState(role === "coach");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);

  const email = session?.user?.email ?? "—";
  const name = session?.user?.name ?? email.split("@")[0] ?? "Kullanici";

  const tabs: Array<{ key: SettingsTab; label: string; icon: string }> =
    role === "coach"
      ? [
          { key: "mufredat", label: "Mufredat", icon: "ki-book-open" },
          { key: "profil", label: "Profil", icon: "ki-profile-circle" },
          { key: "bildirimler", label: "Bildirimler", icon: "ki-notification-on" },
        ]
      : [
          { key: "profil", label: "Profil", icon: "ki-profile-circle" },
          { key: "odeme", label: "Abonelik", icon: "ki-wallet" },
          { key: "bildirimler", label: "Bildirimler", icon: "ki-notification-on" },
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
      setSuccess("Sinav turu guncellendi.");
      await load();
    } else {
      setError("Sinav turu kaydedilemedi.");
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
      setError("Mufredat kaydedilemedi.");
      return false;
    }

    const data = (await response.json()) as { curriculum: CurriculumRecord };
    setCurriculum(data.curriculum);
    setSuccess("Mufredat guncellendi.");
    return true;
  }

  async function resetSubjects(): Promise<boolean> {
    if (!confirm("Mufredat varsayilan degerlere sifirlansin mi?")) {
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
      setError("Mufredat sifirlanamadi.");
      return false;
    }

    await load();
    setSuccess("Mufredat varsayilana sifirlandi.");
    return true;
  }

  function handleProfileSave() {
    showToast("Profil tercihleri kaydedildi");
  }

  function handleNotificationSave() {
    showToast("Bildirim tercihleri kaydedildi");
  }

  return (
    <div className="stack rise" data-testid={`settings-panel-${role}`}>
      <UkPageHead title="Ayarlar" sub="Hesap ve mufredat yapilandirmasi" />

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
          <UkSection title="Sinav turu">
            <div className="card-body">
              {isLoading ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Yukleniyor...
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

          <UkSection title="Mufredat & Konu Gruplari" sub="Ders, grup ve konu yapisini duzenle">
            {isLoading || !curriculum ? (
              <div className="card-body muted" style={{ fontSize: 13 }}>
                Yukleniyor...
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
        <UkSection
          title="Profil tercihleri"
          sub="Hesap bilgilerin ve gorunum"
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
                    Sistem temasi otomatik uygulanir
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UkSection>
      ) : null}

      {tab === "odeme" && (role === "student" || role === "parent") ? (
        <BillingPanel role={role} embedded />
      ) : null}

      {tab === "bildirimler" ? (
        <UkSection
          title="Bildirim tercihleri"
          sub="E-posta ve push hatirlatmalari"
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={handleNotificationSave}>
              <KiIcon name="ki-check" size={15} />
              Kaydet
            </button>
          }
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="between" style={{ padding: "10px 0" }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                  <KiIcon name="ki-message-text" size={18} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>E-posta hatirlatmalari</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Odev ve deneme bildirimleri
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`switch${emailReminders ? " on" : ""}`}
                aria-label="E-posta hatirlatmalari"
                onClick={() => setEmailReminders((value) => !value)}
              >
                <span />
              </button>
            </div>
            <hr className="hr" />
            <div className="between" style={{ padding: "10px 0" }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                  <KiIcon name="ki-notification-on" size={18} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Push hatirlatmalari</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Anlik bildirimler
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`switch${pushReminders ? " on" : ""}`}
                aria-label="Push hatirlatmalari"
                onClick={() => setPushReminders((value) => !value)}
              >
                <span />
              </button>
            </div>
          </div>
        </UkSection>
      ) : null}

      <SettingsToast message={toast} />
    </div>
  );
}
