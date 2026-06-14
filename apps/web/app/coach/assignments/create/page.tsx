"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CoachOdevAtaModal } from "@/components/coach/CoachOdevAtaModal";
import type { CoachRosterEntry, CurriculumRecord } from "@uyanik/database";

export default function CoachCreateAssignmentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const [studentsResponse, curriculumResponse] = await Promise.all([
        fetch("/api/coach/students", { credentials: "same-origin" }),
        fetch("/api/coach/curriculum", { credentials: "same-origin" }),
      ]);
      if (!active) return;
      if (studentsResponse.ok) {
        const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
      }
      if (curriculumResponse.ok) {
        const data = (await curriculumResponse.json()) as { curriculum: CurriculumRecord };
        setCurriculum(data.curriculum);
      }
      setReady(true);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const back = () => router.push("/coach/assignments");

  if (!ready || !curriculum) {
    return (
      <div className="stack rise">
        <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <CoachOdevAtaModal
      open
      onClose={back}
      curriculum={curriculum}
      studentId={students[0]?.studentId ?? ""}
      studentName={students[0]?.displayName ?? "Öğrenci"}
      roster={students.map((student) => ({ studentId: student.studentId, name: student.displayName }))}
      defaultAll
      onAssigned={back}
    />
  );
}
