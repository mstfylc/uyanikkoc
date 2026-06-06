/* KAYNAKLARIM — öğrencinin çalışma kaynaklarını yönetir. */
import { useState } from "react";
import { SubHeader } from "../ui/SubHeader";
import { MIcon } from "../ui/MIcon";
import { CATALOG, KAYNAK_TUR, SOURCES, SUBJECT_COLORS } from "../mocks/student";
import type { IconName } from "../ui/icons";
import type { SourceBook } from "../types";

export function KaynaklarimScreen({ onBack }: { onBack: () => void }) {
  const [mine, setMine] = useState<SourceBook[]>(SOURCES);
  const [adding, setAdding] = useState(false);

  const has = (name: string) => mine.some((m) => m.name === name);
  const add = (k: SourceBook) => { if (!has(k.name)) setMine([...mine, k]); };
  const remove = (name: string) => setMine(mine.filter((m) => m.name !== name));

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader
        title="Kaynaklarım"
        sub={`${mine.length} kaynak · koçun ödev atarken bunlardan seçer`}
        onBack={onBack}
        action={
          <button className="uk-btn uk-btn-primary" onClick={() => setAdding(true)}>
            <MIcon name="plus" size={15} /> Ekle
          </button>
        }
      />

      <div className="uk-sec" style={{ marginTop: 8, gap: 8 }}>
        {mine.map((s) => {
          const tur = KAYNAK_TUR[s.tur] ?? KAYNAK_TUR.soru;
          const c = SUBJECT_COLORS[s.subj] || "var(--primary)";
          return (
            <div className="uk-odev" key={s.name} style={{ alignItems: "center", padding: "13px 14px" }}>
              <span className="ic" style={{ width: 38, height: 38, background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}>
                <MIcon name={tur.icon as IconName} size={18} />
              </span>
              <div className="body">
                <div className="ttl" style={{ fontSize: 14 }}>{s.name}</div>
                <div className="uk-meta" style={{ marginTop: 5 }}>
                  <span className="mi">{s.subj}</span>
                  <span className="mi d">{tur.label}</span>
                </div>
              </div>
              <button
                className="uk-iconbtn"
                style={{ width: 34, height: 34, boxShadow: "none", color: "var(--faint)" }}
                onClick={() => remove(s.name)}
              >
                <MIcon name="plus" size={16} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="uk-sheet-overlay" onClick={() => setAdding(false)}>
          <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="uk-grip" />
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Katalogdan ekle</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginBottom: 14 }}>
              Bilinen yayınevi kitaplarından seç
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATALOG.map((k) => {
                const tur = KAYNAK_TUR[k.tur] ?? KAYNAK_TUR.soru;
                const on = has(k.name);
                return (
                  <button
                    key={k.name}
                    onClick={() => add(k)}
                    disabled={on}
                    className="uk-odev"
                    style={{ alignItems: "center", padding: "12px 14px", width: "100%", textAlign: "left", opacity: on ? 0.55 : 1 }}
                  >
                    <span className="ic" style={{ width: 36, height: 36, background: "var(--surface-3)", color: "var(--text-2)" }}>
                      <MIcon name={tur.icon as IconName} size={17} />
                    </span>
                    <div className="body">
                      <div className="ttl" style={{ fontSize: 13.5 }}>{k.name}</div>
                      <div className="uk-meta" style={{ marginTop: 4 }}>
                        <span className="mi">{k.subj}</span>
                        <span className="mi d">{tur.label}</span>
                      </div>
                    </div>
                    <span className={`uk-badge ${on ? "success" : "primary"}`}>
                      {on ? <><MIcon name="check" size={12} /> Eklendi</> : "Ekle"}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              className="uk-btn uk-btn-light uk-btn-block"
              style={{ marginTop: 14, height: 48, boxShadow: "none" }}
              onClick={() => setAdding(false)}
            >
              Bitti
            </button>
          </div>
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}
