"use client";

import type { CoachRosterEntry } from "@uyanik/database";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CoachStudentRoster() {
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/coach/students", { credentials: "same-origin" });
      if (!response.ok) {
        setError("Ogrenci listesi yuklenemedi.");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as { students: CoachRosterEntry[] };
      setStudents(data.students);
      setIsLoading(false);
    }

    void load();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Yukleniyor...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-danger text-sm">
        {error}
      </p>
    );
  }

  if (students.length === 0) {
    return (
      <div className="kt-card">
        <div className="kt-card-body p-5">
          <p className="text-sm text-muted-foreground">Henuz roster ogrencisi yok.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="coach-student-roster">
      {students.map((student) => (
        <Link
          key={student.studentId}
          href={`/coach/students/${student.studentId}`}
          className="kt-card hover:border-primary transition-colors"
        >
          <div className="kt-card-body p-5 flex flex-col gap-1">
            <h2 className="text-base font-medium">{student.displayName}</h2>
            <p className="text-sm text-muted-foreground">{student.email}</p>
            <span className="text-sm text-primary mt-2">Detay gor →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
