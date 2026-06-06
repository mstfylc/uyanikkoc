"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkNumStepper } from "@/components/design/UkNumStepper";
import { groupTargetKey, pickKaynak } from "@/lib/design/coach-topic-metrics";
import { subjectColor } from "@/lib/design/subject-colors";
import type { CurriculumRecord } from "@uyanik/database";

type CoachOdevAtaModalProps = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  curriculum: CurriculumRecord | null;
  initialSubject?: string | null;
  initialTopic?: string | null;
  onAssigned?: (summary: { konu: number; soru: number; due?: string }) => void;
};

function topicKey(subject: string, topic: string): string {
  return `${subject}::${topic}`;
}

export function CoachOdevAtaModal({
  open,
  onClose,
  studentId,
  studentName,
  curriculum,
  initialSubject,
  initialTopic,
  onAssigned,
}: CoachOdevAtaModalProps) {
  const [mounted, setMounted] = useState(false);
  const subjects = useMemo(() => Object.keys(curriculum?.subjects ?? {}), [curriculum]);
  const [activeSubject, setActiveSubject] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [defaultSoru, setDefaultSoru] = useState(30);
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setDefaultSoru(30);

    if (initialSubject && initialTopic) {
      setSelected({ [topicKey(initialSubject, initialTopic)]: 30 });
    } else {
      setSelected({});
    }
  }, [open, initialSubject, initialTopic, subjects]);

  const selectedKeys = Object.keys(selected);
  const totalSoru = selectedKeys.reduce((sum, key) => sum + (selected[key] || 0), 0);

  const toggleTopic = useCallback(
    (subject: string, topic: string) => {
      const key = topicKey(subject, topic);
      setSelected((current) => {
        const next = { ...current };
        if (next[key] != null) {
          delete next[key];
        } else {
          next[key] = defaultSoru;
        }
        return next;
      });
    },
    [defaultSoru],
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
            next[key] = next[key] ?? defaultSoru;
          } else {
            delete next[key];
          }
        }
        return next;
      });
    },
    [defaultSoru],
  );

  const subjSelCount = useCallback(
    (subject: string) => selectedKeys.filter((key) => key.startsWith(`${subject}::`)).length,
    [selectedKeys],
  );

  async function handleAssign() {
    if (!studentId || selectedKeys.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      for (const key of selectedKeys) {
        const [subject, title] = key.split("::");
        const soruCount = selected[key] || defaultSoru;
        const response = await fetch("/api/coach/assignments", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            subject,
            title,
            type: "practice",
            description: note.trim()
              ? `${note.trim()} · ${soruCount} soru · ${pickKaynak(subject, 0)}`
              : `${soruCount} soru · ${pickKaynak(subject, 0)}`,
            dueDate: due || undefined,
          }),
        });
        if (!response.ok) {
          throw new Error("Odev atanamadi");
        }
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

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 800 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-notepad-edit" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Odev Ata</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {studentName} · derslere ve konulara soru ata
              </div>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 36, height: 36 }}
            onClick={onClose}
            aria-label="Kapat"
          >
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-sub" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
            <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
              Varsayilan soru
            </span>
            <UkNumStepper value={defaultSoru} onChange={setDefaultSoru} step={10} min={0} max={500} size="sm" />
          </div>
        </div>

        <div className="modal-body ata-body">
          <div className="ata-rail">
            {subjects.map((subject) => {
              const color = subjectColor(subject);
              const on = activeSubject === subject;
              const count = subjSelCount(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  className={`ata-subj${on ? " on" : ""}`}
                  onClick={() => setActiveSubject(subject)}
                >
                  <span
                    className="swatch"
                    style={{ width: 10, height: 10, borderRadius: 4, background: color, flexShrink: 0 }}
                  />
                  <span className="ata-subj-name" style={{ color: on ? color : "var(--text)" }}>
                    {subject}
                  </span>
                  {count > 0 ? (
                    <span className="nav-count tnum" style={{ minWidth: 18, height: 18, fontSize: 10.5 }}>
                      {count}
                    </span>
                  ) : (
                    <KiIcon name="ki-right" size={15} style={{ color: "var(--faint)" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="ata-detail">
            <div className="between" style={{ marginBottom: 4 }}>
              <span className="row" style={{ gap: 8 }}>
                <span
                  className="swatch"
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 4,
                    background: subjectColor(activeSubject),
                  }}
                />
                <b style={{ fontSize: 14 }}>{activeSubject}</b>
                <span className="muted" style={{ fontSize: 12 }}>
                  {activeGroups.length} grup
                </span>
              </span>
            </div>

            {activeGroups.map((group) => {
              const allOn = group.topics.length > 0 && group.topics.every((topic) => selected[topicKey(activeSubject, topic)] != null);
              const someOn = group.topics.some((topic) => selected[topicKey(activeSubject, topic)] != null);
              return (
                <div className="grp" key={groupTargetKey(activeSubject, group.name)}>
                  <button
                    type="button"
                    className="grp-head"
                    style={{ width: "100%", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}
                    onClick={() => toggleGroup(activeSubject, group.topics, !allOn)}
                  >
                    <span className={`chk sm${allOn ? " done" : someOn ? " part" : ""}`}>
                      <KiIcon name={allOn ? "ki-check" : "ki-plus"} size={12} />
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 12.5 }}>{group.name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>
                      {group.topics.length} konu
                    </span>
                    <span className="muted" style={{ fontSize: 11, marginLeft: "auto" }}>
                      {allOn ? "tumunu kaldir" : "tumunu sec"}
                    </span>
                  </button>
                  <div className="grp-topics">
                    {group.topics.map((topic) => {
                      const on = selected[topicKey(activeSubject, topic)] != null;
                      return (
                        <div
                          key={topic}
                          className={`pick-row${on ? " on" : ""}`}
                          onClick={() => toggleTopic(activeSubject, topic)}
                          onKeyDown={() => undefined}
                          role="presentation"
                        >
                          <button
                            type="button"
                            className={`chk sm${on ? " done" : ""}`}
                            aria-label="Konu sec"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTopic(activeSubject, topic);
                            }}
                          >
                            <KiIcon name="ki-check" size={12} />
                          </button>
                          <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, flex: 1 }}>{topic}</span>
                          {on ? (
                            <UkNumStepper
                              value={selected[topicKey(activeSubject, topic)]}
                              onChange={(value) => setSoru(activeSubject, topic, value)}
                              step={10}
                              min={0}
                              max={500}
                              size="sm"
                            />
                          ) : (
                            <span className="muted" style={{ fontSize: 11.5 }}>
                              sec
                            </span>
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

        <div className="modal-foot" style={{ flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: "1 1 180px" }}
            placeholder="Not ekle (opsiyonel)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <label className="ata-date" title="Bitis tarihi (opsiyonel)">
            <KiIcon name="ki-calendar" size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input type="date" value={due} onChange={(event) => setDue(event.target.value)} />
            {due ? (
              <button
                type="button"
                onClick={() => setDue("")}
                aria-label="Tarihi temizle"
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--faint)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <KiIcon name="ki-plus" size={14} style={{ transform: "rotate(45deg)" }} />
              </button>
            ) : null}
          </label>
          <div className="row" style={{ gap: 14, flexShrink: 0, marginLeft: "auto" }}>
            <div style={{ textAlign: "right", lineHeight: 1.2 }}>
              <div className="tnum" style={{ fontSize: 15, fontWeight: 800 }}>
                {selectedKeys.length} konu · {totalSoru} soru
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                atanacak
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedKeys.length === 0 || isSubmitting}
              onClick={() => void handleAssign()}
              style={{ opacity: selectedKeys.length === 0 ? 0.5 : 1 }}
            >
              <KiIcon name={done ? "ki-check" : "ki-send"} />
              {done ? "Atandi!" : isSubmitting ? "Ataniyor..." : "Odevi Ata"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
