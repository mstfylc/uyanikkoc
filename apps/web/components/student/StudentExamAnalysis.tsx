"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { displaySubjectName, subjectColor } from "@/lib/design/subject-colors";
import { formatExamNet } from "@uyanik/shared";
import type { ExamResultRecord } from "@uyanik/database";

type StudentExamAnalysisProps = {
  exams: ExamResultRecord[];
  selected: ExamResultRecord | null;
  onSelect: (id: string) => void;
};

function successRate(correct: number, wrong: number): number {
  const total = correct + wrong;
  if (total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
}

function buildProjection(totalNet: number) {
  const curPuan = +(totalNet * 4.3 + 100).toFixed(2);
  const curRank = Math.round(Math.max(5000, 80000 - totalNet * 600));
  return [
    { label: "Mevcut", puan: curPuan, rank: curRank, gain: 0 },
    { label: "1. Öncelik", puan: +(curPuan + 22).toFixed(2), rank: Math.round(curRank * 0.74), gain: 22 },
    { label: "2. Öncelik", puan: +(curPuan + 36).toFixed(2), rank: Math.round(curRank * 0.55), gain: 36 },
    { label: "3. Öncelik", puan: +(curPuan + 49).toFixed(2), rank: Math.round(curRank * 0.4), gain: 49 },
  ];
}

export function StudentExamAnalysis({ exams, selected, onSelect }: StudentExamAnalysisProps) {
  if (!selected) {
    return (
      <UkSection title="Deneme analizi" sub="Analiz için bir deneme seçin">
        <div className="card-body muted" style={{ fontSize: 13 }}>
          Sonuçlar sekmesinden bir deneme seçin veya yeni sonuç ekleyin.
        </div>
      </UkSection>
    );
  }

  const sortedByPerformance = [...selected.subjects]
    .filter((row) => row.correct + row.wrong > 0)
    .sort((a, b) => successRate(a.correct, a.wrong) - successRate(b.correct, b.wrong));

  const strongest = sortedByPerformance[sortedByPerformance.length - 1];
  const weakest = sortedByPerformance[0];

  const trendNets = [...exams]
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
    .map((exam) => exam.totalNet);

  const trendDelta =
    trendNets.length > 1 ? trendNets[trendNets.length - 1] - trendNets[0] : null;

  const projection = buildProjection(selected.totalNet);
  const priorityTopics = sortedByPerformance.slice(0, 3).flatMap((row, index) =>
    Array.from({ length: 2 }, (_, topicIndex) => ({
      subject: row.subjectName,
      topic: `${row.subjectName} tekrar ${topicIndex + 1}`,
      success: successRate(row.correct, row.wrong),
      priority: index + 1,
    })),
  );

  return (
    <div className="stack" style={{ gap: 16 }}>
      <UkSection
        title="Deneme analizim"
        sub={`${selected.label ?? "Deneme"} · kişisel sonuç`}
        action={
          exams.length > 1 ? (
            <select
              className="select"
              style={{ height: 34, fontSize: 12.5, maxWidth: 220 }}
              value={selected.id}
              onChange={(event) => onSelect(event.target.value)}
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.label ?? new Date(exam.takenAt).toLocaleDateString("tr-TR")}
                </option>
              ))}
            </select>
          ) : null
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="hero" style={{ padding: "20px 22px" }}>
            <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>
                  {new Date(selected.takenAt).toLocaleDateString("tr-TR")}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}>
                  Toplam {formatExamNet(selected.totalNet)} net
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 4 }}>
                  {trendDelta != null && trendDelta >= 0
                    ? `Son ${trendNets.length} denemede +${formatExamNet(trendDelta)} net gelişim`
                    : "Trend verisi için birden fazla deneme gerekir"}
                </div>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <div className="glass" style={{ padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", fontWeight: 700 }}>TAHMİNİ PUAN</div>
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                    {projection[0]?.puan}
                  </div>
                </div>
                <div className="glass" style={{ padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", fontWeight: 700 }}>TAHMİNİ SIRA</div>
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                    {projection[0]?.rank.toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {strongest && weakest ? (
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <UkBadge tone="success">
                <KiIcon name="ki-star" size={13} />
                En güçlü: {displaySubjectName(strongest.subjectName)}
              </UkBadge>
              <UkBadge tone="danger">
                <KiIcon name="ki-information-2" size={13} />
                Odaklan: {displaySubjectName(weakest.subjectName)}
              </UkBadge>
              {trendDelta != null ? (
                <UkBadge tone="primary">
                  <KiIcon name="ki-chart-line-up" size={13} />
                  {trendDelta >= 0 ? "+" : ""}
                  {formatExamNet(trendDelta)} net trend
                </UkBadge>
              ) : null}
            </div>
          ) : null}

          <div className="grid col-main">
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>
                Ders bazında net
              </div>
              <div className="subj">
                {selected.subjects.map((row) => {
                  const max = Math.max(row.correct + row.wrong, 20);
                  const pct = Math.min(100, (row.net / max) * 100);
                  const color = subjectColor(row.subjectName);
                  return (
                    <div className="subj-row" key={row.id}>
                      <div className="between" style={{ marginBottom: 7 }}>
                        <span className="sname">
                          <span className="swatch" style={{ background: color }} />
                          {displaySubjectName(row.subjectName)}
                        </span>
                        <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>
                          {formatExamNet(row.net)}
                        </span>
                      </div>
                      <div className="bar thin">
                        <span style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ overflow: "hidden", boxShadow: "none" }}>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Ders</th>
                      <th style={{ textAlign: "center" }}>D</th>
                      <th style={{ textAlign: "center" }}>Y</th>
                      <th style={{ textAlign: "right" }}>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.subjects.map((row) => (
                      <tr key={row.id}>
                        <td>{displaySubjectName(row.subjectName)}</td>
                        <td className="tnum" style={{ textAlign: "center" }}>
                          {row.correct}
                        </td>
                        <td className="tnum" style={{ textAlign: "center" }}>
                          {row.wrong}
                        </td>
                        <td className="tnum" style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatExamNet(row.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </UkSection>

      <UkSection title="Puan & sıralama projeksiyonu" sub="Öncelikli çalışma senaryoları">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Senaryo</th>
                <th>Tahmini puan</th>
                <th>Tahmini sıra</th>
                <th>Kazanım</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className="tnum">{row.puan}</td>
                  <td className="tnum">{row.rank.toLocaleString("tr-TR")}</td>
                  <td className="tnum">{row.gain > 0 ? `+${row.gain} puan` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UkSection>

      {priorityTopics.length > 0 ? (
        <UkSection title="Öncelikli konular" sub="Zayıf derslerden türetilen çalışma listesi">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Oncelik</th>
                  <th>Ders</th>
                  <th>Konu</th>
                  <th>Basari %</th>
                </tr>
              </thead>
              <tbody>
                {priorityTopics.map((row, index) => (
                  <tr key={`${row.subject}-${index}`}>
                    <td>
                      <UkBadge tone={row.priority === 1 ? "danger" : row.priority === 2 ? "warning" : "info"}>
                        {row.priority}. oncelik
                      </UkBadge>
                    </td>
                    <td>{row.subject}</td>
                    <td>{row.topic}</td>
                    <td className="tnum">%{row.success}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UkSection>
      ) : null}
    </div>
  );
}
