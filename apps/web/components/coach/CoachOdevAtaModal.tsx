"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import {
  KAYNAK_TUR,
  kaynakLabel,
  katalogByLabel,
  katalogList,
  katalogPublishers,
  sourcesForSubject,
} from "@/lib/design/kaynak-catalog";
import { groupTargetKey } from "@/lib/design/coach-topic-metrics";
import { subjectColor } from "@/lib/design/subject-colors";
import type { SourceStatus, StudentSourceTracker } from "@/mocks/student-sources";
import type { CurriculumRecord } from "@uyanik/database";

type OdevTypeKey = "soru" | "video" | "konu" | "test";

type Recipient = { studentId: string; name: string };

type CoachOdevAtaModalProps = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  curriculum: CurriculumRecord | null;
  /** Toplu atama: verilirse "Kime" chip'leri görünür, çoklu öğrenciye atanır. */
  roster?: Recipient[];
  defaultAll?: boolean;
  examType?: "YKS" | "LGS";
  initialSubject?: string | null;
  initialTopic?: string | null;
  onAssigned?: (summary: { konu: number; soru: number; due?: string }) => void;
};

const ODEV_TYPES: { key: OdevTypeKey; label: string; icon: string }[] = [
  { key: "soru", label: "Soru Çözümü", icon: "ki-notepad-edit" },
  { key: "video", label: "Video İzleme", icon: "ki-technology-2" },
  { key: "konu", label: "Konu Çalışması", icon: "ki-book-open" },
  { key: "test", label: "Deneme/Test", icon: "ki-chart-simple" },
];

const KAYNAK_DURUM: Record<SourceStatus, { label: string; tone: "muted" | "info" | "success" }> = {
  beklemede: { label: "Beklemede", tone: "muted" },
  aktif: { label: "Aktif", tone: "info" },
  bitti: { label: "Tamamlandı", tone: "success" },
};

const DUR_COLOR: Record<"muted" | "info" | "success", string> = {
  muted: "var(--faint)",
  info: "var(--info)",
  success: "var(--success)",
};

function topicKey(subject: string, topic: string): string {
  return `${subject}::${topic}`;
}

function norm(value: string): string {
  return (value || "").toLocaleLowerCase("tr-TR");
}

/** Klavyeden yazılabilir + butonlu sayı girişi (oa-stepper). */
function OaStepper({
  value,
  onChange,
  step = 10,
  min = 0,
  max = 9999,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (raw: string | number) => {
    let n = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(n)) n = min;
    n = Math.max(min, Math.min(max, n));
    onChange(n);
    setText(String(n));
  };

  return (
    <div className="oa-stepper" onClick={(event) => event.stopPropagation()} role="presentation">
      <button type="button" onClick={() => commit(value - step)} aria-label="Azalt">
        −
      </button>
      <input
        className="tnum"
        value={text}
        onChange={(event) => setText(event.target.value.replace(/[^\d]/g, ""))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit(event.currentTarget.value);
            event.currentTarget.blur();
          }
        }}
        inputMode="numeric"
        aria-label="Hedef değeri"
      />
      <button type="button" onClick={() => commit(value + step)} aria-label="Artır">
        +
      </button>
    </div>
  );
}

export function CoachOdevAtaModal({
  open,
  onClose,
  studentId,
  studentName,
  curriculum,
  roster,
  defaultAll,
  examType,
  initialSubject,
  initialTopic,
  onAssigned,
}: CoachOdevAtaModalProps) {
  const [mounted, setMounted] = useState(false);
  const subjects = useMemo(() => Object.keys(curriculum?.subjects ?? {}), [curriculum]);

  const bulkRoster = roster ?? [];
  const isBulk = bulkRoster.length > 0;
  const examKey: "YKS" | "LGS" = examType === "LGS" ? "LGS" : "YKS";

  const [activeSubject, setActiveSubject] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [recipients, setRecipients] = useState<string[]>([]);
  const [types, setTypes] = useState<OdevTypeKey[]>(["soru"]);
  const [defSoru, setDefSoru] = useState(30);
  const [defTest, setDefTest] = useState(5);
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceBySubject, setSourceBySubject] = useState<Record<string, string>>({});
  const [srcSearch, setSrcSearch] = useState("");
  const [srcOpen, setSrcOpen] = useState(false);
  const [srcPub, setSrcPub] = useState("Tümü");
  const [tracker, setTracker] = useState<StudentSourceTracker | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const firstSubject = initialSubject && subjects.includes(initialSubject) ? initialSubject : subjects[0] ?? "";
    setActiveSubject(firstSubject);
    setNote("");
    setDue("");
    setDone(false);
    setTypes(["soru"]);
    setDefSoru(30);
    setDefTest(5);
    setSourceBySubject({});
    setSrcSearch("");
    setSrcPub("Tümü");
    setSrcOpen(false);
    setTracker(null);
    setRecipients(defaultAll ? bulkRoster.map((item) => item.studentId) : isBulk ? [] : [studentId]);

    if (initialSubject && initialTopic) {
      setSelected({ [topicKey(initialSubject, initialTopic)]: 30 });
    } else {
      setSelected({});
    }
  }, [open, initialSubject, initialTopic, subjects, studentId]);

  const hasSoru = types.includes("soru");
  const hasTest = types.includes("test");
  const showCount = hasSoru || hasTest;
  const unitSoru = hasSoru;
  const unitLabel = unitSoru ? "soru" : "test";
  const cStep = unitSoru ? 10 : 1;
  const cMax = unitSoru ? 500 : 50;
  const defCount = unitSoru ? defSoru : defTest;

  const targets = isBulk ? recipients : [studentId];
  const sourceStudentId = isBulk ? recipients[0] ?? bulkRoster[0]?.studentId ?? studentId : studentId;

  useEffect(() => {
    if (!open || !sourceStudentId) {
      return;
    }
    let active = true;
    async function loadSources() {
      const response = await fetch(`/api/coach/students/${sourceStudentId}/sources`, { credentials: "same-origin" });
      if (!active) return;
      if (response.ok) {
        const data = (await response.json()) as { tracker?: StudentSourceTracker };
        setTracker(data.tracker ?? null);
      }
    }
    void loadSources();
    return () => {
      active = false;
    };
  }, [open, sourceStudentId]);

  const selectedKeys = Object.keys(selected);
  const totalSoru = selectedKeys.reduce((sum, key) => sum + (selected[key] || 0), 0);

  const toggleType = useCallback((key: OdevTypeKey) => {
    setTypes((current) =>
      current.includes(key) ? (current.length > 1 ? current.filter((item) => item !== key) : current) : [...current, key],
    );
  }, []);

  const toggleTopic = useCallback(
    (subject: string, topic: string) => {
      const key = topicKey(subject, topic);
      setSelected((current) => {
        const next = { ...current };
        if (next[key] != null) {
          delete next[key];
        } else {
          next[key] = defCount;
        }
        return next;
      });
    },
    [defCount],
  );

  const setSoru = useCallback((subject: string, topic: string, value: number) => {
    setSelected((current) => ({ ...current, [topicKey(subject, topic)]: value }));
  }, []);

  const toggleGroup = useCallback(
    (subject: string, topics: string[], selectAll: boolean) => {
      setSelected((current) => {
        const next = { ...current };
        for (const topic of topics) {
          const key = topicKey(subject, topic);
          if (selectAll) {
            next[key] = next[key] ?? defCount;
          } else {
            delete next[key];
          }
        }
        return next;
      });
    },
    [defCount],
  );

  const subjSelCount = useCallback(
    (subject: string) => selectedKeys.filter((key) => key.startsWith(`${subject}::`)).length,
    [selectedKeys],
  );

  const toggleRecipient = useCallback((id: string) => {
    setRecipients((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const studentItems = tracker?.items ?? [];
  const srcPubOpts = useMemo(() => katalogPublishers({ exam: examKey, subject: activeSubject }), [examKey, activeSubject]);
  const catalogHits = useMemo(
    () => katalogList({ exam: examKey, subject: activeSubject, pub: srcPub === "Tümü" ? undefined : srcPub, q: srcSearch }),
    [examKey, activeSubject, srcPub, srcSearch],
  );

  const studentForActive = studentItems.filter((item) => {
    const k = katalogByLabel(item.name);
    const subjOk = k ? k.s === activeSubject : true;
    return subjOk && srcPub === "Tümü" && norm(item.name).includes(norm(srcSearch));
  });
  const studentNameSet = new Set(studentForActive.map((item) => item.name));
  const myCustom = studentItems
    .map((item) => item.name)
    .filter((name) => !katalogByLabel(name) && srcPub === "Tümü" && norm(name).includes(norm(srcSearch)));

  const activeSource = sourceBySubject[activeSubject] || "";
  const activeItem = studentItems.find((item) => item.name === activeSource) ?? null;
  const activeCat = activeSource ? katalogByLabel(activeSource) : null;

  const allRecipientsOn = bulkRoster.length > 0 && recipients.length === bulkRoster.length;

  function sourceForSubject(subject: string): string {
    return (
      sourceBySubject[subject] ||
      tracker?.items.find((item) => item.status === "aktif")?.name ||
      sourcesForSubject(subject)[0] ||
      ""
    );
  }

  async function handleAssign() {
    if (selectedKeys.length === 0 || targets.length === 0) {
      return;
    }
    const primary: OdevTypeKey = hasSoru ? "soru" : hasTest ? "test" : types[0]!;
    const items = selectedKeys.map((key) => {
      const [subject, topic] = key.split("::");
      return {
        subject,
        topic,
        source: sourceBySubject[subject!] || sourceForSubject(subject!),
        count: selected[key] ?? defCount,
        type: primary,
        types,
        note: note.trim() || undefined,
        due: due || undefined,
      };
    });

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/coach/assignments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: targets, items }),
      });
      if (!response.ok) {
        throw new Error("Ödev atanamadı");
      }
      setDone(true);
      onAssigned?.({ konu: selectedKeys.length, soru: totalSoru, due: due || undefined });
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1400);
    } catch {
      setDone(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open || !mounted || !curriculum) {
    return null;
  }

  const activeGroups = curriculum.subjects[activeSubject] ?? [];
  const canAssign = selectedKeys.length > 0 && targets.length > 0;

  return createPortal(
    <div className="oa-overlay" onClick={onClose} role="presentation">
      <div className="oa-sheet" onClick={(event) => event.stopPropagation()} role="presentation">
        {/* header */}
        <div className="oa-head">
          <span className="ic">
            <KiIcon name="ki-notepad-edit" size={19} />
          </span>
          <div className="tx">
            <h3>{isBulk ? "Toplu Ödev Ata" : "Ödev Ata"}</h3>
            <p>
              {isBulk
                ? `${recipients.length} öğrenci · derslere ve konulara ata`
                : `${studentName} · derslere ve konulara ata`}
            </p>
          </div>
          <button type="button" className="oa-x" onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        {/* config */}
        <div className="oa-config">
          {isBulk ? (
            <div className="oa-field">
              <span className="oa-label">
                Kime
                <span className="sub">
                  {recipients.length}/{bulkRoster.length}
                </span>
              </span>
              <div className="oa-chips">
                {bulkRoster.map((item) => {
                  const on = recipients.includes(item.studentId);
                  return (
                    <button
                      key={item.studentId}
                      type="button"
                      className={`oa-chip${on ? " on" : ""}`}
                      onClick={() => toggleRecipient(item.studentId)}
                    >
                      <span className="tick">
                        <KiIcon name="ki-check" size={11} />
                      </span>
                      {item.name}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="oa-allbtn"
                onClick={() => setRecipients(allRecipientsOn ? [] : bulkRoster.map((item) => item.studentId))}
              >
                {allRecipientsOn ? "Seçimi kaldır" : "Tümünü seç"}
              </button>
            </div>
          ) : null}

          <div className="oa-field">
            <span className="oa-label">Tür</span>
            <div className="oa-chips">
              {ODEV_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  className={`oa-chip${types.includes(type.key) ? " on" : ""}`}
                  onClick={() => toggleType(type.key)}
                >
                  <span className="tick">
                    <KiIcon name="ki-check" size={11} />
                  </span>
                  <KiIcon name={type.icon} size={14} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="oa-field">
            <span className="oa-label">
              Kaynak<span className="sub">{activeSubject}</span>
            </span>
            <div className="oa-srcwrap">
              <button
                type="button"
                className="oa-srctrigger"
                onClick={() => {
                  setSrcOpen((value) => !value);
                  setSrcSearch("");
                }}
              >
                <KiIcon name="ki-book-open" size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
                <span className={`lbl${activeSource ? "" : " ph"}`}>{activeSource || "Otomatik (derse göre)"}</span>
                <KiIcon name="ki-down" size={15} style={{ color: "var(--faint)" }} />
              </button>
              {srcOpen ? (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 5 }} onClick={() => setSrcOpen(false)} role="presentation" />
                  <div className="oa-pop">
                    <div className="oa-popsearch">
                      <KiIcon name="ki-magnifier" size={15} style={{ color: "var(--muted)" }} />
                      <input
                        autoFocus
                        placeholder={`${activeSubject} kaynağı ara...`}
                        value={srcSearch}
                        onChange={(event) => setSrcSearch(event.target.value)}
                      />
                    </div>
                    {srcPubOpts.length > 1 ? (
                      <div className="oa-pubs">
                        <button
                          type="button"
                          className={`oa-pub${srcPub === "Tümü" ? " on" : ""}`}
                          onClick={() => setSrcPub("Tümü")}
                        >
                          Tümü
                        </button>
                        {srcPubOpts.map((pub) => (
                          <button
                            key={pub}
                            type="button"
                            className={`oa-pub${srcPub === pub ? " on" : ""}`}
                            onClick={() => setSrcPub(pub)}
                          >
                            {pub}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="oa-poplist">
                      <button
                        type="button"
                        className="oa-srcitem"
                        onClick={() => {
                          setSourceBySubject((current) => ({ ...current, [activeSubject]: "" }));
                          setSrcOpen(false);
                        }}
                      >
                        <span className="ic" style={{ color: "var(--muted)" }}>
                          <KiIcon name="ki-flash" size={14} />
                        </span>
                        <div className="body">
                          <span className="t1">Otomatik (derse göre)</span>
                          <span className="t2">öğrencinin kaynağına göre seçilir</span>
                        </div>
                      </button>

                      {studentForActive.length > 0 || myCustom.filter((name) => !studentNameSet.has(name)).length > 0 ? (
                        <div className="oa-grouphd">Öğrencide olanlar</div>
                      ) : null}
                      {studentForActive.map((item) => {
                        const k = katalogByLabel(item.name);
                        const tur = k ? KAYNAK_TUR[k.t] : null;
                        const dur = KAYNAK_DURUM[item.status];
                        const dcol = DUR_COLOR[dur.tone];
                        return (
                          <button
                            key={item.name}
                            type="button"
                            className={`oa-srcitem${activeSource === item.name ? " on" : ""}`}
                            onClick={() => {
                              setSourceBySubject((current) => ({ ...current, [activeSubject]: item.name }));
                              setSrcOpen(false);
                            }}
                          >
                            <span className="ic" style={{ color: "var(--primary)" }}>
                              <KiIcon name={tur ? tur.icon : "ki-book-open"} size={14} />
                            </span>
                            <div className="body">
                              <span className="t1">{k ? k.n : item.name}</span>
                              <span className="t2">
                                {k ? `${k.p} · ` : "Özel · "}
                                <span style={{ color: dcol, fontWeight: 700 }}>
                                  {dur.label} · %{item.progress}
                                </span>
                              </span>
                            </div>
                            <span className="mini">
                              <span style={{ width: `${item.progress}%`, background: dcol }} />
                            </span>
                          </button>
                        );
                      })}
                      {myCustom
                        .filter((name) => !studentNameSet.has(name))
                        .map((name) => (
                          <button
                            key={name}
                            type="button"
                            className={`oa-srcitem${activeSource === name ? " on" : ""}`}
                            onClick={() => {
                              setSourceBySubject((current) => ({ ...current, [activeSubject]: name }));
                              setSrcOpen(false);
                            }}
                          >
                            <span className="ic" style={{ color: "var(--faint)" }}>
                              <KiIcon name="ki-book-open" size={14} />
                            </span>
                            <div className="body">
                              <span className="t1">{name}</span>
                              <span className="t2">özel kaynak</span>
                            </div>
                          </button>
                        ))}

                      {catalogHits.filter((entry) => !studentNameSet.has(kaynakLabel(entry))).length > 0 ? (
                        <div className="oa-grouphd">
                          Katalog · {catalogHits.filter((entry) => !studentNameSet.has(kaynakLabel(entry))).length}
                        </div>
                      ) : null}
                      {catalogHits
                        .filter((entry) => !studentNameSet.has(kaynakLabel(entry)))
                        .slice(0, 60)
                        .map((entry) => {
                          const label = kaynakLabel(entry);
                          const tur = KAYNAK_TUR[entry.t];
                          return (
                            <button
                              key={entry.id}
                              type="button"
                              className={`oa-srcitem${activeSource === label ? " on" : ""}`}
                              onClick={() => {
                                setSourceBySubject((current) => ({ ...current, [activeSubject]: label }));
                                setSrcOpen(false);
                              }}
                            >
                              <span className="ic" style={{ color: "var(--primary)" }}>
                                <KiIcon name={tur.icon} size={14} />
                              </span>
                              <div className="body">
                                <span className="t1">{entry.n}</span>
                                <span className="t2">
                                  {entry.p} · {tur.short} ·{" "}
                                  {entry.q && entry.q > 0 ? `${entry.q.toLocaleString("tr-TR")} soru` : "Konu anlatımı"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      {catalogHits.length === 0 && studentForActive.length === 0 && myCustom.length === 0 ? (
                        <div className="oa-popempty">Sonuç yok</div>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            {showCount ? (
              <div className="oa-default">
                <span>Varsayılan {unitLabel}</span>
                {unitSoru ? (
                  <OaStepper value={defSoru} onChange={setDefSoru} step={10} min={0} max={500} />
                ) : (
                  <OaStepper value={defTest} onChange={setDefTest} step={1} min={0} max={50} />
                )}
              </div>
            ) : null}
          </div>

          {activeSource
            ? (() => {
                const dur = activeItem ? KAYNAK_DURUM[activeItem.status] : null;
                const dcol = dur ? DUR_COLOR[dur.tone] : "var(--muted)";
                return (
                  <div className="oa-srcinfo">
                    <KiIcon name="ki-book-open" size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span className="nm">{activeSource}</span>
                    {activeCat ? (
                      <span className="sb">
                        {activeCat.q && activeCat.q > 0 ? `${activeCat.q.toLocaleString("tr-TR")} soru` : "Konu anlatımı"}
                      </span>
                    ) : null}
                    {activeItem ? (
                      <span className="st" style={{ color: dcol }}>
                        {dur?.label} · %{activeItem.progress}
                        <span className="prog">
                          <span style={{ width: `${activeItem.progress}%`, background: dcol }} />
                        </span>
                      </span>
                    ) : (
                      <span className="warn">
                        <KiIcon name="ki-information-2" size={12} />
                        öğrencinin listesinde yok
                      </span>
                    )}
                  </div>
                );
              })()
            : null}
        </div>

        {/* main: ders rayı + konu seçimi */}
        <div className="oa-main">
          <div className="oa-rail">
            {subjects.map((subject) => {
              const color = subjectColor(subject);
              const on = activeSubject === subject;
              const count = subjSelCount(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  className={`oa-subj${on ? " on" : ""}`}
                  onClick={() => {
                    setActiveSubject(subject);
                    setSrcPub("Tümü");
                    setSrcSearch("");
                  }}
                >
                  <span className="sw" style={{ background: color }} />
                  <span className="nm" style={{ color: on ? color : "var(--text)" }}>
                    {subject}
                  </span>
                  {count > 0 ? (
                    <span className="ct" style={{ background: color }}>
                      {count}
                    </span>
                  ) : (
                    <KiIcon name="ki-right" size={15} style={{ color: "var(--faint)" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="oa-topics">
            <div className="oa-topics-head">
              <span className="sw" style={{ background: subjectColor(activeSubject) }} />
              <b>{activeSubject}</b>
              <span>{activeGroups.length} grup</span>
            </div>
            {activeGroups.map((group) => {
              const allOn = group.topics.length > 0 && group.topics.every((topic) => selected[topicKey(activeSubject, topic)] != null);
              const someOn = group.topics.some((topic) => selected[topicKey(activeSubject, topic)] != null);
              return (
                <div className="oa-grp" key={groupTargetKey(activeSubject, group.name)}>
                  <button
                    type="button"
                    className="oa-grp-head"
                    onClick={() => toggleGroup(activeSubject, group.topics, !allOn)}
                  >
                    <span className={`oa-chk${allOn ? " on" : someOn ? " part" : ""}`}>
                      <KiIcon name={allOn ? "ki-check" : "ki-plus"} size={12} />
                    </span>
                    <span className="nm">{group.name}</span>
                    <span className="ct">{group.topics.length} konu</span>
                    <span className="act">{allOn ? "tümünü kaldır" : "tümünü seç"}</span>
                  </button>
                  <div className="oa-grp-topics">
                    {group.topics.map((topic) => {
                      const on = selected[topicKey(activeSubject, topic)] != null;
                      return (
                        <div
                          key={topic}
                          className={`oa-topic${on ? " on" : ""}`}
                          onClick={() => toggleTopic(activeSubject, topic)}
                          onKeyDown={() => undefined}
                          role="presentation"
                        >
                          <span
                            className={`oa-chk${on ? " on" : ""}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTopic(activeSubject, topic);
                            }}
                            role="presentation"
                          >
                            <KiIcon name="ki-check" size={12} />
                          </span>
                          <span className="nm">{topic}</span>
                          {on ? (
                            showCount ? (
                              <OaStepper
                                value={selected[topicKey(activeSubject, topic)]!}
                                onChange={(value) => setSoru(activeSubject, topic, value)}
                                step={cStep}
                                min={0}
                                max={cMax}
                              />
                            ) : (
                              <span className="badge badge-success" style={{ height: 22 }}>
                                <KiIcon name="ki-check" size={12} />
                                seçildi
                              </span>
                            )
                          ) : (
                            <span className="pickhint">seç</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="oa-foot">
          <div className="oa-note">
            <KiIcon name="ki-message-text" size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input placeholder="Not ekle (opsiyonel)" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <label className="oa-date" title="Bitiş tarihi (opsiyonel)">
            <KiIcon name="ki-calendar" size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input type="date" value={due} onChange={(event) => setDue(event.target.value)} />
            {due ? (
              <button type="button" className="clear" onClick={() => setDue("")} aria-label="Tarihi temizle">
                <KiIcon name="ki-plus" size={13} style={{ transform: "rotate(45deg)" }} />
              </button>
            ) : null}
          </label>
          <div className="oa-summary">
            <div className="big tnum">
              {selectedKeys.length} konu{showCount ? ` · ${totalSoru} ${unitLabel}` : ""}
            </div>
            <div className="sm">atanacak</div>
          </div>
          <button
            type="button"
            className={`oa-assign${done ? " done" : ""}`}
            disabled={!canAssign || isSubmitting}
            onClick={() => void handleAssign()}
          >
            <KiIcon name={done ? "ki-check" : "ki-send"} size={16} />
            {done ? "Atandı!" : isBulk ? `${recipients.length} Öğrenciye Ata` : "Ödevi Ata"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
