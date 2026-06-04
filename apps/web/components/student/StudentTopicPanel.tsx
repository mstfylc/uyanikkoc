"use client";

import { useCallback, useEffect, useState } from "react";

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
    <div className="flex flex-col gap-5" data-testid="student-topic-panel">
      <div className="kt-card">
        <div className="kt-card-body p-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-mono">Konu Takibi</h2>
          <p className="text-sm text-muted-foreground">
            Konulari sen tanimlarsin — ornek seed kayitlari silinebilir.
          </p>
          {summary ? (
            <p className="text-sm">
              Tamamlanan: {summary.completedTopics}/{summary.totalTopics} ({summary.completionRate}%)
            </p>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleCreateSubject} className="kt-card">
        <div className="kt-card-body p-5 flex flex-col gap-3">
          <h3 className="text-base font-medium">Yeni ders alani</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="kt-input"
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
              className="kt-input grow"
              placeholder="Ornek: Matematik"
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
            />
            <button type="submit" className="kt-btn kt-btn-primary">
              Ekle
            </button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yukleniyor...</p>
      ) : subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henuz konu alani yok.</p>
      ) : (
        subjects.map((subject) => (
          <div key={subject.id} className="kt-card">
            <div className="kt-card-header flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-medium">{subject.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {TOPIC_EXAM_TYPE_LABELS[subject.examType]}
                </p>
              </div>
              <button
                type="button"
                className="kt-btn kt-btn-sm kt-btn-light text-danger"
                onClick={() => void removeSubject(subject.id)}
              >
                Sil
              </button>
            </div>
            <div className="kt-card-body flex flex-col gap-3 p-5">
              {subject.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium">{topic.name}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`kt-btn kt-btn-sm ${topic.progress.completed ? "kt-btn-success" : "kt-btn-light"}`}
                      onClick={() => void toggleTopic(topic.id, topic.progress.completed)}
                    >
                      {topic.progress.completed ? "Tamamlandi" : "Tamamla"}
                    </button>
                    <button
                      type="button"
                      className="kt-btn kt-btn-sm kt-btn-light text-danger"
                      onClick={() => void removeTopic(topic.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="kt-input grow"
                  placeholder="Yeni konu adi"
                  value={topicNames[subject.id] ?? ""}
                  onChange={(event) =>
                    setTopicNames((current) => ({ ...current, [subject.id]: event.target.value }))
                  }
                />
                <button
                  type="button"
                  className="kt-btn kt-btn-light"
                  onClick={() => void handleCreateTopic(subject.id)}
                >
                  Konu ekle
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
