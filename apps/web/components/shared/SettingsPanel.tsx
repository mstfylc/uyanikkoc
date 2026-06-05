"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

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
  const [jsonDraft, setJsonDraft] = useState("");
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
      setJsonDraft(JSON.stringify(data.curriculum.subjects, null, 2));
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
    const response = await fetch("/api/coach/curriculum", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examType }),
    });
    setIsSaving(false);

    if (response.ok) {
      await load();
    }
  }

  async function handleJsonSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    let subjects: CurriculumRecord["subjects"];
    try {
      subjects = JSON.parse(jsonDraft) as CurriculumRecord["subjects"];
    } catch {
      setError("Gecersiz JSON formati.");
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/coach/curriculum", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects }),
    });
    setIsSaving(false);

    if (!response.ok) {
      setError("Mufredat kaydedilemedi.");
      return;
    }

    setSuccess("Mufredat guncellendi.");
    await load();
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
              <div className="filters">
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

        <UkSection title="Mufredat JSON" sub="Ders ve konu listesini duzenle">
          <form onSubmit={handleJsonSave} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="label" htmlFor="curriculum-json">
                subjects JSON
              </label>
              <textarea
                id="curriculum-json"
                className="input"
                rows={14}
                value={jsonDraft}
                onChange={(e) => setJsonDraft(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: 12 }}
              />
            </div>
            <button type="submit" disabled={isSaving} className="btn btn-primary w-fit">
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {error ? (
              <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="badge badge-success" style={{ height: "auto", padding: "10px 12px" }}>
                {success}
              </p>
            ) : null}
          </form>
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
