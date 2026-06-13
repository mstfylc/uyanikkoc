"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { katalogByLabel, KAYNAK_TUR } from "@/lib/design/kaynak-catalog";
import { subjectColor } from "@/lib/design/subject-colors";
import type {
  SelfStudyRecord,
  SourceActivity,
  SourceStatus,
  StudentSourceItem,
  StudentSourceTracker,
} from "@/mocks/student-sources";

const KaynakKatalogModal = dynamic(
  () => import("@/components/student/KaynakKatalogModal").then((mod) => mod.KaynakKatalogModal),
  { ssr: false },
);

type StudentResourcesCardProps = {
  apiPath?: string;
  defaultExam?: "Tumu" | "YKS" | "LGS";
  editable?: boolean;
  title?: string;
  sub?: string;
};

const SOURCE_STATUS_META: Record<SourceStatus, { label: string; icon: string; tone: "muted" | "info" | "success" }> = {
  aktif: { label: "Aktif", icon: "ki-book-open", tone: "info" },
  beklemede: { label: "Beklemede", icon: "ki-time", tone: "muted" },
  bitti: { label: "Bitti", icon: "ki-check-circle", tone: "success" },
};

const SOURCE_STATUS_ORDER: SourceStatus[] = ["aktif", "beklemede", "bitti"];

function emptyTracker(sources: string[]): StudentSourceTracker {
  return {
    items: sources.map((name) => ({ name, status: "beklemede", progress: 0 })),
    selfStudy: [],
    activity: Object.fromEntries(
      sources.map((name) => [name, { soru: 0, acc: null, lastUsed: null, selfSoru: 0, selfCount: 0 }]),
    ),
  };
}

function relTime(value: number | null): string | null {
  if (!value) return null;
  const days = Math.floor((Date.now() - value) / 86_400_000);
  if (days <= 0) return "bugün";
  if (days === 1) return "dün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return `${Math.floor(days / 30)} ay önce`;
}

function sourceSubject(name: string): string {
  return katalogByLabel(name)?.s ?? "Genel";
}

function sourceTypeIcon(name: string): string {
  const entry = katalogByLabel(name);
  return entry ? KAYNAK_TUR[entry.t]?.icon ?? "ki-book-open" : "ki-book-open";
}

export function StudentResourcesCard({
  apiPath = "/api/student/sources",
  defaultExam = "Tumu",
  editable = true,
  title = "Kaynaklarım",
  sub = "Elindeki kitapları katalogdan seç - koçun ödev atarken bunlardan seçebilir",
}: StudentResourcesCardProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [tracker, setTracker] = useState<StudentSourceTracker>(emptyTracker([]));
  const [customValue, setCustomValue] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openSource, setOpenSource] = useState<string | null>(null);
  const [selfDraft, setSelfDraft] = useState<Record<string, { soru: string; dogru: string }>>({});

  const load = useCallback(async () => {
    const response = await fetch(apiPath, { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[]; tracker?: StudentSourceTracker };
      setSources(data.sources);
      setTracker(data.tracker ?? emptyTracker(data.sources));
    }
    setIsLoading(false);
  }, [apiPath]);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(label: string, add: boolean) {
    if (!editable) return;
    const response = await fetch(apiPath, {
      method: add ? "POST" : "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[]; tracker?: StudentSourceTracker };
      setSources(data.sources);
      setTracker(data.tracker ?? emptyTracker(data.sources));
    }
  }

  async function updateItem(name: string, patch: { status?: SourceStatus; progress?: number }) {
    if (!editable) return;
    const response = await fetch(apiPath, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ...patch }),
    });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[]; tracker: StudentSourceTracker };
      setSources(data.sources);
      setTracker(data.tracker);
    }
  }

  async function addSelfStudy(item: StudentSourceItem, kind: "cozdum" | "calistim") {
    if (!editable) return;
    const draft = selfDraft[item.name] ?? { soru: "", dogru: "" };
    const soru = Number.parseInt(draft.soru, 10) || 0;
    const dogru = draft.dogru.trim() ? Number.parseInt(draft.dogru, 10) || 0 : null;
    if (kind === "cozdum" && soru <= 0) return;

    const response = await fetch(apiPath, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "selfStudy",
        book: item.name,
        kind,
        soru,
        dogru,
        subject: sourceSubject(item.name),
      }),
    });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[]; tracker: StudentSourceTracker };
      setSources(data.sources);
      setTracker(data.tracker);
      setSelfDraft((current) => ({ ...current, [item.name]: { soru: "", dogru: "" } }));
    }
  }

  async function removeSelfStudy(id: string) {
    if (!editable) return;
    const response = await fetch(apiPath, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "selfStudy", id }),
    });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[]; tracker: StudentSourceTracker };
      setSources(data.sources);
      setTracker(data.tracker);
    }
  }

  async function addCustom() {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    await persist(trimmed, true);
    setCustomValue("");
  }

  return (
    <>
      <UkSection
        title={title}
        sub={sub}
        action={
          <div className="row" style={{ gap: 8 }}>
            <UkBadge tone="muted">
              <KiIcon name="ki-book-open" size={13} />
              {tracker.items.length}
            </UkBadge>
            {editable ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setCatalogOpen(true)}>
                <KiIcon name="ki-plus" size={15} />
                Katalogdan ekle
              </button>
            ) : null}
          </div>
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : tracker.items.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                if (editable) setCatalogOpen(true);
              }}
              className="dropzone"
              style={{ padding: "26px 24px" }}
            >
              <KiIcon name="ki-book-open" size={26} style={{ color: "var(--faint)" }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-2)" }}>Henüz kaynak yok</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {editable ? (
                  <>
                    Bilinen yayınevi kitaplarını <b style={{ color: "var(--primary-600)" }}>katalogdan</b> ekle
                  </>
                ) : (
                  "Henüz kaynak eklenmedi."
                )}
              </div>
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tracker.selfStudy.length ? (
                <SelfStudyFeed
                  records={tracker.selfStudy.slice(0, 5)}
                  editable={editable}
                  onRemove={(id) => void removeSelfStudy(id)}
                />
              ) : null}
              {tracker.items.map((item) => {
                const activity = tracker.activity[item.name] ?? {
                  soru: 0,
                  acc: null,
                  lastUsed: null,
                  selfSoru: 0,
                  selfCount: 0,
                };
                return (
                  <SourceTrackerRow
                    key={item.name}
                    item={item}
                    activity={activity}
                    open={openSource === item.name}
                    draft={selfDraft[item.name] ?? { soru: "", dogru: "" }}
                    editable={editable}
                    onOpen={() => setOpenSource((current) => (current === item.name ? null : item.name))}
                    onDraft={(draft) => setSelfDraft((current) => ({ ...current, [item.name]: draft }))}
                    onUpdate={(patch) => void updateItem(item.name, patch)}
                    onSelfStudy={(kind) => void addSelfStudy(item, kind)}
                    onRemove={() => void persist(item.name, false)}
                  />
                );
              })}
            </div>
          )}

          {editable ? (
            <div>
              <div className="muted" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 6 }}>
                Listede yoksa - özel kaynağını yaz:
              </div>
              <div className="add-topic">
                <KiIcon name="ki-plus" size={14} style={{ color: "var(--faint)", flexShrink: 0 }} />
                <input
                  className="add-topic-input"
                  placeholder="Özel kaynak / fotokopi / öğretmen notu... (Enter)"
                  value={customValue}
                  onChange={(event) => setCustomValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addCustom();
                    }
                  }}
                />
                {customValue.trim() ? (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => void addCustom()} style={{ height: 28 }}>
                    Ekle
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </UkSection>

      {editable ? (
        <KaynakKatalogModal
          open={catalogOpen}
          onClose={() => setCatalogOpen(false)}
          sources={sources}
          onToggle={(label, add) => void persist(label, add)}
          defaultExam={defaultExam}
        />
      ) : null}
    </>
  );
}

function SelfStudyFeed({
  records,
  editable,
  onRemove,
}: {
  records: SelfStudyRecord[];
  editable: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 12,
        background: "var(--surface-2)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div className="row" style={{ gap: 8, fontSize: 12.5, fontWeight: 800 }}>
        <KiIcon name="ki-flash-circle" size={14} style={{ color: "var(--info)" }} />
        Ödev harici çalışma
        <span className="muted" style={{ fontWeight: 600 }}>
          son {records.length} kayıt
        </span>
      </div>
      {records.map((record) => (
        <div key={record.id} className="between" style={{ gap: 10, fontSize: 12.5 }}>
          <span className="row" style={{ gap: 7, minWidth: 0 }}>
            <span className="swatch" style={{ background: subjectColor(record.subject), flexShrink: 0 }} />
            <b style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.book}</b>
            <span className="muted" style={{ flexShrink: 0 }}>
              {record.kind === "cozdum"
                ? `${record.soru} soru${record.dogru != null ? ` - ${record.dogru} D` : ""}`
                : "konu çalıştı"}
            </span>
          </span>
          <span className="row" style={{ gap: 8, flexShrink: 0 }}>
            <span className="muted">{relTime(record.date)}</span>
            {editable ? (
              <button type="button" className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => onRemove(record.id)}>
                <KiIcon name="ki-trash" size={13} />
              </button>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function SourceTrackerRow({
  item,
  activity,
  open,
  draft,
  editable,
  onOpen,
  onDraft,
  onUpdate,
  onSelfStudy,
  onRemove,
}: {
  item: StudentSourceItem;
  activity: SourceActivity;
  open: boolean;
  draft: { soru: string; dogru: string };
  editable: boolean;
  onOpen: () => void;
  onDraft: (draft: { soru: string; dogru: string }) => void;
  onUpdate: (patch: { status?: SourceStatus; progress?: number }) => void;
  onSelfStudy: (kind: "cozdum" | "calistim") => void;
  onRemove: () => void;
}) {
  const meta = SOURCE_STATUS_META[item.status];
  const color = subjectColor(sourceSubject(item.name));
  const lastUsed = relTime(activity.lastUsed);

  return (
    <div className="lrow" style={{ alignItems: "stretch", flexDirection: "column", gap: 10 }}>
      <button type="button" className="between" style={{ gap: 12, textAlign: "left" }} onClick={onOpen}>
        <span className="row" style={{ gap: 10, minWidth: 0 }}>
          <span className="lr-icon" style={{ background: `color-mix(in srgb, ${color} 13%, transparent)`, color }}>
            <KiIcon name={sourceTypeIcon(item.name)} size={18} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span className="lr-title" style={{ display: "block" }}>
              {item.name}
            </span>
            <span className="lr-meta">
              <UkBadge tone={meta.tone}>
                <KiIcon name={meta.icon} size={12} />
                {meta.label}
              </UkBadge>
              {activity.soru > 0 ? <span className="d">{activity.soru.toLocaleString("tr-TR")} soru</span> : null}
              {activity.acc != null ? <span className="d">%{activity.acc} doğru</span> : null}
              {activity.selfCount > 0 ? <span className="d">ödev harici {activity.selfSoru || activity.selfCount}</span> : null}
              {lastUsed ? <span className="d">{lastUsed}</span> : null}
            </span>
          </span>
        </span>
        <span style={{ display: "grid", gap: 5, width: 92, flexShrink: 0 }}>
          <span className="tnum" style={{ fontWeight: 800, color }}>
            %{item.progress}
          </span>
          <span className="progress-mini">
            <span style={{ width: `${item.progress}%`, background: color }} />
          </span>
        </span>
      </button>

      {open && editable ? (
        <div style={{ display: "grid", gap: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 800, marginBottom: 7, textTransform: "uppercase" }}>
              Durum
            </div>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {SOURCE_STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`btn btn-sm ${item.status === status ? "btn-primary" : "btn-light"}`}
                  onClick={() => onUpdate({ status })}
                >
                  <KiIcon name={SOURCE_STATUS_META[status].icon} size={14} />
                  {SOURCE_STATUS_META[status].label}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: "grid", gap: 7 }}>
            <span className="muted" style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase" }}>
              İlerleme
            </span>
            <span className="row" style={{ gap: 10 }}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={item.progress}
                onChange={(event) => onUpdate({ progress: Number(event.target.value) })}
                style={{ flex: 1 }}
              />
              <span className="tnum" style={{ width: 44, textAlign: "right", fontWeight: 800 }}>
                %{item.progress}
              </span>
            </span>
          </label>

          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 800, marginBottom: 7, textTransform: "uppercase" }}>
              Ödev harici çalışma
            </div>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <input
                className="input"
                inputMode="numeric"
                placeholder="Soru"
                value={draft.soru}
                onChange={(event) => onDraft({ ...draft, soru: event.target.value.replace(/\D/g, "") })}
                style={{ width: 86, height: 34 }}
              />
              <input
                className="input"
                inputMode="numeric"
                placeholder="Doğru"
                value={draft.dogru}
                onChange={(event) => onDraft({ ...draft, dogru: event.target.value.replace(/\D/g, "") })}
                style={{ width: 86, height: 34 }}
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onSelfStudy("cozdum")}>
                <KiIcon name="ki-check-circle" size={14} />
                Çözdüm
              </button>
              <button type="button" className="btn btn-light btn-sm" onClick={() => onSelfStudy("calistim")}>
                <KiIcon name="ki-book-open" size={14} />
                Çalıştım
              </button>
              <button type="button" className="btn btn-light btn-sm" onClick={onRemove} style={{ marginLeft: "auto", color: "var(--danger)" }}>
                <KiIcon name="ki-trash" size={14} />
                Çıkar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
