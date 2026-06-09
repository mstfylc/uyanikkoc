"use client";

import { useMemo, useState } from "react";

import { EmptyState, Icon, OrgLogo, RankBars, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore, useSnapshot } from "@/components/admin/AdminStore";
import { Modal } from "@/components/admin/dialogs";
import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import { downloadCSV } from "@/lib/admin/csv";
import { fmtShort, tl } from "@/lib/admin/format";
import { COACH_PLANS, ORG_PLANS, coachPlanById, orgPlanById } from "@/lib/admin/pricing";
import type { DemoRequest, DemoRequestKind, DemoRequestStatus, OrgPlanId, CoachPlanId } from "@/lib/admin/types";

const DAY = 86_400_000;

const STATUS_META: Record<DemoRequestStatus, { tone: string; label: string }> = {
  new: { tone: "warning", label: "Yeni talep" },
  contacted: { tone: "info", label: "Iletisime gecildi" },
  scheduled: { tone: "primary", label: "Demo planlandi" },
  converted: { tone: "success", label: "Satisa dondu" },
  lost: { tone: "muted", label: "Kayip" },
};

const STATUS_FLOW: DemoRequestStatus[] = ["new", "contacted", "scheduled", "converted"];
const SIGNUP_META = {
  new: { tone: "success", label: "Yeni uyelik" },
  renewal: { tone: "info", label: "Yenileme" },
  upgrade: { tone: "primary", label: "Yukseltme" },
  trial: { tone: "warning", label: "Ucretsiz deneme" },
} as const;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "az once";
  if (h < 24) return `${h} saat once`;
  return `${Math.floor(h / 24)} gun once`;
}

function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function toLocalInput(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts - new Date().getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
}

function planName(d: { kind: DemoRequestKind; planId: string }): string {
  return d.kind === "org" ? orgPlanById(d.planId as OrgPlanId).name : coachPlanById(d.planId as CoachPlanId).name;
}

function planColor(d: { kind: DemoRequestKind; planId: string }): string {
  return d.kind === "org" ? orgPlanById(d.planId as OrgPlanId).color : coachPlanById(d.planId as CoachPlanId).color;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}

function AddDemoModal({ onClose }: { onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [name, setName] = useState("");
  const [requestKind, setRequestKind] = useState<DemoRequestKind>("org");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [planId, setPlanId] = useState<OrgPlanId | CoachPlanId>("pro");
  const [source, setSource] = useState("Telefon");
  const [note, setNote] = useState("");
  const plans = requestKind === "org" ? ORG_PLANS : COACH_PLANS;

  async function apply() {
    await mutate({ kind: "addDemoRequest", name, requestKind, email, phone, city, planId, source, note });
    toast("Demo talebi eklendi", { icon: "ki-check-circle", tone: "success" });
    onClose();
  }

  return (
    <Modal
      title="Yeni demo talebi"
      sub="Telefon, form veya reklamdan gelen ilgiyi kaydet"
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgec</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!name.trim()} onClick={() => void apply()}>
            <Icon name="plus" size={16} />Talep ekle
          </button>
        </>
      }
    >
      <Field label="Talep turu">
        <div className="seg" style={{ width: "100%" }}>
          <button type="button" className={requestKind === "org" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setRequestKind("org"); setPlanId("pro"); }}>Kurum / Franchise</button>
          <button type="button" className={requestKind === "coach" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setRequestKind("coach"); setPlanId("c-pro"); }}>Bireysel koc</button>
        </div>
      </Field>
      <Field label={requestKind === "org" ? "Kurum adi" : "Ad soyad"}><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="E-posta"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Telefon"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Sehir"><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></Field>
        <Field label="Kaynak">
          <select className="input" value={source} onChange={(e) => setSource(e.target.value)}>
            {["Telefon", "Web sitesi", "Instagram", "Google reklam", "Jotform", "Referans", "Fuar / etkinlik"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Ilgilenilen plan">
        <select className="input" value={planId} onChange={(e) => setPlanId(e.target.value as OrgPlanId | CoachPlanId)}>
          {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
        </select>
      </Field>
      <Field label="Not"><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
    </Modal>
  );
}

function LeadDetailModal({ lead, onClose }: { lead: DemoRequest; onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [note, setNote] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [showLost, setShowLost] = useState(false);
  const author = "Platform Ekibi";

  async function setStatus(status: DemoRequestStatus) {
    await mutate({ kind: "setDemoStatus", requestId: lead.id, status });
    toast(`${lead.name} · ${STATUS_META[status].label}`, { icon: "ki-check-circle" });
  }

  async function addNote(text: string) {
    await mutate({ kind: "addDemoNote", requestId: lead.id, text, author });
    toast("Not eklendi", { icon: "ki-notepad-edit" });
  }

  return (
    <Modal
      title={lead.name}
      sub={`${lead.kind === "org" ? "Kurum" : "Bireysel koc"} · ${lead.city} · ${planName(lead)}`}
      width={660}
      onClose={onClose}
      foot={
        <>
          {lead.status === "lost" ? (
            <button type="button" className="btn btn-light" onClick={() => void setStatus("contacted")}><Icon name="refresh" size={16} />Yeniden ac</button>
          ) : (
            <button type="button" className="btn btn-light" onClick={() => setShowLost(true)}><Icon name="alert" size={16} />Kayip olarak isaretle</button>
          )}
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onClose}>Kapat</button>
        </>
      }
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <a className="badge badge-muted" href={`mailto:${lead.email}`} style={{ height: 26, textDecoration: "none" }}><Icon name="message" size={12} />{lead.email}</a>
        <a className="badge badge-muted" href={`tel:${lead.phone.replace(/\s/g, "")}`} style={{ height: 26, textDecoration: "none" }}><Icon name="phone" size={12} />{lead.phone}</a>
        <span className="badge badge-muted" style={{ height: 26 }}><Icon name="bell" size={12} />{lead.source}</span>
      </div>

      <div>
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 800, marginBottom: 12, textTransform: "uppercase" }}>Asama - tiklayarak ilerlet</div>
        <div className="grid g-4" style={{ gap: 10 }}>
          {STATUS_FLOW.map((status) => {
            const idx = STATUS_FLOW.indexOf(status);
            const current = lead.status === status;
            const done = STATUS_FLOW.indexOf(lead.status) > idx && lead.status !== "lost";
            return (
              <button key={status} type="button" className={`card ${current ? "tone-primary" : ""}`} style={{ padding: 12, border: "1px solid var(--border)" }} onClick={() => void setStatus(status)}>
                <span className={`stat-icon tone-${done ? "success" : current ? "primary" : "info"}`} style={{ width: 34, height: 34, margin: "0 auto 8px" }}>
                  <Icon name={done ? "check" : status === "converted" ? "checkCircle" : status === "scheduled" ? "calendar" : status === "contacted" ? "phone" : "bell"} size={15} />
                </span>
                <span style={{ display: "block", fontSize: 11.5, fontWeight: 800 }}>{STATUS_META[status].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Demo randevusu">
        <input
          className="input"
          type="datetime-local"
          value={toLocalInput(lead.scheduledAt)}
          onChange={(e) => void mutate({ kind: "setDemoSchedule", requestId: lead.id, scheduledAt: e.target.value ? new Date(e.target.value).getTime() : null })}
        />
        {lead.scheduledAt ? <span className="muted" style={{ fontSize: 12, marginTop: 6 }}>{fmtDateTime(lead.scheduledAt)} olarak planlandi</span> : null}
      </Field>

      <div>
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 800, marginBottom: 9, textTransform: "uppercase" }}>Gorusme notlari</div>
        <div className="row" style={{ alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1 }} />
          <button type="button" className="btn btn-primary" disabled={!note.trim()} onClick={() => { void addNote(note.trim()); setNote(""); }}><Icon name="plus" size={16} />Ekle</button>
        </div>
        <div className="stack" style={{ gap: 9 }}>
          {lead.notes.length === 0 ? <p className="muted" style={{ fontSize: 12.5 }}>Henuz not yok.</p> : lead.notes.map((item) => (
            <div key={item.id} className="card" style={{ padding: 12 }}>
              <div className="between">
                <b style={{ fontSize: 12.5 }}>{item.author}</b>
                <button type="button" className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => void mutate({ kind: "deleteDemoNote", requestId: lead.id, noteId: item.id })}>
                  <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>{fmtDateTime(item.date)}</div>
              <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {showLost ? (
        <Modal
          title="Kayip olarak isaretle"
          sub={lead.name}
          width={460}
          onClose={() => setShowLost(false)}
          foot={
            <>
              <button type="button" className="btn btn-light" onClick={() => setShowLost(false)}>Vazgec</button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginLeft: "auto" }}
                disabled={!lostReason.trim()}
                onClick={() => {
                  void (async () => {
                    await addNote(`Kayip nedeni: ${lostReason.trim()}`);
                    await setStatus("lost");
                  })();
                  setShowLost(false);
                }}
              >
                <Icon name="alert" size={16} />Kayip olarak isaretle
              </button>
            </>
          }
        >
          <Field label="Kayip nedeni (zorunlu)">
            <textarea className="input" rows={3} value={lostReason} onChange={(e) => setLostReason(e.target.value)} autoFocus />
          </Field>
        </Modal>
      ) : null}
    </Modal>
  );
}

function LostReasonModal({ lead, onClose }: { lead: DemoRequest; onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [reason, setReason] = useState("");

  async function apply() {
    const text = reason.trim();
    if (!text) return;
    await mutate({ kind: "addDemoNote", requestId: lead.id, text: `Kayip nedeni: ${text}`, author: "Platform Ekibi" });
    await mutate({ kind: "setDemoStatus", requestId: lead.id, status: "lost" });
    toast(`${lead.name} kayip olarak isaretlendi`, { icon: "ki-shield-cross", tone: "warning" });
    onClose();
  }

  return (
    <Modal
      title="Kayip olarak isaretle"
      sub={lead.name}
      width={460}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgec</button>
          <button type="button" className="btn btn-danger" style={{ marginLeft: "auto" }} disabled={!reason.trim()} onClick={() => void apply()}>
            <Icon name="alert" size={16} />Kayip olarak isaretle
          </button>
        </>
      }
    >
      <Field label="Kayip nedeni (zorunlu)">
        <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </Field>
    </Modal>
  );
}

function DemoCard({ lead, onOpen, onLost }: { lead: DemoRequest; onOpen: () => void; onLost: () => void }) {
  const { mutate, toast } = useAdminStore();
  const meta = STATUS_META[lead.status];
  const currentIdx = STATUS_FLOW.indexOf(lead.status);
  const next = currentIdx >= 0 ? STATUS_FLOW[currentIdx + 1] : null;

  async function advance() {
    if (!next) return;
    await mutate({ kind: "setDemoStatus", requestId: lead.id, status: next });
    toast(`${lead.name} · ${STATUS_META[next].label}`, { icon: "ki-check-circle" });
  }

  return (
    <div className="card">
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <OrgLogo name={lead.name} tone={planColor(lead)} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 15, fontWeight: 800, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.name}</b>
            <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 5 }}>
              <span className="badge badge-muted" style={{ height: 21, fontSize: 11 }}><Icon name={lead.kind === "org" ? "building" : "users"} size={12} />{lead.kind === "org" ? "Kurum" : "Bireysel koc"}</span>
              <span className={`badge badge-${meta.tone}`} style={{ height: 21, fontSize: 11 }}>{meta.label}</span>
              <span className="muted" style={{ fontSize: 12 }}>{lead.city} · {lead.source} · {timeAgo(lead.requestedAt)}</span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span className="row" style={{ gap: 6, justifyContent: "flex-end", whiteSpace: "nowrap" }}><span className="plan-dot" style={{ background: planColor(lead) }} /><b style={{ fontSize: 12.5 }}>{planName(lead)}</b></span>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>ilgilenilen plan</div>
          </div>
        </div>
        {lead.note ? <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{lead.note}</p> : null}
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {lead.scheduledAt ? <span className="badge badge-primary" style={{ height: 24 }}><Icon name="calendar" size={12} />Randevu: {fmtDateTime(lead.scheduledAt)}</span> : null}
          {lead.notes.length ? <span className="badge badge-muted" style={{ height: 24 }}><Icon name="notebook" size={12} />{lead.notes.length} not</span> : null}
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {next ? <button type="button" className="btn btn-primary btn-sm" onClick={() => void advance()}><Icon name="check" size={14} />{STATUS_META[next].label}</button> : null}
          <button type="button" className="btn btn-light btn-sm" onClick={onOpen}><Icon name="notebook" size={14} />Detay & notlar</button>
          {lead.status === "lost" ? <button type="button" className="btn btn-light btn-sm" onClick={() => void mutate({ kind: "setDemoStatus", requestId: lead.id, status: "contacted" })}><Icon name="refresh" size={14} />Yeniden ac</button> : null}
          {lead.status !== "lost" && lead.status !== "converted" ? <button type="button" className="btn btn-light btn-sm" onClick={onLost}><Icon name="alert" size={14} />Kayip</button> : null}
          <button type="button" className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => void mutate({ kind: "deleteDemoRequest", requestId: lead.id })}>
            <Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuperLeads() {
  const snapshot = useSnapshot();
  const [tab, setTab] = useState<"demo" | "signup">("demo");
  const [status, setStatus] = useState<DemoRequestStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [lostId, setLostId] = useState<string | null>(null);

  const data = useMemo(() => {
    const demoRequests = snapshot?.demoRequests ?? [];
    const signups = snapshot?.signups ?? [];
    const recent = signups.filter((item) => item.at >= Date.now() - 30 * DAY);
    const closed = demoRequests.filter((item) => item.status === "converted" || item.status === "lost");
    const converted = demoRequests.filter((item) => item.status === "converted").length;
    return {
      demoRequests,
      signups,
      open: demoRequests.filter((item) => item.status === "new" || item.status === "contacted" || item.status === "scheduled").length,
      newCount: demoRequests.filter((item) => item.status === "new").length,
      newMembers: recent.filter((item) => item.type === "new").length,
      revenue: recent.reduce((sum, item) => sum + item.amount, 0),
      convRate: closed.length ? Math.round((converted / closed.length) * 100) : 0,
    };
  }, [snapshot]);

  if (!snapshot) return <div className="card card-pad muted">Yukleniyor...</div>;

  const visible = data.demoRequests
    .filter((item) => status === "all" || item.status === status)
    .filter((item) => `${item.name} ${item.city} ${item.source}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.requestedAt - a.requestedAt);
  const openLead = openId ? data.demoRequests.find((item) => item.id === openId) : null;
  const lostLead = lostId ? data.demoRequests.find((item) => item.id === lostId) : null;

  function exportRows() {
    if (tab === "demo") {
      downloadCSV("demo-talepleri.csv", [
        ["Ad", "Tur", "Sehir", "Plan", "Kaynak", "Durum", "E-posta", "Telefon", "Tarih"],
        ...data.demoRequests.map((item) => [item.name, item.kind, item.city, planName(item), item.source, STATUS_META[item.status].label, item.email, item.phone, fmtShort(item.requestedAt)]),
      ]);
      return;
    }
    downloadCSV("yeni-uyelikler.csv", [
      ["Uye", "Tur", "Sehir", "Plan", "Islem", "Tutar", "Yontem", "Tarih"],
      ...data.signups.map((item) => [item.name, item.kind, item.city, planName(item), SIGNUP_META[item.type].label, item.amount, item.method, fmtShort(item.at)]),
    ]);
  }

  return (
    <div className="stack rise">
      <UkPageHead
        title="Demo & Uyelik Takibi"
        sub="Gelen demo taleplerini takip et, yeni uyelik ve satin almalari izle"
        actions={
          <>
            <button type="button" className="btn btn-light" onClick={exportRows}><KiIcon name="ki-exit-down" />CSV indir</button>
            {tab === "demo" ? <button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}><KiIcon name="ki-plus" />Yeni demo talebi</button> : null}
          </>
        }
      />

      <div className="grid g-4">
        <StatCard icon="clock" tone="warning" value={data.open} label="Acik demo talebi" delta={`${data.newCount} yeni`} />
        <StatCard icon="users" tone="success" value={data.newMembers} label="Yeni uyelik (30 gun)" />
        <StatCard icon="banknote" tone="primary" value={tl(data.revenue)} label="Satin alma (30 gun)" />
        <StatCard icon="trend" tone="info" value={`%${data.convRate}`} label="Demo donusum orani" />
      </div>

      <div className="seg-tabs">
        <button type="button" className={`seg-tab${tab === "demo" ? " on" : ""}`} onClick={() => setTab("demo")}><Icon name="clipboard" size={16} />Demo talepleri<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{data.demoRequests.length}</span></button>
        <button type="button" className={`seg-tab${tab === "signup" ? " on" : ""}`} onClick={() => setTab("signup")}><Icon name="card" size={16} />Yeni uyelik & satin alma<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{data.signups.length}</span></button>
      </div>

      {tab === "demo" ? (
        <div className="grid col-main">
          <div className="stack">
            <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
              <div className="seg">
                {([{ key: "all", label: "Tumu" }, { key: "new", label: "Yeni" }, { key: "contacted", label: "Iletisimde" }, { key: "scheduled", label: "Planlandi" }, { key: "converted", label: "Dondu" }, { key: "lost", label: "Kayip" }] as const).map((item) => (
                  <button key={item.key} type="button" className={status === item.key ? "on" : ""} onClick={() => setStatus(item.key)}> {item.label}</button>
                ))}
              </div>
              <div className="searchbox" style={{ maxWidth: 260 }}><Icon name="search" size={17} /><input placeholder="Talep ara..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            </div>
            <div className="stack">{visible.map((lead) => <DemoCard key={lead.id} lead={lead} onOpen={() => setOpenId(lead.id)} onLost={() => setLostId(lead.id)} />)}</div>
            {visible.length === 0 ? <EmptyState icon="clipboard" title="Talep bulunamadi" sub="Filtre veya aramayi degistir" /> : null}
          </div>
          <div className="stack">
            <div className="card">
              <div className="card-head"><div><h3>Talep hunisi</h3><p className="sub">{data.demoRequests.length} toplam talep</p></div></div>
              <div className="card-body">
                <RankBars items={Object.entries(STATUS_META).map(([key, meta]) => ({ l: meta.label, v: data.demoRequests.filter((item) => item.status === key).length, color: key === "lost" ? "var(--faint)" : undefined }))} />
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div><h3>Kaynaklar</h3><p className="sub">Talepler nereden geliyor</p></div></div>
              <div className="card-body" style={{ padding: 0 }}>
                {Object.entries(data.demoRequests.reduce<Record<string, number>>((acc, item) => { acc[item.source] = (acc[item.source] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                  <div key={source} className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>{source}</span><b className="tnum" style={{ fontSize: 13 }}>{count}</b></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-head"><div><h3>Son uyelikler & satin almalar</h3><p className="sub">{data.signups.length} islem · {tl(data.revenue)}</p></div></div>
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 760 }}>
              <thead><tr><th>Uye</th><th>Plan</th><th>Islem</th><th>Yontem</th><th>Tarih</th><th style={{ textAlign: "right" }}>Tutar</th></tr></thead>
              <tbody>
                {data.signups.slice().sort((a, b) => b.at - a.at).map((item) => {
                  const meta = SIGNUP_META[item.type];
                  return (
                    <tr key={item.id}>
                      <td><div className="name"><OrgLogo name={item.name} tone={planColor(item)} size={34} /><div><b>{item.name}</b><span>{item.kind === "org" ? "Kurum" : "Bireysel koc"} · {item.city}</span></div></div></td>
                      <td><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: planColor(item) }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{planName(item)}</span></span></td>
                      <td><span className={`badge badge-${meta.tone}`} style={{ height: 22 }}>{meta.label}</span></td>
                      <td><span className="muted" style={{ fontSize: 12.5 }}>{item.method}</span></td>
                      <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(item.at)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{item.amount ? tl(item.amount) : "-"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addOpen ? <AddDemoModal onClose={() => setAddOpen(false)} /> : null}
      {openLead ? <LeadDetailModal lead={openLead} onClose={() => setOpenId(null)} /> : null}
      {lostLead ? <LostReasonModal lead={lostLead} onClose={() => setLostId(null)} /> : null}
    </div>
  );
}
