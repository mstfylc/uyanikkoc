"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkIcon } from "@/components/design/UkIcon";
import { UkNumStepper } from "@/components/design/UkNumStepper";
import { subjectColor } from "@/lib/design/subject-colors";
import {
  defaultSmartOpts,
  dueDateForPlanDay,
  generateSmartPlan,
  SMART_ODEV_TYPES,
  SM_DOW,
  SM_FOCUS,
  SM_INTENSITY,
  smartPlanSentence,
  sourceLabel,
  topicsOfSubject,
  buildSmartSignals,
  type SmartPlanItem,
  type SmartPlanOpts,
  type SmartSignals,
} from "@/lib/design/smart-odev-plan";
import type { CurriculumRecord, ExamResultRecord, SubjectRecord } from "@uyanik/database";
import type { StudentSourceTracker } from "@/mocks/student-sources";

type SmartOdevModalProps = {
  open: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
  onAssigned: () => void;
};

type AssignmentRow = {
  studentId: string;
  completed: boolean;
};

function Seg<T extends string>({
  value,
  map,
  onPick,
}: {
  value: T;
  map: Record<T, { label: string }>;
  onPick: (key: T) => void;
}) {
  return (
    <div className="seg" style={{ height: 34 }}>
      {(Object.keys(map) as T[]).map((key) => (
        <button key={key} type="button" className={value === key ? "on" : ""} style={{ fontSize: 12 }} onClick={() => onPick(key)}>
          {map[key].label}
        </button>
      ))}
    </div>
  );
}

export function SmartOdevModal({ open, studentId, studentName, onClose, onAssigned }: SmartOdevModalProps) {
  const [mounted, setMounted] = useState(false);
  const [sig, setSig] = useState<SmartSignals | null>(null);
  const [opts, setOpts] = useState<SmartPlanOpts | null>(null);
  const [items, setItems] = useState<SmartPlanItem[]>([]);
  const [studentSources, setStudentSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !studentId) {
      return;
    }
    let active = true;
    setIsLoading(true);
    setAssigned(false);

    async function load() {
      const [topicsRes, assignmentsRes, examsRes, curriculumRes, sourcesRes] = await Promise.all([
        fetch(`/api/coach/students/topics?studentId=${encodeURIComponent(studentId)}`, { credentials: "same-origin" }),
        fetch("/api/coach/assignments", { credentials: "same-origin" }),
        fetch("/api/coach/exams", { credentials: "same-origin" }),
        fetch("/api/coach/curriculum", { credentials: "same-origin" }),
        fetch(`/api/coach/students/${encodeURIComponent(studentId)}/sources`, { credentials: "same-origin" }),
      ]);

      if (!active) {
        return;
      }

      let subjects: SubjectRecord[] = [];
      if (topicsRes.ok) {
        const data = (await topicsRes.json()) as { topics: { subjects: SubjectRecord[] } };
        subjects = data.topics?.subjects ?? [];
      }

      let assignments: AssignmentRow[] = [];
      if (assignmentsRes.ok) {
        const data = (await assignmentsRes.json()) as { assignments: AssignmentRow[] };
        assignments = data.assignments;
      }

      let exams: ExamResultRecord[] = [];
      if (examsRes.ok) {
        const data = (await examsRes.json()) as { exams: ExamResultRecord[] };
        exams = data.exams;
      }

      let curriculum: CurriculumRecord | null = null;
      if (curriculumRes.ok) {
        const data = (await curriculumRes.json()) as { curriculum: CurriculumRecord };
        curriculum = data.curriculum;
      }

      if (sourcesRes.ok) {
        const data = (await sourcesRes.json()) as { tracker?: StudentSourceTracker };
        setStudentSources((data.tracker?.items ?? []).map((item) => item.name));
      } else {
        setStudentSources([]);
      }

      const signals = buildSmartSignals(studentName, studentId, subjects, assignments, exams, curriculum);
      const initialOpts = defaultSmartOpts(signals);
      setSig(signals);
      setOpts(initialOpts);
      setItems(generateSmartPlan(signals, initialOpts));
      setIsLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [open, studentId, studentName]);

  const regen = useCallback(
    (patch: Partial<SmartPlanOpts>) => {
      if (!sig || !opts) {
        return;
      }
      const next = { ...opts, ...patch };
      setOpts(next);
      setItems(generateSmartPlan(sig, next));
    },
    [opts, sig],
  );

  const setOpt = useCallback((patch: Partial<SmartPlanOpts>) => {
    setOpts((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const setSourceAll = useCallback((src: string) => {
    setOpt({ source: src });
    setItems((current) => current.map((item) => ({ ...item, source: src })));
  }, [setOpt]);

  const editItem = useCallback((uid: string, patch: Partial<SmartPlanItem>) => {
    setItems((current) => current.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
  }, []);

  const removeItem = useCallback((uid: string) => {
    setItems((current) => current.filter((item) => item.uid !== uid));
  }, []);

  const addRow = useCallback(
    (day: number) => {
      if (!sig || !opts) {
        return;
      }
      const wd = sig.weak[0] ?? sig.subs[0];
      const subject = wd?.subject ?? Object.keys(sig.curriculum?.subjects ?? {})[0] ?? "Genel";
      const tops = topicsOfSubject(sig, subject);
      setItems((current) => [
        ...current,
        {
          uid: `it${Date.now()}`,
          day,
          subject,
          topic: tops[0] ?? "Konu",
          type: "soru",
          count: 20,
          source: opts.source,
          status: "todo",
        },
      ]);
    },
    [opts, sig],
  );

  const totalSoru = useMemo(
    () => items.filter((item) => item.type === "soru").reduce((sum, item) => sum + (item.count || 0), 0),
    [items],
  );
  const usedDays = useMemo(() => new Set(items.map((item) => item.day)).size, [items]);

  async function assign() {
    if (!items.length || !opts || !studentId) {
      return;
    }
    setIsAssigning(true);
    const batchItems = items.map((item) => {
      const srcLabel = sourceLabel(item.source);
      const note =
        (opts.focus === "tekrar" ? "Tekrar ağırlıklı" : item.type === "konu" ? "Önce konu, sonra örnek" : "Süreli çöz") +
        (opts.quality ? " · süreyi not et" : "");
      return {
        studentId,
        week: "w0",
        subject: item.subject,
        topic: item.topic,
        source: srcLabel,
        count: item.count,
        type: item.type,
        types: [item.type],
        note,
        due: dueDateForPlanDay(item.day),
        smart: true,
        overdueAlert: opts.overdueAlert,
        quality: opts.quality,
      };
    });

    const response = await fetch("/api/coach/assignments", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: [studentId], items: batchItems }),
    });

    setIsAssigning(false);
    if (!response.ok) {
      return;
    }
    setAssigned(true);
    onAssigned();
    setTimeout(onClose, 650);
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel sm-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--primary-soft)", color: "var(--primary-600)" }}>
              <UkIcon name="bolt" size={20} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Akıllı Ödev Sistemi</h3>
              <div className="muted" style={{ fontSize: 12 }}>{studentName} · otomatik haftalık öneri</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>Analiz ediliyor...</p>
          ) : null}

          {sig && opts ? (
            <>
              <div className="sm-analiz">
                <div className="sm-sig">
                  <div className="s">
                    <span className="k">Hedef</span>
                    <span className="v">{sig.goal}</span>
                    <span className="muted" style={{ fontSize: 11 }}>≈ {sig.targetNet} net hedef</span>
                  </div>
                  <div className="s">
                    <span className="k">Şu anki net</span>
                    <span className="v">{sig.net}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sig.netDelta >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {sig.netDelta >= 0 ? "▲ +" : "▼ "}{sig.netDelta} son deneme
                    </span>
                  </div>
                  <div className="s">
                    <span className="k">Geçen hafta</span>
                    <span
                      className="v"
                      style={{
                        color: sig.completion < 65 ? "var(--danger)" : sig.completion < 85 ? "var(--warning)" : "var(--success)",
                      }}
                    >
                      %{sig.completion}
                    </span>
                    <span className="muted" style={{ fontSize: 11 }}>ödev tamamlama</span>
                  </div>
                  <div className="s">
                    <span className="k">Müsaitlik</span>
                    <span className="v">{sig.availDays} gün</span>
                    <span className="muted" style={{ fontSize: 11 }}>tahmini / hafta</span>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="k" style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--faint)", marginBottom: 7 }}>
                    Öncelikli zayıf alanlar
                  </div>
                  <div className="sm-weakchips">
                    {sig.weak.map((w) => (
                      <span key={w.subject} className="sm-weakchip">
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: subjectColor(w.subject) }} />
                        {w.subject}
                        <b style={{ color: "var(--muted)", fontWeight: 800 }}>%{w.pct}</b>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm-reco">
                  <span className="ic"><UkIcon name="bolt" size={17} /></span>
                  <p>{smartPlanSentence(sig, opts)}</p>
                </div>
              </div>

              <div>
                <div className="sm-sechd">Plan ayarları <span>— değiştir, plan otomatik güncellensin</span></div>
                <div className="sm-controls">
                  <div className="sm-ctl">
                    <span className="label">Yoğunluk</span>
                    <Seg value={opts.intensity} map={SM_INTENSITY} onPick={(key) => regen({ intensity: key })} />
                  </div>
                  <div className="sm-ctl">
                    <span className="label">Odak</span>
                    <Seg value={opts.focus} map={SM_FOCUS} onPick={(key) => regen({ focus: key })} />
                  </div>
                  <div className="sm-ctl">
                    <span className="label">Güne böl</span>
                    <UkNumStepper value={opts.days} step={1} min={1} max={7} size="sm" onChange={(n) => regen({ days: Math.max(1, n) })} />
                  </div>
                  <div className="sm-ctl" style={{ flex: 1, minWidth: 180 }}>
                    <span className="label">Kaynak (bağımsız)</span>
                    <select className="select" style={{ height: 34 }} value={opts.source} onChange={(event) => setSourceAll(event.target.value)}>
                      <option value="free">Kaynak fark etmez</option>
                      <option value="pdf">Koç PDF / föy</option>
                      {studentSources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row" style={{ gap: 20, flexWrap: "wrap", marginTop: 12 }}>
                  <label className="sm-toggle">
                    <button type="button" className={`switch sm${opts.overdueAlert ? " on" : ""}`} onClick={() => setOpt({ overdueAlert: !opts.overdueAlert })} aria-label="Gecikme uyarısı">
                      <span />
                    </button>
                    Geciken ödevde otomatik uyarı
                  </label>
                  <label className="sm-toggle">
                    <button type="button" className={`switch sm${opts.quality ? " on" : ""}`} onClick={() => setOpt({ quality: !opts.quality })} aria-label="Kalite ölç">
                      <span />
                    </button>
                    Kalite ölç (doğruluk + süre)
                  </label>
                </div>
              </div>

              <div>
                <div className="sm-sechd" style={{ display: "flex", alignItems: "center" }}>
                  Önerilen plan <span>— her satırı düzenleyebilirsin</span>
                  <button type="button" className="btn btn-light btn-sm" style={{ marginLeft: "auto" }} onClick={() => sig && setItems(generateSmartPlan(sig, opts))}>
                    <UkIcon name="ai" size={14} />
                    Yeniden öner
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Array.from({ length: opts.days }).map((_, day) => {
                    const dayItems = items.filter((item) => item.day === day);
                    const due = new Date();
                    due.setDate(due.getDate() + day + 1);
                    return (
                      <div className="sm-day" key={day}>
                        <div className="sm-day-head">
                          <span className="lr-icon" style={{ width: 24, height: 24, fontSize: 11, fontWeight: 800, background: "var(--surface-3)", color: "var(--text-2)" }}>
                            {day + 1}
                          </span>
                          <b>Gün {day + 1}</b>
                          <span className="muted" style={{ fontSize: 11.5 }}>· {SM_DOW[due.getDay()]}</span>
                          <button type="button" className="sm-add" onClick={() => addRow(day)} title="Bu güne ödev ekle">
                            <KiIcon name="ki-plus" size={14} />
                            Satır
                          </button>
                        </div>
                        <div className="sm-items">
                          {dayItems.length === 0 ? (
                            <div className="sm-emptyrow">Bu gün boş — serbest tekrar ya da “+ Satır” ile ödev ekle.</div>
                          ) : (
                            dayItems.map((item) => {
                              const tops = topicsOfSubject(sig, item.subject);
                              return (
                                <div className="sm-item" key={item.uid}>
                                  <span className="sw" style={{ background: subjectColor(item.subject) }} />
                                  <select
                                    className="select sm-isel sm-itopic"
                                    value={item.topic}
                                    onChange={(event) => editItem(item.uid, { topic: event.target.value })}
                                    title={item.subject}
                                  >
                                    {!tops.includes(item.topic) ? <option value={item.topic}>{item.topic}</option> : null}
                                    {tops.map((topic) => (
                                      <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                  </select>
                                  <div className="sm-ictl">
                                    <select
                                      className="select sm-isel sm-itype"
                                      value={item.type}
                                      onChange={(event) => editItem(item.uid, { type: event.target.value as SmartPlanItem["type"] })}
                                    >
                                      {(Object.keys(SMART_ODEV_TYPES) as Array<SmartPlanItem["type"]>).map((key) => (
                                        <option key={key} value={key}>{SMART_ODEV_TYPES[key]}</option>
                                      ))}
                                    </select>
                                    {item.type === "soru" ? (
                                      <UkNumStepper value={item.count} step={5} min={0} max={300} size="sm" onChange={(n) => editItem(item.uid, { count: n })} />
                                    ) : (
                                      <span className="sm-typetag">{SMART_ODEV_TYPES[item.type]}</span>
                                    )}
                                  </div>
                                  <button type="button" className="mini-btn danger" onClick={() => removeItem(item.uid)} aria-label="Sil">
                                    <KiIcon name="ki-plus" size={14} style={{ transform: "rotate(45deg)" }} />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="modal-foot">
          <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
            <b style={{ color: "var(--text)" }}>{items.length}</b> ödev · <b style={{ color: "var(--text)" }}>{totalSoru}</b> soru hedefi · {usedDays} güne yayılmış
          </div>
          <div className="row" style={{ gap: 10, marginLeft: "auto" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
            <button type="button" className="btn btn-primary" onClick={() => void assign()} disabled={!items.length || assigned || isAssigning}>
              <UkIcon name={assigned ? "check" : "bolt"} size={16} />
              {assigned ? "Atandı!" : isAssigning ? "Atanıyor..." : "Planı ata"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
