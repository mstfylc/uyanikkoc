/* ============================================================
   Yönetim Paneli — yeni ekranlar (modallar + paylaşılan parçalar)
   Kampanya, çoklu yönetici, gerçek ticket, koç geri bildirim, abone notu+demo,
   detaylı yenileme. admin-data.jsx + admin-ui.jsx üzerine kurulur.
   ============================================================ */
const { useState: uS } = React;

/* yıldız satırı */
function StarRow({ value, size = 14 }) {
  return (
    <span className="row" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} fill={n <= Math.round(value)}
          style={{ color: n <= Math.round(value) ? "var(--warning)" : "var(--surface-3)" }} />
      ))}
    </span>
  );
}
function PriorityBadge({ priority }) {
  const m = { high: ["danger", "Yüksek"], med: ["warning", "Orta"], low: ["info", "Düşük"] }[priority] || ["info", "—"];
  return <span className={`badge badge-${m[0]}`} style={{ height: 21, fontSize: 11 }}>{m[1]}</span>;
}
const TICKET_META = { open: ["warning", "Açık"], answered: ["info", "Yanıtlandı"], resolved: ["success", "Çözüldü"] };
function TicketStatusBadge({ status }) {
  const m = TICKET_META[status] || TICKET_META.open;
  return <span className={`badge badge-${m[0]}`} style={{ height: 22 }}>{m[1]}</span>;
}

/* genel modal kabuğu */
function Modal({ title, sub, onClose, children, foot, width = 520 }) {
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>{title}</h3>{sub ? <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</div> : null}</div>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
        {foot ? <div className="modal-foot">{foot}</div> : null}
      </div>
    </div>
  ), document.body);
}
function Field({ label, children }) {
  return <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>{children}</label>;
}

const MONTHS_OPT = [{ m: 1, l: "1 ay" }, { m: 3, l: "3 ay" }, { m: 6, l: "6 ay" }, { m: 12, l: "12 ay" }];

/* detaylı lisans yenileme */
function RenewModal({ subjectKind, subject, onClose }) {
  const plans = subjectKind === "org" ? orgPlans() : coachPlans();
  const [months, setMonths] = uS(12);
  const [planId, setPlanId] = uS(subject.planId);
  const plan = plans.find((p) => p.id === planId) || plans[0];
  const annual = plan.annual || plan.monthly * 12;
  const total = months >= 12 ? Math.round((annual / 12) * months) : plan.monthly * months;
  const from = Math.max(Date.now(), subject.renewsAt);
  const newDate = from + Math.round(months * 30.4 * DAY);
  const apply = () => {
    if (subjectKind === "org") renewOrgDetailed(subject.id, months, planId);
    else buyCoachPlan(subject.id, planId, months >= 12 ? "annual" : "monthly");
    toast(subject.name + " lisansı " + months + " ay uzatıldı", { icon: "refresh" }); onClose();
  };
  return (
    <Modal title="Lisansı yenile" sub={subject.name + " · mevcut bitiş " + fmtShort(subject.renewsAt)} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply}><Icon name="refresh" size={16} />Yenile · {TRY(total)}</button></>}>
      <Field label="Uzatma süresi">
        <div className="seg" style={{ width: "100%" }}>{MONTHS_OPT.map((o) => <button key={o.m} className={months === o.m ? "on" : ""} style={{ flex: 1 }} onClick={() => setMonths(o.m)}>{o.l}</button>)}</div>
      </Field>
      <Field label="Paket">
        <div className="stack" style={{ gap: 8 }}>
          {plans.map((p) => (
            <div key={p.id} className={`lic-plan${planId === p.id ? " sel" : ""}`} style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 10 }} onClick={() => setPlanId(p.id)}>
              <span className="plan-dot" style={{ background: p.color }} /><b style={{ fontSize: 13.5, flex: 1 }}>{p.name}</b>
              <span className="tnum muted" style={{ fontSize: 12.5 }}>{TRY(p.monthly)}/ay</span>
              {planId === p.id ? <Icon name="checkCircle" size={18} style={{ color: "var(--primary)" }} /> : null}
            </div>
          ))}
        </div>
      </Field>
      <div className="alert-strip"><span className="as-ic"><Icon name="calendar" size={18} /></span>
        <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Yeni bitiş tarihi: {fmtShort(newDate)}</b><div className="muted" style={{ fontSize: 12 }}>{plan.name} · {months} ay · toplam {TRY(total)}</div></div>
      </div>
    </Modal>
  );
}

/* ücretsiz demo */
function DemoModal({ subjectKind, subject, onClose }) {
  const [days, setDays] = uS(14);
  const apply = () => { grantDemo(subjectKind, subject.id, days, "Platform Ekibi"); toast(subject.name + " için " + days + " gün ücretsiz demo tanımlandı", { icon: "bolt" }); onClose(); };
  return (
    <Modal title="Ücretsiz demo tanımla" sub={subject.name} width={440} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply}><Icon name="bolt" size={16} />{days} gün tanımla</button></>}>
      <Field label="Demo süresi (gün)"><div className="seg" style={{ width: "100%" }}>{[7, 14, 30, 60].map((d) => <button key={d} className={days === d ? "on" : ""} style={{ flex: 1 }} onClick={() => setDays(d)}>{d} gün</button>)}</div></Field>
      <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Lisans bitiş tarihi {days} gün ileri alınır ve aboneye ücretsiz demo notu eklenir.</p>
    </Modal>
  );
}

/* koça görev atama */
function TaskModal({ orgId, coachId, coachName, onClose }) {
  const [title, setTitle] = uS(""); const [detail, setDetail] = uS(""); const [priority, setPriority] = uS("med"); const [dueDays, setDueDays] = uS(7);
  const [dueMode, setDueMode] = uS("preset"); const [dueDate, setDueDate] = uS("");
  const todayISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const customOk = dueMode === "preset" || (dueDate && new Date(dueDate).getTime() >= Date.now() - DAY);
  const apply = () => {
    if (!title.trim() || !customOk) return;
    const due = dueMode === "custom" && dueDate ? new Date(dueDate + "T23:59:59").getTime() : Date.now() + dueDays * DAY;
    assignTask(orgId, coachId, { title: title.trim(), detail: detail.trim(), due, priority }); toast(coachName + " için görev atandı", { icon: "checkCircle" }); onClose();
  };
  return (
    <Modal title="Görev ata" sub={coachName} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply} disabled={!title.trim() || !customOk}><Icon name="plus" size={16} />Görevi ata</button></>}>
      <Field label="Görev başlığı"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Risk altındaki öğrencilerle birebir" /></Field>
      <Field label="Açıklama"><textarea className="input" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detay (opsiyonel)" style={{ resize: "vertical" }} /></Field>
      <Field label="Öncelik"><div className="seg" style={{ width: "100%" }}>{[["low", "Düşük"], ["med", "Orta"], ["high", "Yüksek"]].map(([k, l]) => <button key={k} className={priority === k ? "on" : ""} style={{ flex: 1 }} onClick={() => setPriority(k)}>{l}</button>)}</div></Field>
      <Field label="Son tarih">
        <div className="seg" style={{ width: "100%", marginBottom: 10 }}>
          <button type="button" className={dueMode === "preset" ? "on" : ""} style={{ flex: 1 }} onClick={() => setDueMode("preset")}>Hazır süre</button>
          <button type="button" className={dueMode === "custom" ? "on" : ""} style={{ flex: 1 }} onClick={() => setDueMode("custom")}>Tarih seç</button>
        </div>
        {dueMode === "preset"
          ? <select className="input" value={dueDays} onChange={(e) => setDueDays(+e.target.value)}><option value={1}>Yarın</option><option value={3}>3 gün</option><option value={7}>1 hafta</option><option value={14}>2 hafta</option><option value={30}>1 ay</option></select>
          : <input className="input" type="date" value={dueDate} min={todayISO} onChange={(e) => setDueDate(e.target.value)} />}
      </Field>
    </Modal>
  );
}

/* kişi davet (yönetici / ekip) */
function InviteModal({ title, roleMode, onClose, onSubmit }) {
  const [name, setName] = uS(""); const [email, setEmail] = uS(""); const [value, setValue] = uS(roleMode === "orgManager" ? "manager" : "support");
  const ok = name.trim() && /.+@.+\..+/.test(email);
  return (
    <Modal title={title} width={460} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={() => { onSubmit({ name: name.trim(), email: email.trim(), value }); onClose(); }}><Icon name="send" size={16} />Davet gönder</button></>}>
      <Field label="Ad soyad"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Derya Soylu" /></Field>
      <Field label="E-posta"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kisi@ornek.com" /></Field>
      <Field label={roleMode === "orgManager" ? "Rol" : "Erişim"}>
        <div className="seg" style={{ width: "100%" }}>
          {roleMode === "orgManager"
            ? <><button className={value === "manager" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("manager")}>Yönetici</button><button className={value === "owner" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("owner")}>Sahip</button></>
            : <><button className={value === "support" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("support")}>Destek yetkilisi</button><button className={value === "full" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("full")}>Tam yetki</button></>}
        </div>
      </Field>
    </Modal>
  );
}

/* kampanya oluştur */
function CampaignModal({ onClose }) {
  const [name, setName] = uS(""); const [code, setCode] = uS(""); const [type, setType] = uS("percent"); const [value, setValue] = uS(20);
  const [audience, setAudience] = uS("all"); const [days, setDays] = uS(30); const [maxR, setMaxR] = uS(100); const [note, setNote] = uS("");
  const ok = name.trim() && code.trim();
  const apply = () => { createCampaign({ name: name.trim(), code: code.trim(), type, value: +value, audience, startsAt: Date.now(), endsAt: Date.now() + days * DAY, maxRedemptions: +maxR, note: note.trim() }); toast("Kampanya oluşturuldu", { icon: "bolt" }); onClose(); };
  return (
    <Modal title="Yeni kampanya / kod" onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={apply}><Icon name="plus" size={16} />Oluştur</button></>}>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Kampanya adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Yeni Dönem İndirimi" /></Field>
        <Field label="Promosyon kodu"><input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="YENIDONEM25" style={{ textTransform: "uppercase" }} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="İndirim türü"><div className="seg" style={{ width: "100%" }}>{[["percent", "% Yüzde"], ["amount", "₺ Tutar"], ["freeDays", "Gün"]].map(([k, l]) => <button key={k} className={type === k ? "on" : ""} style={{ flex: 1 }} onClick={() => setType(k)}>{l}</button>)}</div></Field>
        <Field label={type === "percent" ? "Yüzde (%)" : type === "amount" ? "Tutar (₺)" : "Ücretsiz gün"}><input className="input" type="number" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Hedef kitle"><select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}><option value="all">Tümü</option><option value="orgs">Kurumlar</option><option value="coaches">Bireysel koçlar</option></select></Field>
        <Field label="Geçerlilik (gün)"><input className="input" type="number" value={days} onChange={(e) => setDays(e.target.value)} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Maks. kullanım (0=sınırsız)"><input className="input" type="number" value={maxR} onChange={(e) => setMaxR(e.target.value)} /></Field>
        <Field label="Not"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Açıklama" /></Field>
      </div>
    </Modal>
  );
}

/* kampanyayı kullanıcıya ver */
function GrantModal({ campaign, onClose }) {
  const a = useAdmin();
  const [kind, setKind] = uS("org");
  const list = kind === "org" ? a.orgs : a.coaches;
  const [subjectId, setSubjectId] = uS(list[0] ? list[0].id : "");
  const apply = () => { if (!subjectId) return; grantCampaign(campaign.id, kind, subjectId); const t = list.find((x) => x.id === subjectId); toast((t ? t.name : "") + " kullanıcısına kod tanımlandı", { icon: "bolt" }); onClose(); };
  return (
    <Modal title="Kampanyayı uygula" sub={campaign.name} width={460} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply} disabled={!subjectId}><Icon name="check" size={16} />Kullanıcıya ver</button></>}>
      <Field label="Abone türü"><div className="seg" style={{ width: "100%" }}>
        <button className={kind === "org" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setKind("org"); setSubjectId(a.orgs[0] ? a.orgs[0].id : ""); }}>Kurum</button>
        <button className={kind === "coach" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setKind("coach"); setSubjectId(a.coaches[0] ? a.coaches[0].id : ""); }}>Bireysel koç</button>
      </div></Field>
      <Field label="Abone"><select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>{list.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
    </Modal>
  );
}

/* abone notu + demo + yenileme kartı */
function SubscriberNotes({ subjectKind, subject }) {
  const a = useAdmin();
  const [text, setText] = uS(""); const [renew, setRenew] = uS(false); const [demo, setDemo] = uS(false);
  const editable = a.viewerAccess === "full";
  const notes = licenseNotesFor(subjectKind, subject.id);
  const add = () => { if (!text.trim()) return; addLicenseNote(subjectKind, subject.id, text.trim(), "Platform Ekibi"); setText(""); toast("Not eklendi", { icon: "notebook" }); };
  return (
    <Section title="Lisans işlemleri" sub="Yenileme, ücretsiz demo ve abone notları"
      action={subject.giftedDemoUntil ? <span className="badge badge-info"><Icon name="bolt" size={13} />Demo · {fmtShort(subject.giftedDemoUntil)}</span> : null}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {editable ? (
          <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-sm" onClick={() => setRenew(true)}><Icon name="refresh" size={15} />Lisansı yenile</button>
            <button className="btn btn-light btn-sm" onClick={() => setDemo(true)}><Icon name="bolt" size={15} />Ücretsiz demo tanımla</button>
          </div>
        ) : <div className="alert-strip"><span className="as-ic"><Icon name="lock" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Salt görüntüleme</b><div className="muted" style={{ fontSize: 12 }}>Destek yetkilisi lisans işlemi yapamaz.</div></div></div>}
        <div>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 9 }}>Abone notları</div>
          {editable ? (
            <div className="row" style={{ gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
              <textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Bu abone için iç not ekle…" style={{ flex: 1, resize: "vertical" }} />
              <button className="btn btn-primary" onClick={add} disabled={!text.trim()} style={{ flexShrink: 0 }}><Icon name="plus" size={16} />Ekle</button>
            </div>
          ) : null}
          <div className="stack" style={{ gap: 9 }}>
            {notes.length === 0 ? <p className="muted" style={{ fontSize: 12.5 }}>Henüz not yok.</p> : notes.map((n) => (
              <div key={n.id} className="fb-card">
                <div className="fb-head"><span className="stat-icon tone-primary" style={{ width: 30, height: 30 }}><Icon name="notebook" size={15} /></span>
                  <div style={{ flex: 1 }}><b style={{ fontSize: 12.5 }}>{n.author}</b><div className="muted" style={{ fontSize: 11 }}>{fmtShort(n.date)}</div></div>
                  {editable ? <button className="icon-btn" style={{ width: 30, height: 30 }} title="Sil" onClick={() => { deleteLicenseNote(n.id); toast("Not silindi", { icon: "alert" }); }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button> : null}
                </div>
                <p className="fb-quote">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {renew ? <RenewModal subjectKind={subjectKind} subject={subject} onClose={() => setRenew(false)} /> : null}
      {demo ? <DemoModal subjectKind={subjectKind} subject={subject} onClose={() => setDemo(false)} /> : null}
    </Section>
  );
}

/* gerçek mesaj gönderme modalı (kurum/koç/müdür iletişimi) */
function MessageComposeModal({ toName, sub, presetSubject, presetChannel, by, onClose }) {
  const [channel, setChannel] = uS(presetChannel || "email");
  const [subject, setSubject] = uS(presetSubject || "");
  const [body, setBody] = uS("");
  const ok = body.trim().length > 1;
  const send = () => {
    if (!ok) return;
    if (typeof sendMessage === "function") sendMessage({ toName: toName || "", channel, subject: subject.trim(), body: body.trim(), by: by || "Platform Ekibi" });
    toast((toName ? toName + " · " : "") + "mesaj gönderildi", { icon: "send" });
    onClose();
  };
  const CH = [["email", "E-posta", "message"], ["sms", "SMS", "phone"], ["app", "Uygulama", "bell"]];
  return (
    <Modal title="Mesaj gönder" sub={sub || toName} width={520} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={send}><Icon name="send" size={16} />Gönder</button></>}>
      {toName ? <div className="row" style={{ gap: 11, padding: "2px 0 10px" }}><Avatar name={toName} size={38} /><div><b style={{ fontSize: 13.5 }}>{toName}</b>{sub ? <div className="muted" style={{ fontSize: 12 }}>{sub}</div> : null}</div></div> : null}
      <Field label="Kanal"><div className="seg" style={{ width: "100%" }}>{CH.map(([k, l, ic]) => <button key={k} type="button" className={channel === k ? "on" : ""} style={{ flex: 1 }} onClick={() => setChannel(k)}><Icon name={ic} size={15} />{l}</button>)}</div></Field>
      {channel !== "sms" ? <Field label="Konu"><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Konu (opsiyonel)" /></Field> : null}
      <Field label="Mesaj"><textarea className="input" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Mesajınızı yazın…" style={{ resize: "vertical" }} /></Field>
    </Modal>
  );
}

/* ticket konuşma dizisi */
function TicketThread({ ticket, onClose }) {
  const [reply, setReply] = uS("");
  const send = () => { if (!reply.trim()) return; replyTicket(ticket.id, reply.trim(), "Destek Ekibi"); setReply(""); toast("Yanıt gönderildi", { icon: "send" }); };
  return (
    <Modal title={ticket.subj} sub={ticket.id + " · " + ticket.org + " · " + ticket.priority + " öncelik"} width={620} onClose={onClose}
      foot={<>
        {ticket.status === "resolved"
          ? <button className="btn btn-light" onClick={() => { setTicketStatus(ticket.id, "open"); toast(ticket.id + " yeniden açıldı", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Yeniden aç</button>
          : <button className="btn btn-light" onClick={() => { setTicketStatus(ticket.id, "resolved"); toast(ticket.id + " çözümlendi", { icon: "checkCircle" }); }}><Icon name="checkCircle" size={16} />Çözümlendi işaretle</button>}
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={send} disabled={!reply.trim()}><Icon name="send" size={16} />Yanıtla</button>
      </>}>
      <div className="row" style={{ gap: 8, alignItems: "center" }}><TicketStatusBadge status={ticket.status} /><span className="muted" style={{ fontSize: 12 }}>{ticket.time} açıldı</span></div>
      <div className="stack" style={{ gap: 12, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
        {ticket.messages.map((m) => {
          const agent = m.role === "agent";
          return (
            <div key={m.id} className="row" style={{ gap: 10, alignItems: "flex-start", flexDirection: agent ? "row-reverse" : "row" }}>
              <Avatar name={m.author} size={32} />
              <div style={{ maxWidth: "78%" }}>
                <div style={{ background: agent ? "var(--primary)" : "var(--surface-3)", color: agent ? "#fff" : "var(--text)", padding: "10px 14px", borderRadius: agent ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                <div className="muted" style={{ fontSize: 10.5, marginTop: 4, textAlign: agent ? "right" : "left" }}>{m.author} · {fmtShort(m.date)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <textarea className="input" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Yanıtınızı yazın…" style={{ resize: "vertical" }} />
    </Modal>
  );
}

Object.assign(window, { StarRow, PriorityBadge, TicketStatusBadge, Modal, RenewModal, DemoModal, TaskModal, InviteModal, CampaignModal, GrantModal, SubscriberNotes, TicketThread });
