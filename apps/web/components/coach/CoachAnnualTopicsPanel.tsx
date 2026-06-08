"use client";

import { useCallback, useEffect, useState } from "react";

import { KonuCizelge } from "@/components/coach/KonuCizelge";
import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import type { CoachRosterEntry, SchoolScheduleRecord, SubjectRecord, TopicTrackingSummary } from "@uyanik/database";

export function CoachAnnualTopicsPanel() {
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [studentId, setStudentId] = useState("");
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      const response = await fetch("/api/coach/students", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
        setStudentId(data.students[0]?.studentId ?? "");
      }
      setIsLoading(false);
    }

    void loadStudents();
  }, []);

  const loadTopics = useCallback(async () => {
    if (!studentId) {
      setSubjects([]);
      return;
    }

    const response = await fetch(`/api/coach/students/topics?studentId=${encodeURIComponent(studentId)}`, {
      credentials: "same-origin",
    });
    if (response.ok) {
      const data = (await response.json()) as {
        topics: { subjects: SubjectRecord[]; summary: TopicTrackingSummary };
        schedule: SchoolScheduleRecord;
      };
      setSubjects(data.topics.subjects);
    }
  }, [studentId]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Yillik Cizelge"
        sub="Tum yilin oturum oturum konu, soru ve dogru takibi"
        actions={
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <div className="field" style={{ minWidth: 220, marginBottom: 0 }}>
              <select className="select" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
                {students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.displayName}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-light" onClick={() => void loadTopics()}>
              <KiIcon name="ki-arrows-circle" size={15} />
              Yenile
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="card">
          <div className="card-body muted" style={{ fontSize: 13 }}>
            Yukleniyor...
          </div>
        </div>
      ) : (
        <KonuCizelge studentId={studentId} subjects={subjects} maxHeight="66vh" />
      )}
    </div>
  );
}
