"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { cargoBadgeLabel, cargoBadgeTone } from "@/lib/design/motivation-ui";
import type { OnlineExamRecord } from "@uyanik/database";

const EXAM_TYPES = ["TYT", "AYT", "LGS"] as const;
type ExamType = (typeof EXAM_TYPES)[number];

type Perms = { denemeOlustur: boolean; denemeSil: boolean; onlineDeneme: boolean; gelirGorunur: boolean };
const PERM_LABELS: Array<{ key: keyof Perms; label: string }> = [
  { key: "denemeOlustur", label: "Deneme oluşturabilir" },
  { key: "denemeSil", label: "Deneme silebilir" },
  { key: "onlineDeneme", label: "Online deneme kullanabilir" },
  { key: "gelirGorunur", label: "Gelir & Tahsilat görebilir" },
];

const INITIAL_FORM = { title: "", examType: "TYT" as ExamType, questionCount: "20", answerKey: "", pdfName: "" };

export function CoachOnlineExams() {
  const [exams, setExams] = useState<OnlineExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Yetki / paket (demo — kurum modunda kurum belirler)
  const [coachType, setCoachType] = useState<"bireysel" | "kurum">("bireysel");
  const [paketOpen, setPaketOpen] = useState(true);
  const [perms, setPerms] = useState<Perms>({ denemeOlustur: true, denemeSil: true, onlineDeneme: true, gelirGorunur: true });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (coachType === "bireysel") setPerms({ denemeOlustur: true, denemeSil: true, onlineDeneme: true, gelirGorunur: true });
  }, [coachType]);

  const locked = coachType === "bireysel";
  const canCreate = paketOpen && perms.denemeOlustur;
  const maxLetter = form.examType === "LGS" ? "D" : "E";
  const parsedKey = useMemo(
    () => form.answerKey.toUpperCase().replace(form.examType === "LGS" ? /[^A-D]/g : /[^A-E]/g, "").split("").filter(Boolean),
    [form.answerKey, form.examType],
  );
  const count = Math.max(0, Number.parseInt(form.questionCount, 10) || 0);
  const keyComplete = parsedKey.length === count && count > 0;

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

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
    setError(null);
    if (form.title.trim().length < 2 || count <= 0 || parsedKey.length !== count) {
      setError("Ad, soru sayısı ve cevap anahtarı (uzunluk = soru sayısı) gerekli.");
      return;
    }
    setIsSaving(true);
    const response = await fetch("/api/coach/online-exams", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title.trim(), publisher: form.pdfName.trim(), examType: form.examType, answerKey: parsedKey }),
    });
    setIsSaving(false);
    if (!response.ok) {
      setError("Online deneme oluşturulamadı.");
      return;
    }
    setForm(INITIAL_FORM);
    setCreateOpen(false);
    showToast("Online deneme oluşturuldu ve öğrencilere yayınlandı 📝");
    await load();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/coach/online-exams?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "same-origin" });
    setConfirmId(null);
    if (response.ok) {
      showToast("Deneme silindi · bildirim oluşturuldu");
      await load();
    }
  }

  return (
    <div className="stack rise" data-testid="coach-online-exams">
      <UkPageHead
        title="Online Denemeler"
        sub="Online deneme oluştur, cevap anahtarını belirle, öğrencilere yayınla"
        actions={
          canCreate ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
              <KiIcon name="ki-plus" />
              Online Deneme Oluştur
            </button>
          ) : null
        }
      />

      <UkSection
        title="Hesap & Yetkiler"
        sub="Bireysel koç tüm yetkilere sahiptir; kuruma bağlı koçun yetkilerini kurum belirler"
        action={
          coachType === "bireysel" ? (
            <UkBadge tone="success"><KiIcon name="ki-people" size={13} />Bireysel lisans</UkBadge>
          ) : (
            <UkBadge tone="info"><KiIcon name="ki-bank" size={13} />Kuruma bağlı · Uyanık Kütüphane</UkBadge>
          )
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="seg" style={{ width: "fit-content" }}>
            <button type="button" className={coachType === "bireysel" ? "on" : ""} onClick={() => setCoachType("bireysel")}>Bireysel</button>
            <button type="button" className={coachType === "kurum" ? "on" : ""} onClick={() => setCoachType("kurum")}>Kuruma bağlı</button>
          </div>
          {PERM_LABELS.map((perm) => (
            <div key={perm.key} className="between">
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{perm.label}</span>
              <button
                type="button"
                className={`switch${perms[perm.key] ? " on" : ""}`}
                disabled={locked}
                style={{ opacity: locked ? 0.7 : 1 }}
                onClick={() => !locked && setPerms((current) => ({ ...current, [perm.key]: !current[perm.key] }))}
                aria-label={perm.label}
              >
                <span />
              </button>
            </div>
          ))}
          <div className="between" style={{ paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Online deneme paketi (süper admin/kurum)</div>
              <div className="muted" style={{ fontSize: 12 }}>Paket kapalıysa yetki açık olsa bile oluşturulamaz</div>
            </div>
            <button type="button" className={`switch${paketOpen ? " on" : ""}`} onClick={() => setPaketOpen((value) => !value)} aria-label="Online deneme paketi">
              <span />
            </button>
          </div>
        </div>
      </UkSection>

      {!paketOpen ? (
        <div className="notice" style={{ background: "var(--danger-soft)", borderColor: "color-mix(in srgb, var(--danger) 25%, transparent)" }}>
          <KiIcon name="ki-lock" size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
          <div>
            <b style={{ fontSize: 13.5 }}>Online deneme paketi kapalı</b>
            <div className="muted" style={{ fontSize: 12.5 }}>Bu özellik kuruma/koça tanımlı bir paket modülüdür. Süper admin / kurum bu paketi açmadan online deneme oluşturulamaz.</div>
          </div>
        </div>
      ) : !perms.denemeOlustur ? (
        <div className="notice" style={{ background: "var(--warning-soft)", borderColor: "color-mix(in srgb, var(--warning) 25%, transparent)" }}>
          <KiIcon name="ki-information-2" size={18} style={{ color: "var(--warning)", flexShrink: 0 }} />
          <div>
            <b style={{ fontSize: 13.5 }}>Deneme oluşturma yetkin yok</b>
            <div className="muted" style={{ fontSize: 12.5 }}>Kurum bu yetkiyi vermedi. Kuruma bağlı koçlar yalnızca kurum izniyle online deneme oluşturabilir.</div>
          </div>
        </div>
      ) : null}

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
                    <span className="d">{exam.questionCount} soru</span>
                    {exam.publisher ? <span className="d">{exam.publisher}</span> : null}
                    <UkBadge tone={cargoBadgeTone(exam.cargoStatus)}>{cargoBadgeLabel(exam.cargoStatus)}</UkBadge>
                  </div>
                </div>
                {perms.denemeSil ? (
                  <button type="button" className="btn btn-light btn-sm" style={{ color: "var(--danger)" }} onClick={() => setConfirmId(exam.id)}>
                    <KiIcon name="ki-trash" size={14} />
                    Sil
                  </button>
                ) : (
                  <UkBadge tone="muted"><KiIcon name="ki-lock" size={12} />Kilitli</UkBadge>
                )}
              </div>
            ))
          )}
        </div>
      </UkSection>

      {createOpen && mounted
        ? createPortal(
            <div className="modal-overlay" onClick={() => setCreateOpen(false)}>
              <div className="modal-panel" style={{ maxWidth: 520 }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-head">
                  <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Online Deneme Oluştur</h3>
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
                      <span className="label">Tür</span>
                      <select className="select" value={form.examType} onChange={(event) => setForm({ ...form, examType: event.target.value as ExamType })}>
                        {EXAM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <span className="label">Soru sayısı</span>
                      <input className="input tnum" inputMode="numeric" value={form.questionCount} onChange={(event) => setForm({ ...form, questionCount: event.target.value.replace(/\D/g, "") })} />
                    </div>
                  </div>
                  <div className="field">
                    <div className="between">
                      <span className="label">Cevap anahtarı (A–{maxLetter} · {parsedKey.length}/{count})</span>
                      <UkBadge tone={keyComplete ? "success" : "warning"}>{keyComplete ? "Tam" : `${parsedKey.length}/${count}`}</UkBadge>
                    </div>
                    <textarea className="input" rows={3} value={form.answerKey} onChange={(event) => setForm({ ...form, answerKey: event.target.value })} placeholder="ABCDE BCDEA ..." />
                    <label className="btn btn-light btn-sm w-fit" style={{ marginTop: 8, cursor: "pointer" }}>
                      <KiIcon name="ki-cloud-download" size={14} />
                      PDF&apos;ten içe aktar
                      <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) { setForm((current) => ({ ...current, pdfName: file.name })); showToast(`PDF eklendi: ${file.name}`); }
                      }} />
                    </label>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
                      PDF eklersen referans olarak saklanır; cevap anahtarını harf dizisi olarak yapıştır/gir.
                    </div>
                  </div>
                  {error ? <UkBadge tone="danger">{error}</UkBadge> : null}
                </div>
                <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Vazgeç</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSaving || form.title.trim().length < 2 || count <= 0 || parsedKey.length !== count}
                    style={{ opacity: form.title.trim().length < 2 || count <= 0 || parsedKey.length !== count ? 0.5 : 1 }}
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

      {confirmId && mounted
        ? createPortal(
            <div className="modal-overlay" onClick={() => setConfirmId(null)}>
              <div className="modal-panel" style={{ maxWidth: 380 }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-body" style={{ padding: 22, textAlign: "center", gap: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Denemeyi sil?</h3>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {exams.find((e) => e.id === confirmId)?.title} kaldırılacak. Bu işlem için bildirim oluşturulur.
                  </p>
                </div>
                <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setConfirmId(null)}>Vazgeç</button>
                  <button type="button" className="btn btn-primary" style={{ background: "var(--danger)" }} onClick={() => void handleDelete(confirmId)}>Sil</button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {toast && mounted
        ? createPortal(
            <div className="toast">
              <span className="lr-icon" style={{ width: 34, height: 34, background: "var(--success-soft)", color: "var(--success)" }}>
                <KiIcon name="ki-check-circle" size={18} />
              </span>
              <div className="muted" style={{ fontSize: 13 }}>{toast}</div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
