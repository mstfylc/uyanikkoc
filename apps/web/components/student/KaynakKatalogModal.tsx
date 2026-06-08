"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import {
  catalogSubjectColor,
  KAYNAK_CATALOG,
  KAYNAK_DERSLER,
  KAYNAK_TUR,
  katalogList,
  katalogPublishers,
  kaynakLabel,
  type KaynakCatalogEntry,
  type KaynakExamGroup,
  type KaynakTypeKey,
} from "@/lib/design/kaynak-catalog";

type ExamFilter = "Tumu" | KaynakExamGroup;
const MAX_VISIBLE_RESULTS = 120;

type KaynakKatalogModalProps = {
  open: boolean;
  onClose: () => void;
  sources: string[];
  onToggle: (label: string, add: boolean) => void;
  defaultExam?: ExamFilter;
};

function KatalogRow({
  entry,
  added,
  onToggle,
}: {
  entry: KaynakCatalogEntry;
  added: boolean;
  onToggle: () => void;
}) {
  const tur = KAYNAK_TUR[entry.t] ?? KAYNAK_TUR.soru;
  const color = catalogSubjectColor(entry.s);

  return (
    <div className="lrow" style={{ alignItems: "center", padding: "11px 13px" }}>
      <span
        className="lr-icon"
        style={{
          width: 36,
          height: 36,
          background: `color-mix(in srgb, ${color} 13%, transparent)`,
          color,
        }}
      >
        <KiIcon name={tur.icon} size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title" style={{ whiteSpace: "normal" }}>
          {entry.n}
        </div>
        <div className="lr-meta">
          <b style={{ color: "var(--text-2)", fontWeight: 700 }}>{entry.p}</b>
          <span className="d">{tur.label}</span>
          <span className="d">{entry.e.join(" · ")}</span>
          {entry.g ? <span className="d">{entry.g}. sinif</span> : null}
          {entry.q ? <span className="d">{entry.q} soru</span> : null}
        </div>
      </div>
      <button
        type="button"
        className={added ? "btn btn-light btn-sm" : "btn btn-primary btn-sm"}
        onClick={onToggle}
        style={{ flexShrink: 0, minWidth: 96, justifyContent: "center" }}
      >
        <KiIcon name={added ? "ki-check" : "ki-plus"} size={15} />
        {added ? "Eklendi" : "Ekle"}
      </button>
    </div>
  );
}

export function KaynakKatalogModal({
  open,
  onClose,
  sources,
  onToggle,
  defaultExam = "Tumu",
}: KaynakKatalogModalProps) {
  const [mounted, setMounted] = useState(false);
  const [exam, setExam] = useState<ExamFilter>(defaultExam);
  const [subject, setSubject] = useState("Tumu");
  const [pub, setPub] = useState("Tumu");
  const [type, setType] = useState<KaynakTypeKey | "Tumu">("Tumu");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setExam(defaultExam);
    setSubject("Tumu");
    setPub("Tumu");
    setType("Tumu");
    setQuery("");
  }, [open, defaultExam]);

  useEffect(() => {
    if (exam === "Tumu") return;
    const subjects = KAYNAK_DERSLER[exam];
    if (subject !== "Tumu" && !subjects.includes(subject)) {
      setSubject("Tumu");
    }
    const publishers = katalogPublishers({ exam, subject: "Tumu" });
    if (pub !== "Tumu" && !publishers.includes(pub)) {
      setPub("Tumu");
    }
  }, [exam, pub, subject]);

  const subjectOptions = useMemo(() => {
    if (exam === "Tumu") {
      return [...new Set([...KAYNAK_DERSLER.YKS, ...KAYNAK_DERSLER.LGS])].sort((a, b) =>
        a.localeCompare(b, "tr-TR"),
      );
    }
    return KAYNAK_DERSLER[exam];
  }, [exam]);

  const publisherOptions = katalogPublishers({
    exam: exam === "Tumu" ? "Tumu" : exam,
    subject,
  });

  const results = katalogList({
    exam,
    subject,
    pub,
    type,
    q: query,
  });
  const visibleResults = results.slice(0, MAX_VISIBLE_RESULTS);
  const hiddenResultCount = Math.max(0, results.length - visibleResults.length);

  const groups = useMemo(() => {
    const map: Record<string, KaynakCatalogEntry[]> = {};
    for (const entry of visibleResults) {
      map[entry.s] ??= [];
      map[entry.s].push(entry);
    }
    return map;
  }, [visibleResults]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 680, height: "min(720px, calc(100vh - 48px))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--primary-soft)", color: "var(--primary-600)" }}>
              <KiIcon name="ki-book-open" size={19} />
            </span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Kaynak Katalogu</h3>
              <div className="muted" style={{ fontSize: 12 }}>
                Turkiye geneli bilinen yayinevi kitaplari · {KAYNAK_CATALOG.length} kaynak
              </div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="between" style={{ gap: 10, flexWrap: "wrap" }}>
            <div className="seg" style={{ width: "fit-content" }}>
              {(["Tumu", "YKS", "LGS"] as const).map((value) => (
                <button key={value} type="button" className={exam === value ? "on" : ""} onClick={() => setExam(value)}>
                  {value === "Tumu" ? "Tumu" : value}
                </button>
              ))}
            </div>
            <div className="searchbox" style={{ margin: 0, minWidth: 200, flex: "1 1 200px", display: "flex" }}>
              <KiIcon name="ki-magnifier" size={16} />
              <input
                placeholder="Kitap veya yayinevi ara..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <select
              className="select"
              style={{ height: 36, flex: "1 1 140px", minWidth: 130 }}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setPub("Tumu");
              }}
            >
              <option value="Tumu">Tum dersler</option>
              {subjectOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              className="select"
              style={{ height: 36, flex: "1 1 140px", minWidth: 130 }}
              value={pub}
              onChange={(event) => setPub(event.target.value)}
            >
              <option value="Tumu">Tum yayinevleri</option>
              {publisherOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              className="select"
              style={{ height: 36, flex: "0 1 140px", minWidth: 120 }}
              value={type}
              onChange={(event) => setType(event.target.value as KaynakTypeKey | "Tumu")}
            >
              <option value="Tumu">Tum turler</option>
              {Object.entries(KAYNAK_TUR).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-body" style={{ gap: 16, padding: "16px 20px" }}>
          {Object.keys(groups).length === 0 ? (
            <div style={{ padding: "44px 0", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
              Eslesen kaynak yok. Filtreyi gevset ya da ozel kaynagini serbest ekle.
            </div>
          ) : (
            <>
              {hiddenResultCount > 0 ? (
                <div className="alert-strip" style={{ alignItems: "center" }}>
                  <span className="as-ic">
                    <KiIcon name="ki-magnifier" size={14} />
                  </span>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    {results.length} kaynak bulundu; ilk {MAX_VISIBLE_RESULTS} kaynak gosteriliyor. Daha net sonuc icin
                    kitap, yayinevi veya ders filtresi kullan.
                  </div>
                </div>
              ) : null}
              {Object.entries(groups).map(([group, entries]) => {
                const color = catalogSubjectColor(group);
                return (
                  <div key={group} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <div className="row" style={{ gap: 8, padding: "0 2px" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
                      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".02em", color: "var(--text-2)" }}>
                        {group}
                      </span>
                      <span className="muted" style={{ fontSize: 11.5 }}>
                        {entries.length}
                      </span>
                    </div>
                    {entries.map((entry) => {
                      const label = kaynakLabel(entry);
                      const added = sources.includes(label);
                      return (
                        <KatalogRow
                          key={entry.id}
                          entry={entry}
                          added={added}
                          onToggle={() => onToggle(label, !added)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
            <b style={{ color: "var(--primary-600)" }}>{sources.length}</b> kaynak listende
          </span>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            <KiIcon name="ki-check" size={16} />
            Bitti
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
