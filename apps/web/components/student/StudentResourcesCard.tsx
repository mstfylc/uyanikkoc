"use client";

import { useCallback, useEffect, useState } from "react";

import { KaynakKatalogModal } from "@/components/student/KaynakKatalogModal";
import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { KAYNAK_TUR, katalogByLabel } from "@/lib/design/kaynak-catalog";

type StudentResourcesCardProps = {
  defaultExam?: "Tumu" | "YKS" | "LGS";
};

export function StudentResourcesCard({ defaultExam = "Tumu" }: StudentResourcesCardProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/sources", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[] };
      setSources(data.sources);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(label: string, add: boolean) {
    const response = await fetch("/api/student/sources", {
      method: add ? "POST" : "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (response.ok) {
      const data = (await response.json()) as { sources: string[] };
      setSources(data.sources);
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
        title="Kaynaklarim"
        sub="Elindeki kitaplari katalogdan sec — kocun odev atarken bunlardan secebilir"
        action={
          <div className="row" style={{ gap: 8 }}>
            <UkBadge tone="muted">
              <KiIcon name="ki-book-open" size={13} />
              {sources.length}
            </UkBadge>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setCatalogOpen(true)}>
              <KiIcon name="ki-plus" size={15} />
              Katalogdan ekle
            </button>
          </div>
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : sources.length === 0 ? (
            <button type="button" onClick={() => setCatalogOpen(true)} className="dropzone" style={{ padding: "26px 24px" }}>
              <KiIcon name="ki-book-open" size={26} style={{ color: "var(--faint)" }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-2)" }}>Henuz kaynak yok</div>
              <div className="muted" style={{ fontSize: 12 }}>
                Bilinen yayinevi kitaplarini <b style={{ color: "var(--primary-600)" }}>katalogdan</b> ekle
              </div>
            </button>
          ) : (
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {sources.map((label) => {
                const entry = katalogByLabel(label);
                const tur = entry ? KAYNAK_TUR[entry.t] : null;
                return (
                  <span
                    key={label}
                    className="chip"
                    style={{ height: 30, paddingRight: 6 }}
                    title={entry ? `${entry.s} · ${tur?.label ?? ""}` : "Ozel kaynak"}
                  >
                    <KiIcon
                      name={tur?.icon ?? "ki-book-open"}
                      size={13}
                      style={{ color: entry ? "var(--primary)" : "var(--faint)" }}
                    />
                    {label}
                    <button
                      type="button"
                      onClick={() => void persist(label, false)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "var(--faint)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        marginLeft: 2,
                      }}
                      aria-label="Kaldir"
                    >
                      <KiIcon name="ki-plus" size={13} style={{ transform: "rotate(45deg)" }} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 6 }}>
              Listede yoksa — ozel kaynagini yaz:
            </div>
            <div className="add-topic">
              <KiIcon name="ki-plus" size={14} style={{ color: "var(--faint)", flexShrink: 0 }} />
              <input
                className="add-topic-input"
                placeholder="Ozel kaynak / fotokopi / ogretmen notu... (Enter)"
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
        </div>
      </UkSection>

      <KaynakKatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        sources={sources}
        onToggle={(label, add) => void persist(label, add)}
        defaultExam={defaultExam}
      />
    </>
  );
}
