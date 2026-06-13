"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { subjectColor } from "@/lib/design/subject-colors";
import { formatExamNet } from "@uyanik/shared";

type NetGainItem = {
  subject: string;
  currentNet: number;
  previousNet: number | null;
  gain: number;
  trend: "up" | "down" | "flat";
};

type NetGainMapResult = {
  latestNet: number | null;
  previousNet: number | null;
  totalGain: number | null;
  examCount: number;
  examType: string | null;
  takenAt: string | null;
  items: NetGainItem[];
};

type NetGainMapProps = {
  mode: "student" | "coach" | "parent";
  studentId?: string;
};

function formatGain(value: number | null): string {
  if (value == null) return "-";
  return `${value > 0 ? "+" : ""}${formatExamNet(value)}`;
}

export function NetGainMap({ mode, studentId }: NetGainMapProps) {
  const [netGain, setNetGain] = useState<NetGainMapResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const endpoint = useMemo(() => {
    if (mode === "coach" && studentId) {
      return `/api/coach/students/${studentId}/net-gain`;
    }
    return mode === "parent" ? "/api/parent/net-gain" : "/api/student/net-gain";
  }, [mode, studentId]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const response = await fetch(endpoint, { credentials: "same-origin" });
      if (isMounted && response.ok) {
        const data = (await response.json()) as { netGain: NetGainMapResult };
        setNetGain(data.netGain);
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

  return (
    <UkSection
      title="Net Kaybı Haritası"
      sub="En hızlı net kazancı veren alanlar"
      action={netGain ? <UkBadge tone={netGain.totalGain && netGain.totalGain > 0 ? "success" : "warning"}>≈ {formatGain(netGain.totalGain)} net potansiyel</UkBadge> : null}
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isLoading ? (
          <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Yükleniyor...</div>
        ) : !netGain || netGain.items.length === 0 ? (
          <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Net kazanımı için en az bir deneme sonucu gerekli.
          </div>
        ) : (
          <>
            <div className="grid g-4">
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{netGain.latestNet == null ? "-" : formatExamNet(netGain.latestNet)}</div>
                <div className="stat-label">Son net</div>
              </div>
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{formatGain(netGain.totalGain)}</div>
                <div className="stat-label">Net kazanımı</div>
              </div>
              <div>
                <div className="stat-value tnum" style={{ fontSize: 22 }}>{netGain.examCount}</div>
                <div className="stat-label">Deneme</div>
              </div>
            </div>

            {netGain.items.map((item) => {
              const color = subjectColor(item.subject);
              const width = `${Math.min(100, Math.max(8, Math.abs(item.gain) * 8))}%`;
              return (
                <div className="subj-row" key={item.subject}>
                  <div className="between" style={{ marginBottom: 7 }}>
                    <span className="sname">
                      <span className="swatch" style={{ background: color }} />
                      {item.subject}
                    </span>
                    <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>{formatGain(item.gain)}</span>
                  </div>
                  <div className="bar">
                    <span style={{ width, background: item.trend === "down" ? "var(--danger)" : color }} />
                  </div>
                </div>
              );
            })}

            {mode === "student" ? (
              <Link href="/student/schedule" className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }}>
                <KiIcon name="ki-calendar" />
                Programa ekle
              </Link>
            ) : mode === "coach" ? (
              <Link href="/coach/assignments/create" className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }}>
                <KiIcon name="ki-notepad-edit" />
                Bu konuya ödev ata
              </Link>
            ) : null}
          </>
        )}
      </div>
    </UkSection>
  );
}
