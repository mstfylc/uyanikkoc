"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import type { SubjectRecord, TopicRecord, TopicStudySessionRecord } from "@uyanik/database";

type ViewMode = "repeat" | "daily" | "weekly";

type KonuCizelgeProps = {
  studentId: string;
  subjects: SubjectRecord[];
  maxHeight?: string;
  showTip?: boolean;
  hideTabs?: boolean;
  subj?: string;
  onSubj?: (subject: string) => void;
};

type CellDraft = {
  session?: TopicStudySessionRecord;
  topic: TopicRecord;
  subjectName: string;
  date: string;
};

const WEEK_DAYS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];
const REPEAT_COLUMNS = Array.from({ length: 12 }, (_, index) => index + 1);
const WEEK_COLUMNS = Array.from({ length: 12 }, (_, index) => index);

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDay(value: string): Date {
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function mondayOf(date: Date): Date {
  const out = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
  const day = out.getUTCDay() || 7;
  out.setUTCDate(out.getUTCDate() - day + 1);
  return out;
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function heatTone(value: number): string {
  if (value >= 85) return "var(--success-soft)";
  if (value >= 70) return "color-mix(in srgb, var(--warning) 18%, transparent)";
  if (value >= 55) return "color-mix(in srgb, var(--info) 16%, transparent)";
  return value > 0 ? "color-mix(in srgb, var(--danger) 14%, transparent)" : "var(--surface)";
}

function sessionDate(session: TopicStudySessionRecord): string {
  return session.date.slice(0, 10);
}

function sessionsForTopic(sessions: TopicStudySessionRecord[], topicId: string) {
  return sessions
    .filter((session) => session.topicId === topicId)
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function KonuCizelge({
  studentId,
  subjects,
  maxHeight = "66vh",
  showTip = true,
  hideTabs = false,
  subj,
  onSubj,
}: KonuCizelgeProps) {
  const [sessions, setSessions] = useState<TopicStudySessionRecord[]>([]);
  const [mode, setMode] = useState<ViewMode>("repeat");
  const [weekStart, setWeekStart] = useState(() => isoDate(mondayOf(new Date())));
  const [localSubject, setLocalSubject] = useState("");
  const [draft, setDraft] = useState<CellDraft | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const subjectNames = useMemo(() => subjects.map((subject) => subject.name), [subjects]);
  const activeSubject = (subj ?? localSubject) || (subjectNames[0] ?? "");
  const active = subjects.find((subject) => subject.name === activeSubject) ?? subjects[0];
  const currentWeek = parseDay(weekStart);

  useEffect(() => {
    if (!localSubject && subjectNames[0]) {
      setLocalSubject(subjectNames[0]);
    }
  }, [localSubject, subjectNames]);

  useEffect(() => {
    async function loadSessions() {
      if (!studentId) {
        setSessions([]);
        return;
      }
      const response = await fetch(
        `/api/coach/students/topics/sessions?studentId=${encodeURIComponent(studentId)}`,
        { credentials: "same-origin" },
      );
      if (response.ok) {
        const data = (await response.json()) as { sessions: TopicStudySessionRecord[] };
        setSessions(data.sessions);
      }
    }

    void loadSessions();
  }, [studentId]);

  function setSubject(name: string) {
    if (onSubj) {
      onSubj(name);
      return;
    }
    setLocalSubject(name);
  }

  function openDraft(next: CellDraft) {
    setDraft(next);
    setQuestionCount(next.session?.questionCount ?? 0);
    setCorrectCount(next.session?.correctCount ?? 0);
  }

  async function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!draft || correctCount > questionCount) {
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/coach/students/topics/sessions", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draft.session?.id,
        studentId,
        topicId: draft.topic.id,
        date: draft.date,
        questionCount,
        correctCount,
      }),
    });
    setIsSaving(false);

    if (response.ok) {
      const data = (await response.json()) as { session: TopicStudySessionRecord };
      setSessions((current) => {
        const index = current.findIndex((item) => item.id === data.session.id);
        if (index < 0) return [...current, data.session].sort((left, right) => left.date.localeCompare(right.date));
        return current.map((item) => (item.id === data.session.id ? data.session : item));
      });
      setDraft(null);
    }
  }

  function renderCell(topic: TopicRecord, subjectName: string, cellSessions: TopicStudySessionRecord[], date: string) {
    const total = cellSessions.reduce((sum, session) => sum + session.questionCount, 0);
    const correct = cellSessions.reduce((sum, session) => sum + session.correctCount, 0);
    const ratio = pct(correct, total);
    const first = cellSessions[0];

    return (
      <button
        type="button"
        className="mini-btn"
        style={{
          width: 74,
          height: 48,
          borderRadius: 8,
          background: heatTone(ratio),
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        onClick={() => openDraft({ session: first, topic, subjectName, date })}
      >
        <span className="tnum" style={{ fontWeight: 800, fontSize: 12 }}>
          {total ? `${total}/${correct}` : "-"}
        </span>
        <span className="muted" style={{ fontSize: 10 }}>
          {ratio ? `%${ratio}` : "S/D"}
        </span>
      </button>
    );
  }

  const rows = active?.topics ?? [];

  return (
    <div className="card" data-testid="konu-cizelge">
      <div className="card-head" style={{ gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3>Yillik Konu Takip Cizelgesi</h3>
          <div className="sub">Soru / dogru takibi · tekrar, gunluk ve haftalik gorunum</div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div className="seg" style={{ width: "fit-content" }}>
            {(["repeat", "daily", "weekly"] as ViewMode[]).map((item) => (
              <button key={item} type="button" className={mode === item ? "on" : ""} onClick={() => setMode(item)}>
                {item === "repeat" ? "Tekrar" : item === "daily" ? "Gunluk" : "Haftalik"}
              </button>
            ))}
          </div>
          {mode === "daily" ? (
            <div className="row" style={{ gap: 6 }}>
              <button
                type="button"
                className="mini-btn"
                onClick={() => setWeekStart(isoDate(addDays(currentWeek, -7)))}
                aria-label="Onceki hafta"
              >
                <KiIcon name="ki-left" size={15} />
              </button>
              <UkBadge tone="muted">{isoDate(currentWeek)}</UkBadge>
              <button
                type="button"
                className="mini-btn"
                onClick={() => setWeekStart(isoDate(addDays(currentWeek, 7)))}
                aria-label="Sonraki hafta"
              >
                <KiIcon name="ki-right" size={15} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {!hideTabs ? (
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="seg-tabs">
            {subjectNames.map((name) => (
              <button
                key={name}
                type="button"
                className={`seg-tab${name === activeSubject ? " on" : ""}`}
                onClick={() => setSubject(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card-body" style={{ paddingTop: hideTabs ? 20 : 14 }}>
        <div style={{ maxHeight, overflow: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
          <table className="tbl" style={{ minWidth: mode === "daily" ? 820 : 1060 }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, zIndex: 3, background: "var(--surface)", minWidth: 240 }}>
                  Konu
                </th>
                {(mode === "repeat" ? REPEAT_COLUMNS : mode === "daily" ? WEEK_DAYS : WEEK_COLUMNS).map((col, index) => (
                  <th key={String(col)} style={{ textAlign: "center", minWidth: 82 }}>
                    {mode === "repeat"
                      ? `${col}.`
                      : mode === "daily"
                        ? `${col} ${addDays(currentWeek, index).getUTCDate()}`
                        : `${index + 1}. hf`}
                  </th>
                ))}
                <th style={{ position: "sticky", right: 0, zIndex: 3, background: "var(--surface)", minWidth: 110, textAlign: "right" }}>
                  TOP / ORT
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="muted" style={{ padding: 16, textAlign: "center" }}>
                    Secili derste konu yok.
                  </td>
                </tr>
              ) : (
                rows.map((topic) => {
                  const topicSessions = sessionsForTopic(sessions, topic.id);
                  const total = topicSessions.reduce((sum, session) => sum + session.questionCount, 0);
                  const correct = topicSessions.reduce((sum, session) => sum + session.correctCount, 0);
                  const average = pct(correct, total);
                  return (
                    <tr key={topic.id}>
                      <td style={{ position: "sticky", left: 0, zIndex: 2, background: "var(--surface)", minWidth: 240 }}>
                        <div className="row" style={{ gap: 10 }}>
                          <KiIcon name={topic.progress.completed ? "ki-check-circle" : "ki-book-open"} size={16} />
                          <div>
                            <b style={{ fontSize: 13 }}>{topic.name}</b>
                            <div className="muted" style={{ fontSize: 11.5 }}>{active?.name}</div>
                          </div>
                        </div>
                      </td>
                      {mode === "repeat"
                        ? REPEAT_COLUMNS.map((number, index) => {
                            const session = topicSessions[index];
                            return (
                              <td key={number} style={{ textAlign: "center" }}>
                                {renderCell(topic, active?.name ?? "", session ? [session] : [], session?.date ?? new Date().toISOString())}
                              </td>
                            );
                          })
                        : mode === "daily"
                          ? WEEK_DAYS.map((day, index) => {
                              const date = isoDate(addDays(currentWeek, index));
                              const daySessions = topicSessions.filter((session) => sessionDate(session) === date);
                              return (
                                <td key={day} style={{ textAlign: "center" }}>
                                  {renderCell(topic, active?.name ?? "", daySessions, `${date}T12:00:00.000Z`)}
                                </td>
                              );
                            })
                          : WEEK_COLUMNS.map((week) => {
                              const start = addDays(currentWeek, -7 * (11 - week));
                              const end = addDays(start, 7);
                              const weekSessions = topicSessions.filter((session) => {
                                const date = parseDay(sessionDate(session));
                                return date >= start && date < end;
                              });
                              return (
                                <td key={week} style={{ textAlign: "center" }}>
                                  {renderCell(topic, active?.name ?? "", weekSessions, `${isoDate(start)}T12:00:00.000Z`)}
                                </td>
                              );
                            })}
                      <td style={{ position: "sticky", right: 0, zIndex: 2, background: "var(--surface)", textAlign: "right" }}>
                        <span className="tnum" style={{ display: "block", fontWeight: 800 }}>
                          {total}
                        </span>
                        <span className="muted" style={{ fontSize: 11 }}>
                          %{average}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {showTip ? (
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            S / D degeri soru ve dogru sayisini gosterir.
          </div>
        ) : null}
      </div>

      {draft ? (
        <div className="modal-overlay" onClick={() => setDraft(null)}>
          <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{draft.topic.name}</h3>
                <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                  {draft.subjectName} · {draft.date.slice(0, 10)}
                </p>
              </div>
              <button type="button" className="mini-btn" onClick={() => setDraft(null)} aria-label="Kapat">
                <KiIcon name="ki-plus" size={16} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
            <form onSubmit={saveDraft} className="modal-body" style={{ gap: 14 }}>
              <div className="grid g-2">
                <div className="field">
                  <label className="label" htmlFor="cz-question-count">Soru</label>
                  <input
                    id="cz-question-count"
                    className="input tnum"
                    type="number"
                    min={0}
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Number(event.target.value))}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="cz-correct-count">Dogru</label>
                  <input
                    id="cz-correct-count"
                    className="input tnum"
                    type="number"
                    min={0}
                    max={questionCount}
                    value={correctCount}
                    onChange={(event) => setCorrectCount(Number(event.target.value))}
                  />
                </div>
              </div>
              {correctCount > questionCount ? (
                <UkBadge tone="danger">Dogru sayisi soru sayisini gecemez</UkBadge>
              ) : null}
              <div className="modal-foot" style={{ margin: "0 -20px -14px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-light" onClick={() => setDraft(null)}>
                  Vazgec
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving || correctCount > questionCount}>
                  <KiIcon name="ki-check" size={15} />
                  {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
