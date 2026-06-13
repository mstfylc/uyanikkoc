/* ============================================================
   SÜPER ADMIN override: Destek (gerçek ticket) · Kurum detayı (abone profili) · Lisans Takibi
   ============================================================ */

/* ===== Destek & Sistem + Ekip & Erişim ===== */
function SASupport() {
  const a = useAdmin();
  const [note, setNote] = uS("");
  const [inviteOpen, setInviteOpen] = uS(false);
  const [activeTicketId, setActiveTicketId] = uS(null);
  const fullAccess = a.viewerAccess === "full";
  const services = [
    { l: "Uygulama (web)", up: true }, { l: "Mobil API", up: true }, { l: "Ödeme servisi (iyzico)", up: true },
    { l: "Bildirim servisi", up: true }, { l: "Online deneme motoru", up: false }, { l: "Raporlama", up: true },
  ];
  const openTickets = a.tickets.filter((t) => t.status !== "resolved");
  const liveTicket = activeTicketId ? a.tickets.find((t) => t.id === activeTicketId) : null;
  const addNote = () => { if (!note.trim()) return; addSystemNote(note.trim(), "Platform Ekibi"); setNote(""); toast("Sistem notu eklendi", { icon: "notebook" }); };
  return (
    <div className="stack rise">
      <PageHead title="Destek & Sistem Durumu" sub="Açık talepler, sistem notları ve servis sağlığı"
        actions={<div className="seg" role="tablist" title="Demo: görüntüleme rolü">
          <button className={fullAccess ? "on" : ""} onClick={() => setViewerAccess("full")}><Icon name="shield" size={15} />Tam yetki</button>
          <button className={!fullAccess ? "on" : ""} onClick={() => setViewerAccess("support")}><Icon name="message" size={15} />Destek yetkilisi</button>
        </div>} />
      {!fullAccess ? <div className="alert-strip"><span className="as-ic"><Icon name="lock" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Destek yetkilisi modu</b><div className="muted" style={{ fontSize: 12.5 }}>Bu rol yalnızca destek taleplerini yanıtlar ve sistem notu ekler; diğer ekranlar salt görüntülenir.</div></div></div> : null}
      <div className="grid col-main">
        <div className="stack">
          <Section title="Destek talepleri" sub={openTickets.length + " açık · " + a.tickets.length + " toplam"}>
            <div className="card-body" style={{ padding: 0 }}>
              {a.tickets.map((t) => { const last = t.messages[t.messages.length - 1]; return (
                <button key={t.id} className="list-row" style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setActiveTicketId(t.id)}>
                  <span className={`stat-icon tone-${t.tone}`} style={{ width: 38, height: 38 }}><Icon name="message" size={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{t.subj}</b>
                    <span className="muted" style={{ fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.id} · {t.org} · {last ? (last.role === "agent" ? "Siz: " : "") + last.text : ""}</span>
                  </div>
                  <div className="row" style={{ gap: 7 }}><span className={`badge badge-${t.tone}`} style={{ height: 22 }}>{t.priority}</span><TicketStatusBadge status={t.status} />{t.messages.length > 1 ? <span className="muted tnum" style={{ fontSize: 11 }}><Icon name="message" size={12} /> {t.messages.length}</span> : null}</div>
                  <Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} />
                </button>
              ); })}
            </div>
          </Section>
          <Section title="Sistem notları" sub="Ekip içi duyuru ve bakım notları">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yeni sistem notu / duyuru ekle…" style={{ flex: 1, resize: "vertical" }} />
                <button className="btn btn-primary" onClick={addNote} disabled={!note.trim()} style={{ flexShrink: 0 }}><Icon name="plus" size={16} />Ekle</button>
              </div>
              <div className="stack" style={{ gap: 9 }}>{a.systemNotes.map((n) => (
                <div key={n.id} className="fb-card"><div className="fb-head">
                  <span className={`stat-icon tone-${n.pinned ? "warning" : "primary"}`} style={{ width: 30, height: 30 }}><Icon name={n.pinned ? "flag" : "notebook"} size={15} /></span>
                  <div style={{ flex: 1 }}><b style={{ fontSize: 12.5 }}>{n.author}</b><div className="muted" style={{ fontSize: 11 }}>{fmtShort(n.date)}</div></div>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} title="Sil" onClick={() => { deleteSystemNote(n.id); toast("Not silindi", { icon: "alert" }); }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
                </div><p className="fb-quote">{n.text}</p></div>
              ))}</div>
            </div>
          </Section>
        </div>
        <div className="stack">
          <Section title="Sistem durumu" action={<span className="badge badge-success"><span className="dot-live" />Çoğu servis çalışıyor</span>}>
            <div className="card-body" style={{ padding: 0 }}>{services.map((s, i) => (
              <div key={i} className="kpi-row" style={{ padding: "13px 18px" }}><span style={{ fontSize: 13, fontWeight: 600 }}>{s.l}</span><span className={`badge badge-${s.up ? "success" : "warning"}`} style={{ height: 22 }}>{s.up ? <><span className="dot-live" />Çalışıyor</> : <><Icon name="alert" size={12} />Bakımda</>}</span></div>
            ))}</div>
          </Section>
          <Section title="Ekip & Erişim" sub="Platform ekibi ve yetki seviyeleri" action={fullAccess ? <button className="btn btn-light btn-sm" onClick={() => setInviteOpen(true)}><Icon name="plus" size={15} />Üye davet et</button> : null}>
            <div className="card-body" style={{ padding: 0 }}>{a.team.map((m) => (
              <div key={m.id} className="list-row">
                <Avatar name={m.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5, display: "block" }}>{m.name}{m.status === "invited" ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Davetli</span> : null}</b><span className="muted" style={{ fontSize: 12 }}>{m.email}</span></div>
                {fullAccess
                  ? <select className="input" style={{ width: 150, height: 34, fontSize: 12.5 }} value={m.access} onChange={(e) => { setAdminAccess(m.id, e.target.value); toast("Erişim güncellendi", { icon: "shield" }); }}><option value="full">Tam yetki</option><option value="support">Destek yetkilisi</option></select>
                  : <span className={`badge badge-${m.access === "full" ? "primary" : "muted"}`} style={{ height: 22 }}>{m.access === "full" ? "Tam yetki" : "Destek"}</span>}
                {fullAccess ? <button className="icon-btn" style={{ width: 32, height: 32 }} title="Kaldır" onClick={() => { removeAdminMember(m.id); toast("Üye kaldırıldı", { icon: "alert" }); }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button> : null}
              </div>
            ))}</div>
          </Section>
        </div>
      </div>
      {inviteOpen ? <InviteModal title="Platform ekibine davet et" roleMode="adminAccess" onClose={() => setInviteOpen(false)} onSubmit={({ name, email, value }) => { inviteAdminMember({ name, email, access: value }); toast("Davet gönderildi", { icon: "send" }); }} /> : null}
      {liveTicket ? <TicketThread ticket={liveTicket} onClose={() => setActiveTicketId(null)} /> : null}
    </div>
  );
}

/* ===== Kurum detayı (override: abone notu + demo + detaylı yenileme) ===== */
function SAOrgDetail({ orgId, back }) {
  const a = useAdmin();
  const o = getOrg(orgId);
  const [tab, setTab] = uS("ozet");
  const [confirm, setConfirm] = uS(null);
  if (!o) return <div className="stack rise"><button className="link-btn" onClick={back}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Kurumlara dön</button><EmptyState icon="building" title="Kurum bulunamadı" /></div>;
  const editable = a.viewerAccess === "full";
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);
  const TABS = [{ k: "ozet", label: "Özet", icon: "dashboard" }, { k: "subeler", label: o.type === "franchise" ? "Şubeler" : "Şube", icon: "building", count: o.branches.length }, { k: "lisans", label: "Lisans & Plan", icon: "shield" }, { k: "moduller", label: "Modüller", icon: "bolt" }];
  return (
    <div className="stack rise">
      <button className="link-btn" onClick={back} style={{ alignSelf: "flex-start" }}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Kurumlara dön</button>
      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <OrgLogo name={o.name} tone={o.tone} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}><h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{o.name}</h1><StatusBadge status={o.status} /></div>
          <p className="muted" style={{ fontSize: 13 }}>{o.type === "franchise" ? "Franchise ağı" : "Tek kurum"} · {o.city} · Sahip: {o.owner.name}</p>
        </div>
        {editable ? <div className="row" style={{ gap: 9 }}>
          <button className="btn btn-light" onClick={() => toast(o.owner.email + " adresine yazıldı", { icon: "message" })}><Icon name="message" size={16} />İletişim</button>
          <button className="btn btn-light" onClick={() => {
            const coaches = typeof orgCoaches === "function" ? orgCoaches(o) : [];
            const students = typeof orgStudents === "function" ? orgStudents(o) : [];
            const rows = [["UYANIK KOÇ — TÜM KURUM VERİSİ"], ["Kurum", o.name], ["Tür", o.type], ["Şehir", o.city], ["Plan", orgPlanById(o.planId).name], ["Öğrenci", o.seats.used], ["Koç", o.coaches.used], ["Aylık tahsilat", totalCollect], [],
              ["ŞUBELER"], ["Ad", "Şehir", "Öğrenci", "Koç", "Tahsilat", "Durum"], ...o.branches.map((b) => [b.name, b.city, b.students, b.coaches, b.collect, b.status]), [],
              ["KOÇLAR"], ["Ad", "Şube", "Öğrenci", "Puan", "Durum"], ...coaches.map((c) => [c.name, c.branch, c.students, c.rating, c.status]), [],
              ["ÖĞRENCİLER"], ["Ad", "Sınıf", "Şube", "Koç", "Net", "Devam", "Durum"], ...students.map((s) => [s.name, s.grade, s.branch, s.coach, s.net, s.attend, s.status])];
            downloadCSV("tum-kurum-verisi-" + o.id + ".csv", rows); toast(o.name + " tüm verisi dışa aktarıldı", { icon: "download" });
          }}><Icon name="download" size={16} />Tüm veriyi dışa aktar</button>
          {o.status === "suspended" ? <button className="btn btn-primary" onClick={() => { activateOrg(o.id); toast("Lisans aktifleştirildi", { icon: "checkCircle" }); }}><Icon name="refresh" size={16} />Aktifleştir</button> : <button className="btn btn-primary" onClick={() => { renewOrg(o.id); toast("Lisans yenilendi", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Hızlı yenile</button>}
        </div> : null}
      </div>
      <LicenseHero org={o} />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "ozet" ? (
        <div className="grid col-main">
          <div className="stack">
            <div className="grid g-3"><StatCard icon="cap" tone="primary" value={o.seats.used} label="Aktif öğrenci" /><StatCard icon="users" tone="info" value={o.coaches.used} label="Koç" /><StatCard icon="banknote" tone="success" value={TRY(totalCollect)} label="Aylık tahsilat" /></div>
            <Section title="Şube performansı" sub="Aylık tahsilat karşılaştırması"><div className="card-body"><RankBars items={o.branches.map((b) => ({ l: b.name, v: b.collect }))} fmt={(v) => TRY(v)} /></div></Section>
            <SubscriberNotes subjectKind="org" subject={o} />
          </div>
          <div className="stack">
            <Section title="Kurum bilgileri"><div className="card-body" style={{ padding: 0 }}>
              {[["Yetkili", o.owner.name], ["E-posta", o.owner.email], ["Telefon", o.owner.phone], ["Sözleşme başlangıcı", fmtShort(o.startedAt)]].map(([k, v]) => <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>{k}</span><b style={{ fontSize: 13 }}>{v}</b></div>)}
            </div></Section>
            {editable ? <Section title="Lisans işlemleri"><div className="card-body" style={{ gap: 9, display: "flex", flexDirection: "column" }}>
              <button className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={() => setTab("lisans")}><Icon name="arrowUp" size={16} />Planı yükselt / değiştir</button>
              <button className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={() => { addOrgSeats(o.id, 25); toast("25 öğrenci koltuğu eklendi", { icon: "plus" }); }}><Icon name="plus" size={16} />Koltuk paketi ekle (+25)</button>
              <button className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => setConfirm("suspend")}><Icon name="alert" size={16} />Lisansı dondur</button>
            </div></Section> : null}
          </div>
        </div>
      ) : null}
      {tab === "subeler" ? (
        <Section title={o.type === "franchise" ? "Şubeler" : "Şube"} sub={`${o.branches.length} konum · toplam ${o.seats.used} öğrenci`}>
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 620 }}><thead><tr><th>Şube</th><th>Öğrenci</th><th>Koç</th><th style={{ textAlign: "right" }}>Aylık tahsilat</th><th style={{ textAlign: "center" }}>Durum</th></tr></thead>
              <tbody>{o.branches.map((b) => <tr key={b.id}><td><div className="name"><span className="org-logo" style={{ width: 34, height: 34, background: o.tone, fontSize: 12, borderRadius: 9 }}><Icon name="building" size={16} /></span><div><b>{b.name}</b><span>{b.city}</span></div></div></td><td><span className="tnum" style={{ fontWeight: 700 }}>{b.students}</span></td><td><span className="tnum">{b.coaches}</span></td><td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(b.collect)}</span></td><td style={{ textAlign: "center" }}><StatusBadge status={b.status} sm /></td></tr>)}</tbody>
            </table>
          </div>
        </Section>
      ) : null}
      {tab === "lisans" ? (
        <Section title="Lisans planı" sub="Plan değişikliği anında kapasite ve modülleri günceller"><div className="card-body"><div className="grid g-3">
          {orgPlans().map((pl) => { const sel = pl.id === o.planId; return (
            <div key={pl.id} className={`lic-plan${sel ? " sel" : ""}`} onClick={() => { if (!sel && editable) { changeOrgPlan(o.id, pl.id); toast(pl.name + " planına geçildi", { icon: "checkCircle" }); } }}>
              {pl.popular ? <span className="lp-flag">Popüler</span> : null}
              <h4><span className="plan-dot" style={{ background: pl.color }} />{pl.name}</h4>
              <div className="lp-price tnum">{TRY(pl.monthly)}<span className="per"> /ay</span></div>
              <ul><li><Icon name="cap" size={14} />{pl.seats} öğrenci koltuğu</li><li><Icon name="users" size={14} />{pl.coaches} koç</li><li><Icon name="building" size={14} />{pl.branches} şubeye kadar</li><li><Icon name="bolt" size={14} />{pl.modules.length} modül</li></ul>
              {sel ? <span className="badge badge-primary" style={{ alignSelf: "flex-start" }}><Icon name="check" size={13} />Mevcut plan</span> : editable ? <button className="btn btn-outline btn-sm">Bu plana geç</button> : null}
            </div>
          ); })}
        </div></div></Section>
      ) : null}
      {tab === "moduller" ? (
        <Section title="Modül erişimi" sub="Bu kuruma açık özellikleri yönet — değişiklikler anında uygulanır"><div className="card-body">
          <ModuleGrid modules={o.modules} readOnly={!editable} onToggle={(k) => { toggleOrgModule(o.id, k); toast(moduleName(k) + " " + (o.modules[k] ? "kapatıldı" : "açıldı"), { icon: "bolt" }); }} />
        </div></Section>
      ) : null}
      <ConfirmModal open={confirm === "suspend"} title="Lisansı dondur?" tone="danger" body={`${o.name} kurumunun tüm koç ve öğrenci erişimi geçici olarak durdurulacak.`} confirmLabel="Dondur" onConfirm={() => { suspendOrg(o.id); toast("Lisans donduruldu", { icon: "alert", tone: "danger" }); }} onClose={() => setConfirm(null)} />
    </div>
  );
}

Object.assign(window, { SASupport, SAOrgDetail });
