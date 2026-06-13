/* ============================================================
   SÜPER ADMIN — Platform yönetimi (1/2)
   Genel Bakış · Kurumlar/Franchise · Lisans Takibi
   ============================================================ */

/* ---- Platform Genel Bakış ---- */
function SAOverview({ goto }) {
  const a = useAdmin();
  const m = platformMetrics();
  const mrrSeries = [612, 640, 661, 698, 724, 770, 812, 848, 879, 910, 952, Math.round(m.mrr / 1000)];
  const newOrgs = [{ l: "Şub", v: 1 }, { l: "Mar", v: 0 }, { l: "Nis", v: 2 }, { l: "May", v: 1 }, { l: "Haz", v: 1 }, { l: "Tem", v: 1 }];

  const segByType = [
    { l: "Franchise", v: a.orgs.filter((o) => o.type === "franchise").length, color: "var(--primary)" },
    { l: "Tek kurum", v: a.orgs.filter((o) => o.type === "kurum").length, color: "var(--info)" },
    { l: "Bireysel koç", v: a.coaches.filter((c) => c.status !== "canceled").length, color: "var(--warning)" },
  ];
  const renewals = [...a.orgs.map((o) => ({ name: o.name, type: o.type, ts: o.renewsAt, status: o.status, fee: o.feeMonthly, tone: o.tone, kind: "org", id: o.id })),
    ...a.coaches.filter((c) => c.status === "active" || c.status === "trial").map((c) => ({ name: c.name, type: "coach", ts: c.renewsAt, status: c.status, fee: c.feeMonthly, kind: "coach", id: c.id }))]
    .sort((x, y) => x.ts - y.ts).slice(0, 6);

  return (
    <div className="stack rise">
      <PageHead title="Platform Genel Bakış" sub="Uyanık Koç — tüm kurumlar, koçlar ve abonelik geliri tek ekranda"
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("platform-ozet.csv", [["Metrik", "Değer"], ["Kurum/Franchise", m.orgs], ["Aktif bireysel koç", m.activeCoaches], ["Toplam öğrenci", m.students], ["Aylık gelir (MRR)", m.mrr]])}><Icon name="download" size={16} />Dışa aktar</button>
          <button className="btn btn-primary" onClick={() => goto("kurumlar")}><Icon name="building" size={16} />Kurumları yönet</button></>} />

      <div className="grid g-4">
        <StatCard icon="building" tone="primary" value={m.orgs} label="Kurum / Franchise" delta={`${m.franchises} franchise`} deltaDir="up" />
        <StatCard icon="users" tone="info" value={m.activeCoaches} label="Aktif bireysel koç" delta={`${m.totalCoaches} toplam`} deltaDir="up" />
        <StatCard icon="cap" tone="success" value={m.students.toLocaleString("tr-TR")} label="Toplam öğrenci" delta="+184 / ay" deltaDir="up" />
        <StatCard icon="banknote" tone="warning" value={TRY(m.mrr)} label="Aylık gelir (MRR)" delta="+%8,4" deltaDir="up" />
      </div>

      <div className="grid col-main">
        <Section title="Gelir gelişimi (MRR)" sub="Son 12 ay · ₺ bin" action={<span className="badge badge-success"><Icon name="trend" size={13} />ARR {TRY(m.arr)}</span>}>
          <div className="card-body">
            <Sparkline data={mrrSeries} w={640} h={120} color="var(--primary)" />
            <div className="between" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div><div className="muted" style={{ fontSize: 12 }}>Kurum gelirleri</div><div className="tnum" style={{ fontWeight: 800, fontSize: 16 }}>{TRY(m.orgMrr)}<span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ay</span></div></div>
              <div><div className="muted" style={{ fontSize: 12 }}>Bireysel koç gelirleri</div><div className="tnum" style={{ fontWeight: 800, fontSize: 16 }}>{TRY(m.coachMrr)}<span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ay</span></div></div>
              <div><div className="muted" style={{ fontSize: 12 }}>Tahmini yıllık (ARR)</div><div className="tnum" style={{ fontWeight: 800, fontSize: 16, color: "var(--success)" }}>{TRY(m.arr)}</div></div>
            </div>
          </div>
        </Section>

        <Section title="Abone dağılımı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Donut slices={segByType} center={{ v: m.orgs + m.totalCoaches, l: "abone" }} />
            <div className="legend" style={{ width: "100%" }}>
              {segByType.map((s, i) => <div key={i} className="legend-item"><span className="sw" style={{ background: s.color }} /><span>{s.l}</span><span className="lv tnum">{s.v}</span></div>)}
            </div>
          </div>
        </Section>
      </div>

      {m.atRisk > 0 ? (
        <div className="alert-strip warn">
          <span className="as-ic"><Icon name="alert" size={18} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{m.atRisk} lisans dikkat gerektiriyor</b><div className="muted" style={{ fontSize: 12.5 }}>Süresi dolan, ödemesi geciken veya dondurulmuş lisanslar var.</div></div>
          <button className="btn btn-sm btn-primary" onClick={() => goto("lisanslar")}>Lisans takibine git<Icon name="chevronRight" size={15} /></button>
        </div>
      ) : null}

      <div className="grid col-main">
        <Section title="Yaklaşan yenilemeler" sub="Lisans bitiş tarihine göre" action={<button className="link-btn" onClick={() => goto("lisanslar")}>Tümü</button>}>
          <div className="card-body" style={{ padding: 0 }}>
            {renewals.map((r, i) => {
              const dl = daysLeft(r.ts);
              return (
                <div key={i} className="list-row">
                  {r.kind === "org" ? <OrgLogo name={r.name} tone={r.tone} size={38} /> : <Avatar name={r.name} size={38} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{r.name}</b>
                    <span className="muted" style={{ fontSize: 12 }}>{r.type === "franchise" ? "Franchise" : r.type === "kurum" ? "Tek kurum" : "Bireysel koç"} · {TRY(r.fee)}/ay</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 13.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl < 14 ? "var(--warning)" : "var(--text)" }}>{dl < 0 ? `${-dl} gün geçti` : `${dl} gün`}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{fmtShort(r.ts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Bu ay yeni katılan" sub="Kurum ve franchise">
          <div className="card-body">
            <BarChart data={newOrgs} peakIdx={2} />
            <div className="kpi-row"><span className="muted" style={{ fontSize: 12.5 }}>Dönüşüm (deneme → ücretli)</span><b className="tnum">%62</b></div>
            <div className="kpi-row"><span className="muted" style={{ fontSize: 12.5 }}>Aylık kayıp (churn)</span><b className="tnum" style={{ color: "var(--success)" }}>%1,8</b></div>
            <div className="kpi-row"><span className="muted" style={{ fontSize: 12.5 }}>Ortalama kurum büyüklüğü</span><b className="tnum">164 öğrenci</b></div>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ---- Kurumlar / Franchise listesi ---- */
function SAOrgs({ openOrg }) {
  const a = useAdmin();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [nk, setNk] = useState({ name: "", owner: "", email: "", plan: "pro", type: "kurum", city: "" });
  const FILTERS = [{ k: "all", l: "Tümü" }, { k: "franchise", l: "Franchise" }, { k: "kurum", l: "Tek kurum" }];
  const list = a.orgs.filter((o) => (filter === "all" || o.type === filter) && o.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="stack rise">
      <PageHead title="Kurumlar & Franchise'lar" sub={`${a.orgs.length} kurum · ${a.orgs.filter((o) => o.type === "franchise").length} franchise ağı`}
        actions={<button className="btn btn-primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={16} />Yeni kurum ekle</button>} />

      {addOpen ? <Modal title="Yeni kurum ekle" sub="Kurum panele eklenir ve kurulum daveti gönderilir" width={480} onClose={() => setAddOpen(false)}
        foot={<><button className="btn btn-light" onClick={() => setAddOpen(false)}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!nk.name.trim() || !/.+@.+\..+/.test(nk.email)} onClick={() => { const o = addOrg(nk); toast(o.name + " kuruma eklendi · kurulum daveti panoya kopyalandı", { icon: "building" }); setNk({ name: "", owner: "", email: "", plan: "pro", type: "kurum", city: "" }); setAddOpen(false); openOrg(o.id); }}><Icon name="plus" size={16} />Kurum ekle</button></>}>
        <Field label="Kurum adı"><input className="input" value={nk.name} onChange={(e) => setNk({ ...nk, name: e.target.value })} placeholder="Örn. Yeni Akademi" /></Field>
        <Field label="Kurum türü"><div className="seg">{[{ k: "kurum", l: "Tek kurum" }, { k: "franchise", l: "Franchise" }].map((t) => <button key={t.k} className={nk.type === t.k ? "on" : ""} onClick={() => setNk({ ...nk, type: t.k })}>{t.l}</button>)}</div></Field>
        <div className="grid g-2" style={{ gap: 12 }}>
          <Field label="Yetkili adı"><input className="input" value={nk.owner} onChange={(e) => setNk({ ...nk, owner: e.target.value })} placeholder="Ad Soyad" /></Field>
          <Field label="Yetkili e-posta"><input className="input" value={nk.email} onChange={(e) => setNk({ ...nk, email: e.target.value })} placeholder="yetkili@ornek.com" /></Field>
        </div>
        <div className="grid g-2" style={{ gap: 12 }}>
          <Field label="Şehir"><input className="input" value={nk.city} onChange={(e) => setNk({ ...nk, city: e.target.value })} placeholder="Örn. İstanbul" /></Field>
          <Field label="Başlangıç planı"><select className="input" value={nk.plan} onChange={(e) => setNk({ ...nk, plan: e.target.value })}>{orgPlans().map((p) => <option key={p.id} value={p.id}>{p.name} · {TRY(p.monthly)}/ay</option>)}</select></Field>
        </div>
      </Modal> : null}

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="seg">{FILTERS.map((f) => <button key={f.k} className={filter === f.k ? "on" : ""} onClick={() => setFilter(f.k)}>{f.l}</button>)}</div>
        <div className="searchbox" style={{ maxWidth: 280 }}><Icon name="search" size={17} /><input placeholder="Kurum ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <div className="grid g-2">
        {list.map((o) => {
          const p = orgPlanById(o.planId);
          const seatPct = Math.round((o.seats.used / o.seats.total) * 100);
          const dl = daysLeft(o.renewsAt);
          return (
            <div key={o.id} className="card" style={{ cursor: "pointer" }} onClick={() => openOrg(o.id)}>
              <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div className="row" style={{ gap: 13 }}>
                  <OrgLogo name={o.name} tone={o.tone} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8 }}><b style={{ fontSize: 15, fontWeight: 800 }}>{o.name}</b><StatusBadge status={o.status} sm /></div>
                    <span className="muted" style={{ fontSize: 12.5 }}>{o.type === "franchise" ? `Franchise · ${o.branches.length} şube` : "Tek kurum"} · {o.city}</span>
                  </div>
                  <span className="badge badge-muted" style={{ height: 24 }}>{p.name}</span>
                </div>
                <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
                <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
                  <div><div className="muted" style={{ fontSize: 11 }}>Koç</div><b className="tnum" style={{ fontSize: 14 }}>{o.coaches.used}/{o.coaches.total}</b></div>
                  <div><div className="muted" style={{ fontSize: 11 }}>Platform ücreti</div><b className="tnum" style={{ fontSize: 14 }}>{TRY(o.feeMonthly)}<span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ay</span></b></div>
                  <div><div className="muted" style={{ fontSize: 11 }}>Yenileme</div><b className="tnum" style={{ fontSize: 14, color: dl < 0 ? "var(--danger)" : dl < 14 ? "var(--warning)" : "var(--text)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</b></div>
                  <button className="btn btn-light btn-sm" style={{ marginLeft: "auto" }} onClick={(e) => { e.stopPropagation(); openOrg(o.id); }}>Yönet<Icon name="chevronRight" size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 ? <EmptyState icon="building" title="Kurum bulunamadı" sub="Arama veya filtreyi değiştir" /> : null}
    </div>
  );
}

/* ---- Lisans Takibi ---- */
function SALicenses({ openOrg }) {
  const a = useAdmin();
  const [tab, setTab] = useState("all");
  const rows = [
    ...a.orgs.map((o) => ({ kind: "org", id: o.id, name: o.name, sub: o.type === "franchise" ? "Franchise" : "Tek kurum", tone: o.tone, plan: orgPlanById(o.planId).name, status: o.status, renewsAt: o.renewsAt, fee: o.feeMonthly, seats: o.seats })),
    ...a.coaches.map((c) => ({ kind: "coach", id: c.id, name: c.name, sub: "Bireysel koç", plan: coachPlanById(c.planId).name, status: c.status, renewsAt: c.renewsAt, fee: c.feeMonthly, seats: c.seats })),
  ];
  const counts = {
    all: rows.length,
    expiring: rows.filter((r) => (r.status === "expiring") || (daysLeft(r.renewsAt) >= 0 && daysLeft(r.renewsAt) <= 14 && r.status !== "overdue")).length,
    overdue: rows.filter((r) => r.status === "overdue").length,
    suspended: rows.filter((r) => r.status === "suspended" || r.status === "canceled").length,
  };
  const filtered = rows.filter((r) => {
    if (tab === "all") return true;
    if (tab === "expiring") return r.status === "expiring" || (daysLeft(r.renewsAt) >= 0 && daysLeft(r.renewsAt) <= 14 && r.status !== "overdue");
    if (tab === "overdue") return r.status === "overdue";
    if (tab === "suspended") return r.status === "suspended" || r.status === "canceled";
    return true;
  }).sort((x, y) => x.renewsAt - y.renewsAt);

  const TABS = [
    { k: "all", label: "Tüm lisanslar", count: counts.all },
    { k: "expiring", label: "Süresi doluyor", count: counts.expiring, icon: "clock" },
    { k: "overdue", label: "Ödeme gecikti", count: counts.overdue, icon: "alert" },
    { k: "suspended", label: "Pasif", count: counts.suspended },
  ];

  return (
    <div className="stack rise">
      <PageHead title="Lisans Takibi" sub="Tüm kurum, franchise ve bireysel koç lisanslarının durumu ve yenilemeleri"
        actions={<button className="btn btn-light" onClick={() => downloadCSV("lisans-takip.csv", [["Abone", "Tür", "Plan", "Durum", "Yenileme", "Ücret/ay"], ...rows.map((r) => [r.name, r.sub, r.plan, statusMeta(r.status).label, fmtShort(r.renewsAt), r.fee])])}><Icon name="download" size={16} />CSV indir</button>} />

      <div className="grid g-4">
        <StatCard icon="shield" tone="success" value={rows.filter((r) => r.status === "active").length} label="Aktif lisans" />
        <StatCard icon="clock" tone="warning" value={counts.expiring} label="14 gün içinde doluyor" />
        <StatCard icon="alert" tone="danger" value={counts.overdue} label="Ödeme gecikti" />
        <StatCard icon="refresh" tone="info" value={rows.filter((r) => r.status === "trial").length} label="Deneme sürümünde" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <Section>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 760 }}>
            <thead><tr><th>Abone</th><th>Plan</th><th>Kapasite</th><th>Durum</th><th>Yenileme</th><th style={{ textAlign: "right" }}>Ücret</th><th></th></tr></thead>
            <tbody>
              {filtered.map((r) => {
                const dl = daysLeft(r.renewsAt);
                const unl = r.seats.total >= 999;
                return (
                  <tr key={r.kind + r.id} style={{ cursor: r.kind === "org" ? "pointer" : "default" }} onClick={() => r.kind === "org" && openOrg(r.id)}>
                    <td><div className="name">{r.kind === "org" ? <OrgLogo name={r.name} tone={r.tone} size={34} /> : <Avatar name={r.name} size={34} />}<div><b>{r.name}</b><span>{r.sub}</span></div></div></td>
                    <td><span className="badge badge-muted" style={{ height: 22 }}>{r.plan}</span></td>
                    <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{r.seats.used}<span className="muted">/{unl ? "∞" : r.seats.total}</span></span></td>
                    <td><StatusBadge status={r.status} sm /></td>
                    <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl >= 0 && dl <= 14 ? "var(--warning)" : "var(--text-2)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</span><div className="muted tnum" style={{ fontSize: 11 }}>{fmtShort(r.renewsAt)}</div></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>{TRY(r.fee)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                        {(r.status === "overdue" || r.status === "expiring") ?
                          <button className="btn btn-primary btn-sm" onClick={() => { r.kind === "org" ? renewOrg(r.id) : buyCoachPlan(r.id, getCoach(r.id).planId, getCoach(r.id).cycle); toast(r.name + " lisansı yenilendi", { icon: "refresh" }); }}>Yenile</button>
                          : <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => r.kind === "org" ? openOrg(r.id) : toast("Bireysel koç detayı bireysel mod altında", { icon: "users" })}><Icon name="chevronRight" size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
      {filtered.length === 0 ? <EmptyState icon="shield" title="Bu kategoride lisans yok" sub="Harika — bu durumda bekleyen bir şey görünmüyor" /> : null}
    </div>
  );
}

Object.assign(window, { SAOverview, SAOrgs, SALicenses });
