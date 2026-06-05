"use client";

import { useCallback, useEffect, useState } from "react";

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
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      <UkPageHead
        title="Konu Takibi"
        sub="Konulari sen tanimlarsin — ornek seed kayitlari silinebilir."
      />

      {summary ? (
        <div className="grid g-4">
          <UkStatCard
            icon="ki-book-open"
            tone="primary"
            value={`${summary.completedTopics}/${summary.totalTopics}`}
            label="Tamamlanan konu"
          />
          <UkStatCard icon="ki-chart-pie-simple" tone="success" value={`%${summary.completionRate}`} label="Tamamlama orani" />
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

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Yukleniyor...
        </p>
      ) : subjects.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Henuz konu alani yok.
        </p>
      ) : (
        subjects.map((subject) => {
          const color = subjectColor(subject.name);
          return (
            <UkSection
              key={subject.id}
              title={subject.name}
              sub={TOPIC_EXAM_TYPE_LABELS[subject.examType]}
              action={
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  style={{ color: "var(--danger)" }}
                  onClick={() => void removeSubject(subject.id)}
                >
                  Sil
                </button>
              }
            >
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {subject.topics.map((topic) => (
                  <div key={topic.id} className={`lrow${topic.progress.completed ? " done" : ""}`}>
                    <span
                      className="lr-icon"
                      style={{
                        background: `color-mix(in srgb, ${color} 13%, transparent)`,
                        color,
                      }}
                    >
                      <i className="ki-filled ki-book-open" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{topic.name}</div>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${topic.progress.completed ? "btn-light" : "btn-primary"}`}
                        onClick={() => void toggleTopic(topic.id, topic.progress.completed)}
                      >
                        {topic.progress.completed ? "Tamamlandi" : "Tamamla"}
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
                  </div>
                ))}
                <div className="row" style={{ flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                  <input
                    className="input"
                    style={{ flex: 1, minWidth: 180 }}
                    placeholder="Yeni konu adi"
                    value={topicNames[subject.id] ?? ""}
                    onChange={(event) =>
                      setTopicNames((current) => ({ ...current, [subject.id]: event.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => void handleCreateTopic(subject.id)}
                  >
                    Konu ekle
                  </button>
                </div>
              </div>
            </UkSection>
          );
        })
      )}
    </div>
  );
}
