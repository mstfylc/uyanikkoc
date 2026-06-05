"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { CurriculumEditor } from "@/components/coach/CurriculumEditor";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { TOPIC_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type { CurriculumRecord, TopicExamType } from "@uyanik/database";

type SettingsPanelProps = {
  role: "student" | "coach" | "parent";
};

const EXAM_TYPES: TopicExamType[] = ["TYT", "AYT", "LGS", "GENEL"];

export function SettingsPanel({ role }: SettingsPanelProps) {
  const [curriculum, setCurriculum] = useState<CurriculumRecord | null>(null);
  const [isLoading, setIsLoading] = useState(role === "coach");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  if (role === "coach") {
    return (
      <div className="stack rise" data-testid="settings-panel-coach">
        <UkPageHead title="Ayarlar" sub="Mufredat ve sinav turu ayarlari" />

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
      </div>
    );
  }

  return (
    <div className="stack rise" data-testid={`settings-panel-${role}`}>
      <UkPageHead title="Ayarlar" sub="Profil tercihleri" />

      <UkSection title="Profil tercihleri">
        <div className="card-body muted" style={{ fontSize: 13 }}>
          Bildirim ve gorunum tercihleri yakinda eklenecek.
        </div>
      </UkSection>
    </div>
  );
}
