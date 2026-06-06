"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { subjectColor } from "@/lib/design/subject-colors";
import type { StudyBlockRecord } from "@/mocks/study-plan";
import { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
import { countWeeklyBlocks, countWeeklyDone, STUDY_DAYS, weeklyCompletionByDay } from "@/mocks/study-plan";
import type { SchoolScheduleRecord } from "@uyanik/database";

const DAY_INDEX = new Date().getDay();
const TODAY_LABEL = ["Paz", "Pzt", "Sal", "Car", "Per", "Cum", "Cmt"][DAY_INDEX] ?? "Pzt";

export function StudentSchedulePanel() {
  const [schedule, setSchedule] = useState<SchoolScheduleRecord | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyBlockRecord[]>([]);
  const [activeDay, setActiveDay] = useState(TODAY_LABEL);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [blockDraft, setBlockDraft] = useState({
    day: TODAY_LABEL,
    time: "17:00",
    subject: "Matematik",
    topic: "",
    type: "Soru",
  });
  const [blockError, setBlockError] = useState<string | null>(null);
  const [isSavingBlock, setIsSavingBlock] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/schedule", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        schedule: SchoolScheduleRecord;
        studyPlan: StudyBlockRecord[];
      };
      setSchedule(data.schedule);
      setStudyPlan(data.studyPlan);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    void load();
  }, [load]);

  const dayBlocks = useMemo(
    () => studyPlan.filter((block) => block.day === activeDay).sort((a, b) => a.time.localeCompare(b.time)),
    [studyPlan, activeDay],
  );

  const weeklyChart = useMemo(() => weeklyCompletionByDay(studyPlan), [studyPlan]);

  async function toggleStudyBlock(blockId: string) {
    const response = await fetch("/api/student/schedule", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyBlockId: blockId }),
    });
    if (response.ok) {
      const data = (await response.json()) as { studyPlan: StudyBlockRecord[] };
      setStudyPlan(data.studyPlan);
    }
  }

  async function toggleAttendsSchool() {
    if (!schedule) {
      return;
    }
    const response = await fetch("/api/student/schedule", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendsSchool: !schedule.attendsSchool }),
    });
    if (response.ok) {
      const data = (await response.json()) as { schedule: SchoolScheduleRecord };
      setSchedule(data.schedule);
    }
  }

  async function updateCell(day: string, period: number, value: string) {
    const key = `${day}-${period}`;
    setSavingCell(key);
    const response = await fetch("/api/student/schedule", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cell: { day, period, value } }),
    });
    setSavingCell(null);
    if (response.ok) {
      const data = (await response.json()) as { schedule: SchoolScheduleRecord };
      setSchedule(data.schedule);
    }
  }

  async function handleAddBlock(event: FormEvent) {
    event.preventDefault();
    setBlockError(null);

    if (!blockDraft.topic.trim()) {
      setBlockError("Konu adi gerekli.");
      return;
    }

    setIsSavingBlock(true);
    const response = await fetch("/api/student/schedule", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blockDraft),
    });
    setIsSavingBlock(false);

    if (!response.ok) {
      setBlockError("Blok eklenemedi.");
      return;
    }

    const data = (await response.json()) as { studyPlan: StudyBlockRecord[] };
    setStudyPlan(data.studyPlan);
    setBlockDraft((current) => ({ ...current, topic: "" }));
    setBlockModalOpen(false);
  }

  return (
    <div className="stack rise" data-testid="student-schedule-panel">
      <UkPageHead
        title="Calisma Programi"
        sub="Gunluk plan ve okul programi"
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setBlockModalOpen(true)}>
            <KiIcon name="ki-plus" />
            Blok ekle
          </button>
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-calendar" tone="primary" value={countWeeklyBlocks(studyPlan)} label="Bu hafta plan" />
        <UkStatCard icon="ki-check-circle" tone="success" value={countWeeklyDone(studyPlan)} label="Tamamlanan blok" />
      </div>

      <UkSection title="Haftalik tamamlama" sub="Gun bazinda plan ilerlemesi">
        <div className="card-body">
          <UkBarChart data={weeklyChart} max={100} />
        </div>
      </UkSection>

      <UkSection title="Gunluk calisma plani" sub="Bugun icin onerilen bloklar">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="filters" style={{ flexWrap: "wrap" }}>
            {STUDY_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={activeDay === day ? "on" : ""}
                onClick={() => setActiveDay(day)}
              >
                {day}
                {day === TODAY_LABEL ? " · bugun" : ""}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : dayBlocks.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Bu gun icin planlanmis calisma blogu yok.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dayBlocks.map((block) => {
                const color = subjectColor(block.subject);
                return (
                  <div key={block.id} className={`lrow${block.done ? " done" : ""}`}>
                    <span className="tnum muted" style={{ width: 48, fontWeight: 700, fontSize: 12.5 }}>
                      {block.time}
                    </span>
                    <span
                      className="lr-icon"
                      style={{
                        background: `color-mix(in srgb, ${color} 13%, transparent)`,
                        color,
                      }}
                    >
                      <KiIcon name="ki-book-open" size={18} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{block.topic}</div>
                      <div className="lr-meta">
                        <span className="chip" style={{ height: 22, fontSize: 11, padding: "0 8px" }}>
                          <span className="swatch" style={{ background: color }} />
                          {block.subject}
                        </span>
                        <span className="d">{block.type}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${block.done ? "btn-light" : "btn-primary"}`}
                      onClick={() => void toggleStudyBlock(block.id)}
                    >
                      {block.done ? "Bitti" : "Basla"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </UkSection>

      <div className="card">
        <div className="card-pad between">
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Okula gidiyorum</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              Okul programini goster ve duzenle
            </div>
          </div>
          <button
            type="button"
            className={`switch${schedule?.attendsSchool ? " on" : ""}`}
            onClick={() => void toggleAttendsSchool()}
            aria-label="Okula gidiyorum"
          >
            <span />
          </button>
        </div>
      </div>

      {!schedule?.attendsSchool ? (
        <UkSection title="Okul programi">
          <div className="card-body muted" style={{ fontSize: 13 }}>
            Okula gitmiyorsan program duzenlenmez.
          </div>
        </UkSection>
      ) : (
        <UkSection title="Okul ders programi" sub="Pzt-Cum, 8 ders saati">
          <div className="card-body" style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Saat</th>
                  {SCHOOL_DAYS.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SCHOOL_PERIODS }, (_, period) => (
                  <tr key={period}>
                    <td className="tnum muted" style={{ fontWeight: 600 }}>
                      {period + 1}
                    </td>
                    {SCHOOL_DAYS.map((day) => {
                      const key = `${day}-${period}`;
                      const value = schedule.grid[day]?.[period] ?? "";
                      return (
                        <td key={day}>
                          <input
                            className="input"
                            style={{ minWidth: 90, fontSize: 12, padding: "6px 8px" }}
                            value={value}
                            disabled={savingCell === key}
                            onChange={(e) => {
                              const next = e.target.value;
                              setSchedule((current) => {
                                if (!current) {
                                  return current;
                                }
                                const grid = { ...current.grid };
                                grid[day] = (grid[day] ?? Array(SCHOOL_PERIODS).fill("")).slice();
                                grid[day][period] = next;
                                return { ...current, grid };
                              });
                            }}
                            onBlur={(e) => void updateCell(day, period, e.target.value)}
                            placeholder="Ders"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UkSection>
      )}

      {blockModalOpen && mounted
        ? createPortal(
            <div className="modal-overlay" onClick={() => setBlockModalOpen(false)}>
              <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-head">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>Calisma blogu ekle</h3>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                      Haftalik planina yeni blok ekle
                    </div>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 36, height: 36 }}
                    onClick={() => setBlockModalOpen(false)}
                    aria-label="Kapat"
                  >
                    <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
                  </button>
                </div>
                <form onSubmit={handleAddBlock} className="modal-body" style={{ gap: 14 }}>
                  <div className="grid g-2">
                    <div className="field">
                      <label className="label" htmlFor="block-day">
                        Gun
                      </label>
                      <select
                        id="block-day"
                        className="select"
                        value={blockDraft.day}
                        onChange={(event) => setBlockDraft((current) => ({ ...current, day: event.target.value }))}
                      >
                        {STUDY_DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="block-time">
                        Saat
                      </label>
                      <input
                        id="block-time"
                        className="input"
                        type="time"
                        value={blockDraft.time}
                        onChange={(event) => setBlockDraft((current) => ({ ...current, time: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid g-2">
                    <div className="field">
                      <label className="label" htmlFor="block-subject">
                        Ders
                      </label>
                      <input
                        id="block-subject"
                        className="input"
                        value={blockDraft.subject}
                        onChange={(event) => setBlockDraft((current) => ({ ...current, subject: event.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="block-type">
                        Tur
                      </label>
                      <select
                        id="block-type"
                        className="select"
                        value={blockDraft.type}
                        onChange={(event) => setBlockDraft((current) => ({ ...current, type: event.target.value }))}
                      >
                        <option value="Soru">Soru</option>
                        <option value="Video">Video</option>
                        <option value="Konu">Konu</option>
                        <option value="Deneme">Deneme</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="block-topic">
                      Konu
                    </label>
                    <input
                      id="block-topic"
                      className="input"
                      placeholder="Ornek: Turev uygulamalari"
                      value={blockDraft.topic}
                      onChange={(event) => setBlockDraft((current) => ({ ...current, topic: event.target.value }))}
                    />
                  </div>
                  {blockError ? (
                    <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
                      {blockError}
                    </p>
                  ) : null}
                  <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-light" onClick={() => setBlockModalOpen(false)}>
                      Iptal
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSavingBlock}>
                      {isSavingBlock ? "Ekleniyor..." : "Ekle"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
