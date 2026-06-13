"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { filterSubjectsForStudentExam, studentSinav } from "@/lib/design/student-exam";
import { subjectColor } from "@/lib/design/subject-colors";
import { TOPIC_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type { SubjectRecord, TopicExamType, TopicRecord, TopicTrackingSummary } from "@uyanik/database";


type TopicStatus = "todo" | "progress" | "done";

function getTopicStatus(topic: TopicRecord): TopicStatus {
  if (topic.progress.completed) {
    return "done";
  }
  if (topic.progress.inProgress) {
    return "progress";
  }
  return "todo";
}

function nextTopicStatus(current: TopicStatus): TopicStatus {
  if (current === "todo") return "progress";
  if (current === "progress") return "done";
  return "todo";
}

function statusLabel(status: TopicStatus): string {
  if (status === "done") return "Tamamlandı";
  if (status === "progress") return "Devam ediyor";
  return "Başlanmadı";
}

function statusSquareColor(status: TopicStatus): string {
  if (status === "done") return "var(--success)";
  if (status === "progress") return "var(--warning)";
  return "var(--surface-3)";
}

function statusIcon(status: TopicStatus): string {
  if (status === "done") return "ki-check-circle";
  if (status === "progress") return "ki-time";
  return "ki-book-open";
}

function downloadTopicReport(subjects: SubjectRecord[]) {
  const rows = ["Ders,Konu,Durum"];
  for (const subject of subjects) {
    for (const topic of subject.topics) {
      const status = getTopicStatus(topic);
      rows.push(`${subject.name},${topic.name},${statusLabel(status)}`);
    }
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "konu-takip-raporu.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StudentTopicPanel() {
  const { data: session } = useSession();
  const examProfile = useMemo(
    () =>
      studentSinav({
        email: session?.user?.email,
        studentId: session?.user?.studentId,
      }),
    [session?.user?.email, session?.user?.studentId],
  );

  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [studentSources, setStudentSources] = useState<string[]>([]);
  const [summary, setSummary] = useState<TopicTrackingSummary | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [subjectExamType, setSubjectExamType] = useState<TopicExamType>("TYT");
  const [topicNames, setTopicNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [topicsRes, sourcesRes] = await Promise.all([
      fetch("/api/student/topics", { credentials: "same-origin" }),
      fetch("/api/student/sources", { credentials: "same-origin" }),
    ]);
    if (topicsRes.ok) {
      const data = (await topicsRes.json()) as {
        subjects: SubjectRecord[];
        summary: TopicTrackingSummary;
      };
      const filtered = filterSubjectsForStudentExam(data.subjects, examProfile);
      setSubjects(filtered);
      setSummary(data.summary);
      setActiveSubjectId((current) => {
        if (current && filtered.some((subject) => subject.id === current)) {
          return current;
        }
        return filtered[0]?.id ?? null;
      });
    }
    if (sourcesRes.ok) {
      const data = (await sourcesRes.json()) as { sources: string[] };
      setStudentSources(data.sources);
    }
    setIsLoading(false);
  }, [examProfile]);

  useEffect(() => {
    setSubjectExamType(examProfile.defaultExamType);
    setSubjectName(examProfile.subjects[0] ?? "");
  }, [examProfile]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeSubject = subjects.find((subject) => subject.id === activeSubjectId) ?? subjects[0] ?? null;
  const inProgressTopics = useMemo(
    () => subjects.reduce((acc, subject) => acc + subject.topics.filter((topic) => getTopicStatus(topic) === "progress").length, 0),
    [subjects],
  );
  const notStartedTopics = summary ? Math.max(0, summary.totalTopics - summary.completedTopics - inProgressTopics) : 0;

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

  async function toggleTopicSource(topic: TopicRecord, source: string) {
    const response = await fetch(`/api/student/topics/${topic.id}?kind=topic`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleSource: source }),
    });
    if (response.ok) {
      await load();
    }
  }

  async function cycleTopicStatus(topic: TopicRecord) {
    const next = nextTopicStatus(getTopicStatus(topic));
    const response = await fetch(`/api/student/topics/${topic.id}?kind=topic`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
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
        sub="YKS müfredatına göre konu konu ilerlemen"
        actions={
          subjects.length > 0 ? (
            <button type="button" className="btn btn-light btn-sm" onClick={() => downloadTopicReport(subjects)}>
              <KiIcon name="ki-cloud-download" />
              Rapor indir
            </button>
          ) : null
        }
      />

      {summary ? (
        <div className="card">
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
              <span className="tnum" style={{ fontSize: 30, fontWeight: 850, letterSpacing: "-.02em" }}>%{summary.completionRate}</span>
              <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>genel ilerleme · {summary.totalTopics} konu</span>
            </div>
            <div className="row" style={{ gap: 18, flexWrap: "wrap", fontSize: 12.5, fontWeight: 600 }}>
              <span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: "var(--success)" }} />Tamamlanan <b className="tnum">{summary.completedTopics}</b></span>
              <span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: "var(--warning)" }} />Devam eden <b className="tnum">{inProgressTopics}</b></span>
              <span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: "var(--surface-3)" }} />Başlanmadı <b className="tnum">{notStartedTopics}</b></span>
            </div>
            <div className="bar" style={{ height: 12, display: "flex", overflow: "hidden" }}>
              <span style={{ width: `${summary.totalTopics ? (summary.completedTopics / summary.totalTopics) * 100 : 0}%`, background: "var(--success)" }} />
              <span style={{ width: `${summary.totalTopics ? (inProgressTopics / summary.totalTopics) * 100 : 0}%`, background: "var(--warning)" }} />
            </div>
          </div>
        </div>
      ) : null}

      {subjects.length > 0 ? (
        <UkSection title="Müfredat haritası" sub="Her kare bir konu — yeşil tam, sarı devam, kesik gri başlanmadı. Bir kareye dokun, durumunu değiştir.">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subjects.map((subject) => {
              const done = subject.topics.filter((topic) => topic.progress.completed).length;
              const total = subject.topics.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={subject.id} className="between" style={{ gap: 14, flexWrap: "wrap" }}>
                  <span className="row" style={{ gap: 8, minWidth: 130 }}>
                    <span className="swatch" style={{ background: subjectColor(subject.name) }} />
                    <b style={{ fontSize: 13 }}>{subject.name}</b>
                  </span>
                  <div className="row" style={{ gap: 5, flexWrap: "wrap", flex: 1, justifyContent: "flex-start" }}>
                    {subject.topics.map((topic) => {
                      const status = getTopicStatus(topic);
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          title={`${topic.name} · ${statusLabel(status)}`}
                          aria-label={`${topic.name} · ${statusLabel(status)}`}
                          onClick={() => void cycleTopicStatus(topic)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            cursor: "pointer",
                            background: statusSquareColor(status),
                            border: status === "todo" ? "1.5px dashed var(--border-strong)" : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="tnum" style={{ fontWeight: 800, color: subjectColor(subject.name), minWidth: 42, textAlign: "right" }}>%{pct}</span>
                </div>
              );
            })}
          </div>
        </UkSection>
      ) : null}

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Yükleniyor...
        </p>
      ) : subjects.length === 0 ? (
        <UkSection title="Konu alanı yok">
          <div className="card-body muted" style={{ fontSize: 13 }}>
            Aşağıdan yeni ders alanı ekleyebilirsin.
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
                {showEditor ? "Düzenlemeyi kapat" : "Düzenle"}
              </button>
            }
          >
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeSubject.topics.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Bu derste henüz konu yok.
                </p>
              ) : (
                activeSubject.topics.map((topic) => {
                  const color = subjectColor(activeSubject.name);
                  const status = getTopicStatus(topic);
                  const progressWidth = status === "done" ? "100%" : status === "progress" ? "50%" : "0%";
                  return (
                    <div key={topic.id} className={`lrow${status === "done" ? " done" : ""}`}>
                      <button
                        type="button"
                        className="lr-icon"
                        style={{
                          background: `color-mix(in srgb, ${color} 13%, transparent)`,
                          color,
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => void cycleTopicStatus(topic)}
                        aria-label={`${topic.name} durumunu değiştir`}
                      >
                        <KiIcon name={statusIcon(status)} size={18} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lr-title">{topic.name}</div>
                        <div className="bar thin" style={{ marginTop: 8, maxWidth: 220 }}>
                          <span style={{ width: progressWidth, background: color }} />
                        </div>
                        {status === "done" && studentSources.length > 0 ? (
                          <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                            {studentSources.map((source) => {
                              const done = topic.progress.completedSources?.includes(source);
                              return (
                                <button
                                  key={source}
                                  type="button"
                                  className={`type-chip${done ? " on" : ""}`}
                                  style={{ height: 26, fontSize: 11 }}
                                  onClick={() => void toggleTopicSource(topic, source)}
                                >
                                  {done ? "✓ " : ""}
                                  {source}
                                  {done ? " · bitirdim" : ""}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                      <UkBadge tone={status === "done" ? "success" : status === "progress" ? "warning" : "muted"}>
                        {statusLabel(status)}
                      </UkBadge>
                      {showEditor ? (
                        <div className="row" style={{ gap: 8 }}>
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
                          className="btn btn-sm btn-light"
                          onClick={() => void cycleTopicStatus(topic)}
                        >
                          Durumu değiştir
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
                    placeholder="Yeni konu adı"
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

      <UkSection title="Yeni ders alanı">
        <form onSubmit={handleCreateSubject} className="card-body">
          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <select
              className="select"
              style={{ minWidth: 140 }}
              value={subjectExamType}
              onChange={(event) => setSubjectExamType(event.target.value as TopicExamType)}
            >
              {(examProfile.kind === "LGS" ? (["LGS", "GENEL"] as TopicExamType[]) : (["TYT", "AYT", "GENEL"] as TopicExamType[])).map(
                (examType) => (
                  <option key={examType} value={examType}>
                    {TOPIC_EXAM_TYPE_LABELS[examType]}
                  </option>
                ),
              )}
            </select>
            <select
              className="select"
              style={{ minWidth: 160 }}
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
            >
              {examProfile.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              Ekle
            </button>
          </div>
        </form>
      </UkSection>
    </div>
  );
}
