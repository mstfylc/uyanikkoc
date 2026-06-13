/* ============================================================
   Yönetim Paneli — SÜPER ADMIN yeni/override ekranlar
   Kampanyalar · Koç profili (not+demo+yenileme) · gerçek Destek
   override: SACoaches, SALicenses, SAOrgDetail (abone profili)
   ============================================================ */
function nav() { return window.__adminNav || {}; }

/* ===== Kampanyalar ===== */
function valueLabel(c) { return c.type === "percent" ? "%" + c.value : c.type === "amount" ? TRY(c.value) : c.value + " gün"; }
const CMP_AUD = { all: "Tümü", orgs: "Kurumlar", coaches: "Bireysel koçlar" };
const CMP_STATUS = { active: ["success", "Aktif"], scheduled: ["info", "Planlandı"], ended: ["muted", "Sona erdi"] };

function SACampaigns() {
  const a = useAdmin();
  const [createOpen, setCreateOpen] = uS(false);
  const [grantFor, setGrantFor] = uS(null);
  const editable = a.viewerAccess === "full";
  const active = a.campaigns.filter((c) => c.status === "active").length;
  const totalR = a.campaigns.reduce((s, c) => s + c.redemptions, 0);
  return (
    <div className="stack rise">
      <PageHead title="Kampanyalar & Kodlar" sub="İndirim kampanyaları ve promosyon kodları oluştur, kullanıcılara tanımla"
        actions={editable ? <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" size={16} />Yeni kampanya</button> : null} />
      <div className="grid g-3">
        <StatCard icon="bolt" tone="primary" value={active} label="Aktif kampanya" />
        <StatCard icon="check" tone="success" value={totalR} label="Toplam kullanım" />
        <StatCard icon="users" tone="info" value={a.campaignGrants.length} label="Tanımlanan kod" />
      </div>
      <div className="grid g-2">
        {a.campaigns.map((c) => {
          const meta = CMP_STATUS[c.status] || CMP_STATUS.active;
          return (
            <div key={c.id} className="card"><div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="stat-icon tone-primary" style={{ flexShrink: 0 }}><Icon name="bolt" size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}><b style={{ fontSize: 15, fontWeight: 800 }}>{c.name}</b><span className={`badge badge-${meta[0]}`} style={{ height: 21, fontSize: 11 }}>{meta[1]}</span></div>
                  <span className="muted" style={{ fontSize: 12.5, display: "block", marginTop: 3 }}>{CMP_AUD[c.audience]} · {fmtShort(c.startsAt)} – {fmtShort(c.endsAt)}</span>
                </div>
                <div style={{ textAlign: "right" }}><div className="tnum" style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-600)" }}>{valueLabel(c)}</div><div className="muted" style={{ fontSize: 11 }}>indirim</div></div>
              </div>
              <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <code style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, letterSpacing: ".06em", background: "var(--surface-3)", padding: "6px 12px", borderRadius: 8, border: "1px dashed var(--border-strong)" }}>{c.code}</code>
                <span className="muted tnum" style={{ fontSize: 12 }}>{c.redemptions}{c.maxRedemptions ? "/" + c.maxRedemptions : ""} kullanım</span>
              </div>
              {c.note ? <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{c.note}</p> : null}
              {editable ? (
                <div className="row" style={{ gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setGrantFor(c)}><Icon name="send" size={14} />Kullanıcıya ver</button>
                  {c.status === "active"
                    ? <button className="btn btn-light btn-sm" onClick={() => { setCampaignStatus(c.id, "ended"); toast("Kampanya sonlandırıldı", { icon: "alert" }); }}>Sonlandır</button>
                    : <button className="btn btn-light btn-sm" onClick={() => { setCampaignStatus(c.id, "active"); toast("Kampanya etkinleştirildi", { icon: "checkCircle" }); }}>Etkinleştir</button>}
                  <button className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => { deleteCampaign(c.id); toast("Kampanya silindi", { icon: "alert" }); }}><Icon name="alert" size={14} />Sil</button>
                </div>
              ) : null}
            </div></div>
          );
        })}
      </div>
      {a.campaigns.length === 0 ? <EmptyState icon="bolt" title="Henüz kampanya yok" sub="Yeni kampanya oluştur" /> : null}
      <Section title="Son tanımlanan kodlar" sub={a.campaignGrants.length + " kayıt"}>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          {a.campaignGrants.length === 0 ? <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Henüz bir kullanıcıya kod tanımlanmadı.</p> : (
            <table className="tbl" style={{ minWidth: 560 }}>
              <thead><tr><th>Kullanıcı</th><th>Tür</th><th>Kampanya</th><th>Tarih</th><th style={{ textAlign: "center" }}>Durum</th></tr></thead>
              <tbody>{a.campaignGrants.map((g) => { const camp = a.campaigns.find((c) => c.id === g.campaignId); return (
                <tr key={g.id}><td><b style={{ fontSize: 13 }}>{g.subjectName}</b></td><td><span className="muted" style={{ fontSize: 12.5 }}>{g.subjectKind === "org" ? "Kurum" : "Bireysel koç"}</span></td>
                  <td><span className="badge badge-muted" style={{ height: 22 }}>{camp ? camp.code : "—"}</span></td><td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(g.grantedAt)}</span></td>
                  <td style={{ textAlign: "center" }}><span className={`badge badge-${g.redeemed ? "success" : "info"}`} style={{ height: 22 }}>{g.redeemed ? "Kullanıldı" : "Tanımlı"}</span></td></tr>
              ); })}</tbody>
            </table>
          )}
        </div>
      </Section>
      {createOpen ? <CampaignModal onClose={() => setCreateOpen(false)} /> : null}
      {grantFor ? <GrantModal campaign={grantFor} onClose={() => setGrantFor(null)} /> : null}
    </div>
  );
}

/* ===== Bireysel koç profili (not + demo + yenileme) ===== */
function SACoachProfile({ coachId, back }) {
  const a = useAdmin();
  const c = getCoach(coachId);
  if (!c) return <div className="stack rise"><button className="link-btn" onClick={back}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Koçlara dön</button><EmptyState icon="users" title="Koç bulunamadı" /></div>;
  const cp = coachPlanById(c.planId);
  const unl = c.seats.total >= 999;
  const editable = a.viewerAccess === "full";
  const activeModules = MODULES.filter((m) => c.modules[m.key]);
  return (
    <div className="stack rise">
      <button className="link-btn" onClick={back} style={{ alignSelf: "flex-start" }}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Koçlara dön</button>
      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <Avatar name={c.name} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}><h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{c.name}</h1><StatusBadge status={c.status} />{c.rating ? <span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span> : null}</div>
          <p className="muted" style={{ fontSize: 13 }}>Bireysel koç · {c.city} · {cp.name} planı · {c.email}</p>
        </div>
        {editable ? <div className="row" style={{ gap: 9 }}>
          {c.status === "suspended" || c.status === "canceled"
            ? <button className="btn btn-primary" onClick={() => { activateCoach(c.id); toast(c.name + " aktifleştirildi", { icon: "checkCircle" }); }}><Icon name="refresh" size={16} />Aktifleştir</button>
            : <button className="btn btn-light" onClick={() => { suspendCoach(c.id); toast(c.name + " donduruldu", { icon: "alert", tone: "danger" }); }}><Icon name="alert" size={16} />Dondur</button>}
        </div> : null}
      </div>
      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={c.seats.used + (unl ? "" : "/" + c.seats.total)} label="Öğrenci" />
        <StatCard icon="banknote" tone="success" value={TRY(c.feeMonthly)} label="Aylık ücret" />
        <StatCard icon="star" tone="warning" value={c.rating || "—"} label="Ortalama puan" />
        <StatCard icon="refresh" tone="info" value={c.autoRenew ? "Açık" : "Kapalı"} label="Otomatik yenileme" />
      </div>
      <div className="grid col-main">
        <div className="stack">
          <Section title="Kapasite & plan">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Meter icon="cap" label="Öğrenci koltuğu" used={c.seats.used} total={c.seats.total} unlimited={unl} />
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Plan</span><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: cp.color }} /><b style={{ fontSize: 13.5 }}>{cp.name}</b></span></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Faturalama</span><b style={{ fontSize: 13.5 }}>{c.cycle === "annual" ? "Yıllık" : "Aylık"}</b></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span><b className="tnum" style={{ fontSize: 13.5 }}>{fmtShort(c.renewsAt)}</b></div>
            </div>
          </Section>
          <Section title="Faturalar" sub={c.invoices.length + " kayıt"}>
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              {c.invoices.length === 0 ? <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Henüz fatura yok (deneme sürümü).</p> : (
                <table className="tbl" style={{ minWidth: 460 }}><thead><tr><th>Fatura</th><th>Tarih</th><th style={{ textAlign: "right" }}>Tutar</th><th style={{ textAlign: "center" }}>Durum</th></tr></thead>
                  <tbody>{c.invoices.map((inv) => <tr key={inv.id}><td><span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>{inv.id}</span></td><td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(inv.date)}</span></td><td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(inv.amount)}</span></td><td style={{ textAlign: "center" }}><span className={`badge badge-${inv.status === "paid" ? "success" : inv.status === "failed" ? "danger" : "warning"}`} style={{ height: 22 }}>{inv.status === "paid" ? "Ödendi" : inv.status === "failed" ? "Başarısız" : "Bekliyor"}</span></td></tr>)}</tbody>
                </table>
              )}
            </div>
          </Section>
          <SubscriberNotes subjectKind="coach" subject={c} />
        </div>
        <div className="stack">
          <Section title="İletişim"><div className="card-body" style={{ padding: 0 }}>
            {[["E-posta", c.email], ["Telefon", c.phone], ["Şehir", c.city], ["Üyelik başlangıcı", fmtShort(c.startedAt)]].map(([k, v]) => <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>{k}</span><b style={{ fontSize: 13 }}>{v}</b></div>)}
          </div></Section>
          <Section title="Açık modüller"><div className="card-body"><div className="row" style={{ gap: 7, flexWrap: "wrap" }}>{activeModules.map((m) => <span key={m.key} className="badge badge-muted" style={{ height: 26 }}><Icon name="check" size={12} style={{ color: "var(--success)" }} />{m.name}</span>)}</div></div></Section>
        </div>
      </div>
    </div>
  );
}

/* ===== override: SACoaches (koç profiline link) ===== */
function SACoaches() {
  const a = useAdmin();
  const [q, setQ] = uS(""); const [filter, setFilter] = uS("all");
  const FILTERS = [{ k: "all", l: "Tümü" }, { k: "active", l: "Aktif" }, { k: "trial", l: "Deneme" }, { k: "suspended", l: "Pasif" }];
  const editable = a.viewerAccess === "full";
  const list = a.coaches.filter((c) => { const okF = filter === "all" ? true : filter === "suspended" ? (c.status === "suspended" || c.status === "canceled") : c.status === filter; return okF && c.name.toLowerCase().includes(q.toLowerCase()); });
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
          <table className="tbl" style={{ minWidth: 820 }}>
            <thead><tr><th>Koç</th><th>Plan</th><th>Öğrenci</th><th>Durum</th><th>Yenileme</th><th style={{ textAlign: "right" }}>Ücret</th><th></th></tr></thead>
            <tbody>{list.map((c) => { const cp = coachPlanById(c.planId); const dl = daysLeft(c.renewsAt); const unl = c.seats.total >= 999; return (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => nav().openCoach && nav().openCoach(c.id)}>
                <td><div className="name"><Avatar name={c.name} size={34} /><div><b>{c.name}{c.giftedDemoUntil ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Demo</span> : null}</b><span>{c.city}{c.rating ? ` · ★ ${c.rating}` : ""}</span></div></div></td>
                <td><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: cp.color }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{cp.name}</span></span></td>
                <td><span className="tnum" style={{ fontWeight: 600 }}>{c.seats.used}<span className="muted">/{unl ? "∞" : c.seats.total}</span></span></td>
                <td><StatusBadge status={c.status} sm /></td>
                <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl <= 14 ? "var(--warning)" : "var(--text-2)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</span></td>
                <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(c.feeMonthly)}</span></td>
                <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                    {editable ? (c.status === "suspended" || c.status === "canceled"
                      ? <button className="btn btn-light btn-sm" onClick={() => { activateCoach(c.id); toast(c.name + " yeniden aktif", { icon: "checkCircle" }); }}>Aktifleştir</button>
                      : <button className="btn btn-light btn-sm" onClick={() => { suspendCoach(c.id); toast(c.name + " donduruldu", { icon: "alert", tone: "danger" }); }}>Dondur</button>) : null}
                    <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => nav().openCoach && nav().openCoach(c.id)}><Icon name="chevronRight" size={16} /></button>
                  </div>
                </td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </Section>
      {list.length === 0 ? <EmptyState icon="users" title="Koç bulunamadı" sub="Arama veya filtreyi değiştir" /> : null}
    </div>
  );
}

Object.assign(window, { SACampaigns, SACoachProfile, SACoaches });
