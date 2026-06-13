/* ============================================================
   SÜPER ADMIN — Detaylı Raporlama
   4 kategori: Gelir & Finans · Büyüme & Abone · Kullanım & Modüller · Lisans Sağlığı
   Dönem filtresi + CSV / yazdır dışa aktarma. Mevcut grafik bileşenleri üzerine kurulur.
   ============================================================ */
const { useState: rS } = React;

const RPT_PERIODS = [{ k: "3", l: "Son 3 ay", days: 90 }, { k: "6", l: "Son 6 ay", days: 180 }, { k: "12", l: "Son 12 ay", days: 365 }];
const RPT_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/* son n ay için aylık kova üretir: items[] -> [{l, v}] */
function monthlyBuckets(items, getTs, getVal, months) {
  const now = new Date();
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: d.getFullYear() + "-" + d.getMonth(), l: RPT_MONTHS[d.getMonth()], v: 0 });
  }
  const idx = {}; out.forEach((b, i) => idx[b.key] = i);
  (items || []).forEach((it) => {
    const t = new Date(getTs(it)); const k = t.getFullYear() + "-" + t.getMonth();
    if (k in idx) out[idx[k]].v += (getVal ? getVal(it) : 1);
  });
  return out;
}

/* küçük başlıklı kpi satırı */
function KpiLine({ label, value, tone }) {
  return <div className="kpi-row"><span className="muted" style={{ fontSize: 12.5 }}>{label}</span><b className="tnum" style={{ color: tone || "var(--text)" }}>{value}</b></div>;
}

/* === GELİR & FİNANS === */
function RptRevenue({ period }) {
  const a = useAdmin();
  const m = platformMetrics();
  const months = +period.k;
  const sub = a.orgs.length + a.coaches.length;
  const paid = (a.orgInvoices || []).filter((i) => i.status === "paid");
  const pending = (a.orgInvoices || []).filter((i) => i.status === "pending");
  const collected = paid.reduce((s, i) => s + i.amount, 0);
  const outstanding = pending.reduce((s, i) => s + i.amount, 0);
  const arpu = sub ? Math.round(m.mrr / sub) : 0;
  const collRate = collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 100;
  const mrrSeries = [612, 640, 661, 698, 724, 770, 812, 848, 879, 910, 952, Math.round(m.mrr / 1000)].slice(-months);
  const revByMonth = monthlyBuckets(a.signups, (s) => s.at, (s) => s.amount, months);
  const byPlan = [
    { l: "Franchise", v: a.orgs.filter((o) => o.planId === "franchise").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--warning)" },
    { l: "Kurum Pro", v: a.orgs.filter((o) => o.planId === "pro").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--primary)" },
    { l: "Kurum Başlangıç", v: a.orgs.filter((o) => o.planId === "baslangic").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--info)" },
    { l: "Bireysel koç", v: m.coachMrr, color: "var(--success)" },
  ].sort((x, y) => y.v - x.v);
  return (
    <div className="stack">
      <div className="grid g-4">
        <StatCard icon="banknote" tone="success" value={TRY(m.mrr)} label="Aylık gelir (MRR)" delta="+%8,4" deltaDir="up" />
        <StatCard icon="trend" tone="primary" value={TRY(m.arr)} label="Yıllık gelir (ARR)" />
        <StatCard icon="wallet" tone="info" value={TRY(arpu)} label="Abone başına gelir (ARPU)" />
        <StatCard icon="alert" tone="danger" value={TRY(outstanding)} label="Bekleyen tahsilat" />
      </div>
      <div className="grid col-main">
        <Section title="Gelir gelişimi (MRR)" sub={period.l + " · ₺ bin"} action={<span className="badge badge-success"><Icon name="trend" size={13} />ARR {TRY(m.arr)}</span>}>
          <div className="card-body"><Sparkline data={mrrSeries} w={640} h={130} color="var(--primary)" /></div>
        </Section>
        <Section title="Tahsilat oranı" sub="Bu dönem">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Ring value={collRate} label={`%${collRate}`} sub="tahsil edildi" big />
            <div className="legend" style={{ width: "100%" }}>
              <div className="legend-item"><span className="sw" style={{ background: "var(--primary)" }} /><span>Tahsil edilen</span><span className="lv tnum">{TRY(collected)}</span></div>
              <div className="legend-item"><span className="sw" style={{ background: "var(--surface-3)" }} /><span>Bekleyen</span><span className="lv tnum">{TRY(outstanding)}</span></div>
            </div>
          </div>
        </Section>
      </div>
      <div className="grid col-main">
        <Section title="Aylık satış / tahsilat" sub={period.l}>
          <div className="card-body"><BarChart data={revByMonth} /></div>
        </Section>
        <Section title="Plana göre aylık gelir">
          <div className="card-body"><RankBars items={byPlan} fmt={(v) => TRY(v)} /></div>
        </Section>
      </div>
    </div>
  );
}

/* === BÜYÜME & ABONE === */
const DEMO_FUNNEL = [["new", "Yeni talep", "var(--info)"], ["contacted", "İletişime geçildi", "var(--primary)"], ["scheduled", "Demo planlandı", "var(--warning)"], ["converted", "Kazanıldı", "var(--success)"], ["lost", "Kayıp", "var(--danger)"]];
function RptGrowth({ period }) {
  const a = useAdmin();
  const m = platformMetrics();
  const months = +period.k;
  const newByMonth = monthlyBuckets((a.signups || []).filter((s) => s.type === "new" || s.type === "trial"), (s) => s.at, () => 1, months);
  const demos = a.demoRequests || [];
  const funnel = DEMO_FUNNEL.map(([k, l, color]) => ({ l, v: demos.filter((d) => d.status === k).length, color }));
  const converted = demos.filter((d) => d.status === "converted").length;
  const convRate = demos.length ? Math.round((converted / demos.length) * 100) : 0;
  const byCity = {};
  a.orgs.forEach((o) => { byCity[o.city] = (byCity[o.city] || 0) + 1; });
  a.coaches.filter((c) => c.status !== "canceled").forEach((c) => { byCity[c.city] = (byCity[c.city] || 0) + 1; });
  const cityRank = Object.entries(byCity).map(([l, v]) => ({ l, v })).sort((x, y) => y.v - x.v).slice(0, 7);
  const segByType = [
    { l: "Franchise", v: a.orgs.filter((o) => o.type === "franchise").length, color: "var(--warning)" },
    { l: "Tek kurum", v: a.orgs.filter((o) => o.type === "kurum").length, color: "var(--primary)" },
    { l: "Bireysel koç", v: a.coaches.filter((c) => c.status !== "canceled").length, color: "var(--info)" },
  ];
  return (
    <div className="stack">
      <div className="grid g-4">
        <StatCard icon="building" tone="primary" value={m.orgs} label="Toplam kurum" delta={`${m.franchises} franchise`} deltaDir="up" />
        <StatCard icon="users" tone="info" value={m.totalCoaches} label="Bireysel koç" delta={`${m.activeCoaches} aktif`} deltaDir="up" />
        <StatCard icon="bell" tone="warning" value={demos.length} label="Demo talebi" />
        <StatCard icon="trend" tone="success" value={`%${convRate}`} label="Dönüşüm (demo → ücretli)" />
      </div>
      <div className="grid col-main">
        <Section title="Yeni katılan aboneler" sub={period.l}>
          <div className="card-body"><BarChart data={newByMonth} /></div>
        </Section>
        <Section title="Abone dağılımı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Donut slices={segByType} center={{ v: m.orgs + m.totalCoaches, l: "abone" }} />
            <div className="legend" style={{ width: "100%" }}>
              {segByType.map((s, i) => <div key={i} className="legend-item"><span className="sw" style={{ background: s.color }} /><span>{s.l}</span><span className="lv tnum">{s.v}</span></div>)}
            </div>
          </div>
        </Section>
      </div>
      <div className="grid col-main">
        <Section title="Demo talep hunisi" sub="Talep durumuna göre">
          <div className="card-body"><RankBars items={funnel} /></div>
        </Section>
        <Section title="Şehir bazında abone" sub="En yoğun 7 şehir">
          <div className="card-body"><RankBars items={cityRank} color="var(--primary)" /></div>
        </Section>
      </div>
    </div>
  );
}

/* === KULLANIM & MODÜLLER === */
function RptUsage({ period }) {
  const a = useAdmin();
  const m = platformMetrics();
  const totalOrgs = a.orgs.length || 1;
  const modAdoption = MODULES.map((mod) => ({ l: mod.name, v: a.orgs.filter((o) => o.modules[mod.key]).length, color: "var(--primary)" })).sort((x, y) => y.v - x.v);
  const topOrgs = [...a.orgs].map((o) => ({ l: o.name, v: o.seats.used, tone: o.tone })).sort((x, y) => y.v - x.v).slice(0, 7);
  const avgUtil = Math.round(a.orgs.reduce((s, o) => s + (o.seats.used / o.seats.total), 0) / totalOrgs * 100);
  const totalSeats = a.orgs.reduce((s, o) => s + o.seats.total, 0);
  const usedSeats = a.orgs.reduce((s, o) => s + o.seats.used, 0);
  const avgRating = (() => { const act = a.coaches.filter((c) => c.rating > 0); return act.length ? (act.reduce((s, c) => s + c.rating, 0) / act.length).toFixed(1) : "—"; })();
  return (
    <div className="stack">
      <div className="grid g-4">
        <StatCard icon="cap" tone="success" value={m.students.toLocaleString("tr-TR")} label="Toplam öğrenci" />
        <StatCard icon="building" tone="primary" value={m.branches} label="Toplam şube" />
        <StatCard icon="chart" tone="info" value={`%${avgUtil}`} label="Ort. koltuk doluluğu" />
        <StatCard icon="star" tone="warning" value={avgRating} label="Ort. koç puanı" />
      </div>
      <div className="grid col-main">
        <Section title="Modül benimseme" sub={`${totalOrgs} kurum içinde modül başına açık kurum sayısı`}>
          <div className="card-body"><RankBars items={modAdoption} max={totalOrgs} /></div>
        </Section>
        <Section title="Koltuk doluluğu" sub="Platform geneli">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Ring value={Math.round((usedSeats / totalSeats) * 100)} label={`%${Math.round((usedSeats / totalSeats) * 100)}`} sub="doluluk" big color="var(--success)" />
            <div className="legend" style={{ width: "100%" }}>
              <div className="legend-item"><span className="sw" style={{ background: "var(--success)" }} /><span>Dolu koltuk</span><span className="lv tnum">{usedSeats}</span></div>
              <div className="legend-item"><span className="sw" style={{ background: "var(--surface-3)" }} /><span>Boş koltuk</span><span className="lv tnum">{totalSeats - usedSeats}</span></div>
            </div>
          </div>
        </Section>
      </div>
      <Section title="En çok öğrencisi olan kurumlar" sub="İlk 7">
        <div className="card-body"><RankBars items={topOrgs} /></div>
      </Section>
    </div>
  );
}

/* === LİSANS SAĞLIĞI === */
function RptLicense({ period }) {
  const a = useAdmin();
  const rows = [
    ...a.orgs.map((o) => ({ kind: "org", name: o.name, status: o.status, renewsAt: o.renewsAt, fee: o.feeMonthly, tone: o.tone, sub: o.type === "franchise" ? "Franchise" : "Tek kurum" })),
    ...a.coaches.map((c) => ({ kind: "coach", name: c.name, status: c.status, renewsAt: c.renewsAt, fee: c.feeMonthly, sub: "Bireysel koç" })),
  ];
  const statusSeg = [
    { l: "Aktif", v: rows.filter((r) => r.status === "active").length, color: "var(--success)" },
    { l: "Deneme", v: rows.filter((r) => r.status === "trial").length, color: "var(--info)" },
    { l: "Süresi doluyor", v: rows.filter((r) => r.status === "expiring").length, color: "var(--warning)" },
    { l: "Ödeme gecikti", v: rows.filter((r) => r.status === "overdue").length, color: "var(--danger)" },
    { l: "Pasif/İptal", v: rows.filter((r) => r.status === "suspended" || r.status === "canceled").length, color: "var(--muted)" },
  ];
  const upcoming = rows.filter((r) => r.status === "active" || r.status === "expiring" || r.status === "trial").sort((x, y) => x.renewsAt - y.renewsAt).slice(0, 8);
  const atRiskRev = rows.filter((r) => r.status === "overdue" || r.status === "expiring").reduce((s, r) => s + r.fee, 0);
  return (
    <div className="stack">
      <div className="grid g-4">
        <StatCard icon="shield" tone="success" value={rows.filter((r) => r.status === "active").length} label="Aktif lisans" />
        <StatCard icon="clock" tone="warning" value={rows.filter((r) => r.status === "expiring").length} label="Süresi doluyor" />
        <StatCard icon="alert" tone="danger" value={rows.filter((r) => r.status === "overdue").length} label="Ödeme gecikti" />
        <StatCard icon="banknote" tone="danger" value={TRY(atRiskRev)} label="Risk altındaki gelir" />
      </div>
      <div className="grid col-main">
        <Section title="Lisans durumu dağılımı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Donut slices={statusSeg.filter((s) => s.v > 0)} center={{ v: rows.length, l: "lisans" }} />
            <div className="legend" style={{ width: "100%" }}>
              {statusSeg.map((s, i) => <div key={i} className="legend-item"><span className="sw" style={{ background: s.color }} /><span>{s.l}</span><span className="lv tnum">{s.v}</span></div>)}
            </div>
          </div>
        </Section>
        <Section title="Yaklaşan yenilemeler" sub="Bitiş tarihine göre">
          <div className="card-body" style={{ padding: 0 }}>
            {upcoming.map((r, i) => {
              const dl = daysLeft(r.renewsAt);
              return (
                <div key={i} className="list-row">
                  {r.kind === "org" ? <OrgLogo name={r.name} tone={r.tone} size={36} /> : <Avatar name={r.name} size={36} />}
                  <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13, display: "block" }}>{r.name}</b><span className="muted" style={{ fontSize: 11.5 }}>{r.sub} · {TRY(r.fee)}/ay</span></div>
                  <div style={{ textAlign: "right" }}><div className="tnum" style={{ fontSize: 13, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl < 14 ? "var(--warning)" : "var(--text)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</div><div className="muted" style={{ fontSize: 11 }}>{fmtShort(r.renewsAt)}</div></div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* === Ana Raporlar ekranı === */
const RPT_TABS = [
  { k: "gelir", label: "Gelir & Finans", icon: "banknote" },
  { k: "buyume", label: "Büyüme & Abone", icon: "trend" },
  { k: "kullanim", label: "Kullanım & Modüller", icon: "chart" },
  { k: "lisans", label: "Lisans Sağlığı", icon: "shield" },
];
function SAReports() {
  const a = useAdmin();
  const m = platformMetrics();
  const [tab, setTab] = rS("gelir");
  const [pk, setPk] = rS("12");
  const period = RPT_PERIODS.find((p) => p.k === pk) || RPT_PERIODS[2];

  const exportCsv = () => {
    const rows = [["Uyanık Koç — Platform Raporu"], ["Dönem", period.l], ["Oluşturma", fmtDate(Date.now())], [],
      ["GENEL METRİKLER"],
      ["Kurum / Franchise", m.orgs], ["Franchise", m.franchises], ["Aktif bireysel koç", m.activeCoaches], ["Toplam koç", m.totalCoaches],
      ["Toplam öğrenci", m.students], ["Toplam şube", m.branches],
      ["Aylık gelir (MRR)", m.mrr], ["Yıllık gelir (ARR)", m.arr], ["Kurum geliri (MRR)", m.orgMrr], ["Bireysel koç geliri (MRR)", m.coachMrr],
      ["Risk altındaki lisans", m.atRisk], [],
      ["KURUM DETAYI"], ["Kurum", "Tür", "Şehir", "Plan", "Öğrenci", "Koç", "Durum", "Aylık ücret", "Yenileme"],
      ...a.orgs.map((o) => [o.name, o.type === "franchise" ? "Franchise" : "Tek kurum", o.city, orgPlanById(o.planId).name, o.seats.used, o.coaches.used, statusMeta(o.status).label, o.feeMonthly, fmtShort(o.renewsAt)]), [],
      ["BİREYSEL KOÇ DETAYI"], ["Koç", "Şehir", "Plan", "Öğrenci", "Durum", "Puan", "Aylık ücret", "Yenileme"],
      ...a.coaches.map((c) => [c.name, c.city, coachPlanById(c.planId).name, c.seats.used, statusMeta(c.status).label, c.rating || "—", c.feeMonthly, fmtShort(c.renewsAt)]),
    ];
    downloadCSV("platform-raporu-" + period.k + "ay.csv", rows);
    toast("Rapor CSV olarak indirildi", { icon: "download" });
  };

  return (
    <div className="stack rise">
      <PageHead title="Raporlar" sub="Platform genelinde gelir, büyüme, kullanım ve lisans sağlığı raporları"
        actions={<>
          <div className="seg">{RPT_PERIODS.map((p) => <button key={p.k} className={pk === p.k ? "on" : ""} onClick={() => setPk(p.k)}>{p.l}</button>)}</div>
          <button className="btn btn-light" onClick={() => window.print()}><Icon name="receipt" size={16} />Yazdır / PDF</button>
          <button className="btn btn-primary" onClick={exportCsv}><Icon name="download" size={16} />Raporu indir (CSV)</button>
        </>} />
      <Tabs tabs={RPT_TABS} active={tab} onChange={setTab} />
      {tab === "gelir" ? <RptRevenue period={period} /> : null}
      {tab === "buyume" ? <RptGrowth period={period} /> : null}
      {tab === "kullanim" ? <RptUsage period={period} /> : null}
      {tab === "lisans" ? <RptLicense period={period} /> : null}
    </div>
  );
}

Object.assign(window, { SAReports, RptRevenue, RptGrowth, RptUsage, RptLicense });
