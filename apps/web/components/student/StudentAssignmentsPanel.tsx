"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { MistakeBatchModal } from "@/components/student/MistakeBatchModal";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
  isAssignmentOpen,
} from "@/lib/assignment-labels";
import { calculateCompletionRate } from "@uyanik/shared";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

type AssignmentResult = { correct: number; wrong: number; blank: number; net: number };

type AssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  completed: boolean;
  result?: AssignmentResult | null;
};

const weeks = [
  { id: "w0", label: "Bu hafta", range: "3-9 Haziran" },
  { id: "w1", label: "Geçen hafta", range: "27 Mayıs-2 Haziran" },
  { id: "all", label: "Tümü", range: "Tüm zamanlar" },
];

const subjectColors: Record<string, string> = {
  Turkce: "#5b51c9",
  Matematik: "#2f80ed",
  Geometri: "#10a37f",
  Fizik: "#b7791f",
  Kimya: "#b94d86",
  Biyoloji: "#39834a",
};

function Badge({
  tone = "muted",
  icon,
  children,
}: {
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "muted";
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon ? <KiIcon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}

function assignmentColor(assignment: AssignmentItem) {
  return subjectColors[assignment.subject ?? ""] ?? "var(--primary)";
}

function needsResult(assignment: AssignmentItem) {
  return assignment.type === "practice" || assignment.type === "exam_prep";
}

function StatCard({
  icon,
  tone,
  value,
  label,
}: {
  icon: string;
  tone: "primary" | "success" | "warning" | "info" | "danger";
  value: number | string;
  label: string;
}) {
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}>
            <KiIcon name={icon} size={22} />
          </span>
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ResultModal({
  assignment,
  onClose,
  onSave,
}: {
  assignment: AssignmentItem | null;
  onClose: () => void;
  onSave: (assignmentId: string, result?: { correct: number; wrong: number; blank: number }) => void;
}) {
  const [correct, setCorrect] = useState("");
  const [wrong, setWrong] = useState("");
  const [blank, setBlank] = useState("");

  useEffect(() => {
    if (!assignment) return;
    setCorrect(String(assignment.result?.correct ?? ""));
    setWrong(String(assignment.result?.wrong ?? ""));
    setBlank(String(assignment.result?.blank ?? ""));
  }, [assignment]);

  if (!assignment) return null;

  const requiresResult = needsResult(assignment);
  const c = Number.parseInt(correct, 10) || 0;
  const w = Number.parseInt(wrong, 10) || 0;
  const b = Number.parseInt(blank, 10) || 0;
  const valid = !requiresResult || c + w + b > 0;
  const net = Math.max(0, c - w / 4);
  const color = assignmentColor(assignment);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 440 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 10 }}>
            <span className="lr-icon" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
              <KiIcon name={assignment.type === "exam_prep" ? "ki-chart-simple" : "ki-book-open"} size={19} />
            </span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>{assignment.title}</h3>
              <div className="muted" style={{ fontSize: 12 }}>{assignment.subject ?? "Genel"} · {ASSIGNMENT_TYPE_LABELS[assignment.type]}</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-cross" size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          {requiresResult ? (
            <>
              <div className="muted" style={{ fontSize: 12.5 }}>Sonucu gir, sistem netini hesaplasın.</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  ["Doğru", correct, setCorrect, "var(--success)"],
                  ["Yanlış", wrong, setWrong, "var(--danger)"],
                  ["Boş", blank, setBlank, "var(--muted)"],
                ].map(([label, value, setter, inputColor]) => (
                  <div className="field" key={label as string} style={{ flex: 1, minWidth: 0 }}>
                    <label className="label" style={{ color: inputColor as string }}>{label as string}</label>
                    <input
                      className="input tnum"
                      inputMode="numeric"
                      value={value as string}
                      onChange={(event) => (setter as (value: string) => void)(event.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      style={{ textAlign: "center", fontWeight: 800, fontSize: 16 }}
                    />
                  </div>
                ))}
              </div>
              <div className="between" style={{ padding: "10px 14px", background: "var(--surface-3)", borderRadius: 11 }}>
                <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>Hesaplanan net</span>
                <span className="tnum" style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{net.toFixed(2).replace(/\.00$/, "")}</span>
              </div>
            </>
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                Bu görevi tamamladıysan işaretle. {assignment.description ? assignment.description : ""}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => onSave(assignment.id, requiresResult ? { correct: c, wrong: w, blank: b } : undefined)}
            style={{ opacity: valid ? 1 : 0.5 }}
          >
            <KiIcon name="ki-check-circle" size={16} />
            {requiresResult ? "Sonucu Kaydet" : "Tamamlandı"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AssignmentCard({
  assignment,
  onResult,
  onComplete,
}: {
  assignment: AssignmentItem;
  onResult: (assignment: AssignmentItem) => void;
  onComplete: (assignmentId: string) => void;
}) {
  const color = assignmentColor(assignment);
  const open = isAssignmentOpen(assignment);
  const resultNeeded = needsResult(assignment);
  const overdue = open && assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;

  return (
    <li className={`lrow${open ? "" : " done"}`} style={{ alignItems: "flex-start" }}>
      <span className="lr-icon" style={{ background: `color-mix(in srgb, ${color} 13%, transparent)`, color, flexShrink: 0 }}>
        <KiIcon name={assignment.type === "exam_prep" ? "ki-chart-simple" : "ki-book-open"} size={19} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{assignment.title}</div>
        <div className="lr-meta">
          <span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 8px" }}>
            <span className="swatch" style={{ background: color }} />
            {assignment.subject ?? "Genel"}
          </span>
          <span className="d">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
          <span className="d">{ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</span>
          <span className="d row" style={{ gap: 4 }}>
            <KiIcon name="ki-calendar" size={12} />
            {formatAssignmentDueDate(assignment.dueDate)}
          </span>
        </div>
        {assignment.description ? (
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6, background: "var(--surface-3)", padding: "6px 10px", borderRadius: 8, display: "inline-block" }}>
            {assignment.description}
          </div>
        ) : null}
        {!open && assignment.result ? (
          <div className="row" style={{ gap: 10, marginTop: 8, fontSize: 11.5, fontWeight: 700 }}>
            <span style={{ color: "var(--success)" }}>{assignment.result.correct} doğru</span>
            <span style={{ color: "var(--danger)" }}>{assignment.result.wrong} yanlış</span>
            <span className="muted">{assignment.result.blank} boş</span>
            <Badge tone="primary">net {assignment.result.net.toFixed(2).replace(/\.00$/, "")}</Badge>
          </div>
        ) : null}
        {!open ? <span className="sr-only">(Tamamlandı)</span> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        {open ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => (resultNeeded ? onResult(assignment) : onComplete(assignment.id))}
          >
            {resultNeeded ? "Sonuç Gir" : "Tamamla"}
          </button>
        ) : (
          <Badge tone="success" icon="ki-check">Bitti</Badge>
        )}
        {assignment.dueDate ? (
          <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? "var(--danger)" : "var(--muted)" }}>
            {overdue ? "Gecikti · " : ""}{formatAssignmentDueDate(assignment.dueDate)}
          </span>
        ) : null}
      </div>
    </li>
  );
}

type ViewMode = "liste" | "gunluk" | "takvim";

type ViewProps = {
  assignments: AssignmentItem[];
  onResult: (assignment: AssignmentItem) => void;
  onComplete: (assignmentId: string) => void;
};

const CAL_DOW = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function toYmd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dueYmd(assignment: AssignmentItem): string | null {
  return assignment.dueDate ? toYmd(new Date(assignment.dueDate)) : null;
}

function dayLabel(ymd: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${ymd}T00:00:00`);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff === -1) return "Dün";
  return date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function ListView({ assignments, onResult, onComplete }: ViewProps) {
  const [week, setWeek] = useState("w0");
  const shown = useMemo(() => {
    if (week === "all") return assignments;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (week === "w0" ? 7 : 14));
    const end = new Date(now);
    end.setDate(now.getDate() - (week === "w0" ? 0 : 7));
    return assignments.filter((assignment) => {
      if (!assignment.dueDate) return week === "w0";
      const due = new Date(assignment.dueDate);
      return due >= start && due <= end;
    });
  }, [assignments, week]);
  const pending = shown.filter((assignment) => isAssignmentOpen(assignment));
  const doneList = shown.filter((assignment) => !isAssignmentOpen(assignment));

  return (
    <>
      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {weeks.map((item) => (
          <button key={item.id} type="button" className={week === item.id ? "on" : ""} onClick={() => setWeek(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <UkSection title="Atanan Ödevler" sub={`${weeks.find((item) => item.id === week)?.range} · ${pending.length} bekleyen`}>
        <ul
          data-testid="assignment-list"
          className="card-body"
          style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", paddingLeft: 0, margin: 0 }}
        >
          {shown.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Bu hafta atanmış ödev yok.
            </div>
          ) : (
            [...pending, ...doneList].map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} onResult={onResult} onComplete={onComplete} />
            ))
          )}
        </ul>
      </UkSection>
    </>
  );
}

function DailyPlanView({ assignments, onResult, onComplete }: ViewProps) {
  const todayYmd = toYmd(new Date());
  const overdue = assignments
    .filter((assignment) => isAssignmentOpen(assignment) && dueYmd(assignment) !== null && dueYmd(assignment)! < todayYmd)
    .sort((a, b) => (dueYmd(a) ?? "").localeCompare(dueYmd(b) ?? ""));
  const byDay = new Map<string, AssignmentItem[]>();
  for (const assignment of assignments) {
    const key = dueYmd(assignment);
    if (key && key >= todayYmd) {
      byDay.set(key, [...(byDay.get(key) ?? []), assignment]);
    }
  }
  if (!byDay.has(todayYmd)) byDay.set(todayYmd, []);
  const days = [...byDay.keys()].sort();

  return (
    <div data-testid="assignment-list" className="stack">
      {overdue.length ? (
        <UkSection title="Geciken görevler" sub={`${overdue.length} görev tarihini geçti — önce bunları tamamla`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {overdue.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} onResult={onResult} onComplete={onComplete} />
            ))}
          </div>
        </UkSection>
      ) : null}

      {days.map((ymd) => {
        const items = [...(byDay.get(ymd) ?? [])].sort(
          (a, b) => Number(!isAssignmentOpen(a)) - Number(!isAssignmentOpen(b)),
        );
        const doneCount = items.filter((assignment) => !isAssignmentOpen(assignment)).length;
        return (
          <UkSection
            key={ymd}
            title={dayLabel(ymd)}
            sub={items.length ? `${items.length} görev · ${doneCount}/${items.length} tamam` : "Planlı görev yok — serbest tekrar günü"}
          >
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  Bugün koçundan atanmış görev yok. Eksik konularına tekrar yapabilirsin. 💪
                </div>
              ) : (
                items.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} onResult={onResult} onComplete={onComplete} />
                ))
              )}
            </div>
          </UkSection>
        );
      })}
    </div>
  );
}

function CalendarView({ assignments, onResult, onComplete }: ViewProps) {
  const byDate = useMemo(() => {
    const map = new Map<string, AssignmentItem[]>();
    for (const assignment of assignments) {
      const key = dueYmd(assignment);
      if (key) map.set(key, [...(map.get(key) ?? []), assignment]);
    }
    return map;
  }, [assignments]);
  const undated = assignments.filter((assignment) => dueYmd(assignment) === null);

  const defaultMonth = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assignment of assignments) {
      const key = dueYmd(assignment)?.slice(0, 7);
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? toYmd(new Date()).slice(0, 7);
    const [yy, mm] = top.split("-").map(Number);
    return new Date(yy, mm - 1, 1);
  }, [assignments]);

  const [month, setMonth] = useState(defaultMonth);
  const [selected, setSelected] = useState<string | null>(null);
  const todayYmd = toYmd(new Date());

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);

  const monthLabel = month.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const monthCount = assignments.filter((assignment) => dueYmd(assignment)?.slice(0, 7) === toYmd(month).slice(0, 7)).length;
  const selList = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div data-testid="assignment-list" className="stack">
      <UkSection
        title="Ödev Takvimi"
        sub={`${monthCount} görev · güne tıklayıp detayları gör`}
        action={
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Önceki ay" onClick={() => { setSelected(null); setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); }}>
              <KiIcon name="ki-arrow-right" size={16} style={{ transform: "rotate(180deg)" }} />
            </button>
            <b style={{ fontSize: 13.5, minWidth: 130, textAlign: "center", textTransform: "capitalize" }}>{monthLabel}</b>
            <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Sonraki ay" onClick={() => { setSelected(null); setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); }}>
              <KiIcon name="ki-arrow-right" size={16} />
            </button>
          </div>
        }
      >
        <div className="card-body">
          <div className="odev-cal-grid head">{CAL_DOW.map((d) => <div key={d} className="odev-cal-dow">{d}</div>)}</div>
          <div className="odev-cal-grid">
            {cells.map((date, index) => {
              if (!date) return <div key={index} className="odev-cal-cell empty" />;
              const key = toYmd(date);
              const items = byDate.get(key) ?? [];
              const isToday = key === todayYmd;
              const isSel = selected === key;
              return (
                <button
                  key={index}
                  type="button"
                  className={`odev-cal-cell${isToday ? " today" : ""}${isSel ? " sel" : ""}${items.length ? " has" : ""}`}
                  onClick={() => setSelected(isSel ? null : key)}
                >
                  <span className="odev-cal-num">{date.getDate()}</span>
                  {items.length ? (
                    <span className="odev-cal-dots">
                      {items.slice(0, 4).map((assignment, j) => {
                        const overdue = isAssignmentOpen(assignment) && assignment.dueDate != null && new Date(assignment.dueDate) < new Date();
                        const background = !isAssignmentOpen(assignment) ? "var(--success)" : overdue ? "var(--danger)" : assignmentColor(assignment);
                        return <span key={j} className="odev-cal-dot" title={assignment.subject ?? "Genel"} style={{ background }} />;
                      })}
                      {items.length > 4 ? <span className="odev-cal-more">+{items.length - 4}</span> : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="row" style={{ gap: 14, flexWrap: "wrap", marginTop: 14, fontSize: 11.5, color: "var(--muted)" }}>
            <span className="row" style={{ gap: 5 }}><span className="odev-cal-dot" style={{ background: "var(--primary)" }} />Bekleyen</span>
            <span className="row" style={{ gap: 5 }}><span className="odev-cal-dot" style={{ background: "var(--success)" }} />Tamamlanan</span>
            <span className="row" style={{ gap: 5 }}><span className="odev-cal-dot" style={{ background: "var(--danger)" }} />Gecikmiş</span>
          </div>
        </div>
      </UkSection>

      {selected ? (
        <UkSection title={new Date(`${selected}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })} sub={`${selList.length} görev`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selList.length === 0 ? (
              <div style={{ padding: "18px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu gün için görev yok.</div>
            ) : (
              selList.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} onResult={onResult} onComplete={onComplete} />
              ))
            )}
          </div>
        </UkSection>
      ) : null}

      {undated.length ? (
        <UkSection title="Tarihsiz görevler" sub={`${undated.length} görev`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {undated.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} onResult={onResult} onComplete={onComplete} />
            ))}
          </div>
        </UkSection>
      ) : null}
    </div>
  );
}

export function StudentAssignmentsPanel({ resources }: { resources: React.ReactNode }) {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [view, setView] = useState<ViewMode>("gunluk");
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [batchTarget, setBatchTarget] = useState<{ subject: string; count: number; source: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await fetch("/api/student/assignments", { credentials: "same-origin" });
    if (!response.ok) {
      setError("Ödev listesi yüklenemedi.");
      setIsLoading(false);
      return;
    }
    const data = (await response.json()) as { assignments: AssignmentItem[] };
    setAssignments(data.assignments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  async function saveResult(assignmentId: string, result?: { correct: number; wrong: number; blank: number }) {
    const response = await fetch("/api/student/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ assignmentId, ...(result ? { result } : { status: "completed" }) }),
    });

    if (!response.ok) {
      setError("Ödev kaydedilemedi.");
      return;
    }

    const saved = assignments.find((item) => item.id === assignmentId);
    setActiveAssignment(null);
    await loadAssignments();
    if (result && result.wrong > 0) {
      setBatchTarget({ subject: saved?.subject ?? "Genel", count: result.wrong, source: saved?.title ?? "Ödev sonucu" });
    }
  }

  const stats = useMemo(() => {
    const total = assignments.length;
    const done = assignments.filter((assignment) => !isAssignmentOpen(assignment)).length;
    const pending = total - done;
    const overdue = assignments.filter(
      (assignment) => isAssignmentOpen(assignment) && assignment.dueDate != null && new Date(assignment.dueDate) < new Date(),
    ).length;
    const resultCount = assignments.filter((assignment) => assignment.result).length;
    return { total, done, pending, overdue, resultCount, rate: calculateCompletionRate(total, done) };
  }, [assignments]);

  const onComplete = (assignmentId: string) => void saveResult(assignmentId);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Ödevlerim"
        sub="Koçunun atadığı görevler — sonucunu gir, takip et"
        actions={
          <div className="seg" role="tablist" aria-label="Görünüm" style={{ flexWrap: "wrap" }}>
            <button type="button" className={view === "liste" ? "on" : ""} onClick={() => setView("liste")}>
              <KiIcon name="ki-menu" size={15} />
              Liste
            </button>
            <button type="button" className={view === "gunluk" ? "on" : ""} onClick={() => setView("gunluk")}>
              <KiIcon name="ki-check-circle" size={15} />
              Günlük plan
            </button>
            <button type="button" className={view === "takvim" ? "on" : ""} onClick={() => setView("takvim")}>
              <KiIcon name="ki-calendar" size={15} />
              Takvim
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <StatCard icon="ki-notepad-edit" tone="primary" value={isLoading ? "-" : stats.total} label="Toplam görev" />
        <StatCard icon="ki-check-circle" tone="success" value={isLoading ? "-" : stats.done} label="Tamamlanan" />
        <StatCard icon="ki-time" tone="warning" value={isLoading ? "-" : stats.pending} label="Bekleyen" />
        <StatCard icon="ki-shield-cross" tone="danger" value={isLoading ? "-" : stats.overdue} label="Gecikmiş" />
      </div>

      {error ? (
        <p role="alert" className="badge badge-danger" style={{ width: "fit-content" }}>{error}</p>
      ) : null}

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
      ) : view === "liste" ? (
        <ListView assignments={assignments} onResult={setActiveAssignment} onComplete={onComplete} />
      ) : view === "takvim" ? (
        <CalendarView assignments={assignments} onResult={setActiveAssignment} onComplete={onComplete} />
      ) : (
        <DailyPlanView assignments={assignments} onResult={setActiveAssignment} onComplete={onComplete} />
      )}

      {resources}

      <ResultModal assignment={activeAssignment} onClose={() => setActiveAssignment(null)} onSave={(id, result) => void saveResult(id, result)} />

      <MistakeBatchModal
        open={Boolean(batchTarget)}
        subject={batchTarget?.subject ?? ""}
        count={batchTarget?.count ?? 0}
        source={batchTarget?.source ?? ""}
        onClose={() => setBatchTarget(null)}
      />
    </div>
  );
}
