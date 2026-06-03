"use client";

import { useEffect, useState } from "react";

type ParentSummary = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
};

export function ParentSummaryPanel() {
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      const response = await fetch("/api/parent/summary", { credentials: "same-origin" });
      if (!response.ok) {
        setError("Ozet yuklenemedi.");
        return;
      }

      const data = (await response.json()) as { summary: ParentSummary };
      setSummary(data.summary);
    }

    void loadSummary();
  }, []);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!summary) {
    return <p data-testid="summary-loading">Ozet yukleniyor...</p>;
  }

  return (
    <section data-testid="parent-summary">
      <p>Toplam odev: {summary.totalAssignments}</p>
      <p>Tamamlanan: {summary.completedCount}</p>
      <p>Bekleyen: {summary.pendingCount}</p>
    </section>
  );
}
