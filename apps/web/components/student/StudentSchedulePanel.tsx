"use client";

import { useCallback, useEffect, useState } from "react";

import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
import type { SchoolScheduleRecord } from "@uyanik/database";

export function StudentSchedulePanel() {
  const [schedule, setSchedule] = useState<SchoolScheduleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCell, setSavingCell] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/schedule", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { schedule: SchoolScheduleRecord };
      setSchedule(data.schedule);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <div className="stack rise" data-testid="student-schedule-panel">
      <UkPageHead title="Calisma Programi" sub="Okul ders programini duzenle" />

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

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Yukleniyor...
        </p>
      ) : !schedule?.attendsSchool ? (
        <UkSection title="Okul programi">
          <div className="card-body muted" style={{ fontSize: 13 }}>
            Okula gitmiyorsan program duzenlenmez.
          </div>
        </UkSection>
      ) : (
        <UkSection title="Haftalik program" sub="Pzt-Cum, 8 ders saati">
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
    </div>
  );
}
