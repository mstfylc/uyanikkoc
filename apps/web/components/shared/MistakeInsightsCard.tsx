"use client";

import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";

type MistakeInsightGroup = {
  key: string;
  label: string;
  subject: string;
  topic: string | null;
  openCount: number;
  dueCount: number;
  lastSource: string;
};

type MistakeInsights = {
  total: number;
  openCount: number;
  dueCount: number;
  closedCount: number;
  reviewCount: number;
  groups: MistakeInsightGroup[];
};

type MistakeInsightsCardProps = {
  mode: "coach" | "parent";
  studentId?: string;
};

export function MistakeInsightsCard({ mode, studentId }: MistakeInsightsCardProps) {
  const [insights, setInsights] = useState<MistakeInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const endpoint = useMemo(() => {
    if (mode === "coach" && studentId) {
      return `/api/coach/students/${studentId}/mistakes`;
    }
    return "/api/parent/mistakes/summary";
  }, [mode, studentId]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const response = await fetch(endpoint, { credentials: "same-origin" });
      if (isMounted && response.ok) {
        const data = (await response.json()) as { insights: MistakeInsights };
        setInsights(data.insights);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  const title = mode === "coach" ? "Yanlış Defteri İçgörüsü" : "Hata Frekansi";
  const sub = mode === "coach" ? "Roster ogrencisinin acik/due hatalari" : "Cocugunuzun tekrar bekleyen hata alanlari";

  return (
    <UkSection
      title={title}
      sub={sub}
      action={insights ? <UkBadge tone={insights.dueCount > 0 ? "warning" : "success"}>{insights.dueCount} tekrar</UkBadge> : null}
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Yukleniyor...</div>
        ) : !insights || insights.total === 0 ? (
          <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Kayitli hata yok.
          </div>
        ) : (
          <>
            <div className="grid g-4">
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{insights.openCount}</div>
                <div className="stat-label">Acik hata</div>
              </div>
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{insights.dueCount}</div>
                <div className="stat-label">Tekrar sirasi</div>
              </div>
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{insights.closedCount}</div>
                <div className="stat-label">Kapanan</div>
              </div>
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{insights.reviewCount}</div>
                <div className="stat-label">Tekrar kaydi</div>
              </div>
            </div>

            {insights.groups.length === 0 ? (
              <div style={{ padding: "6px 0", color: "var(--muted)", fontSize: 13 }}>Acik hata alani yok.</div>
            ) : (
              insights.groups.map((group) => (
                <div className="lrow" key={group.key} style={{ cursor: "default" }}>
                  <span className="lr-icon tone-warning">
                    <KiIcon name="ki-chart-simple" size={17} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{group.label}</div>
                    <div className="lr-meta">
                      <span className="d">{group.openCount} acik</span>
                      <span className="d">{group.dueCount} tekrar</span>
                      {group.lastSource ? <span className="d">{group.lastSource}</span> : null}
                    </div>
                  </div>
                  {mode === "coach" ? <UkBadge tone="primary">Odev icin aday</UkBadge> : null}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </UkSection>
  );
}
