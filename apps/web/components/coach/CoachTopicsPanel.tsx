"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { CoachOdevAtaModal } from "@/components/coach/CoachOdevAtaModal";
import { KonuCizelge } from "@/components/coach/KonuCizelge";
import { CoachSchoolScheduleModal } from "@/components/coach/CoachSchoolScheduleModal";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkNumStepper } from "@/components/design/UkNumStepper";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { NetGainMap } from "@/components/shared/NetGainMap";
import { buildCoachStudentRows } from "@/lib/design/coach-student-rows";
import {
  buildNetData,
  buildPerSubjectStats,
  buildQuestionTracking,
  buildSubjectWeekDistribution,
  buildWeakTopics,
  buildWeekSoru,
  defaultGroupTargets,
  groupDone,
  groupTargetKey,
  resolveExamTrack,
  subjTarget,
  TOPIC_STATUS,
  type TopicState,
  type QuestionChartMode,
} from "@/lib/design/coach-topic-metrics";
import { subjectColor } from "@/lib/design/subject-colors";
import { NOTE_KIND_LABELS } from "@/mocks/coach-notes";
import { RISK_BAND_LABELS } from "@uyanik/shared";
import type {
  CoachNoteKind,
  CoachRosterEntry,
  CoachStudentNoteRecord,
  CurriculumRecord,
  SchoolScheduleRecord,
  SubjectRecord,
  TopicTrackingSummary,
} from "@uyanik/database";

function TopicStatusIcon({ state }: { state: TopicState }) {
  const icon =
    state === "done" ? "ki-check-circle" : state === "progress" ? "ki-time" : "ki-minus-circle";
  const color =
    state === "done" ? "var(--success)" : state === "progress" ? "var(--warning)" : "var(--faint)";
  return <KiIcon name={icon} size={16} style={{ color }} />;
}

export function CoachTopicsPanel() {
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [studentId, setStudentId] = useState("");
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [summary, setSummary] = useState<TopicTrackingSummary | null>(null);
  const [schedule, setSchedule] = useState<SchoolScheduleRecord | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumRecord | null>(null);
  const [notes, setNotes] = useState<CoachStudentNoteRecord[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState<CoachNoteKind>("general");
  const [activeSubject, setActiveSubject] = useState("");
  const [kaynakFilter, setKaynakFilter] = useState<string | "all">("all");
  const [topicView, setTopicView] = useState<"liste" | "cizelge">("cizelge");
  const [chartMode, setChartMode] = useState<QuestionChartMode>("daily");
  const [chartOffset, setChartOffset] = useState(0);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [savedTargets, setSavedTargets] = useState<Record<string, number>>({});
  const [expTarget, setExpTarget] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(false);
  const [odevModal, setOdevModal] = useState<{ open: boolean; subject: string | null; topic: string | null }>({
    open: false,
    subject: null,
    topic: null,
  });
  const [schedModal, setSchedModal] = useState(false);
  const [assignedToast, setAssignedToast] = useState<{ konu: number; soru: number; due?: string } | null>(null);
  const [assignments, setAssignments] = useState<Array<{ studentId: string; completed: boolean; status: string; dueDate: string | null; updatedAt: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingTargets, setIsSavingTargets] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      const [studentsResponse, curriculumResponse] = await Promise.all([
        fetch("/api/coach/students", { credentials: "same-origin" }),
        fetch("/api/coach/curriculum", { credentials: "same-origin" }),
      ]);

      if (studentsResponse.ok) {
        const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
        if (data.students[0]) {
          setStudentId(data.students[0].studentId);
        }
      }

      if (curriculumResponse.ok) {
        const data = (await curriculumResponse.json()) as { curriculum: CurriculumRecord };
        setCurriculum(data.curriculum);
      }

      setIsLoading(false);
    }
    void loadStudents();
  }, []);

  const loadStudentData = useCallback(async () => {
    if (!studentId) {
      return;
    }

    const [topicsResponse, notesResponse, assignmentsResponse, targetsResponse] = await Promise.all([
      fetch(`/api/coach/students/topics?studentId=${encodeURIComponent(studentId)}`, {
        credentials: "same-origin",
      }),
      fetch(`/api/coach/notes?studentId=${encodeURIComponent(studentId)}`, {
        credentials: "same-origin",
      }),
      fetch("/api/coach/assignments", { credentials: "same-origin" }),
      fetch(`/api/coach/students/topic-targets?studentId=${encodeURIComponent(studentId)}`, {
        credentials: "same-origin",
      }),
    ]);

    if (topicsResponse.ok) {
      const data = (await topicsResponse.json()) as {
        topics: { subjects: SubjectRecord[]; summary: TopicTrackingSummary };
        schedule: SchoolScheduleRecord;
      };
      setSubjects(data.topics.subjects);
      setSummary(data.topics.summary);
      setSchedule(data.schedule);
      setActiveSubject((current) => {
        const names = data.topics.subjects.map((subject) => subject.name);
        if (current && names.includes(current)) {
          return current;
        }
        return names[0] ?? "";
      });
      setKaynakFilter("all");
    }

    if (notesResponse.ok) {
      const data = (await notesResponse.json()) as { notes: CoachStudentNoteRecord[] };
      setNotes(data.notes);
    }

    if (assignmentsResponse.ok) {
      const data = (await assignmentsResponse.json()) as {
        assignments: Array<{ studentId: string; completed: boolean; status: string; dueDate: string | null; updatedAt: string }>;
      };
      setAssignments(data.assignments);
    }

    if (targetsResponse.ok) {
      const data = (await targetsResponse.json()) as { targets: Record<string, number> };
      setSavedTargets(data.targets);
    } else {
      setSavedTargets({});
    }
  }, [studentId]);

  useEffect(() => {
    void loadStudentData();
  }, [loadStudentData]);

  const selectedStudent = students.find((student) => student.studentId === studentId);
  const completion = summary?.completionRate ?? 0;
  const examTrack = resolveExamTrack(subjects);
  const perSubj = useMemo(() => buildPerSubjectStats(subjects), [subjects]);
  const totalTopics = perSubj.reduce((sum, subject) => sum + subject.total, 0);
  const doneTopics = perSubj.reduce((sum, subject) => sum + subject.done, 0);
  const totalSoru = perSubj.reduce((sum, subject) => sum + subject.soru, 0);
  const overallPct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : completion;
  const { groups: netData, totalGain } = useMemo(() => buildNetData(examTrack, completion), [examTrack, completion]);
  const weekTotal = useMemo(() => buildWeekSoru(completion).total, [completion]);
  const questionChart = useMemo(
    () => buildQuestionTracking(completion, chartMode, chartOffset),
    [chartMode, chartOffset, completion],
  );
  const subjWeek = useMemo(() => buildSubjectWeekDistribution(perSubj, weekTotal), [perSubj, weekTotal]);
  const weak = useMemo(() => buildWeakTopics(perSubj), [perSubj]);
  const activePerSubj = perSubj.find((subject) => subject.s === activeSubject) ?? perSubj[0];
  const activeKaynakList = useMemo(
    () => (activePerSubj ? [...new Set(activePerSubj.t.flatMap((topic) => topic.kaynaklar))] : []),
    [activePerSubj],
  );
  const filteredTopics = useMemo(() => {
    if (!activePerSubj) return [];
    if (kaynakFilter === "all") return activePerSubj.t;
    return activePerSubj.t.filter((topic) => topic.kaynaklar.includes(kaynakFilter));
  }, [activePerSubj, kaynakFilter]);
  const studentRow = useMemo(
    () => buildCoachStudentRows(students, assignments, []).find((row) => row.studentId === studentId),
    [students, assignments, studentId],
  );

  useEffect(() => {
    if (curriculum) {
      setTargets({ ...defaultGroupTargets(curriculum, subjWeek), ...savedTargets });
    }
  }, [studentId, curriculum, subjWeek, savedTargets]);

  const totalTarget = curriculum
    ? Object.keys(curriculum.subjects).reduce((sum, subject) => sum + subjTarget(subject, curriculum, targets), 0)
    : 0;
  const totalDone = subjWeek.reduce((sum, item) => sum + item.done, 0);

  async function handleAddNote(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !noteText.trim()) {
      return;
    }

    setIsSavingNote(true);
    const response = await fetch("/api/coach/notes", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, text: noteText.trim(), kind: noteKind }),
    });
    setIsSavingNote(false);

    if (response.ok) {
      setNoteText("");
      await loadStudentData();
    }
  }

  async function handleNoteAction(noteId: string, action: "pin" | "delete") {
    const response = await fetch("/api/coach/notes", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, action }),
    });
    if (response.ok) {
      await loadStudentData();
    }
  }

  async function saveTargets() {
    if (!studentId) {
      return;
    }

    setIsSavingTargets(true);
    const response = await fetch("/api/coach/students/topic-targets", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, targets }),
    });
    setIsSavingTargets(false);

    if (response.ok) {
      const data = (await response.json()) as { targets: Record<string, number> };
      setSavedTargets(data.targets);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2000);
    }
  }

  const sortedNotes = [...notes].sort((left, right) => Number(right.pinned) - Number(left.pinned));

  return (
    <div className="stack rise" data-testid="coach-topics-panel">
      <UkPageHead
        title="Konu Takibi"
        sub="Öğrencinin ders bazında konu ilerlemesi, çözülen soru ve net gelişimi"
        actions={
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ minWidth: 200, marginBottom: 0 }}>
              <select
                className="select"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              >
                {students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.displayName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setOdevModal({ open: true, subject: null, topic: null })}
            >
              <KiIcon name="ki-plus" />
              Ödev Ata
            </button>
          </div>
        }
      />

      {selectedStudent ? (
        <div className="card">
          <div className="card-pad" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <UkAvatar name={selectedStudent.displayName} size={52} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>
                  {selectedStudent.displayName}
                </span>
                <UkBadge tone="primary">{examTrack}</UkBadge>
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {examTrack === "LGS" ? "LGS 2026 hedefi" : "Hedef: YKS 2026"} · KAMP US programi
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button type="button" className="btn btn-light btn-sm" onClick={() => setSchedModal(true)}>
                <KiIcon name="ki-calendar" size={15} />
                Okul Programi
              </button>
              {studentRow ? (
                <UkBadge tone={studentRow.risk === "excellent" || studentRow.risk === "normal" ? "success" : studentRow.risk === "attention" ? "warning" : "danger"}>
                  {RISK_BAND_LABELS[studentRow.risk]}
                </UkBadge>
              ) : null}
              <span className="badge badge-muted">
                <KiIcon name="ki-time" size={13} />
                {studentRow?.lastActivity ?? "—"}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {studentId ? <NetGainMap mode="coach" studentId={studentId} /> : null}

      {summary ? (
        <div className="grid g-4">
          <UkStatCard icon="ki-book-open" tone="primary" value={`${overallPct}%`} label="Genel konu tamamlama" />
          <UkStatCard icon="ki-check-circle" tone="success" value={`${doneTopics}/${totalTopics}`} label="Tamamlanan konu" />
          <UkStatCard icon="ki-notepad-edit" tone="info" value={totalSoru.toLocaleString("tr-TR")} label="Cozulen soru" />
          <UkStatCard
            icon="ki-chart-line-up-2"
            tone="warning"
            value={`+${totalGain}`}
            label={examTrack === "LGS" ? "Net gelişimi (LGS)" : "Net gelişimi (TYT+AYT)"}
          />
        </div>
      ) : null}

      <UkSection
        title="Net Gelisimi"
        sub={examTrack === "LGS" ? "Baslangic → Son net (Sayisal / Sozel)" : "Baslangic → Son net (TYT / AYT)"}
        action={
          <UkBadge tone="success">
            +{totalGain} net
          </UkBadge>
        }
      >
        <div className="card-body">
          <div className="grid g-2" style={{ gap: 28 }}>
            {netData.map(({ grp, rows }) => (
              <div key={grp}>
                <div className="row" style={{ gap: 8, marginBottom: 14 }}>
                  <UkBadge tone="primary">{grp}</UkBadge>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Net karsilastirmasi
                  </span>
                </div>
                <div className="subj">
                  {rows.map((row) => {
                    const max = row.max || 40;
                    const gain = row.son - row.bas;
                    return (
                      <div className="subj-row" key={row.ders}>
                        <div className="between" style={{ marginBottom: 7 }}>
                          <span className="sname">{row.ders}</span>
                          <span className="row" style={{ gap: 8 }}>
                            <span className="tnum muted" style={{ fontSize: 12 }}>
                              {row.bas}
                            </span>
                            <KiIcon name="ki-right" size={13} style={{ color: "var(--faint)" }} />
                            <span className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
                              {row.son}
                            </span>
                            {gain > 0 ? (
                              <span className="delta up" style={{ fontSize: 11 }}>
                                <KiIcon name="ki-arrow-up" size={11} />
                                {gain}
                              </span>
                            ) : (
                              <span className="delta flat" style={{ fontSize: 11 }}>
                                0
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="bar" style={{ position: "relative" }}>
                          <span style={{ width: `${(row.bas / max) * 100}%`, background: "var(--border-strong)" }} />
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              height: "100%",
                              width: `${(row.son / max) * 100}%`,
                              background: "var(--primary)",
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </UkSection>

      <div className="grid col-main">
        <UkSection
          title="Haftalik Soru Hedefi"
          sub="Öğrencin için ders bazında hedef belirle"
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={saveTargets} disabled={isSavingTargets}>
              <KiIcon name={savedTick ? "ki-check" : "ki-target"} size={15} />
              {isSavingTargets ? "Kaydediliyor" : savedTick ? "Kaydedildi" : "Hedefleri kaydet"}
            </button>
          }
        >
          <div className="card-body">
            <div
              className="between"
              style={{ marginBottom: 16, padding: "12px 14px", background: "var(--surface-3)", borderRadius: 12 }}
            >
              <div>
                <div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>
                  HAFTALIK TOPLAM HEDEF
                </div>
                <div className="row" style={{ gap: 8, alignItems: "baseline", marginTop: 2 }}>
                  <span className="tnum" style={{ fontSize: 26, fontWeight: 800 }}>
                    {totalTarget.toLocaleString("tr-TR")}
                  </span>
                  <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
                    soru
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>
                  BU HAFTA COZULEN
                </div>
                <div className="row" style={{ gap: 8, alignItems: "baseline", marginTop: 2, justifyContent: "flex-end" }}>
                  <span className="tnum" style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)" }}>
                    {totalDone.toLocaleString("tr-TR")}
                  </span>
                  <UkBadge tone="primary">
                    %{totalTarget ? Math.round((totalDone / totalTarget) * 100) : 0}
                  </UkBadge>
                </div>
              </div>
            </div>

            {curriculum ? (
              <div className="subj" style={{ gap: 10 }}>
                {Object.keys(curriculum.subjects).map((subject) => {
                  const color = subjectColor(subject);
                  const tgt = subjTarget(subject, curriculum, targets);
                  const done = subjWeek.find((item) => item.s === subject)?.done ?? 0;
                  const pct = tgt ? Math.min(100, Math.round((done / tgt) * 100)) : 0;
                  const hit = done >= tgt && tgt > 0;
                  const open = expTarget === subject;
                  const groups = curriculum.subjects[subject] ?? [];

                  return (
                    <div className={`acc-item${open ? " open" : ""}`} key={subject}>
                      <button
                        type="button"
                        className="acc-head"
                        style={{ padding: "11px 14px" }}
                        onClick={() => setExpTarget(open ? null : subject)}
                      >
                        <span
                          className="swatch"
                          style={{ width: 11, height: 11, borderRadius: 4, background: color, flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{subject}</span>
                        <span className="muted" style={{ fontSize: 11 }}>
                          {groups.length} kirilim
                        </span>
                        <div className="row" style={{ gap: 12, marginLeft: "auto" }}>
                          <span
                            className="tnum"
                            style={{
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: hit ? "var(--success)" : "var(--text-2)",
                            }}
                          >
                            {done} / {tgt}
                          </span>
                          <KiIcon
                            name="ki-down"
                            size={16}
                            style={{
                              color: "var(--faint)",
                              transform: open ? "rotate(180deg)" : "none",
                              transition: "transform .2s",
                            }}
                          />
                        </div>
                      </button>
                      <div style={{ padding: "0 14px 11px" }}>
                        <div className="bar">
                          <span style={{ width: `${pct}%`, background: hit ? "var(--success)" : color }} />
                        </div>
                      </div>
                      {open ? (
                        <div className="acc-body" style={{ paddingTop: 2 }}>
                          {groups.map((group) => {
                            const gt = targets[groupTargetKey(subject, group.name)] || 0;
                            const gd = groupDone(subject, group, curriculum, subjWeek);
                            const ghit = gd >= gt && gt > 0;
                            return (
                              <div className="grp-target" key={group.name}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="row" style={{ gap: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 12.5 }}>{group.name}</span>
                                    <span className="muted" style={{ fontSize: 10.5 }}>
                                      {group.topics.length} konu
                                    </span>
                                  </div>
                                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                                    {group.topics.join(" · ")}
                                  </div>
                                </div>
                                <span
                                  className="tnum"
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: ghit ? "var(--success)" : "var(--muted)",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {gd} / {gt}
                                </span>
                                <UkNumStepper
                                  value={gt}
                                  onChange={(value) =>
                                    setTargets((current) => ({
                                      ...current,
                                      [groupTargetKey(subject, group.name)]: value,
                                    }))
                                  }
                                  step={5}
                                  min={0}
                                  max={1000}
                                  size="sm"
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </UkSection>

        <UkSection
          title="Deneme Analizleri"
          sub="En cok yanlis yapilan konular"
          action={<UkBadge tone="danger">{weak.length} zayif konu</UkBadge>}
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weak.map((topic) => {
              const color = subjectColor(topic.subj);
              return (
                <div className="lrow" key={`${topic.subj}-${topic.n}`}>
                  <span
                    className="lr-icon"
                    style={{ background: `color-mix(in srgb, ${color} 13%, transparent)`, color }}
                  >
                    <KiIcon name="ki-information-2" size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{topic.n}</div>
                    <div className="lr-meta">
                      <span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 7px" }}>
                        <span className="swatch" style={{ background: color }} />
                        {topic.subj}
                      </span>
                      <span className="d" style={{ color: "var(--danger)", fontWeight: 700 }}>
                        {topic.yanlis} yanlis
                      </span>
                      <span className="d">%{topic.oran} dogru</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setOdevModal({ open: true, subject: topic.subj, topic: topic.n })}
                  >
                    <KiIcon name="ki-plus" size={15} />
                    Ödev ata
                  </button>
                </div>
              );
            })}
          </div>
        </UkSection>
      </div>

      <UkSection
        title="Soru Takibi"
        sub={questionChart.caption}
        action={
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <div className="seg" style={{ width: "fit-content" }}>
              {(["daily", "weekly", "monthly"] as QuestionChartMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={chartMode === mode ? "on" : ""}
                  onClick={() => setChartMode(mode)}
                >
                  {mode === "daily" ? "Gunluk" : mode === "weekly" ? "Haftalik" : "Aylik"}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-light btn-sm" onClick={() => setChartOffset((value) => value + 1)}>
              Onceki
            </button>
            <UkBadge tone="primary">{questionChart.total.toLocaleString("tr-TR")} soru</UkBadge>
          </div>
        }
      >
        <div className="card-body">
          <UkBarChart
            data={questionChart.points}
            gradient
            peakIdx={questionChart.points.reduce(
              (maxIndex, point, index, array) => (point.value > array[maxIndex].value ? index : maxIndex),
              0,
            )}
          />
        </div>
      </UkSection>

      <div className="between" style={{ alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Konu Tablosu</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 3 }}>
            Ders bazinda konu ilerlemesi ve soru takibi
          </p>
        </div>
        <div className="seg" style={{ width: "fit-content" }}>
          <button type="button" className={topicView === "liste" ? "on" : ""} onClick={() => setTopicView("liste")}>
            <KiIcon name="ki-notepad-edit" size={15} />
            Liste
          </button>
          <button type="button" className={topicView === "cizelge" ? "on" : ""} onClick={() => setTopicView("cizelge")}>
            <KiIcon name="ki-book-open" size={15} />
            Cizelge
          </button>
        </div>
      </div>

      {topicView === "cizelge" ? (
        <KonuCizelge
          studentId={studentId}
          subjects={subjects}
          maxHeight="58vh"
          showTip={false}
          subj={activeSubject}
          onSubj={setActiveSubject}
        />
      ) : (
        <div className="grid col-rail">
          <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-head">
            <h3>Dersler</h3>
          </div>
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {isLoading ? (
              <p className="muted" style={{ fontSize: 13, padding: 8 }}>
                Yükleniyor...
              </p>
            ) : (
              perSubj.map((subject) => {
                const color = subjectColor(subject.s);
                const on = subject.s === activeSubject;
                const pct = subject.total > 0 ? Math.round((subject.done / subject.total) * 100) : 0;
                return (
                  <button
                    key={subject.s}
                    type="button"
                    className="user-card"
                    style={{ background: on ? "var(--surface-3)" : "none", borderRadius: 11 }}
                    onClick={() => setActiveSubject(subject.s)}
                  >
                    <span
                      className="swatch"
                      style={{ width: 10, height: 10, borderRadius: 4, background: color, flexShrink: 0 }}
                    />
                    <div className="user-meta" style={{ flex: 1 }}>
                      <b style={{ fontSize: 13, color: on ? color : "var(--text)" }}>{subject.s}</b>
                      <span style={{ fontSize: 11 }}>
                        {subject.done}/{subject.total} konu · {subject.soru} soru
                      </span>
                    </div>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color }}>
                      {pct}%
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {activePerSubj ? (
          <UkSection
            title={activePerSubj.s}
            sub={`${activePerSubj.done}/${activePerSubj.total} konu tamamlandi · ${activePerSubj.soru} soru cozuldu`}
            action={
              <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className={`type-chip${kaynakFilter === "all" ? " on" : ""}`}
                  style={{ height: 24, fontSize: 11 }}
                  onClick={() => setKaynakFilter("all")}
                >
                  Tümü
                </button>
                {activeKaynakList.map((source) => (
                  <button
                    key={source}
                    type="button"
                    className={`type-chip${kaynakFilter === source ? " on" : ""}`}
                    style={{ height: 24, fontSize: 11 }}
                    onClick={() => setKaynakFilter(source)}
                  >
                    <KiIcon name="ki-book-open" size={12} />
                    {source}
                  </button>
                ))}
              </div>
            }
          >
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              <table className="tbl" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>Konu</th>
                    <th>Kaynaklar</th>
                    <th style={{ textAlign: "center" }}>Soru</th>
                    <th style={{ textAlign: "center" }}>Dogru</th>
                    <th style={{ textAlign: "right" }}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted" style={{ padding: 16, textAlign: "center" }}>
                        Secilen kaynakta konu yok.
                      </td>
                    </tr>
                  ) : (
                    filteredTopics.map((topic) => {
                    const cfg = TOPIC_STATUS[topic.s];
                    return (
                      <tr key={`${topic.n}-${topic.kaynaklar.join("-")}`}>
                        <td>
                          <div className="row" style={{ gap: 10 }}>
                            <TopicStatusIcon state={topic.s} />
                            <b style={{ fontSize: 13, fontWeight: 700 }}>{topic.n}</b>
                          </div>
                        </td>
                        <td>
                          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                            {topic.kaynaklar.map((source, sourceIndex) => {
                              const done = topic.kaynakDone[sourceIndex];
                              return (
                                <span
                                  key={source}
                                  className="src-pill"
                                  style={{
                                    borderColor: done ? "var(--success)" : "var(--border)",
                                    color: done ? "var(--success)" : "var(--text-2)",
                                    background: done ? "var(--success-soft)" : "var(--surface-2)",
                                  }}
                                >
                                  <KiIcon name={done ? "ki-check" : "ki-book-open"} size={11} />
                                  {source}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="tnum" style={{ fontWeight: 700 }}>
                            {topic.soru || "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className="tnum"
                            style={{ fontWeight: 700, color: topic.dogru ? "var(--success)" : "var(--faint)" }}
                          >
                            {topic.dogru || "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <UkBadge tone={cfg.tone}>{cfg.label}</UkBadge>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </UkSection>
        ) : null}
        </div>
      )}

      <UkSection title="Öğrenci notları" sub={`${notes.length} not`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <form onSubmit={handleAddNote} className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {(Object.keys(NOTE_KIND_LABELS) as CoachNoteKind[]).map((kind) => {
                const meta = NOTE_KIND_LABELS[kind];
                return (
                  <button
                    key={kind}
                    type="button"
                    className={`type-chip${noteKind === kind ? " on" : ""}`}
                    onClick={() => setNoteKind(kind)}
                  >
                    <KiIcon name={meta.icon} size={13} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Not ekle veya uyari yaz..."
              />
              <button type="submit" disabled={isSavingNote || !noteText.trim()} className="btn btn-primary">
                <KiIcon name="ki-plus" />
                {isSavingNote ? "Kaydediliyor..." : "Ekle"}
              </button>
            </div>
          </form>

          {sortedNotes.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz not yok.
            </p>
          ) : (
            sortedNotes.map((note) => {
              const meta = NOTE_KIND_LABELS[note.kind];
              return (
                <div
                  key={note.id}
                  className="lrow"
                  style={{
                    alignItems: "flex-start",
                    borderColor: note.pinned ? "color-mix(in srgb, var(--warning) 40%, transparent)" : "var(--border)",
                  }}
                >
                  <span className={`stat-icon tone-${meta.tone}`} style={{ width: 38, height: 38 }}>
                    <KiIcon name={meta.icon} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.45 }}>{note.text}</div>
                    <div className="lr-meta">
                      <UkBadge tone={meta.tone}>{meta.label}</UkBadge>
                      {note.pinned ? (
                        <span className="d" style={{ color: "var(--warning)", fontWeight: 700 }}>
                          Sabit
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 2 }}>
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() => void handleNoteAction(note.id, "pin")}
                      aria-label="Sabitle"
                    >
                      <KiIcon name="ki-star" size={15} />
                    </button>
                    <button
                      type="button"
                      className="mini-btn danger"
                      onClick={() => void handleNoteAction(note.id, "delete")}
                      aria-label="Sil"
                    >
                      <KiIcon name="ki-plus" size={15} style={{ transform: "rotate(45deg)" }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </UkSection>

      <CoachOdevAtaModal
        open={odevModal.open}
        onClose={() => setOdevModal({ open: false, subject: null, topic: null })}
        studentId={studentId}
        studentName={selectedStudent?.displayName ?? "Öğrenci"}
        curriculum={curriculum}
        initialSubject={odevModal.subject}
        initialTopic={odevModal.topic}
        onAssigned={(toast) => {
          setAssignedToast(toast);
          setTimeout(() => setAssignedToast(null), 3600);
          void loadStudentData();
        }}
      />

      <CoachSchoolScheduleModal
        open={schedModal}
        onClose={() => setSchedModal(false)}
        studentName={selectedStudent?.displayName ?? "Öğrenci"}
        schedule={schedule}
      />

      {assignedToast
        ? createPortal(
            <div className="toast">
              <span
                className="lr-icon"
                style={{ width: 34, height: 34, background: "var(--success-soft)", color: "var(--success)" }}
              >
                <KiIcon name="ki-check-circle" size={18} />
              </span>
              <div>
                <b style={{ fontSize: 13.5, fontWeight: 700 }}>Ödev atandi</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  {assignedToast.konu} konu · {assignedToast.soru} soru{" "}
                  {selectedStudent?.displayName.split(" ")[0]}&apos;e gonderildi
                  {assignedToast.due
                    ? ` · son tarih ${new Date(assignedToast.due).toLocaleDateString("tr-TR")}`
                    : ""}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
