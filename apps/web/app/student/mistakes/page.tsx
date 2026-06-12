"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";

type ErrorType = "bilgi" | "islem" | "sure" | "dikkat" | "yorum" | "unutma";
type QuestionType = "yeninesil" | "klasik" | "islem" | "yorum" | "grafik";
type MistakeStatus = "acik" | "tekrar" | "kapandi";

type Mistake = {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  errorType: ErrorType;
  source: string;
  qType: QuestionType;
  note: string;
  photoUrl: string | null;
  status: MistakeStatus;
  stage: number;
  nextDue: string | null;
  createdAt: string;
};

const ERROR_LABELS: Record<ErrorType, { label: string; tone: "danger" | "info" | "warning" | "primary" | "muted" }> = {
  bilgi: { label: "Bilgi eksigi", tone: "danger" },
  islem: { label: "Islem hatasi", tone: "info" },
  sure: { label: "Sure", tone: "warning" },
  dikkat: { label: "Dikkat", tone: "primary" },
  yorum: { label: "Yorum", tone: "info" },
  unutma: { label: "Unutma", tone: "muted" },
};

const QUESTION_LABELS: Record<QuestionType, string> = {
  yeninesil: "Yeni nesil",
  klasik: "Klasik",
  islem: "Islem",
  yorum: "Yorum",
  grafik: "Grafik / Tablo",
};

const STATUS_LABELS: Record<MistakeStatus, { label: string; tone: "warning" | "info" | "success" }> = {
  acik: { label: "Acik", tone: "warning" },
  tekrar: { label: "Tekrar edildi", tone: "info" },
  kapandi: { label: "Kapandi", tone: "success" },
};

const INITIAL_FORM = {
  subject: "",
  topic: "",
  subtopic: "",
  errorType: "islem" as ErrorType,
  source: "",
  qType: "klasik" as QuestionType,
  note: "",
  photoUrl: "",
};

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function isDue(mistake: Mistake) {
  return mistake.status !== "kapandi" && Boolean(mistake.nextDue) && new Date(`${mistake.nextDue}T00:00:00`) <= new Date();
}

function StageDots({ stage }: { stage: number }) {
  return (
    <span className="row" title={`${stage}/4 tekrar tamam`} style={{ gap: 4 }}>
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: index < stage ? "var(--success)" : "var(--border-strong)",
          }}
        />
      ))}
    </span>
  );
}

function recentFrequency(mistakes: Mistake[]) {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  const recent = mistakes.filter((item) => new Date(item.createdAt) >= since);
  const byType = Object.fromEntries(Object.keys(ERROR_LABELS).map((key) => [key, 0])) as Record<ErrorType, number>;
  const byTopic = new Map<string, number>();
  for (const item of recent) {
    byType[item.errorType] += 1;
    const topicKey = `${item.subject} · ${item.topic}`;
    byTopic.set(topicKey, (byTopic.get(topicKey) ?? 0) + 1);
  }
  const ranked = Object.entries(byType)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]) as Array<[ErrorType, number]>;
  const total = recent.length;
  const diagnosis =
    total === 0
      ? "Bu donemde kayitli yanlis yok."
      : byType.bilgi / total > 0.45
        ? "Agirlikli bilgi eksigi - once konu tekrari gerekiyor."
        : (byType.islem + byType.sure) / total >= 0.5
          ? "Asil sorun konu bilmemek degil; cozum disiplini ve sure yonetimi."
          : "Dikkat ve daginik hatalar one cikiyor - kontrollu cozum sart.";
  const topTopics = Array.from(byTopic.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { total, byType, ranked, diagnosis, topTopics };
}

export default function StudentMistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMistakes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await fetch("/api/student/mistakes", { credentials: "same-origin" });
    if (!response.ok) {
      setError("Yanlis Defteri yuklenemedi.");
      setIsLoading(false);
      return;
    }
    const data = (await response.json()) as { mistakes: Mistake[] };
    setMistakes(data.mistakes);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadMistakes();
  }, [loadMistakes]);

  async function addMistake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/student/mistakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ ...form, photoUrl: form.photoUrl || null }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Yanlis kaydedilemedi.");
      return;
    }
    setForm(INITIAL_FORM);
    await loadMistakes();
  }

  async function reviewMistake(id: string) {
    const response = await fetch(`/api/student/mistakes/${id}/review`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (!response.ok) {
      setError("Tekrar kaydedilemedi.");
      return;
    }
    await loadMistakes();
  }

  async function deleteMistake(id: string) {
    const response = await fetch(`/api/student/mistakes/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!response.ok) {
      setError("Yanlis silinemedi.");
      return;
    }
    await loadMistakes();
  }

  const subjects = useMemo(() => Array.from(new Set(mistakes.map((item) => item.subject))).sort(), [mistakes]);
  const due = useMemo(() => mistakes.filter(isDue).sort((a, b) => (a.nextDue ?? "").localeCompare(b.nextDue ?? "")), [mistakes]);
  const shown = useMemo(
    () =>
      mistakes.filter((item) => {
        if (subjectFilter !== "all" && item.subject !== subjectFilter) return false;
        if (typeFilter !== "all" && item.errorType !== typeFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        return true;
      }),
    [mistakes, subjectFilter, statusFilter, typeFilter],
  );
  const openCount = mistakes.filter((item) => item.status !== "kapandi").length;
  const closedCount = mistakes.filter((item) => item.status === "kapandi").length;
  const frequency = useMemo(() => recentFrequency(mistakes), [mistakes]);
  const maxFrequency = Math.max(1, ...frequency.ranked.map(([, count]) => count));

  return (
    <div className="stack rise">
      <UkPageHead
        title="Yanlis Defteri"
        sub="Hatalarini kaydet, sistem unutturmadan tekrar ettirsin"
        actions={
          <a className="btn btn-primary" href="#yanlis-ekle">
            <KiIcon name="ki-plus" size={16} />
            Yanlis ekle
          </a>
        }
      />

      <div className="grid g-4">
        {[
          ["ki-shield-cross", "danger", mistakes.length, "Toplam yanlis"],
          ["ki-time", "warning", openCount, "Acik takipte"],
          ["ki-check-circle", "success", closedCount, "Kapandi"],
          ["ki-calendar-tick", "info", due.length, "Bugun tekrar"],
        ].map(([icon, tone, value, label]) => (
          <div key={label as string} className="card stat">
            <div className="card-pad">
              <span className={`stat-icon tone-${tone}`}>
                <KiIcon name={icon as string} size={22} />
              </span>
              <div className="stat-value tnum">{isLoading ? "-" : value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <UkSection
        title="Sifir Hata Dongusu"
        sub={due.length ? "Bugun tekrar edilecekler" : "1 -> 3 -> 7 -> 21 gun otomatik tekrar takvimi"}
        action={due.length ? <Badge tone="warning">{due.length} tekrar</Badge> : null}
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {due.length === 0 ? (
            <div style={{ padding: 18, textAlign: "center", color: "var(--muted)" }}>
              Bugun tekrar edilecek yanlis yok - dongu temiz.
            </div>
          ) : (
            due.slice(0, 5).map((item) => (
              <div key={item.id} className="lrow">
                <span className="lr-icon" style={{ color: "var(--warning)" }}>
                  <KiIcon name="ki-time" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{item.topic} · {item.subject}</div>
                  <div className="lr-meta">
                    <Badge tone={ERROR_LABELS[item.errorType].tone}>{ERROR_LABELS[item.errorType].label}</Badge>
                    <StageDots stage={item.stage} />
                    <span className="d">{item.nextDue}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-light btn-sm" onClick={() => void reviewMistake(item.id)}>
                  Tekrar ettim
                </button>
              </div>
            ))
          )}
        </div>
      </UkSection>

      <UkSection title="Hata Frekansi" sub="Son 14 gunde hangi tur hatayi daha cok yapiyorsun" action={<Badge tone="primary">{frequency.total} yanlis</Badge>}>
        <div className="card-body" style={{ display: "grid", gap: 14 }}>
          <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
            <span className="lr-icon" style={{ color: "var(--primary)" }}>
              <KiIcon name="ki-chart-simple" size={18} />
            </span>
            <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text)" }}>
                {frequency.ranked.length
                  ? frequency.ranked.map(([type, count]) => `${count} ${ERROR_LABELS[type].label}`).join(", ")
                  : "Henuz yanlis eklenmedi."}
              </strong>{" "}
              {frequency.diagnosis}
            </div>
          </div>
          {frequency.total === 0 ? (
            <div style={{ padding: 18, textAlign: "center", color: "var(--muted)" }}>
              Ilk yanlisini ekleyince burada hata tipi dagilimin cikacak.
            </div>
          ) : (
            <div className="grid g-2">
              <div style={{ display: "grid", gap: 10 }}>
                {frequency.ranked.map(([type, count]) => (
                  <div key={type} className="row" style={{ gap: 10 }}>
                    <span style={{ width: 94 }}>
                      <Badge tone={ERROR_LABELS[type].tone}>{ERROR_LABELS[type].label}</Badge>
                    </span>
                    <span style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
                      <span
                        style={{
                          display: "block",
                          width: `${(count / maxFrequency) * 100}%`,
                          height: "100%",
                          background: `var(--${ERROR_LABELS[type].tone})`,
                        }}
                      />
                    </span>
                    <span className="tnum" style={{ width: 24, textAlign: "right", fontWeight: 800 }}>{count}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>En sik yanlis konular</div>
                {frequency.topTopics.map(([topic, count]) => (
                  <div key={topic} className="between" style={{ gap: 10 }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>{topic}</span>
                    <Badge tone="muted">{count}x</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </UkSection>

      <UkSection title="Yanlis ekle" sub="Ders ve konu zorunlu; fotograf icin yalniz URL kabul edilir">
        <form id="yanlis-ekle" className="card-body" onSubmit={(event) => void addMistake(event)} style={{ display: "grid", gap: 12 }}>
          <div className="grid g-2">
            <label className="field">
              <span className="label">Ders</span>
              <input className="input" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required />
            </label>
            <label className="field">
              <span className="label">Konu</span>
              <input className="input" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} required />
            </label>
          </div>
          <div className="grid g-3">
            <label className="field">
              <span className="label">Alt konu</span>
              <input className="input" value={form.subtopic} onChange={(event) => setForm({ ...form, subtopic: event.target.value })} />
            </label>
            <label className="field">
              <span className="label">Hata tipi</span>
              <select className="select" value={form.errorType} onChange={(event) => setForm({ ...form, errorType: event.target.value as ErrorType })}>
                {Object.entries(ERROR_LABELS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="label">Soru turu</span>
              <select className="select" value={form.qType} onChange={(event) => setForm({ ...form, qType: event.target.value as QuestionType })}>
                {Object.entries(QUESTION_LABELS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
              </select>
            </label>
          </div>
          <label className="field">
            <span className="label">Kaynak</span>
            <input className="input" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} />
          </label>
          <label className="field">
            <span className="label">Cozum notu</span>
            <textarea className="input" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} style={{ minHeight: 72 }} />
          </label>
          <label className="field">
            <span className="label">Fotograf URL</span>
            <input className="input" value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} placeholder="https://..." />
          </label>
          <div className="between" style={{ gap: 10, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>Tekrar takvimi: 1 - 3 - 7 - 21 gun</span>
            <button type="submit" className="btn btn-primary">
              <KiIcon name="ki-plus" size={16} />
              Deftere ekle
            </button>
          </div>
        </form>
      </UkSection>

      <UkSection title="Tum Yanlislar" sub={`${shown.length} kayit`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {error ? <p role="alert" className="badge badge-danger" style={{ width: "fit-content" }}>{error}</p> : null}
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <select className="select" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} style={{ width: 160 }}>
              <option value="all">Tum dersler</option>
              {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
            </select>
            <select className="select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} style={{ width: 160 }}>
              <option value="all">Tum hata tipleri</option>
              {Object.entries(ERROR_LABELS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
            <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ width: 160 }}>
              <option value="all">Tum durumlar</option>
              {Object.entries(STATUS_LABELS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
          </div>
          {isLoading ? (
            <p className="muted">Yukleniyor...</p>
          ) : shown.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Bu filtrede yanlis yok.</div>
          ) : (
            shown.map((item) => (
              <div key={item.id} className="lrow" style={{ alignItems: "flex-start" }}>
                <span className="lr-icon" style={{ color: "var(--danger)" }}>
                  <KiIcon name="ki-shield-cross" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{item.topic}{item.subtopic ? <span className="muted"> · {item.subtopic}</span> : null}</div>
                  <div className="lr-meta">
                    <Badge tone={ERROR_LABELS[item.errorType].tone}>{ERROR_LABELS[item.errorType].label}</Badge>
                    <Badge tone={STATUS_LABELS[item.status].tone}>{STATUS_LABELS[item.status].label}</Badge>
                    <span className="d">{item.subject}</span>
                    <span className="d">{QUESTION_LABELS[item.qType]}</span>
                    <StageDots stage={item.stage} />
                  </div>
                  {item.note ? <div style={{ marginTop: 6, color: "var(--text-2)", fontSize: 12 }}>{item.note}</div> : null}
                  {item.source ? <div className="muted" style={{ marginTop: 4, fontSize: 11.5 }}>Kaynak: {item.source}</div> : null}
                </div>
                <button type="button" className="icon-btn" aria-label="Sil" onClick={() => void deleteMistake(item.id)}>
                  <KiIcon name="ki-cross" size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </UkSection>
    </div>
  );
}
