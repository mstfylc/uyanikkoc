/* ============================================================
   SÜPER ADMIN — Platform yönetimi (2/2)
   Kurum detayı · Bireysel koç lisansları · Gelir · Modüller · Destek
   ============================================================ */

/* ---- Kurum detayı (drill-in) ---- */
function SAOrgDetail({ orgId, back }) {
  const a = useAdmin();
  const o = getOrg(orgId);
  const [tab, setTab] = useState("ozet");
  const [confirm, setConfirm] = useState(null);
  const [msg, setMsg] = useState(false);
  if (!o) return <EmptyState icon="building" title="Kurum bulunamadı" />;
  const p = orgPlanById(o.planId);
  const TABS = [{ k: "ozet", label: "Özet", icon: "dashboard" }, { k: "subeler", label: o.type === "franchise" ? "Şubeler" : "Şube", icon: "building", count: o.branches.length }, { k: "lisans", label: "Lisans & Plan", icon: "shield" }, { k: "moduller", label: "Modüller", icon: "bolt" }];
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);

  return (
    <div className="stack rise">
      <button className="link-btn" onClick={back} style={{ alignSelf: "flex-start" }}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Kurumlara dön</button>
      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <OrgLogo name={o.name} tone={o.tone} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}><h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{o.name}</h1><StatusBadge status={o.status} /></div>
          <p className="muted" style={{ fontSize: 13 }}>{o.type === "franchise" ? "Franchise ağı" : "Tek kurum"} · {o.city} · Sahip: {o.owner.name}</p>
        </div>
        <div className="row" style={{ gap: 9 }}>
          <button className="btn btn-light" onClick={() => setMsg(true)}><Icon name="message" size={16} />İletişim</button>
          {o.status === "suspended"
            ? <button className="btn btn-primary" onClick={() => { activateOrg(o.id); toast("Lisans yeniden aktifleştirildi", { icon: "checkCircle" }); }}><Icon name="refresh" size={16} />Aktifleştir</button>
            : <button className="btn btn-primary" onClick={() => { renewOrg(o.id); toast("Lisans yenilendi", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Lisansı yenile</button>}
        </div>
      </div>

      <LicenseHero org={o} />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "ozet" ? (
        <div className="grid col-main">
          <div className="stack">
            <div className="grid g-3">
              <StatCard icon="cap" tone="primary" value={o.seats.used} label="Aktif öğrenci" />
              <StatCard icon="users" tone="info" value={o.coaches.used} label="Koç" />
              <StatCard icon="banknote" tone="success" value={TRY(totalCollect)} label="Aylık tahsilat" />
            </div>
            <Section title="Şube performansı" sub="Aylık tahsilat karşılaştırması">
              <div className="card-body">
                <RankBars items={o.branches.map((b) => ({ l: b.name, v: b.collect }))} fmt={(v) => TRY(v)} />
              </div>
            </Section>
          </div>
          <div className="stack">
            <Section title="Kurum bilgileri">
              <div className="card-body" style={{ padding: 0 }}>
                <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Yetkili</span><b style={{ fontSize: 13 }}>{o.owner.name}</b></div>
                <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>E-posta</span><b style={{ fontSize: 13 }}>{o.owner.email}</b></div>
                <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Telefon</span><b className="tnum" style={{ fontSize: 13 }}>{o.owner.phone}</b></div>
                <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Sözleşme başlangıcı</span><b style={{ fontSize: 13 }}>{fmtShort(o.startedAt)}</b></div>
              </div>
            </Section>
            <Section title="Lisans işlemleri">
              <div className="card-body" style={{ gap: 9, display: "flex", flexDirection: "column" }}>
                <button className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={() => setTab("lisans")}><Icon name="arrowUp" size={16} />Planı yükselt / değiştir</button>
                <button className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={() => { addOrgSeats(o.id, 25); toast("25 öğrenci koltuğu eklendi", { icon: "plus" }); }}><Icon name="plus" size={16} />Koltuk paketi ekle (+25)</button>
                <button className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => setConfirm("suspend")}><Icon name="alert" size={16} />Lisansı dondur</button>
              </div>
            </Section>
          </div>
        </div>
      ) : null}

      {tab === "subeler" ? (
        <Section title={o.type === "franchise" ? "Şubeler" : "Şube"} sub={`${o.branches.length} konum · toplam ${o.seats.used} öğrenci`}
          action={o.type === "franchise" ? <button className="btn btn-primary btn-sm"><Icon name="plus" size={15} />Şube ekle</button> : null}>
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 620 }}>
              <thead><tr><th>Şube</th><th>Öğrenci</th><th>Koç</th><th style={{ textAlign: "right" }}>Aylık tahsilat</th><th style={{ textAlign: "center" }}>Durum</th></tr></thead>
              <tbody>
                {o.branches.map((b) => (
                  <tr key={b.id}>
                    <td><div className="name"><span className="org-logo" style={{ width: 34, height: 34, background: o.tone, fontSize: 12, borderRadius: 9 }}><Icon name="building" size={16} /></span><div><b>{b.name}</b><span>{b.city}</span></div></div></td>
                    <td><span className="tnum" style={{ fontWeight: 700 }}>{b.students}</span></td>
                    <td><span className="tnum">{b.coaches}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(b.collect)}</span></td>
                    <td style={{ textAlign: "center" }}><StatusBadge status={b.status} sm /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {tab === "lisans" ? (
        <Section title="Lisans planı" sub="Plan değişikliği anında kapasite ve modülleri günceller">
          <div className="card-body">
            <div className="grid g-3">
              {orgPlans().map((pl) => {
                const sel = pl.id === o.planId;
                return (
                  <div key={pl.id} className={`lic-plan${sel ? " sel" : ""}`} onClick={() => { if (!sel) { changeOrgPlan(o.id, pl.id); toast(pl.name + " planına geçildi", { icon: "checkCircle" }); } }}>
                    {pl.popular ? <span className="lp-flag">Popüler</span> : null}
                    <h4><span className="plan-dot" style={{ background: pl.color }} />{pl.name}</h4>
                    <div className="lp-price tnum">{TRY(pl.monthly)}<span className="per"> /ay</span></div>
                    <ul>
                      <li><Icon name="cap" size={14} />{pl.seats} öğrenci koltuğu</li>
                      <li><Icon name="users" size={14} />{pl.coaches} koç</li>
                      <li><Icon name="building" size={14} />{pl.branches} şubeye kadar</li>
                      <li><Icon name="bolt" size={14} />{pl.modules.length} modül</li>
                    </ul>
                    {sel ? <span className="badge badge-primary" style={{ alignSelf: "flex-start" }}><Icon name="check" size={13} />Mevcut plan</span> : <button className="btn btn-outline btn-sm">Bu plana geç</button>}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      ) : null}

      {tab === "moduller" ? (
        <Section title="Modül erişimi" sub="Bu kuruma açık özellikleri yönet — değişiklikler anında uygulanır">
          <div className="card-body">
            <ModuleGrid modules={o.modules} onToggle={(k) => { toggleOrgModule(o.id, k); toast(moduleName(k) + " " + (o.modules[k] ? "kapatıldı" : "açıldı"), { icon: "bolt" }); }} />
          </div>
        </Section>
      ) : null}

      <ConfirmModal open={confirm === "suspend"} title="Lisansı dondur?" tone="danger"
        body={`${o.name} kurumunun tüm koç ve öğrenci erişimi geçici olarak durdurulacak. İstediğin zaman tekrar aktifleştirebilirsin.`}
        confirmLabel="Dondur" onConfirm={() => { suspendOrg(o.id); toast("Lisans donduruldu", { icon: "alert", tone: "danger" }); }} onClose={() => setConfirm(null)} />
      {msg ? <MessageComposeModal toName={o.owner.name} sub={o.name + " · " + o.owner.email} presetSubject={""} by="Platform Ekibi" onClose={() => setMsg(false)} /> : null}
    </div>
  );
}

/* ---- Bireysel koç lisansları ---- */
function SACoaches() {
  const a = useAdmin();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const FILTERS = [{ k: "all", l: "Tümü" }, { k: "active", l: "Aktif" }, { k: "trial", l: "Deneme" }, { k: "suspended", l: "Pasif" }];
  const list = a.coaches.filter((c) => {
    const okF = filter === "all" ? true : filter === "suspended" ? (c.status === "suspended" || c.status === "canceled") : c.status === filter;
    return okF && c.name.toLowerCase().includes(q.toLowerCase());
  });
  const mrr = a.coaches.filter((c) => c.status === "active").reduce((s, c) => s + c.feeMonthly, 0);

  return (
    <div className="stack rise">
      <PageHead title="Bireysel Koç Lisansları" sub="Kuruma bağlı olmadan tek başına lisans alan koçlar"
        actions={<button className="btn btn-light" onClick={() => downloadCSV("bireysel-koclar.csv", [["Koç", "Şehir", "Plan", "Durum", "Öğrenci", "Yenileme", "Ücret/ay"], ...a.coaches.map((c) => [c.name, c.city, coachPlanById(c.planId).name, statusMeta(c.status).label, c.seats.used, fmtShort(c.renewsAt), c.feeMonthly])])}><Icon name="download" size={16} />CSV indir</button>} />

      <div className="grid g-4">
        <StatCard icon="users" tone="primary" value={a.coaches.filter((c) => c.status === "active").length} label="Aktif koç lisansı" />
        <StatCard icon="refresh" tone="info" value={a.coaches.filter((c) => c.status === "trial").length} label="Deneme sürümünde" />
        <StatCard icon="cap" tone="success" value={a.coaches.filter((c) => c.status !== "canceled").reduce((s, c) => s + c.seats.used, 0)} label="Toplam öğrenci" />
        <StatCard icon="banknote" tone="warning" value={TRY(mrr)} label="Aylık koç geliri" />
      </div>

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="seg">{FILTERS.map((f) => <button key={f.k} className={filter === f.k ? "on" : ""} onClick={() => setFilter(f.k)}>{f.l}</button>)}</div>
        <div className="searchbox" style={{ maxWidth: 280 }}><Icon name="search" size={17} /><input placeholder="Koç ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <Section>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 800 }}>
            <thead><tr><th>Koç</th><th>Plan</th><th>Öğrenci</th><th>Durum</th><th>Yenileme</th><th style={{ textAlign: "right" }}>Ücret</th><th></th></tr></thead>
            <tbody>
              {list.map((c) => {
                const cp = coachPlanById(c.planId);
                const dl = daysLeft(c.renewsAt);
                const unl = c.seats.total >= 999;
                return (
                  <tr key={c.id}>
                    <td><div className="name"><Avatar name={c.name} size={34} /><div><b>{c.name}</b><span>{c.city}{c.rating ? ` · ★ ${c.rating}` : ""}</span></div></div></td>
                    <td><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: cp.color }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{cp.name}</span></span></td>
                    <td><span className="tnum" style={{ fontWeight: 600 }}>{c.seats.used}<span className="muted">/{unl ? "∞" : c.seats.total}</span></span></td>
                    <td><StatusBadge status={c.status} sm /></td>
                    <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl >= 0 && dl <= 14 ? "var(--warning)" : "var(--text-2)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(c.feeMonthly)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                        {c.status === "suspended" || c.status === "canceled"
                          ? <button className="btn btn-light btn-sm" onClick={() => { activateCoach(c.id); toast(c.name + " yeniden aktif", { icon: "checkCircle" }); }}>Aktifleştir</button>
                          : <button className="btn btn-light btn-sm" onClick={() => { suspendCoach(c.id); toast(c.name + " donduruldu", { icon: "alert", tone: "danger" }); }}>Dondur</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
      {list.length === 0 ? <EmptyState icon="users" title="Koç bulunamadı" sub="Arama veya filtreyi değiştir" /> : null}
    </div>
  );
}

/* ---- Gelir & Faturalama ---- */
function SARevenue() {
  const a = useAdmin();
  const m = platformMetrics();
  const paid = a.orgInvoices.filter((i) => i.status === "paid");
  const pending = a.orgInvoices.filter((i) => i.status === "pending");
  const collected = paid.reduce((s, i) => s + i.amount, 0);
  const outstanding = pending.reduce((s, i) => s + i.amount, 0);
  const byPlan = [
    { l: "Franchise", v: a.orgs.filter((o) => o.planId === "franchise").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--warning)" },
    { l: "Kurum Pro", v: a.orgs.filter((o) => o.planId === "pro").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--primary)" },
    { l: "Kurum Başlangıç", v: a.orgs.filter((o) => o.planId === "baslangic").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--info)" },
    { l: "Bireysel koç", v: m.coachMrr, color: "var(--success)" },
  ];

  return (
    <div className="stack rise">
      <PageHead title="Gelir & Faturalama" sub="Platform genelinde tüm tahsilat, MRR/ARR ve kurum faturaları"
        actions={<button className="btn btn-light" onClick={() => downloadCSV("faturalar.csv", [["Fatura", "Kurum", "Tarih", "Plan", "Tutar", "Durum"], ...a.orgInvoices.map((i) => [i.id, i.orgName, fmtShort(i.date), i.plan, i.amount, i.status === "paid" ? "Ödendi" : "Bekliyor"])])}><Icon name="download" size={16} />Faturaları indir</button>} />

      <div className="grid g-4">
        <StatCard icon="banknote" tone="success" value={TRY(m.mrr)} label="Aylık gelir (MRR)" delta="+%8,4" deltaDir="up" />
        <StatCard icon="trend" tone="primary" value={TRY(m.arr)} label="Yıllık gelir (ARR)" />
        <StatCard icon="receipt" tone="info" value={TRY(collected)} label="Toplam tahsil edilen" />
        <StatCard icon="alert" tone="danger" value={TRY(outstanding)} label="Bekleyen tahsilat" />
      </div>

      <div className="grid col-main">
        <Section title="Plana göre aylık gelir dağılımı">
          <div className="card-body"><RankBars items={byPlan} fmt={(v) => TRY(v)} /></div>
        </Section>
        <Section title="Tahsilat oranı" sub="Bu ay">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Ring value={collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 100} label={`%${collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 100}`} sub="tahsil edildi" big />
            <div className="legend" style={{ width: "100%" }}>
              <div className="legend-item"><span className="sw" style={{ background: "var(--primary)" }} /><span>Tahsil edilen</span><span className="lv tnum">{TRY(collected)}</span></div>
              <div className="legend-item"><span className="sw" style={{ background: "var(--surface-3)" }} /><span>Bekleyen</span><span className="lv tnum">{TRY(outstanding)}</span></div>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Kurum faturaları" sub="Platform lisans ücretleri">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 700 }}>
            <thead><tr><th>Fatura No</th><th>Kurum</th><th>Tarih</th><th>Plan</th><th style={{ textAlign: "right" }}>Tutar</th><th style={{ textAlign: "center" }}>Durum</th><th></th></tr></thead>
            <tbody>
              {a.orgInvoices.map((i) => (
                <tr key={i.id}>
                  <td><span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>{i.id}</span></td>
                  <td><span style={{ fontSize: 12.5, fontWeight: 600 }}>{i.orgName}</span></td>
                  <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(i.date)}</span></td>
                  <td><span className="badge badge-muted" style={{ height: 22 }}>{i.plan}</span></td>
                  <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(i.amount)}</span></td>
                  <td style={{ textAlign: "center" }}><span className={`badge badge-${i.status === "paid" ? "success" : "warning"}`} style={{ height: 22 }}>{i.status === "paid" ? "Ödendi" : "Bekliyor"}</span></td>
                  <td style={{ textAlign: "right" }}><button className="icon-btn" style={{ width: 32, height: 32 }} title="İndir" onClick={() => { downloadText("fatura-" + i.id + ".txt", ["UYANIK KOÇ — PLATFORM FATURASI", "", "Fatura No: " + i.id, "Kurum: " + i.orgName, "Tarih: " + fmtDate(i.date), "Plan: " + i.plan, "Tutar: " + TRY(i.amount), "Durum: " + (i.status === "paid" ? "Ödendi" : "Bekliyor")].join("\n")); toast("Fatura indirildi", { icon: "download" }); }}><Icon name="download" size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* ---- Modül bayrakları (platform geneli) ---- */
function SAModules() {
  const a = useAdmin();
  return (
    <div className="stack rise">
      <PageHead title="Modül Bayrakları" sub="Hangi kurumda hangi özelliğin açık olduğunu tek tabloda yönet" />
      <Section title="Kurum × Modül matrisi" sub="Hücreye tıklayarak ilgili kurumun modülünü aç/kapat">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 880 }}>
            <thead><tr><th>Kurum</th>{MODULES.map((m) => <th key={m.key} style={{ textAlign: "center", fontSize: 10 }}>{m.name}</th>)}</tr></thead>
            <tbody>
              {a.orgs.map((o) => (
                <tr key={o.id}>
                  <td><div className="name"><OrgLogo name={o.name} tone={o.tone} size={32} /><div><b>{o.name}</b><span>{orgPlanById(o.planId).name}</span></div></div></td>
                  {MODULES.map((m) => {
                    const on = !!o.modules[m.key];
                    return (
                      <td key={m.key} style={{ textAlign: "center" }}>
                        <button onClick={() => { toggleOrgModule(o.id, m.key); toast(o.name + " · " + m.name + " " + (on ? "kapatıldı" : "açıldı"), { icon: "bolt" }); }}
                          className="icon-btn" style={{ width: 30, height: 30, margin: "0 auto", color: on ? "var(--success)" : "var(--faint)", borderColor: on ? "color-mix(in srgb, var(--success) 35%, transparent)" : "var(--border)", background: on ? "var(--success-soft)" : "transparent" }}
                          title={on ? "Açık — kapatmak için tıkla" : "Kapalı — açmak için tıkla"}>
                          <Icon name={on ? "check" : "plus"} size={15} style={on ? null : { transform: "rotate(45deg)" }} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <div className="grid g-2">
        {MODULES.map((m) => {
          const cnt = a.orgs.filter((o) => o.modules[m.key]).length;
          return (
            <div key={m.key} className="card"><div className="card-pad" style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span className="mod-ic" style={cnt ? { background: "var(--primary)", color: "#fff" } : null}><Icon name={m.icon} size={20} /></span>
              <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{m.name}{m.premium ? <span className="mod-prem" style={{ marginLeft: 7 }}>Premium</span> : null}</b><div className="muted" style={{ fontSize: 12 }}>{cnt}/{a.orgs.length} kurumda açık</div></div>
              <div className="tnum" style={{ fontWeight: 800, fontSize: 18 }}>{Math.round((cnt / a.orgs.length) * 100)}%</div>
            </div></div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Destek & sistem durumu ---- */
function SASupport() {
  const tickets = [
    { id: "DST-2041", org: "Hedef Akademi", subj: "Lisans yenileme faturası ulaşmadı", pr: "Yüksek", tone: "danger", t: "2 saat önce", open: true },
    { id: "DST-2038", org: "Doğa Rehberlik", subj: "Yeni şube ekleme talebi", pr: "Orta", tone: "warning", t: "5 saat önce", open: true },
    { id: "DST-2034", org: "Selin Yılmaz (koç)", subj: "Öğrenci koltuğu artırımı", pr: "Düşük", tone: "info", t: "1 gün önce", open: true },
    { id: "DST-2029", org: "Zirve Eğitim", subj: "AI Koç modülü etkinleştirme", pr: "Orta", tone: "warning", t: "2 gün önce", open: false },
  ];
  const services = [
    { l: "Uygulama (web)", up: true }, { l: "Mobil API", up: true }, { l: "Ödeme servisi (iyzico)", up: true },
    { l: "Bildirim servisi", up: true }, { l: "Online deneme motoru", up: false }, { l: "Raporlama", up: true },
  ];
  return (
    <div className="stack rise">
      <PageHead title="Destek & Sistem Durumu" sub="Açık talepler ve servis sağlığı" />
      <div className="grid col-main">
        <Section title="Açık destek talepleri" sub={`${tickets.filter((t) => t.open).length} açık talep`} action={<button className="btn btn-light btn-sm"><Icon name="message" size={15} />Tümünü gör</button>}>
          <div className="card-body" style={{ padding: 0 }}>
            {tickets.map((t) => (
              <div key={t.id} className="list-row">
                <span className={`stat-icon tone-${t.tone}`} style={{ width: 38, height: 38 }}><Icon name="message" size={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 13.5, display: "block" }}>{t.subj}</b>
                  <span className="muted" style={{ fontSize: 12 }}>{t.id} · {t.org} · {t.t}</span>
                </div>
                <span className={`badge badge-${t.tone}`} style={{ height: 22 }}>{t.pr}</span>
                {t.open ? <button className="btn btn-light btn-sm" onClick={() => toast(t.id + " yanıtlandı", { icon: "send" })}>Yanıtla</button> : <span className="badge badge-muted" style={{ height: 22 }}>Kapandı</span>}
              </div>
            ))}
          </div>
        </Section>
        <Section title="Sistem durumu" action={<span className="badge badge-success"><span className="dot-live" />Çoğu servis çalışıyor</span>}>
          <div className="card-body" style={{ padding: 0 }}>
            {services.map((s, i) => (
              <div key={i} className="kpi-row" style={{ padding: "13px 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.l}</span>
                <span className={`badge badge-${s.up ? "success" : "warning"}`} style={{ height: 22 }}>{s.up ? <><span className="dot-live" />Çalışıyor</> : <><Icon name="alert" size={12} />Bakımda</>}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { SAOrgDetail, SACoaches, SARevenue, SAModules, SASupport });
