"use client";

import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { subjectColor } from "@/lib/design/subject-colors";
import type { CurriculumRecord, CurriculumTopicGroup } from "@uyanik/database";

type CurriculumEditorProps = {
  curriculum: CurriculumRecord;
  isSaving: boolean;
  onSave: (subjects: CurriculumRecord["subjects"]) => Promise<boolean>;
  onReset: () => Promise<boolean>;
};

function EditableText({
  value,
  onCommit,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <input
      className={className}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== value) {
          onCommit(trimmed);
        } else {
          setDraft(value);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(value);
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export function CurriculumEditor({ curriculum, isSaving, onSave, onReset }: CurriculumEditorProps) {
  const subjectNames = Object.keys(curriculum.subjects);
  const [activeSubject, setActiveSubject] = useState(subjectNames[0] ?? "");
  const [subjects, setSubjects] = useState(curriculum.subjects);
  const [newTopics, setNewTopics] = useState<Record<number, string>>({});

  useEffect(() => {
    setSubjects(curriculum.subjects);
    const names = Object.keys(curriculum.subjects);
    setActiveSubject((current) => (names.includes(current) ? current : names[0] ?? ""));
  }, [curriculum.subjects]);

  const active = subjectNames.includes(activeSubject) ? activeSubject : subjectNames[0] ?? "";
  const groups = subjects[active] ?? [];

  const totalGroups = subjectNames.reduce((acc, name) => acc + (subjects[name]?.length ?? 0), 0);
  const totalTopics = subjectNames.reduce(
    (acc, name) => acc + (subjects[name]?.reduce((sum, group) => sum + group.topics.length, 0) ?? 0),
    0,
  );

  const persist = useCallback(
    async (next: CurriculumRecord["subjects"]) => {
      setSubjects(next);
      return onSave(next);
    },
    [onSave],
  );

  function mutate(fn: (draft: CurriculumRecord["subjects"]) => void) {
    const next = structuredClone(subjects);
    fn(next);
    void persist(next);
  }

  function renameGroup(index: number, name: string) {
    mutate((draft) => {
      draft[active][index].name = name;
    });
  }

  function addGroup() {
    mutate((draft) => {
      draft[active].push({ name: "Yeni Grup", topics: [] });
    });
  }

  function deleteGroup(index: number) {
    if (!confirm(`"${groups[index]?.name}" grubu silinsin mi?`)) {
      return;
    }
    mutate((draft) => {
      draft[active].splice(index, 1);
    });
  }

  function moveGroup(index: number, direction: -1 | 1) {
    mutate((draft) => {
      const list = draft[active];
      const target = index + direction;
      if (target < 0 || target >= list.length) {
        return;
      }
      [list[index], list[target]] = [list[target], list[index]];
    });
  }

  function renameTopic(groupIndex: number, topicIndex: number, name: string) {
    mutate((draft) => {
      draft[active][groupIndex].topics[topicIndex] = name;
    });
  }

  function deleteTopic(groupIndex: number, topicIndex: number) {
    mutate((draft) => {
      draft[active][groupIndex].topics.splice(topicIndex, 1);
    });
  }

  function addTopic(groupIndex: number) {
    const topic = (newTopics[groupIndex] ?? "").trim();
    if (!topic) {
      return;
    }
    mutate((draft) => {
      draft[active][groupIndex].topics.push(topic);
    });
    setNewTopics((current) => ({ ...current, [groupIndex]: "" }));
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <UkBadge tone="muted">
            <KiIcon name="ki-book" size={13} />
            {subjectNames.length} ders
          </UkBadge>
          <UkBadge tone="muted">
            <KiIcon name="ki-notepad" size={13} />
            {totalGroups} konu grubu
          </UkBadge>
          <UkBadge tone="muted">
            <KiIcon name="ki-check-circle" size={13} />
            {totalTopics} konu
          </UkBadge>
        </div>
        <button
          type="button"
          className="btn btn-light btn-sm"
          disabled={isSaving}
          onClick={() => void onReset()}
        >
          <KiIcon name="ki-arrow-up" size={15} />
          Varsayilana sifirla
        </button>
      </div>

      <div className="grid col-rail">
        <div className="card" style={{ overflow: "hidden", alignSelf: "start" }}>
          <div className="card-head">
            <h3>Dersler</h3>
          </div>
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {subjectNames.map((name) => {
              const color = subjectColor(name);
              const on = name === active;
              const groupCount = subjects[name]?.length ?? 0;
              const topicCount =
                subjects[name]?.reduce((sum, group: CurriculumTopicGroup) => sum + group.topics.length, 0) ?? 0;

              return (
                <button
                  key={name}
                  type="button"
                  className="user-card"
                  style={{ background: on ? "var(--surface-3)" : "none", borderRadius: 11 }}
                  onClick={() => setActiveSubject(name)}
                >
                  <span
                    className="swatch"
                    style={{ width: 10, height: 10, borderRadius: 4, background: color, flexShrink: 0 }}
                  />
                  <div className="user-meta" style={{ flex: 1 }}>
                    <b style={{ fontSize: 13, color: on ? color : "var(--text)" }}>{name}</b>
                    <span style={{ fontSize: 11 }}>
                      {groupCount} grup · {topicCount} konu
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <UkSection
          title={`${active} — Konu Gruplari`}
          sub="Alt kırılımları ve konuları düzenle"
          action={
            <button type="button" className="btn btn-primary btn-sm" disabled={isSaving} onClick={addGroup}>
              <KiIcon name="ki-plus" size={15} />
              Grup ekle
            </button>
          }
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {groups.length === 0 ? (
              <p className="muted" style={{ fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                Bu derste henüz grup yok. &quot;Grup ekle&quot; ile başlayın.
              </p>
            ) : (
              groups.map((group, groupIndex) => (
                <div className="edit-grp" key={`${active}-${groupIndex}`}>
                  <div className="edit-grp-head">
                    <span className="grip">
                      <KiIcon name="ki-menu" size={15} />
                    </span>
                    <EditableText
                      className="edit-grp-name"
                      value={group.name}
                      onCommit={(name) => renameGroup(groupIndex, name)}
                      placeholder="Grup adi"
                    />
                    <span className="muted" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>
                      {group.topics.length} konu
                    </span>
                    <div className="row" style={{ gap: 2, marginLeft: "auto" }}>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={groupIndex === 0 || isSaving}
                        onClick={() => moveGroup(groupIndex, -1)}
                        aria-label="Yukari"
                      >
                        <KiIcon name="ki-arrow-up" size={15} />
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={groupIndex === groups.length - 1 || isSaving}
                        onClick={() => moveGroup(groupIndex, 1)}
                        aria-label="Asagi"
                      >
                        <KiIcon name="ki-arrow-down" size={15} />
                      </button>
                      <button
                        type="button"
                        className="mini-btn danger"
                        disabled={isSaving}
                        onClick={() => deleteGroup(groupIndex)}
                        aria-label="Sil"
                      >
                        <KiIcon name="ki-plus" size={15} style={{ transform: "rotate(45deg)" }} />
                      </button>
                    </div>
                  </div>
                  <div className="edit-topics">
                    {group.topics.map((topic, topicIndex) => (
                      <div className="edit-topic" key={`${groupIndex}-${topicIndex}`}>
                        <span
                          className="dot-sm"
                          style={{ background: subjectColor(active) || "var(--primary)" }}
                        />
                        <EditableText
                          className="edit-topic-name"
                          value={topic}
                          onCommit={(name) => renameTopic(groupIndex, topicIndex, name)}
                        />
                        <button
                          type="button"
                          className="mini-btn danger"
                          disabled={isSaving}
                          onClick={() => deleteTopic(groupIndex, topicIndex)}
                          aria-label="Konu sil"
                        >
                          <KiIcon name="ki-plus" size={13} style={{ transform: "rotate(45deg)" }} />
                        </button>
                      </div>
                    ))}
                    <div className="add-topic">
                      <KiIcon name="ki-plus" size={14} style={{ color: "var(--faint)", flexShrink: 0 }} />
                      <input
                        className="add-topic-input"
                        placeholder="Konu ekle ve Enter'a bas..."
                        value={newTopics[groupIndex] ?? ""}
                        disabled={isSaving}
                        onChange={(event) =>
                          setNewTopics((current) => ({ ...current, [groupIndex]: event.target.value }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addTopic(groupIndex);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </UkSection>
      </div>
    </div>
  );
}
