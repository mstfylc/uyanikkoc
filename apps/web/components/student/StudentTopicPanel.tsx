"use client";

import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { subjectColor } from "@/lib/design/subject-colors";
import { TOPIC_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type { SubjectRecord, TopicExamType, TopicTrackingSummary } from "@uyanik/database";

const EXAM_TYPES: TopicExamType[] = ["TYT", "AYT", "LGS", "GENEL"];

export function StudentTopicPanel() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [summary, setSummary] = useState<TopicTrackingSummary | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [subjectExamType, setSubjectExamType] = useState<TopicExamType>("TYT");
  const [topicNames, setTopicNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const response = await fetch("/api/student/topics", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        subjects: SubjectRecord[];
        summary: TopicTrackingSummary;
      };
      setSubjects(data.subjects);
      setSummary(data.summary);
      setActiveSubjectId((current) => {
        if (current && data.subjects.some((subject) => subject.id === current)) {
          return current;
        }
        return data.subjects[0]?.id ?? null;
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeSubject = subjects.find((subject) => subject.id === activeSubjectId) ?? subjects[0] ?? null;
  const pendingTopics = summary ? summary.totalTopics - summary.completedTopics : 0;

  async function handleCreateSubject(event: React.FormEvent) {
    event.preventDefault();
    const name = subjectName.trim();
    if (!name) {
      return;
    }

    const response = await fetch("/api/student/topics", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "subject", examType: subjectExamType, name }),
    });

    if (response.ok) {
      setSubjectName("");
      await load();
    }
  }

  async function handleCreateTopic(subjectId: string) {
    const name = topicNames[subjectId]?.trim();
    if (!name) {
      return;
    }

    const response = await fetch("/api/student/topics", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "topic", subjectId, name }),
    });

    if (response.ok) {
      setTopicNames((current) => ({ ...current, [subjectId]: "" }));
      await load();
    }
  }

  async function toggleTopic(topicId: string, completed: boolean) {
    const response = await fetch(`/api/student/topics/${topicId}?kind=topic`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    if (response.ok) {
      await load();
    }
  }

  async function removeSubject(subjectId: string) {
    const response = await fetch(`/api/student/topics/${subjectId}?kind=subject`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (response.ok) {
      await load();
    }
  }

  async function removeTopic(topicId: string) {
    const response = await fetch(`/api/student/topics/${topicId}?kind=topic`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (response.ok) {
      await load();
    }
  }

  return (
    <div className="stack rise" data-testid="student-topic-panel">
      <UkPageHead title="Konu Takibi" sub="Ders bazinda ilerlemeni takip et" />

      {summary ? (
        <div className="grid g-4">
          <UkStatCard icon="ki-book-open" tone="primary" value={summary.totalTopics} label="Toplam konu" />
          <UkStatCard icon="ki-check-circle" tone="success" value={summary.completedTopics} label="Tamamlanan" />
          <UkStatCard icon="ki-time" tone="warning" value={pendingTopics} label="Bekleyen" />
          <UkStatCard
            icon="ki-chart-pie-simple"
            tone="info"
            value={`%${summary.completionRate}`}
            label="Genel ilerleme"
          />
        </div>
      ) : null}

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Yukleniyor...
        </p>
      ) : subjects.length === 0 ? (
        <UkSection title="Konu alani yok">
          <div className="card-body muted" style={{ fontSize: 13 }}>
            Asagidan yeni ders alani ekleyebilirsin.
          </div>
        </UkSection>
      ) : activeSubject ? (
        <div className="grid col-rail">
          <div className="card" style={{ overflow: "hidden", alignSelf: "start" }}>
            <div className="card-head">
              <h3>Dersler</h3>
            </div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {subjects.map((subject) => {
                const color = subjectColor(subject.name);
                const done = subject.topics.filter((topic) => topic.progress.completed).length;
                const total = subject.topics.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const on = subject.id === activeSubject.id;

                return (
                  <button
                    key={subject.id}
                    type="button"
                    className="user-card"
                    style={{ background: on ? "var(--surface-3)" : "none", borderRadius: 11 }}
                    onClick={() => setActiveSubjectId(subject.id)}
                  >
                    <span
                      className="swatch"
                      style={{ width: 10, height: 10, borderRadius: 4, background: color, flexShrink: 0 }}
                    />
                    <div className="user-meta" style={{ flex: 1 }}>
                      <b style={{ fontSize: 13, color: on ? color : "var(--text)" }}>{subject.name}</b>
                      <span style={{ fontSize: 11 }}>
                        {done}/{total} konu · %{pct}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <UkSection
            title={activeSubject.name}
            sub={TOPIC_EXAM_TYPE_LABELS[activeSubject.examType]}
            action={
              <button type="button" className="btn btn-light btn-sm" onClick={() => setShowEditor((open) => !open)}>
                {showEditor ? "Duzenlemeyi kapat" : "Duzenle"}
              </button>
            }
          >
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeSubject.topics.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Bu derste henuz konu yok.
                </p>
              ) : (
                activeSubject.topics.map((topic) => {
                  const color = subjectColor(activeSubject.name);
                  const done = topic.progress.completed;
                  return (
                    <div key={topic.id} className={`lrow${done ? " done" : ""}`}>
                      <span
                        className="lr-icon"
                        style={{
                          background: `color-mix(in srgb, ${color} 13%, transparent)`,
                          color,
                        }}
                      >
                        <KiIcon name={done ? "ki-check-circle" : "ki-book-open"} size={18} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lr-title">{topic.name}</div>
                        {!done ? (
                          <div className="bar thin" style={{ marginTop: 8, maxWidth: 220 }}>
                            <span style={{ width: "35%", background: color }} />
                          </div>
                        ) : null}
                      </div>
                      <UkBadge tone={done ? "success" : "muted"}>{done ? "Tamamlandi" : "Baslanmadi"}</UkBadge>
                      {showEditor ? (
                        <div className="row" style={{ gap: 8 }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${done ? "btn-light" : "btn-primary"}`}
                            onClick={() => void toggleTopic(topic.id, done)}
                          >
                            {done ? "Geri al" : "Tamamla"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                            style={{ color: "var(--danger)" }}
                            onClick={() => void removeTopic(topic.id)}
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`btn btn-sm ${done ? "btn-light" : "btn-primary"}`}
                          onClick={() => void toggleTopic(topic.id, done)}
                        >
                          {done ? "Tamamlandi" : "Tamamla"}
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {showEditor ? (
                <div className="row" style={{ flexWrap: "wrap", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <input
                    className="input"
                    style={{ flex: 1, minWidth: 180 }}
                    placeholder="Yeni konu adi"
                    value={topicNames[activeSubject.id] ?? ""}
                    onChange={(event) =>
                      setTopicNames((current) => ({ ...current, [activeSubject.id]: event.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => void handleCreateTopic(activeSubject.id)}
                  >
                    Konu ekle
                  </button>
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    style={{ color: "var(--danger)" }}
                    onClick={() => void removeSubject(activeSubject.id)}
                  >
                    Dersi sil
                  </button>
                </div>
              ) : null}
            </div>
          </UkSection>
        </div>
      ) : null}

      <UkSection title="Yeni ders alani">
        <form onSubmit={handleCreateSubject} className="card-body">
          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <select
              className="select"
              style={{ minWidth: 140 }}
              value={subjectExamType}
              onChange={(event) => setSubjectExamType(event.target.value as TopicExamType)}
            >
              {EXAM_TYPES.map((examType) => (
                <option key={examType} value={examType}>
                  {TOPIC_EXAM_TYPE_LABELS[examType]}
                </option>
              ))}
            </select>
            <input
              className="input"
              style={{ flex: 1, minWidth: 180 }}
              placeholder="Ornek: Matematik"
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Ekle
            </button>
          </div>
        </form>
      </UkSection>
    </div>
  );
}
