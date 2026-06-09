"use client";

/* Uyanık Koç - Yıllık Konu Takip Çizelgesi (Kaynak) v2
   Kaynak: .design-import/handoff-28/.../konu-cizelge/cizelge-app.jsx + cizelge-data.jsx
   Bu dosya yalnızca Next/TypeScript ve mevcut ikon sistemi için uyarlanmıştır. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import type { SubjectRecord } from "@uyanik/database";

type KonuCizelgeProps = {
  studentId?: string;
  subjects?: SubjectRecord[];
  maxHeight?: string;
  showTip?: boolean;
  hideTabs?: boolean;
  subj?: string;
  onSubj?: (subject: string) => void;
};

type CizSession = {
  id: string;
  date: Date;
  w: number;
  soru: number;
  dogru: number;
};

type CizCell = {
  s: number;
  d: number;
  sessions: CizSession[];
  single?: CizSession;
};

type CizColumn = {
  key: string;
  label: string;
  sub?: string | null;
  date?: Date;
  dow?: number;
  w?: number;
};

type CizView = "tekrar" | "gun" | "hafta";
type CizKind = CizView;

const CIZ_SUBJ_COLOR: Record<string, string> = {
  "Türkçe": "#534AB7",
  Matematik: "#2F6BD6",
  Geometri: "#0E8C6F",
  Fizik: "#B26A12",
  Kimya: "#A33E73",
  Biyoloji: "#3F8E45",
};

const CIZ_CURR: Record<string, Array<{ grup: string; konular: string[] }>> = {
  "Türkçe": [
    {
      grup: "Dil Bilgisi",
      konular: ["Sözcükte Yapı", "Ses Bilgisi", "İsimler", "Zamirler", "Sıfatlar", "Zarflar", "Edat - Bağlaç - Ünlem", "Fiiller", "Fiilimsiler", "Cümlenin Ögeleri"],
    },
    { grup: "Anlam Bilgisi", konular: ["Sözcükte Anlam", "Cümlede Anlam", "Paragrafta Anlam", "Paragrafta Yapı", "Anlatım Bozuklukları"] },
  ],
  Matematik: [
    { grup: "Sayılar & Cebir", konular: ["Temel Kavramlar", "Bölme - Bölünebilme", "EBOB - EKOK", "Rasyonel Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar"] },
    { grup: "Problemler", konular: ["Sayı Problemleri", "Kesir Problemleri", "Yüzde - Faiz", "Hız Problemleri", "İşçi - Havuz"] },
    { grup: "Fonksiyon & Analiz", konular: ["Fonksiyonlar", "Polinomlar", "2. Dereceden Denklemler"] },
  ],
  Geometri: [
    { grup: "Üçgenler", konular: ["Açılar", "Üçgende Açı", "Üçgende Alan", "Dik Üçgen", "Açıortay - Kenarortay", "Benzerlik"] },
    { grup: "Çokgenler & Dörtgenler", konular: ["Çokgenler", "Dörtgenler", "Paralelkenar", "Yamuk", "Deltoid"] },
    { grup: "Çember & Analitik", konular: ["Çemberde Açı", "Çemberde Uzunluk", "Analitik Geometri"] },
  ],
  Fizik: [
    { grup: "Mekanik", konular: ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket - Kuvvet", "Dinamik", "İş - Güç - Enerji", "Basınç"] },
    { grup: "Elektrik & Manyetizma", konular: ["Elektrostatik", "Elektrik Akımı", "Manyetizma"] },
    { grup: "Dalgalar & Optik", konular: ["Dalgalar", "Optik"] },
  ],
  Kimya: [
    { grup: "Temel Kimya", konular: ["Kimya Bilimi", "Atom ve Yapısı", "Periyodik Sistem", "Kimyasal Türler Arası Etkileşim", "Kimyanın Temel Kanunları"] },
    { grup: "Karışım & Tepkime", konular: ["Mol Kavramı", "Karışımlar", "Asit - Baz - Tuz", "Kimyasal Tepkimeler"] },
  ],
  Biyoloji: [
    { grup: "Hücre & Canlılar", konular: ["Canlıların Ortak Özellikleri", "Hücre", "Hücre Bölünmeleri", "Canlıların Sınıflandırılması"] },
    { grup: "Sistemler", konular: ["Kalıtım", "Ekosistem", "Sinir Sistemi", "Dolaşım Sistemi"] },
  ],
};

const CIZ_WEEKS = 12;
const CIZ_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const CIZ_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const ICON_MAP: Record<string, string> = {
  refresh: "ki-arrows-circle",
  calendar: "ki-calendar",
  dashboard: "ki-element-11",
  pencil: "ki-notepad-edit",
  search: "ki-magnifier",
  chevronRight: "ki-right",
  chevronDown: "ki-down",
  alert: "ki-information",
  check: "ki-check",
  download: "ki-file-down",
  book: "ki-book-open",
};

function Icon({ name, size = 18, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <KiIcon name={ICON_MAP[name] ?? name} size={size} style={style} />;
}

function cizRate(s: number, d: number) {
  return s > 0 ? d / s : 0;
}

function cizHeat(s: number, d: number) {
  if (s === 0) return "";
  const r = d / s;
  if (r >= 0.85) return "heat-a";
  if (r >= 0.7) return "heat-b";
  if (r >= 0.55) return "heat-c";
  return "heat-d";
}

function cizNet(s: number, d: number) {
  const n = d - (s - d) / 4;
  return Math.round(n * 100) / 100;
}

function cizHeatBg(r: number) {
  return r >= 0.85 ? "var(--success-soft)" : r >= 0.7 ? "#EAF4ED" : r >= 0.55 ? "var(--warning-soft)" : "var(--danger-soft)";
}

function cizHeatFg(r: number) {
  return r >= 0.85 ? "var(--success)" : r >= 0.7 ? "#2F7A4E" : r >= 0.55 ? "var(--warning)" : "var(--danger)";
}

function cizSeed(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function rng() {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cizMonday(w: number) {
  const base = new Date(2026, 5, 1);
  const d = new Date(base);
  d.setDate(base.getDate() - (CIZ_WEEKS - 1 - w) * 7);
  return d;
}

function cizFmtDay(d: Date) {
  return `${d.getDate()} ${CIZ_MONTHS[d.getMonth()]}`;
}

function cizFmtFull(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function cizWeekRange(w: number) {
  const m = cizMonday(w);
  const s = new Date(m);
  s.setDate(m.getDate() + 6);
  return `${cizFmtDay(m)} - ${cizFmtDay(s)}`;
}

function cizBuildSessions(subject: string, topic: string, importanceIdx: number, total: number): CizSession[] {
  const rng = cizSeed(`${subject}::${topic}`);
  const progress = 1 - importanceIdx / Math.max(1, total);
  const pStudy = 0.3 + 0.55 * progress;
  const sessions: CizSession[] = [];
  for (let w = 0; w < CIZ_WEEKS; w++) {
    if (rng() > pStudy) continue;
    const cnt = rng() < 0.25 ? 2 : 1;
    for (let c = 0; c < cnt; c++) {
      const dow = Math.floor(rng() * 6);
      const date = cizMonday(w);
      date.setDate(date.getDate() + dow);
      const soru = 10 + Math.floor(rng() * 41);
      const rate = 0.48 + 0.47 * rng() + 0.05 * progress;
      const dogru = Math.min(soru, Math.round(soru * Math.min(0.98, rate)));
      sessions.push({ date, w, soru, dogru, id: `${subject}:${topic}:${w}:${c}` });
    }
  }
  sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  return sessions;
}

function cizBuildAll() {
  const out: Record<string, Record<string, CizSession[]>> = {};
  Object.keys(CIZ_CURR).forEach((subj) => {
    out[subj] = {};
    const flat = CIZ_CURR[subj]!.flatMap((g) => g.konular);
    flat.forEach((t, i) => {
      out[subj]![t] = cizBuildSessions(subj, t, i, flat.length);
    });
  });
  return out;
}

function buildColumns(view: CizView, topicsSessions: Record<string, CizSession[]>, weekIdx: number): { cols: CizColumn[]; kind: CizKind } {
  if (view === "tekrar") {
    let maxRep = 0;
    Object.values(topicsSessions).forEach((arr) => {
      if (arr.length > maxRep) maxRep = arr.length;
    });
    maxRep = Math.max(maxRep, 52);
    return { cols: Array.from({ length: maxRep }, (_, i) => ({ key: `r${i}`, label: `${i + 1}.`, sub: null })), kind: "tekrar" };
  }
  if (view === "gun") {
    const mon = cizMonday(weekIdx);
    const cols = CIZ_DAYS.map((day, dow) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + dow);
      return { key: `d${dow}`, label: day, sub: String(d.getDate()), date: d, dow };
    });
    return { cols, kind: "gun" };
  }
  return { cols: Array.from({ length: CIZ_WEEKS }, (_, w) => ({ key: `w${w}`, label: `${w + 1}. Hf`, sub: null, w })), kind: "hafta" };
}

function cellFor(kind: CizKind, sessions: CizSession[], col: CizColumn): CizCell | null {
  if (kind === "tekrar") {
    const idx = Number.parseInt(col.key.slice(1), 10);
    const ses = sessions[idx];
    return ses ? { s: ses.soru, d: ses.dogru, sessions: [ses], single: ses } : null;
  }
  if (kind === "gun") {
    const day = col.date;
    if (!day) return null;
    const m = sessions.filter((x) => x.date.getFullYear() === day.getFullYear() && x.date.getMonth() === day.getMonth() && x.date.getDate() === day.getDate());
    if (!m.length) return null;
    return { s: m.reduce((a, x) => a + x.soru, 0), d: m.reduce((a, x) => a + x.dogru, 0), sessions: m };
  }
  const m = sessions.filter((x) => x.w === col.w);
  if (!m.length) return null;
  return { s: m.reduce((a, x) => a + x.soru, 0), d: m.reduce((a, x) => a + x.dogru, 0), sessions: m };
}

function useCizOverrides() {
  const [overrides, setOverrides] = useState<Record<string, { s: number; d: number }>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("cz-overrides") || "{}") as Record<string, { s: number; d: number }>;
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("cz-overrides", JSON.stringify(overrides));
    } catch {
      return;
    }
  }, [overrides]);
  return [overrides, setOverrides] as const;
}

function CellPopover({
  anchor,
  kind,
  topic,
  col,
  cell,
  editable,
  onSave,
  onClose,
}: {
  anchor: HTMLElement;
  kind: CizKind;
  topic: string;
  col: CizColumn;
  cell: CizCell | null;
  editable: boolean;
  onSave: (s: number, d: number) => void;
  onClose: () => void;
}) {
  const single = cell?.single;
  const [sv, setSv] = useState(single ? String(single.soru) : "");
  const [dv, setDv] = useState(single ? String(single.dogru) : "");
  const popRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useEffect(() => {
    const r = anchor.getBoundingClientRect();
    const W = 268;
    const H = popRef.current ? popRef.current.offsetHeight : 220;
    let left = r.left + r.width / 2 - W / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - W - 12));
    let top = r.bottom + 8;
    if (top + H > window.innerHeight - 12) top = r.top - H - 8;
    setPos({ left, top });
  }, [anchor, cell]);

  const sN = Number.parseInt(sv, 10);
  const dN = Number.parseInt(dv, 10);
  const sHas = sv.trim() !== "" && !Number.isNaN(sN);
  const dHas = dv.trim() !== "" && !Number.isNaN(dN);
  const sNeg = sHas && sN < 0;
  const dNeg = dHas && dN < 0;
  const exceeds = sHas && dHas && dN > sN;
  const valid = sHas && dHas && !sNeg && !dNeg && !exceeds;
  const errMsg = sNeg || dNeg ? "Değerler negatif olamaz." : exceeds ? "Doğru sayısı, soru sayısından fazla olamaz." : !sHas || !dHas ? "Soru ve doğru sayısını girin." : "";
  const periodLabel = kind === "tekrar" ? `${Number.parseInt(col.key.slice(1), 10) + 1}. tekrar` : kind === "gun" && col.date ? cizFmtFull(col.date) : col.label;

  return createPortal(
    <div className="cz-pop-overlay" onMouseDown={onClose}>
      <div ref={popRef} className="cz-pop" style={{ left: pos.left, top: pos.top }} onMouseDown={(event) => event.stopPropagation()}>
        <h4>{topic}</h4>
        <div className="psub">
          {periodLabel}
          {cell && cell.sessions.length > 1 ? ` · ${cell.sessions.length} oturum` : ""}
        </div>

        {kind === "tekrar" && editable ? (
          <>
            <div className="fields">
              <div className="f">
                <label>Soru <span className="req">*</span></label>
                <input className={sNeg ? "err" : ""} type="number" min="0" value={sv} onChange={(event) => setSv(event.target.value)} autoFocus />
              </div>
              <div className="f">
                <label>Doğru <span className="req">*</span></label>
                <input className={exceeds || dNeg ? "err" : ""} type="number" min="0" value={dv} onChange={(event) => setDv(event.target.value)} />
              </div>
            </div>
            {errMsg ? (
              <div className="cz-err"><Icon name="alert" size={14} />{errMsg}</div>
            ) : (
              <div className="netbox"><span className="l">Net <span style={{ opacity: 0.7 }}>(yanlış / 4)</span></span><span className="v" style={{ color: "var(--primary)" }}>{cizNet(sN, dN)}</span></div>
            )}
            <div className="actions">
              <button className="btn btn-light btn-sm grow" onClick={onClose}>Vazgeç</button>
              <button className="btn btn-primary btn-sm grow" disabled={!valid} onClick={() => valid && onSave(sN, dN)}><Icon name="check" size={15} />Kaydet</button>
            </div>
          </>
        ) : (
          <>
            {cell ? (
              <>
                <div className="netbox" style={{ marginTop: 13 }}>
                  <span className="l">Toplam</span>
                  <span className="v">{cell.s} soru · <span style={{ color: "var(--success)" }}>{cell.d} doğru</span> · %{Math.round(cizRate(cell.s, cell.d) * 100)}</span>
                </div>
                <div className="cz-brk">
                  {cell.sessions.map((x) => (
                    <div className="cz-brk-row" key={x.id}>
                      <span className="dt">{cizFmtFull(x.date)}</span>
                      <span className="vals"><span className="sv">{x.soru} S</span><span style={{ color: cizRate(x.soru, x.dogru) >= 0.7 ? "var(--success)" : "var(--warning)" }}>{x.dogru} D</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="cz-brk-empty">Bu dönemde kayıt yok.</div>
            )}
            <div className="actions"><button className="btn btn-light btn-sm grow" onClick={onClose}>Kapat</button></div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function KonuCizelge({ maxHeight = "70vh", showTip = true, hideTabs = false, subj: subjProp, onSubj }: KonuCizelgeProps) {
  const ALL0 = useMemo(() => cizBuildAll(), []);
  const subjects = Object.keys(CIZ_CURR);
  const [overrides, setOverrides] = useCizOverrides();
  const [subjState, setSubjState] = useState(subjects[0] ?? "Türkçe");
  const validSubjProp = subjProp != null && CIZ_CURR[subjProp] != null ? subjProp : undefined;
  const subj = validSubjProp ?? subjState;
  const setSubj = (subject: string) => {
    setSubjState(subject);
    onSubj?.(subject);
  };
  const [view, setView] = useState<CizView>("tekrar");
  const [weekIdx, setWeekIdx] = useState(CIZ_WEEKS - 1);
  const [editMode, setEditMode] = useState(true);
  const [q, setQ] = useState("");
  const [pop, setPop] = useState<{ anchor: HTMLElement; topic: string; col: CizColumn; cell: CizCell | null } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [scState, setScState] = useState({ l: false, r: false, first: 1, last: 1, total: 0 });
  const todayWeek = CIZ_WEEKS - 1;

  const topicsSessions = useMemo(() => {
    const o: Record<string, CizSession[]> = {};
    CIZ_CURR[subj]!.flatMap((g) => g.konular).forEach((t) => {
      o[t] = ALL0[subj]![t]!.map((s) => {
        const ov = overrides[s.id];
        return ov ? { ...s, soru: ov.s, dogru: ov.d } : s;
      });
    });
    return o;
  }, [subj, overrides, ALL0]);

  const { cols, kind } = useMemo(() => buildColumns(view, topicsSessions, weekIdx), [view, topicsSessions, weekIdx]);
  const ql = q.trim().toLocaleLowerCase("tr");
  const groups = CIZ_CURR[subj]!
    .map((g) => ({ grup: g.grup, konular: g.konular.filter((t) => !ql || t.toLocaleLowerCase("tr").includes(ql)) }))
    .filter((g) => g.konular.length);

  const yearTotal = useCallback((topic: string) => {
    const arr = topicsSessions[topic] ?? [];
    return { s: arr.reduce((a, x) => a + x.soru, 0), d: arr.reduce((a, x) => a + x.dogru, 0), n: arr.length };
  }, [topicsSessions]);

  const colTotals = cols.map((col) => {
    let s = 0;
    let d = 0;
    Object.keys(topicsSessions).forEach((t) => {
      const c = cellFor(kind, topicsSessions[t] ?? [], col);
      if (c) {
        s += c.s;
        d += c.d;
      }
    });
    return { s, d };
  });
  const grand = Object.keys(topicsSessions).reduce((a, t) => {
    const y = yearTotal(t);
    a.s += y.s;
    a.d += y.d;
    return a;
  }, { s: 0, d: 0 });

  const openCell = (event: MouseEvent<HTMLElement>, topic: string, col: CizColumn, cell: CizCell | null) => setPop({ anchor: event.currentTarget, topic, col, cell });
  const saveCell = (sN: number, dN: number) => {
    if (!pop || kind !== "tekrar") return;
    let id: string;
    if (pop.cell?.single) id = pop.cell.single.id;
    else id = `${subj}:${pop.topic}:new:${topicsSessions[pop.topic]?.length ?? 0}`;
    setOverrides((o) => ({ ...o, [id]: { s: sN, d: dN } }));
    setPop(null);
  };

  const scrollByCols = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    try {
      el.scrollTo({ left: el.scrollLeft + dir * 360, behavior: "smooth" });
      return;
    } catch {
      el.scrollLeft += dir * 360;
    }
  };
  const updateSc = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const FL = 234;
    const FR = 132;
    const total = el.querySelectorAll("thead .r1 .cz-colhead").length || 0;
    const innerW = Math.max(1, el.scrollWidth - FL - FR);
    const colW = innerW / Math.max(1, total);
    const first = Math.min(total || 1, Math.floor(el.scrollLeft / colW) + 1);
    const visCols = Math.max(1, Math.round((el.clientWidth - FL - FR) / colW));
    const last = Math.min(total || 1, first + visCols - 1);
    setScState({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4, first, last, total });
  }, []);

  useEffect(() => {
    updateSc();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateSc, { passive: true });
    window.addEventListener("resize", updateSc);
    return () => {
      el.removeEventListener("scroll", updateSc);
      window.removeEventListener("resize", updateSc);
    };
  }, [updateSc, view, subj, q]);

  return (
    <>
      {!hideTabs && (
        <div className="cz-tabs" style={{ marginBottom: 14 }}>
          {subjects.map((s) => {
            const on = s === subj;
            const c = CIZ_SUBJ_COLOR[s];
            const nTopics = CIZ_CURR[s]!.reduce((a, g) => a + g.konular.length, 0);
            return (
              <button key={s} className={`cz-tab${on ? " on" : ""}`} style={on ? { background: c } : {}} onClick={() => { setSubj(s); setPop(null); }}>
                {!on && <span className="sw" style={{ background: c }} />}{s}<span className="ct">{nTopics}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="cz-toolbar">
          <div className="cz-seg">
            <button className={view === "tekrar" ? "on" : ""} onClick={() => setView("tekrar")}><Icon name="refresh" size={14} />Tekrar</button>
            <button className={view === "gun" ? "on" : ""} onClick={() => setView("gun")}><Icon name="calendar" size={14} />Günlük</button>
            <button className={view === "hafta" ? "on" : ""} onClick={() => setView("hafta")}><Icon name="dashboard" size={14} />Haftalık</button>
          </div>

          {view === "gun" && (
            <div className="cz-nav">
              <button className="cz-navbtn" disabled={weekIdx <= 0} onClick={() => setWeekIdx((w) => Math.max(0, w - 1))} title="Önceki hafta"><Icon name="chevronRight" size={16} style={{ transform: "scaleX(-1)" }} /></button>
              <span className="lab">{cizWeekRange(weekIdx)}{weekIdx === todayWeek ? " · bu hafta" : ""}</span>
              <button className="cz-navbtn" disabled={weekIdx >= todayWeek} onClick={() => setWeekIdx((w) => Math.min(todayWeek, w + 1))} title="Sonraki hafta"><Icon name="chevronRight" size={16} /></button>
            </div>
          )}
          {view === "hafta" && <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Son {CIZ_WEEKS} hafta · haftalık toplamlar</span>}

          <div className="grow" />
          <div className="cz-legend">
            <span className="item"><span className="dot heat-a" />%85+</span>
            <span className="item"><span className="dot heat-c" />%55-70</span>
            <span className="item"><span className="dot heat-d" />&lt;%55</span>
          </div>

          {view === "tekrar" && (
            <button className={`cz-tab${editMode ? " on" : ""}`} style={editMode ? { background: "var(--primary)", height: 36 } : { height: 36 }} onClick={() => setEditMode((e) => !e)}>
              <Icon name="pencil" size={14} />{editMode ? "Düzenleme açık" : "Düzenle"}
            </button>
          )}

          <div className="cz-search">
            <Icon name="search" size={15} />
            <input placeholder="Konu ara..." value={q} onChange={(event) => setQ(event.target.value)} />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="cz-empty">
            <span className="cz-empty-ic"><Icon name="search" size={26} /></span>
            <b>"{q}" için sonuç yok</b>
            <p>Bu derste aramaya uyan konu bulunamadı. Farklı bir konu adı deneyin ya da aramayı temizleyin.</p>
            <button className="btn btn-light btn-sm" onClick={() => setQ("")}><Icon name="refresh" size={15} />Aramayı temizle</button>
          </div>
        ) : (
          <div className="cz-scrollwrap">
            {(view === "tekrar" || view === "hafta") && scState.total > 0 && (
              <div className="cz-colnav">
                <span className="hint"><Icon name="dashboard" size={14} />{scState.total} {view === "tekrar" ? "tekrar" : "hafta"} sütunu · oklarla ya da kaydırarak gez</span>
                <div className="cz-nav">
                  <button className="cz-navbtn" disabled={!scState.l} onClick={() => scrollByCols(-1)} title="Önceki sütunlar"><Icon name="chevronRight" size={16} style={{ transform: "scaleX(-1)" }} /></button>
                  <span className="lab">Sütun {scState.first}-{scState.last} <span style={{ color: "var(--faint)" }}>/ {scState.total}</span></span>
                  <button className="cz-navbtn" disabled={!scState.r} onClick={() => scrollByCols(1)} title="Sonraki sütunlar"><Icon name="chevronRight" size={16} /></button>
                </div>
              </div>
            )}
            <div className="cz-scroll" ref={scrollRef} style={{ maxHeight }}>
              <table className="cz-grid">
                <thead>
                  <tr className="r1">
                    <th className="cz-corner" rowSpan={2}><span className="ttl">Konu / Tarih</span></th>
                    {cols.map((col) => {
                      const isToday = kind === "gun" && col.date && weekIdx === todayWeek;
                      return <th className={`cz-colhead${isToday ? " today" : ""}`} colSpan={2} key={col.key}>{col.label}{col.sub && <span className="sub">{col.sub}</span>}</th>;
                    })}
                    <th className="cz-toth" rowSpan={2}><div style={{ padding: "0 13px", textAlign: "left" }}><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--faint)" }}>Top / Ort</span></div></th>
                  </tr>
                  <tr className="r2">
                    {cols.map((col) => (
                      <FragmentPair key={col.key}>
                        <th className="cz-sub s">S</th><th className="cz-sub d sep">D</th>
                      </FragmentPair>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => {
                    const isCol = !!collapsed[g.grup];
                    let gs = 0;
                    let gd = 0;
                    let gn = 0;
                    g.konular.forEach((t) => {
                      const y = yearTotal(t);
                      gs += y.s;
                      gd += y.d;
                      if (y.n) gn++;
                    });
                    const gr = cizRate(gs, gd);
                    return (
                      <FragmentPair key={g.grup}>
                        <tr className={`cz-grp${isCol ? " collapsed" : ""}`} onClick={() => setCollapsed((c) => ({ ...c, [g.grup]: !c[g.grup] }))}>
                          <td className="cz-topic">
                            <span className="cz-grp-tog"><Icon name="chevronDown" size={15} style={{ transform: isCol ? "rotate(-90deg)" : "none", transition: "transform .18s" }} /></span>
                            {g.grup}<span className="cnt">{g.konular.length} konu</span>
                            {isCol ? <span className="cz-grp-sum">{gn}/{g.konular.length} tamam · {gs.toLocaleString("tr-TR")} soru</span> : null}
                          </td>
                          {cols.map((col) => <td className="cz-cell" colSpan={2} key={col.key} />)}
                          <td className="cz-tot">{isCol ? <div className="l1"><span className="soru tnum">{gs.toLocaleString("tr-TR")}<s> soru</s></span><span className="pct" style={{ background: gn ? cizHeatBg(gr) : "var(--surface-3)", color: gn ? cizHeatFg(gr) : "var(--faint)" }}>%{gn ? Math.round(gr * 100) : 0}</span></div> : null}</td>
                        </tr>
                        {!isCol && g.konular.map((topic) => {
                          const y = yearTotal(topic);
                          const yr = cizRate(y.s, y.d);
                          const status = y.n === 0 ? "todo" : yr >= 0.78 && y.n >= 5 ? "done" : "progress";
                          const stColor = status === "done" ? "var(--success)" : status === "progress" ? "var(--warning)" : "var(--faint)";
                          return (
                            <tr key={topic}>
                              <td className="cz-topic">
                                <div className="row"><span className="st" style={{ background: stColor }} /><span className="nm">{topic}</span></div>
                                <div className="meta">{y.n} oturum{y.n ? ` · ${y.s} soru` : " · başlanmadı"}</div>
                              </td>
                              {cols.map((col) => {
                                const cell = cellFor(kind, topicsSessions[topic] ?? [], col);
                                const editable = kind === "tekrar" && editMode;
                                if (!cell) {
                                  return (
                                    <FragmentPair key={col.key}>
                                      <td className={`cz-cell empty${editable ? " edit-on" : ""}`} onClick={(event) => openCell(event, topic, col, null)} />
                                      <td className={`cz-cell empty sep${editable ? " edit-on" : ""}`} onClick={(event) => openCell(event, topic, col, null)} />
                                    </FragmentPair>
                                  );
                                }
                                const heat = cizHeat(cell.s, cell.d);
                                return (
                                  <FragmentPair key={col.key}>
                                    <td className={`cz-cell s${editable ? " edit-on" : ""}`} onClick={(event) => openCell(event, topic, col, cell)}><span className="num">{cell.s}</span></td>
                                    <td className={`cz-cell d sep ${heat}${editable ? " edit-on" : ""}`} onClick={(event) => openCell(event, topic, col, cell)}><span className="num">{cell.d}</span></td>
                                  </FragmentPair>
                                );
                              })}
                              <td className="cz-tot">
                                <div className="l1">
                                  <span className="soru tnum">{y.s}<s> soru</s></span>
                                  <span className="pct" style={{ background: y.n ? cizHeatBg(yr) : "var(--surface-3)", color: y.n ? cizHeatFg(yr) : "var(--faint)" }}>%{y.n ? Math.round(yr * 100) : 0}</span>
                                </div>
                                <div className="barwrap"><span style={{ width: `${Math.round(yr * 100)}%`, background: y.n ? cizHeatFg(yr) : "var(--border-strong)" }} /></div>
                              </td>
                            </tr>
                          );
                        })}
                      </FragmentPair>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="cz-topic">Sütun toplamı</td>
                    {cols.map((col, i) => (
                      <FragmentPair key={col.key}>
                        <td className="cz-cell cz-foot-cell">{colTotals[i]?.s || ""}</td>
                        <td className="cz-cell cz-foot-cell d sep">{colTotals[i]?.d || ""}</td>
                      </FragmentPair>
                    ))}
                    <td className="cz-tot">
                      <div className="l1"><span className="soru tnum">{grand.s.toLocaleString("tr-TR")}<s> soru</s></span><span className="pct" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>%{grand.s ? Math.round((grand.d / grand.s) * 100) : 0}</span></div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {showTip && (
        <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
          <b style={{ color: "var(--text-2)" }}>İpucu:</b> Tekrar görünümünde bir hücreye tıklayıp soru/doğru girebilirsin; boş hücreye tıklamak yeni oturum ekler. Günlük ve Haftalık görünümlerde hücreye tıklayınca o dönemin kırılımı açılır. Değişiklikler tarayıcında saklanır.
        </p>
      )}

      {pop && <CellPopover anchor={pop.anchor} kind={kind} topic={pop.topic} col={pop.col} cell={pop.cell} editable={editMode} onSave={saveCell} onClose={() => setPop(null)} />}
    </>
  );
}

function FragmentPair({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function StudentStrip() {
  const grand = useMemo(() => {
    const ALL = cizBuildAll();
    let s = 0;
    let d = 0;
    Object.keys(ALL).forEach((subj) => Object.keys(ALL[subj]!).forEach((t) => ALL[subj]![t]!.forEach((x) => { s += x.soru; d += x.dogru; })));
    return { s, d };
  }, []);
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap", padding: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(140deg,var(--primary-300),var(--primary-700))", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16 }}>EY</div>
        <div style={{ flex: 1, minWidth: 170 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>Elif Yıldız</span>
            <span className="badge badge-primary">11. Sınıf · Sayısal</span>
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>KAMP ÜS programı · Hedef: YKS 2026</div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ textAlign: "right" }}>
            <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Toplam soru</div>
            <div className="tnum" style={{ fontSize: 19, fontWeight: 800 }}>{grand.s.toLocaleString("tr-TR")}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Ort. doğru</div>
            <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: "var(--success)" }}>%{grand.s ? Math.round((grand.d / grand.s) * 100) : 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
