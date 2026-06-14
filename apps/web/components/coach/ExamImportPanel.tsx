"use client";

import { FormEvent, useState } from "react";

import { UkSection } from "@/components/design/UkSection";
import { parseCsvExamImport } from "@/lib/coach/exam-import";

export function ExamImportPanel() {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleImport(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const exams = parseCsvExamImport(csvText);
    if (exams.length === 0) {
      setError("Geçerli satır bulunamadı. Format: studentId,examType,label,takenAt,subject,correct,wrong");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/coach/exams/import", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exams }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "İçe aktarma başarısız.");
      return;
    }

    const data = (await response.json()) as { count: number };
    setSuccess(`${data.count} deneme sonucu ice aktarildi.`);
    setCsvText("");
  }

  return (
    <UkSection title="CSV içe aktar" sub="Toplu deneme sonucu yükle">
      <form
        onSubmit={handleImport}
        data-testid="exam-import-panel"
        className="card-body"
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <p className="muted" style={{ fontSize: 12.5 }}>
          Her satir: studentId,examType,label,takenAt,subject,correct,wrong
        </p>
        <div className="field">
          <label className="label" htmlFor="csv-text">
            CSV icerigi
          </label>
          <textarea
            id="csv-text"
            className="input"
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"student_001,TYT,TYT Deneme 1,2025-01-15,Matematik,30,5\nstudent_001,TYT,TYT Deneme 1,2025-01-15,Turkce,25,8"}
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-fit">
          {isSubmitting ? "Aktariliyor..." : "Ice aktar"}
        </button>
        {error ? (
          <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="badge badge-success" style={{ height: "auto", padding: "10px 12px" }}>
            {success}
          </p>
        ) : null}
      </form>
    </UkSection>
  );
}
