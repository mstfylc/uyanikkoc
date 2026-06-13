"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { cargoBadgeLabel, cargoBadgeTone } from "@/lib/design/motivation-ui";
import type { OnlineExamRecord } from "@uyanik/database";

const EXAM_TYPES = ["TYT", "AYT", "LGS"] as const;

const INITIAL_FORM = { title: "", publisher: "", examType: "TYT" as (typeof EXAM_TYPES)[number], questionCount: "40", answerKey: "" };

export function CoachOnlineExams() {
  const [exams, setExams] = useState<OnlineExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch("/api/coach/online-exams", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { exams: OnlineExamRecord[] };
      setExams(data.exams);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    const count = Math.max(1, Number.parseInt(form.questionCount, 10) || 0);
    const keyChars = form.answerKey.trim().toUpperCase().replace(/[^A-E]/g, "").split("");
    const answerKey = Array.from({ length: count }, (_, i) => keyChars[i] ?? "A");
    setError(null);
    setIsSaving(true);
    const response = await fetch("/api/coach/online-exams", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        publisher: form.publisher.trim(),
        examType: form.examType,
        answerKey,
      }),
    });
    setIsSaving(false);
    if (!response.ok) {
      setError("Online deneme oluşturulamadı.");
      return;
    }
    setForm(INITIAL_FORM);
    setCreateOpen(false);
    await load();
  }

  return (
    <div className="stack rise" data-testid="coach-online-exams">
      <UkPageHead
        title="Online Denemeler"
        sub="Online deneme oluştur, cevap anahtarını belirle, öğrencilere yayınla"
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
            <KiIcon name="ki-plus" />
            Online Deneme Oluştur
          </button>
        }
      />

      <div className="notice" style={{ background: "var(--surface-3)" }}>
        <KiIcon name="ki-shield-tick" size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
        <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Bireysel koç tüm yetkilere sahiptir; kuruma bağlı koçun yetkilerini kurum belirler.
        </div>
      </div>

      <UkSection title="Oluşturduğun Online Denemeler" sub={`${exams.length} deneme`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
          ) : exams.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Henüz online deneme oluşturmadın.
            </div>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="lrow">
                <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}>
                  <KiIcon name="ki-notepad" size={19} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{exam.title}</div>
                  <div className="lr-meta">
                    <UkBadge tone="muted">{exam.examType}</UkBadge>
                    {exam.publisher ? <span className="d">{exam.publisher}</span> : null}
                    <span className="d">{exam.questionCount} soru</span>
                    <UkBadge tone={cargoBadgeTone(exam.cargoStatus)}>{cargoBadgeLabel(exam.cargoStatus)}</UkBadge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </UkSection>

      {createOpen && mounted
        ? createPortal(
            <div className="modal-overlay" onClick={() => setCreateOpen(false)}>
              <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-head">
                  <div>
                    <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Online Deneme Oluştur</h3>
                    <div className="muted" style={{ fontSize: 12 }}>Cevap anahtarını belirle, öğrencilere yayınla</div>
                  </div>
                  <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => setCreateOpen(false)} aria-label="Kapat">
                    <KiIcon name="ki-cross" size={18} />
                  </button>
                </div>
                <div className="modal-body" style={{ gap: 12, padding: 20 }}>
                  <div className="field">
                    <span className="label">Deneme adı</span>
                    <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Örn: TYT Genel Deneme #8" />
                  </div>
                  <div className="grid g-2">
                    <div className="field">
                      <span className="label">Yayınevi</span>
                      <input className="input" value={form.publisher} onChange={(event) => setForm({ ...form, publisher: event.target.value })} />
                    </div>
                    <div className="field">
                      <span className="label">Sınav türü</span>
                      <select className="select" value={form.examType} onChange={(event) => setForm({ ...form, examType: event.target.value as (typeof EXAM_TYPES)[number] })}>
                        {EXAM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <span className="label">Soru sayısı</span>
                    <input className="input tnum" inputMode="numeric" value={form.questionCount} onChange={(event) => setForm({ ...form, questionCount: event.target.value.replace(/\D/g, "") })} />
                  </div>
                  <div className="field">
                    <span className="label">Cevap anahtarı (ops. · A–E harfleri)</span>
                    <input className="input" value={form.answerKey} onChange={(event) => setForm({ ...form, answerKey: event.target.value })} placeholder="ABCDE AECDB ..." />
                  </div>
                  {error ? <UkBadge tone="danger">{error}</UkBadge> : null}
                </div>
                <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Vazgeç</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSaving || form.title.trim().length < 2}
                    style={{ opacity: form.title.trim().length < 2 ? 0.5 : 1 }}
                    onClick={() => void handleCreate()}
                  >
                    <KiIcon name="ki-plus" size={16} />
                    {isSaving ? "Oluşturuluyor..." : "Oluştur"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
