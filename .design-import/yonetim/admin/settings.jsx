/* ============================================================
   SÜPER ADMIN — Ayarlar
   1) Ekip & Erişim: süper admin paneline erişebilecek kullanıcılar + roller
   2) Başvuru Kaynakları: Meta Reklam · Google Reklam · Jotform · Web formu (webhook)
      entegrasyonları → gelen başvurular Demo & Üyelikler sayfasına düşer.
   Tam yetki düzenler; destek yetkilisi salt görüntüler.
   ============================================================ */

const ACCESS_META = {
  full: { label: "Tam yetki", tone: "primary", icon: "shield", desc: "Tüm ekranlar · lisans · faturalama · ekip & ayarlar dahil her şey." },
  support: { label: "Destek yetkilisi", tone: "info", icon: "message", desc: "Destek & Sistem + Demo & Üyelik taleplerini yönetir; diğer ekranlar salt görüntüleme." },
};

/* başvuru kaynağı logosu */
function IntegrationLogo({ tone, icon, size = 44 }) {
  return <span style={{ width: size, height: size, borderRadius: size * 0.28, background: tone, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={size * 0.46} /></span>;
}

/* ---- entegrasyon bağla / yönet modalı ---- */
function IntegrationModal({ it, onClose }) {
  const isWebhook = it.id === "webhook";
  const isJotform = it.id === "jotform";
  const [account, setAccount] = uS(it.account || "");
  const [formName, setFormName] = uS(it.formName || "");
  const [apiKey, setApiKey] = uS("");
  const accountLabel = it.id === "meta" ? "Reklam hesabı" : it.id === "google" ? "Google Ads hesabı" : "Hesap";
  const ok = isWebhook ? true : (isJotform ? apiKey.trim() && formName.trim() : account.trim() && formName.trim());

  const copy = () => { try { navigator.clipboard.writeText(it.webhookUrl); toast("Webhook adresi kopyalandı", { icon: "check" }); } catch (e) { toast("Kopyalanamadı", { icon: "alert" }); } };
  const apply = () => {
    if (!ok) return;
    connectIntegration(it.id, isJotform ? { account: "jotform: bağlı", formName } : { account, formName });
    toast(it.name + " bağlandı", { icon: "checkCircle" });
    onClose();
  };

  if (isWebhook) {
    return (
      <Modal title="Web Formu (Webhook)" sub="Kendi sitenizdeki formu bu adrese bağlayın" width={520} onClose={onClose}
        foot={<button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onClose}>Tamam</button>}>
        <Field label="Webhook adresi (POST)">
          <div className="row" style={{ gap: 8 }}>
            <input className="input" readOnly value={it.webhookUrl} style={{ flex: 1, fontFamily: "monospace", fontSize: 12.5 }} />
            <button className="btn btn-light" onClick={copy} style={{ flexShrink: 0 }}><Icon name="clipboard" size={15} />Kopyala</button>
          </div>
        </Field>
        <div className="alert-strip"><span className="as-ic"><Icon name="bolt" size={18} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Form alanları</b><div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>Gönderilecek alanlar: <code>ad</code>, <code>email</code>, <code>telefon</code>, <code>tip</code> (kurum/koç), <code>plan</code>, <code>not</code>. Gelen her gönderim Demo & Üyelikler'de yeni talep olur.</div></div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={it.name + " bağla"} sub={it.desc} width={480} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={apply}><Icon name="check" size={16} />Bağla</button></>}>
      {isJotform
        ? <Field label="Jotform API anahtarı"><input className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="xxxxxxxxxxxxxxxx" /></Field>
        : <Field label={accountLabel}><input className="input" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={it.id === "meta" ? "Uyanık Koç Reklam Hesabı" : "act-123456789"} /></Field>}
      <Field label="Bağlanacak form"><input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Örn. LGS Kayıt Formu" /></Field>
      <div className="alert-strip"><span className="as-ic"><Icon name="bolt" size={18} /></span>
        <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Otomatik aktarım</b><div className="muted" style={{ fontSize: 12 }}>Bağlandıktan sonra bu formdan gelen başvurular Demo & Üyelikler sayfasına otomatik düşer.</div></div>
      </div>
    </Modal>
  );
}

/* ---- entegrasyon kartı ---- */
function IntegrationCard({ it, editable, onManage, onDisconnect }) {
  return (
    <div className="card"><div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div className="row" style={{ gap: 13, alignItems: "flex-start" }}>
        <IntegrationLogo tone={it.tone} icon={it.icon} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <b style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>{it.name}</b>
            <span className={`badge badge-${it.connected ? "success" : "muted"}`} style={{ height: 21, fontSize: 11 }}>{it.connected ? <><span className="dot-live" />Bağlı</> : "Bağlı değil"}</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 5 }}>{it.desc}</p>
        </div>
      </div>

      {it.connected ? (
        <div className="stack" style={{ gap: 0, background: "var(--surface-2)", borderRadius: 12, padding: "4px 14px" }}>
          {it.formName ? <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Bağlı form</span><b style={{ fontSize: 12.5 }}>{it.formName}</b></div> : null}
          {it.account ? <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Hesap</span><b style={{ fontSize: 12.5 }}>{it.account}</b></div> : null}
          {it.id === "webhook" ? <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Webhook</span><b style={{ fontSize: 11.5, fontFamily: "monospace", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.webhookUrl}</b></div> : null}
          <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Son senkron</span><b className="tnum" style={{ fontSize: 12.5 }}>{it.lastSync ? timeAgo(it.lastSync) : "—"}</b></div>
          <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Gelen başvuru</span><b className="tnum" style={{ fontSize: 13, color: "var(--primary-600)" }}>{it.leadCount}</b></div>
        </div>
      ) : null}

      {editable ? (
        <div className="row" style={{ gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {it.connected
            ? <>
                <button className="btn btn-light btn-sm" onClick={() => onManage(it)}><Icon name="settings" size={14} />Yönet</button>
                {it.id !== "webhook" ? <button className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => onDisconnect(it)}><Icon name="alert" size={14} />Bağlantıyı kes</button> : null}
              </>
            : <button className="btn btn-primary btn-sm" onClick={() => onManage(it)}><Icon name="plus" size={14} />Bağla</button>}
        </div>
      ) : (
        <div className="row" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <span className="muted" style={{ fontSize: 12 }}><Icon name="lock" size={13} /> {it.connected ? "Bağlı" : "Bağlı değil"} — değişiklik için tam yetki gerekir</span>
        </div>
      )}
    </div></div>
  );
}

/* ============================================================
   ANA SAYFA — SASettings
   ============================================================ */
function SASettings() {
  const a = useAdmin();
  const editable = a.viewerAccess === "full";
  const integrations = a.integrations || [];
  const [tab, setTab] = uS("team");
  const [inviteOpen, setInviteOpen] = uS(false);
  const [manageIt, setManageIt] = uS(null);
  const [disconnectIt, setDisconnectIt] = uS(null);

  const fulls = a.team.filter((m) => m.access === "full").length;
  const supports = a.team.filter((m) => m.access === "support").length;
  const invited = a.team.filter((m) => m.status === "invited").length;
  const connected = integrations.filter((i) => i.connected).length;
  const totalLeads = integrations.reduce((s, i) => s + (i.connected ? i.leadCount : 0), 0);

  return (
    <div className="stack rise">
      <PageHead title="Ayarlar" sub="Panel erişimi, roller ve başvuru kaynağı entegrasyonları" />

      {!editable ? (
        <div className="alert-strip"><span className="as-ic"><Icon name="lock" size={16} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Salt görüntüleme</b><div className="muted" style={{ fontSize: 12 }}>Destek yetkilisi ayarları görüntüleyebilir; kullanıcı, rol ve entegrasyon değişikliği yalnızca tam yetkili yöneticilerce yapılır.</div></div>
        </div>
      ) : null}

      <div className="seg-tabs">
        <button className={`seg-tab${tab === "team" ? " on" : ""}`} onClick={() => setTab("team")}><Icon name="users" size={16} />Ekip & Erişim<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{a.team.length}</span></button>
        <button className={`seg-tab${tab === "kaynak" ? " on" : ""}`} onClick={() => setTab("kaynak")}><Icon name="bolt" size={16} />Başvuru Kaynakları<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{connected}</span></button>
      </div>

      {tab === "team" ? (
        <div className="stack">
          <div className="grid g-3">
            <StatCard icon="shield" tone="primary" value={fulls} label="Tam yetkili" />
            <StatCard icon="message" tone="info" value={supports} label="Destek yetkilisi" />
            <StatCard icon="send" tone="warning" value={invited} label="Davet bekleyen" />
          </div>

          <Section title="Süper admin erişimi" sub="Panele erişebilecek kullanıcıları ve rollerini yönetin"
            action={editable ? <button className="btn btn-primary btn-sm" onClick={() => setInviteOpen(true)}><Icon name="plus" size={15} />Kullanıcı davet et</button> : null}>
            <div className="card-body" style={{ padding: 0 }}>
              {a.team.map((m) => (
                <div key={m.id} className="list-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
                  <Avatar name={m.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{m.name}{m.status === "invited" ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Davet edildi</span> : null}</b>
                    <span className="muted" style={{ fontSize: 12 }}>{m.email} · {m.status === "invited" ? "henüz katılmadı" : "son giriş " + timeAgo(m.lastActive)}</span>
                  </div>
                  {editable
                    ? <select className="input" style={{ width: 168, height: 36, fontSize: 12.5 }} value={m.access} onChange={(e) => { setAdminAccess(m.id, e.target.value); toast("Rol güncellendi", { icon: "shield" }); }}>
                        <option value="full">Tam yetki</option>
                        <option value="support">Destek yetkilisi</option>
                      </select>
                    : <span className={`badge badge-${ACCESS_META[m.access].tone}`} style={{ height: 24 }}><Icon name={ACCESS_META[m.access].icon} size={12} />{ACCESS_META[m.access].label}</span>}
                  {editable ? <button className="icon-btn" style={{ width: 34, height: 34 }} title="Kaldır" onClick={() => { removeAdminMember(m.id); toast(m.name + " kaldırıldı", { icon: "alert" }); }}><Icon name="plus" size={16} style={{ transform: "rotate(45deg)" }} /></button> : null}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Roller ve yetkiler">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(ACCESS_META).map(([k, r]) => (
                <div key={k} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                  <span className={`stat-icon tone-${r.tone}`} style={{ width: 38, height: 38, flexShrink: 0 }}><Icon name={r.icon} size={18} /></span>
                  <div><b style={{ fontSize: 13.5 }}>{r.label}</b><p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 2 }}>{r.desc}</p></div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      ) : (
        <div className="stack">
          <div className="grid g-3">
            <StatCard icon="bolt" tone="primary" value={connected + "/" + integrations.length} label="Bağlı kaynak" />
            <StatCard icon="users" tone="success" value={totalLeads} label="Toplam gelen başvuru" />
            <StatCard icon="refresh" tone="info" value={integrations.length - connected} label="Bağlanabilir kaynak" />
          </div>

          <div className="alert-strip">
            <span className="as-ic"><Icon name="bell" size={16} /></span>
            <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Başvurular tek yerde</b><div className="muted" style={{ fontSize: 12 }}>Bağlı kaynaklardan gelen tüm başvurular <b>Demo & Üyelikler</b> sayfasında demo talebi olarak listelenir.</div></div>
          </div>

          <div className="grid g-2">
            {integrations.map((it) => (
              <IntegrationCard key={it.id} it={it} editable={editable} onManage={setManageIt} onDisconnect={setDisconnectIt} />
            ))}
          </div>
        </div>
      )}

      {inviteOpen ? <InviteModal title="Süper admin ekibine davet et" roleMode="adminAccess" onClose={() => setInviteOpen(false)} onSubmit={({ name, email, value }) => { inviteAdminMember({ name, email, access: value }); toast(name + " davet edildi", { icon: "send" }); }} /> : null}
      {manageIt ? <IntegrationModal it={manageIt} onClose={() => setManageIt(null)} /> : null}
      <ConfirmModal open={!!disconnectIt} title="Bağlantıyı kes?" tone="danger"
        body={disconnectIt ? disconnectIt.name + " bağlantısı kesilecek; bu kaynaktan yeni başvuru aktarımı duracak." : ""}
        confirmLabel="Bağlantıyı kes"
        onConfirm={() => { if (disconnectIt) { disconnectIntegration(disconnectIt.id); toast(disconnectIt.name + " bağlantısı kesildi", { icon: "alert" }); } }}
        onClose={() => setDisconnectIt(null)} />
    </div>
  );
}

Object.assign(window, { SASettings });
