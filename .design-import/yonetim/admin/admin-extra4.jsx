/* ============================================================
   KURUM + KOÇ yeni/override ekranlar + SALicenses override
   ============================================================ */

function visibleOrgCoaches(o) { return orgCoaches(o).filter((c) => !isCoachRemoved(c.id)); }

/* koç davet modalı */
function CoachInviteModal({ org, onClose }) {
  const [name, setName] = uS(""); const [email, setEmail] = uS(""); const [branch, setBranch] = uS(org.branches[0] ? org.branches[0].id : "");
  const ok = name.trim() && /.+@.+\..+/.test(email);
  return (
    <Modal title="Koç davet et" sub={org.name + " · koça e-posta ile davet bağlantısı gönderilir"} width={460} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={() => { toast(name.trim() + " için koç daveti gönderildi", { icon: "send" }); onClose(); }}><Icon name="send" size={16} />Davet gönder</button></>}>
      <Field label="Ad soyad"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Aslı Korkmaz" /></Field>
      <Field label="E-posta"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="koc@ornek.com" /></Field>
      {org.type === "franchise" ? <Field label="Şube"><select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>{org.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field> : null}
    </Modal>
  );
}

/* öğrenci ekle/davet modalı */
function StudentInviteModal({ org, onClose }) {
  const branches = org.branches;
  const [name, setName] = uS(""); const [contact, setContact] = uS(""); const [branch, setBranch] = uS(branches[0] ? branches[0].id : "");
  const coaches = (typeof orgCoaches === "function" ? orgCoaches(org) : []).filter((c) => org.type !== "franchise" || c.branchId === branch);
  const [coach, setCoach] = uS("");
  const ok = name.trim() && contact.trim();
  return (
    <Modal title="Öğrenci ekle" sub={org.name + " · öğrenci/veliye davet gönderilir"} width={460} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={() => { toast(name.trim() + " için kayıt daveti gönderildi", { icon: "send" }); onClose(); }}><Icon name="send" size={16} />Davet gönder</button></>}>
      <Field label="Ad soyad"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Elif Yıldız" /></Field>
      <Field label="Veli e-posta / telefon"><input className="input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="veli@ornek.com / 05XX..." /></Field>
      {org.type === "franchise" ? <Field label="Şube"><select className="input" value={branch} onChange={(e) => { setBranch(e.target.value); setCoach(""); }}>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field> : null}
      <Field label="Atanacak koç (opsiyonel)"><select className="input" value={coach} onChange={(e) => setCoach(e.target.value)}><option value="">Sonra ata</option>{coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    </Modal>
  );
}

/* ===== override: SALicenses (koç satırı → koç profili) ===== */
function SALicenses() {
  const a = useAdmin();
  const [tab, setTab] = uS("all");
  const rows = [
    ...a.orgs.map((o) => ({ kind: "org", id: o.id, name: o.name, sub: o.type === "franchise" ? "Franchise" : "Tek kurum", tone: o.tone, plan: orgPlanById(o.planId).name, status: o.status, renewsAt: o.renewsAt, fee: o.feeMonthly, seats: o.seats, gifted: !!o.giftedDemoUntil })),
    ...a.coaches.map((c) => ({ kind: "coach", id: c.id, name: c.name, sub: "Bireysel koç", plan: coachPlanById(c.planId).name, status: c.status, renewsAt: c.renewsAt, fee: c.feeMonthly, seats: c.seats, gifted: !!c.giftedDemoUntil })),
  ];
  const soon = (r) => r.status === "expiring" || (daysLeft(r.renewsAt) >= 0 && daysLeft(r.renewsAt) <= 14 && r.status !== "overdue");
  const counts = { all: rows.length, expiring: rows.filter(soon).length, overdue: rows.filter((r) => r.status === "overdue").length, suspended: rows.filter((r) => r.status === "suspended" || r.status === "canceled").length };
  const filtered = rows.filter((r) => tab === "all" ? true : tab === "expiring" ? soon(r) : tab === "overdue" ? r.status === "overdue" : (r.status === "suspended" || r.status === "canceled")).sort((x, y) => x.renewsAt - y.renewsAt);
  const TABS = [{ k: "all", label: "Tüm lisanslar", count: counts.all }, { k: "expiring", label: "Süresi doluyor", count: counts.expiring, icon: "clock" }, { k: "overdue", label: "Ödeme gecikti", count: counts.overdue, icon: "alert" }, { k: "suspended", label: "Pasif", count: counts.suspended }];
  const open = (r) => r.kind === "org" ? (nav().openOrg && nav().openOrg(r.id)) : (nav().openCoach && nav().openCoach(r.id));
  return (
    <div className="stack rise">
      <PageHead title="Lisans Takibi" sub="Tüm kurum, franchise ve bireysel koç lisanslarının durumu — satıra tıklayarak abone profiline gidin"
        actions={<button className="btn btn-light" onClick={() => downloadCSV("lisans-takip.csv", [["Abone", "Tür", "Plan", "Durum", "Yenileme", "Ücret/ay"], ...rows.map((r) => [r.name, r.sub, r.plan, statusMeta(r.status).label, fmtShort(r.renewsAt), r.fee])])}><Icon name="download" size={16} />CSV indir</button>} />
      <div className="grid g-4">
        <StatCard icon="shield" tone="success" value={rows.filter((r) => r.status === "active").length} label="Aktif lisans" />
        <StatCard icon="clock" tone="warning" value={counts.expiring} label="14 gün içinde doluyor" />
        <StatCard icon="alert" tone="danger" value={counts.overdue} label="Ödeme gecikti" />
        <StatCard icon="refresh" tone="info" value={rows.filter((r) => r.status === "trial").length} label="Deneme sürümünde" />
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <Section><div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 800 }}>
          <thead><tr><th>Abone</th><th>Plan</th><th>Kapasite</th><th>Durum</th><th>Yenileme</th><th style={{ textAlign: "right" }}>Ücret</th><th></th></tr></thead>
          <tbody>{filtered.map((r) => { const dl = daysLeft(r.renewsAt); const unl = r.seats.total >= 999; return (
            <tr key={r.kind + r.id} style={{ cursor: "pointer" }} onClick={() => open(r)}>
              <td><div className="name">{r.kind === "org" ? <OrgLogo name={r.name} tone={r.tone} size={34} /> : <Avatar name={r.name} size={34} />}<div><b>{r.name}{r.gifted ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Demo</span> : null}</b><span>{r.sub}</span></div></div></td>
              <td><span className="badge badge-muted" style={{ height: 22 }}>{r.plan}</span></td>
              <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{r.seats.used}<span className="muted">/{unl ? "∞" : r.seats.total}</span></span></td>
              <td><StatusBadge status={r.status} sm /></td>
              <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl <= 14 ? "var(--warning)" : "var(--text-2)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</span><div className="muted tnum" style={{ fontSize: 11 }}>{fmtShort(r.renewsAt)}</div></td>
              <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>{TRY(r.fee)}</span></td>
              <td style={{ textAlign: "right" }}><span className="link-btn">Profil<Icon name="chevronRight" size={15} /></span></td>
            </tr>
          ); })}</tbody>
        </table>
      </div></Section>
      {filtered.length === 0 ? <EmptyState icon="shield" title="Bu kategoride lisans yok" /> : null}
    </div>
  );
}

/* ===== Kurum Yöneticileri (çoklu) ===== */
function KurumManagers() {
  const a = useAdmin();
  const o = getActiveOrg();
  const [inviteOpen, setInviteOpen] = uS(false);
  const [removeFor, setRemoveFor] = uS(null);
  const owners = o.managers.filter((m) => m.role === "owner").length;
  return (
    <div className="stack rise">
      <PageHead title="Yöneticiler" sub={`${o.name} · ${o.managers.length} yönetici · tek kuruma birden fazla yönetici atayabilirsiniz`}
        actions={<button className="btn btn-primary" onClick={() => setInviteOpen(true)}><Icon name="plus" size={16} />Yönetici davet et</button>} />
      <div className="grid g-3">
        <StatCard icon="users" tone="primary" value={o.managers.length} label="Toplam yönetici" />
        <StatCard icon="shield" tone="warning" value={owners} label="Sahip yetkisi" />
        <StatCard icon="checkCircle" tone="success" value={o.managers.filter((m) => m.status === "active").length} label="Aktif" />
      </div>
      <Section title="Kurum yöneticileri" sub="Sahip: lisans + faturalama dahil tüm yetkiler · Yönetici: operasyonel ekranlar">
        <div className="card-body" style={{ padding: 0 }}>{o.managers.map((m) => (
          <div key={m.id} className="list-row">
            <Avatar name={m.name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5, display: "block" }}>{m.name}{m.status === "invited" ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Davet bekliyor</span> : null}</b><span className="muted" style={{ fontSize: 12 }}>{m.email} · {fmtShort(m.addedAt)} eklendi</span></div>
            <select className="input" style={{ width: 140, height: 34, fontSize: 12.5 }} value={m.role} onChange={(e) => { setOrgManagerRole(o.id, m.id, e.target.value); toast("Rol güncellendi", { icon: "shield" }); }}><option value="owner">Sahip</option><option value="manager">Yönetici</option></select>
            <button className="icon-btn" style={{ width: 34, height: 34, color: "var(--danger)" }} title="Kaldır" disabled={m.role === "owner" && owners <= 1} onClick={() => setRemoveFor(m)}><Icon name="logout" size={16} /></button>
          </div>
        ))}</div>
      </Section>
      <div className="alert-strip"><span className="as-ic"><Icon name="shield" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Rol yetkileri</b><div className="muted" style={{ fontSize: 12 }}><b>Sahip</b>: lisans, faturalama, yönetici ekleme dahil her şey. <b>Yönetici</b>: koç, öğrenci, şube, rapor ekranları.</div></div></div>
      {inviteOpen ? <InviteModal title="Kuruma yönetici davet et" roleMode="orgManager" onClose={() => setInviteOpen(false)} onSubmit={({ name, email, value }) => { inviteOrgManager(o.id, { name, email, role: value }); toast("Yönetici davet edildi", { icon: "send" }); }} /> : null}
      <ConfirmModal open={!!removeFor} title="Yöneticiyi kaldır?" tone="danger" body={(removeFor ? removeFor.name : "") + " bu kurumun yönetici listesinden çıkarılacak."} confirmLabel="Kaldır" onConfirm={() => { if (removeFor) { removeOrgManager(o.id, removeFor.id); toast(removeFor.name + " kaldırıldı", { icon: "alert" }); } }} onClose={() => setRemoveFor(null)} />
    </div>
  );
}

/* ===== override: KurumCoaches (görev ata · çıkar · detay) ===== */
function KurumCoaches() {
  const o = getActiveOrg();
  const a = useAdmin();
  const coaches = visibleOrgCoaches(o);
  const [q, setQ] = uS(""); const [branch, setBranch] = uS("all");
  const [assignFor, setAssignFor] = uS(null); const [removeFor, setRemoveFor] = uS(null); const [inviteOpen, setInviteOpen] = uS(false);
  const list = coaches.filter((c) => (branch === "all" || c.branchId === branch) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="stack rise">
      <PageHead title="Koçlar" sub={`${coaches.length} koç · ${o.coaches.total} kapasite`}
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("koclar.csv", [["Koç", "Şube", "Öğrenci", "Puan", "Doluluk"], ...coaches.map((c) => [c.name, c.branch, c.students, c.rating, c.load + "%"])])}><Icon name="download" size={16} />Dışa aktar</button><button className="btn btn-primary" onClick={() => setInviteOpen(true)}><Icon name="plus" size={16} />Koç davet et</button></>} />
      <div className="grid g-3">
        <StatCard icon="users" tone="primary" value={coaches.length} label="Toplam koç" />
        <StatCard icon="star" tone="warning" value={(coaches.reduce((s, c) => s + parseFloat(c.rating), 0) / Math.max(1, coaches.length)).toFixed(1)} label="Ortalama puan" />
        <StatCard icon="cap" tone="success" value={Math.round(coaches.reduce((s, c) => s + c.students, 0) / Math.max(1, coaches.length))} label="Koç başına öğrenci" />
      </div>
      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        {o.type === "franchise" ? <div className="seg" style={{ flexWrap: "wrap" }}><button className={branch === "all" ? "on" : ""} onClick={() => setBranch("all")}>Tüm şubeler</button>{o.branches.map((b) => <button key={b.id} className={branch === b.id ? "on" : ""} onClick={() => setBranch(b.id)}>{b.name.replace(" Şubesi", "")}</button>)}</div> : <div />}
        <div className="searchbox" style={{ maxWidth: 260 }}><Icon name="search" size={17} /><input placeholder="Koç ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <Section><div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 820 }}>
          <thead><tr><th>Koç</th>{o.type === "franchise" ? <th>Şube</th> : null}<th>Öğrenci</th><th>Puan</th><th>Doluluk</th><th>Durum</th><th style={{ textAlign: "right" }}>İşlem</th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id}>
              <td><div className="name" style={{ cursor: "pointer" }} onClick={() => nav().openKCoach && nav().openKCoach(c.id)}><Avatar name={c.name} size={34} /><div><b>{c.name}</b><span>Koç</span></div></div></td>
              {o.type === "franchise" ? <td><span className="muted" style={{ fontSize: 12.5 }}>{c.branch}</span></td> : null}
              <td><span className="tnum" style={{ fontWeight: 700 }}>{c.students}</span></td>
              <td><span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span></td>
              <td style={{ minWidth: 120 }}><div className="meter-bar" style={{ width: 100 }}><span style={{ width: c.load + "%", background: c.load > 90 ? "var(--danger)" : c.load > 75 ? "var(--warning)" : "var(--success)" }} /></div></td>
              <td><StatusBadge status={c.status} sm /></td>
              <td style={{ textAlign: "right" }}><div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                <button className="btn btn-light btn-sm" onClick={() => setAssignFor(c)}><Icon name="flag" size={14} />Görev ata</button>
                <button className="icon-btn" style={{ width: 32, height: 32 }} title="Detay" onClick={() => nav().openKCoach && nav().openKCoach(c.id)}><Icon name="chevronRight" size={16} /></button>
                <button className="icon-btn" style={{ width: 32, height: 32, color: "var(--danger)" }} title="Sistemden çıkar" onClick={() => setRemoveFor(c)}><Icon name="logout" size={16} /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div></Section>
      {list.length === 0 ? <EmptyState icon="users" title="Koç bulunamadı" /> : null}
      {a.removedCoachIds.length > 0 ? <div className="alert-strip"><span className="as-ic"><Icon name="logout" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{a.removedCoachIds.length} koç sistemden çıkarıldı</b><div className="muted" style={{ fontSize: 12 }}>Çıkarılan koçlar listede görünmez.</div></div><button className="btn btn-light btn-sm" onClick={() => { a.removedCoachIds.slice().forEach((id) => restoreOrgCoach(id)); toast("Çıkarılan koçlar geri alındı", { icon: "refresh" }); }}>Tümünü geri al</button></div> : null}
      {assignFor ? <TaskModal orgId={o.id} coachId={assignFor.id} coachName={assignFor.name} onClose={() => setAssignFor(null)} /> : null}
      {inviteOpen ? <CoachInviteModal org={o} onClose={() => setInviteOpen(false)} /> : null}
      <ConfirmModal open={!!removeFor} title="Koçu sistemden çıkar?" tone="danger" body={(removeFor ? removeFor.name : "") + " kurumdan çıkarılacak ve listede görünmeyecek. İstediğin zaman geri alabilirsin."} confirmLabel="Çıkar" onConfirm={() => { if (removeFor) { removeOrgCoach(removeFor.id); toast(removeFor.name + " sistemden çıkarıldı", { icon: "alert", tone: "danger" }); } }} onClose={() => setRemoveFor(null)} />
    </div>
  );
}

/* ===== Kurum Koç detay/rapor (geri bildirim + görevler) ===== */
function KurumCoachDetail({ coachId, back }) {
  const a = useAdmin();
  const o = getActiveOrg();
  const coach = visibleOrgCoaches(o).find((c) => c.id === coachId);
  const [assignOpen, setAssignOpen] = uS(false); const [removeOpen, setRemoveOpen] = uS(false);
  if (!coach) return <div className="stack rise"><button className="link-btn" onClick={back}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Koçlara dön</button><EmptyState icon="users" title="Koç bulunamadı veya çıkarıldı" /></div>;
  const feedback = coachFeedback(coachId); const tasks = coachTasks(coachId); const avg = coachFbAvg(feedback);
  const students = orgStudents(o).filter((s) => s.coach === coach.name);
  const openTasks = tasks.filter((t) => t.status === "open").length;
  const avgNet = students.length ? Math.round(students.reduce((s, x) => s + x.net, 0) / students.length) : 0;
  return (
    <div className="stack rise">
      <button className="link-btn" onClick={back} style={{ alignSelf: "flex-start" }}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Koçlara dön</button>
      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <Avatar name={coach.name} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}><div className="row" style={{ gap: 9 }}><h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{coach.name}</h1><StatusBadge status={coach.status} /></div><p className="muted" style={{ fontSize: 13 }}>{coach.branch} · {coach.students} öğrenci · doluluk %{coach.load}</p></div>
        <div className="row" style={{ gap: 9 }}><button className="btn btn-primary" onClick={() => setAssignOpen(true)}><Icon name="flag" size={16} />Görev ata</button><button className="btn btn-ghost-danger" onClick={() => setRemoveOpen(true)}><Icon name="logout" size={16} />Sistemden çıkar</button></div>
      </div>
      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={coach.students} label="Atanan öğrenci" />
        <StatCard icon="star" tone="warning" value={avg || coach.rating} label="Geri bildirim puanı" />
        <StatCard icon="target" tone="success" value={avgNet || "—"} label="Öğrenci ort. net" />
        <StatCard icon="flag" tone="info" value={openTasks} label="Açık görev" />
      </div>
      <div className="grid col-main">
        <div className="stack">
          <Section title="Öğrenci & veli geri bildirimleri" sub={`${feedback.length} değerlendirme · ortalama ${avg || "—"}`} action={<span className="badge badge-warning" style={{ height: 24 }}><Icon name="star" size={13} fill />{avg || "—"}</span>}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {feedback.length === 0 ? <p className="muted" style={{ fontSize: 12.5 }}>Henüz geri bildirim yok.</p> : feedback.map((f) => (
                <div key={f.id} className="fb-card"><div className="fb-head"><Avatar name={f.author} size={32} /><div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 12.5 }}>{f.author}</b><div className="muted" style={{ fontSize: 11 }}>{f.role === "parent" ? "Veli" : "Öğrenci"} · {fmtShort(f.date)}</div></div><StarRow value={f.rating} /></div><p className="fb-quote">“{f.comment}”</p></div>
              ))}
            </div>
          </Section>
          <Section title="Atanan öğrenciler" sub={students.length + " öğrenci"}>
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              {students.length === 0 ? <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Bu koça atanmış öğrenci bulunamadı.</p> : (
                <table className="tbl" style={{ minWidth: 480 }}><thead><tr><th>Öğrenci</th><th>Sınıf</th><th>Net</th><th>Devam</th></tr></thead>
                  <tbody>{students.slice(0, 12).map((s) => <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => nav().openStudent && nav().openStudent(s.id)}><td><div className="name"><Avatar name={s.name} size={30} /><div><b>{s.name}{s.status === "risk" ? <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Risk</span> : null}</b></div></div></td><td><span className="muted" style={{ fontSize: 12.5 }}>{s.grade}</span></td><td><span className="tnum" style={{ fontWeight: 700 }}>{s.net}</span></td><td><span className="tnum">%{s.attend}</span></td></tr>)}</tbody>
                </table>
              )}
            </div>
          </Section>
        </div>
        <div className="stack">
          <Section title="Görevler" sub={`${openTasks} açık · ${tasks.length} toplam`} action={<button className="btn btn-light btn-sm" onClick={() => setAssignOpen(true)}><Icon name="plus" size={15} />Görev</button>}>
            <div className="card-body" style={{ padding: 0 }}>
              {tasks.length === 0 ? <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Henüz görev atanmadı.</p> : tasks.map((t) => (
                <div key={t.id} className={`task-row${t.status === "done" ? " done" : ""}`}>
                  <button className={`task-check${t.status === "done" ? " on" : ""}`} onClick={() => completeTask(t.id)} aria-label="Tamamla"><Icon name="check" size={13} /></button>
                  <div style={{ flex: 1, minWidth: 0 }}><div className="row" style={{ gap: 8 }}><span className="task-title">{t.title}</span><PriorityBadge priority={t.priority} /></div>{t.detail ? <div className="task-detail">{t.detail}</div> : null}<div className="muted" style={{ fontSize: 11, marginTop: 3 }}>Son tarih: {fmtShort(t.due)}</div></div>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} title="Sil" onClick={() => { deleteTask(t.id); toast("Görev silindi", { icon: "alert" }); }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Performans"><div className="card-body"><RankBars items={[{ l: "Doluluk", v: coach.load }, { l: "Memnuniyet", v: Math.round((avg || parseFloat(coach.rating)) * 20) }, { l: "Görev tamamlama", v: tasks.length ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0 }]} max={100} fmt={(v) => "%" + v} color={o.tone} /></div></Section>
        </div>
      </div>
      {assignOpen ? <TaskModal orgId={o.id} coachId={coach.id} coachName={coach.name} onClose={() => setAssignOpen(false)} /> : null}
      <ConfirmModal open={removeOpen} title="Koçu sistemden çıkar?" tone="danger" body={coach.name + " kurumdan çıkarılacak. Koçlar ekranından geri alabilirsin."} confirmLabel="Çıkar" onConfirm={() => { removeOrgCoach(coach.id); toast(coach.name + " sistemden çıkarıldı", { icon: "alert", tone: "danger" }); back(); }} onClose={() => setRemoveOpen(false)} />
    </div>
  );
}

/* ===== Kurum Öğrenci detay/rapor ===== */
function KurumStudentDetail({ studentId, back }) {
  const o = getActiveOrg();
  const student = orgStudents(o).find((s) => s.id === studentId);
  if (!student) return <div className="stack rise"><button className="link-btn" onClick={back}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Öğrencilere dön</button><EmptyState icon="cap" title="Öğrenci bulunamadı" /></div>;
  const h = _hash(student.id);
  const trend = Array.from({ length: 10 }, (_, i) => Math.round(student.net * (0.74 + i * 0.03) + ((h >> i) % 7)));
  const subjects = [{ l: "Türkçe", v: 28 + (h % 12) }, { l: "Matematik", v: 22 + ((h >> 2) % 16) }, { l: "Fen", v: 12 + ((h >> 3) % 8) }, { l: "Sosyal", v: 11 + ((h >> 4) % 8) }];
  return (
    <div className="stack rise">
      <button className="link-btn" onClick={back} style={{ alignSelf: "flex-start" }}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Öğrencilere dön</button>
      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <Avatar name={student.name} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}><div className="row" style={{ gap: 9 }}><h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{student.name}</h1>{student.status === "risk" ? <span className="badge badge-danger" style={{ height: 22 }}><Icon name="alert" size={12} />Risk altında</span> : <span className="badge badge-success" style={{ height: 22 }}><span className="dot-live" />Aktif</span>}</div><p className="muted" style={{ fontSize: 13 }}>{student.grade} · {student.branch} · Koç: {student.coach}</p></div>
      </div>
      <div className="grid g-4">
        <StatCard icon="target" tone="primary" value={student.net} label="Güncel net (TYT)" delta="+6,2" />
        <StatCard icon="checkCircle" tone="info" value={"%" + student.attend} label="Devam oranı" />
        <StatCard icon="trend" tone="success" value="+%14" label="3 aylık gelişim" />
        <StatCard icon="award" tone="warning" value={student.net >= 110 ? "Yüksek" : "Orta"} label="Başarı seviyesi" />
      </div>
      <div className="grid col-main">
        <Section title="Net gelişimi" sub="Son 10 deneme" action={<span className="badge badge-success"><Icon name="trend" size={13} />Yükseliş</span>}><div className="card-body"><Sparkline data={trend} w={640} h={130} color={o.tone} /></div></Section>
        <Section title="Branş bazında net"><div className="card-body"><RankBars items={subjects} max={40} color={o.tone} /></div></Section>
      </div>
      <Section title="Öğrenci bilgileri"><div className="card-body" style={{ padding: 0 }}>
        {[["Sınıf", student.grade], ["Şube", student.branch], ["Koç", student.coach], ["Devam oranı", "%" + student.attend], ["Durum", student.status === "risk" ? "Risk altında" : "Aktif"]].map(([k, v]) => <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>{k}</span><b style={{ fontSize: 13 }}>{v}</b></div>)}
      </div></Section>
    </div>
  );
}

/* ===== override: KurumStudents (öğrenci detayına git) ===== */
function KurumStudents() {
  const o = getActiveOrg();
  const students = orgStudents(o);
  const [q, setQ] = uS(""); const [branch, setBranch] = uS("all"); const [page, setPage] = uS(0); const [addOpen, setAddOpen] = uS(false);
  const per = 12;
  const bn = (o.branches.find((b) => b.id === branch) || {}).name;
  const filtered = students.filter((s) => (branch === "all" || s.branch === bn) && s.name.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.ceil(filtered.length / per);
  const shown = filtered.slice(page * per, page * per + per);
  const risk = students.filter((s) => s.status === "risk").length;
  return (
    <div className="stack rise">
      <PageHead title="Öğrenciler" sub={`${students.length} öğrenci · ${o.seats.total - students.length} koltuk boş`}
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("ogrenciler.csv", [["Öğrenci", "Sınıf", "Şube", "Koç", "Net", "Devam"], ...students.map((s) => [s.name, s.grade, s.branch, s.coach, s.net, s.attend + "%"])])}><Icon name="download" size={16} />Dışa aktar</button><button className="btn btn-primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={16} />Öğrenci ekle</button></>} />
      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={students.length} label="Toplam öğrenci" />
        <StatCard icon="target" tone="success" value={Math.round(students.reduce((s, x) => s + x.net, 0) / Math.max(1, students.length))} label="Ortalama net" />
        <StatCard icon="checkCircle" tone="info" value={"%" + Math.round(students.reduce((s, x) => s + x.attend, 0) / Math.max(1, students.length))} label="Ortalama devam" />
        <StatCard icon="alert" tone="danger" value={risk} label="Risk altında" />
      </div>
      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        {o.type === "franchise" ? <div className="seg" style={{ flexWrap: "wrap" }}><button className={branch === "all" ? "on" : ""} onClick={() => { setBranch("all"); setPage(0); }}>Tümü</button>{o.branches.map((b) => <button key={b.id} className={branch === b.id ? "on" : ""} onClick={() => { setBranch(b.id); setPage(0); }}>{b.name.replace(" Şubesi", "")}</button>)}</div> : <div />}
        <div className="searchbox" style={{ maxWidth: 260 }}><Icon name="search" size={17} /><input placeholder="Öğrenci ara..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
      </div>
      <Section>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 760 }}>
            <thead><tr><th>Öğrenci</th><th>Sınıf</th>{o.type === "franchise" ? <th>Şube</th> : null}<th>Koç</th><th>Net</th><th>Devam</th><th></th></tr></thead>
            <tbody>{shown.map((s) => (
              <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => nav().openStudent && nav().openStudent(s.id)}>
                <td><div className="name"><Avatar name={s.name} size={34} /><div><b>{s.name}{s.status === "risk" ? <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Risk</span> : null}</b><span>Öğrenci</span></div></div></td>
                <td><span className="muted" style={{ fontSize: 12.5 }}>{s.grade}</span></td>
                {o.type === "franchise" ? <td><span className="muted" style={{ fontSize: 12.5 }}>{s.branch.replace(" Şubesi", "")}</span></td> : null}
                <td><span style={{ fontSize: 12.5 }}>{s.coach}</span></td>
                <td><span className="tnum" style={{ fontWeight: 700 }}>{s.net}</span></td>
                <td><span className="tnum" style={{ color: s.attend < 80 ? "var(--warning)" : "var(--text-2)" }}>%{s.attend}</span></td>
                <td style={{ textAlign: "right" }}><Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {pages > 1 ? <div className="between" style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}><span className="muted" style={{ fontSize: 12.5 }}>{filtered.length} öğrenci · sayfa {page + 1}/{pages}</span><div className="row" style={{ gap: 6 }}><button className="btn btn-light btn-sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Önceki</button><button className="btn btn-light btn-sm" disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>Sonraki</button></div></div> : null}
      </Section>
      {addOpen ? <StudentInviteModal org={o} onClose={() => setAddOpen(false)} /> : null}
    </div>
  );
}

/* ===== override: KurumLicense (detaylı yenileme) ===== */
function KurumLicense() {
  const o = getActiveOrg();
  const p = orgPlanById(o.planId);
  const [confirm, setConfirm] = uS(null); const [renewOpen, setRenewOpen] = uS(false);
  return (
    <div className="stack rise">
      <PageHead title="Lisans & Kapasite" sub="Planınızı, koltuk kullanımınızı ve modüllerinizi görüntüleyin" />
      <LicenseHero org={o} />
      <div className="grid col-main">
        <div className="stack">
          <Section title="Kapasite kullanımı"><div className="card-body" style={{ gap: 18, display: "flex", flexDirection: "column" }}>
            <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
            <Meter icon="users" label="Koç" used={o.coaches.used} total={o.coaches.total} />
            {o.type === "franchise" ? <Meter icon="building" label="Şube" used={o.branches.length} total={p.branches} /> : null}
            {(o.seats.used / o.seats.total) > 0.85 ? <div className="alert-strip warn"><span className="as-ic"><Icon name="alert" size={18} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Koltuk kapasiteniz doluyor</b><div className="muted" style={{ fontSize: 12 }}>Kalan {o.seats.total - o.seats.used} koltuk.</div></div><button className="btn btn-sm btn-primary" onClick={() => { addOrgSeats(o.id, 25); toast("25 öğrenci koltuğu eklendi", { icon: "plus" }); }}>+25 koltuk</button></div> : null}
          </div></Section>
          <Section title="Açık modüller" sub="Lisansınıza dahil özellikler"><div className="card-body"><ModuleGrid modules={o.modules} readOnly /></div></Section>
        </div>
        <div className="stack">
          <Section title="Plan & yenileme"><div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Mevcut plan</span><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><b style={{ fontSize: 13.5 }}>{p.name}</b></span></div>
            <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Faturalama</span><b style={{ fontSize: 13.5 }}>{o.cycle === "annual" ? "Yıllık" : "Aylık"}</b></div>
            <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Aylık ücret</span><b className="tnum" style={{ fontSize: 13.5 }}>{TRY(o.feeMonthly)}</b></div>
            <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span><b className="tnum" style={{ fontSize: 13.5 }}>{fmtShort(o.renewsAt)}</b></div>
            {o.giftedDemoUntil ? <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Ücretsiz demo</span><span className="badge badge-info" style={{ height: 22 }}>{fmtShort(o.giftedDemoUntil)}</span></div> : null}
            <hr className="hr" style={{ margin: "4px 0" }} />
            <button className="btn btn-primary" onClick={() => setRenewOpen(true)}><Icon name="refresh" size={16} />Lisansı yenile / uzat</button>
            <button className="btn btn-light" onClick={() => setConfirm("upgrade")}><Icon name="arrowUp" size={16} />Planı yükselt</button>
          </div></Section>
          <Section title="Üst plan: Franchise"><div className="card-body" style={{ gap: 10, display: "flex", flexDirection: "column" }}><p className="muted" style={{ fontSize: 12.5 }}>Daha fazla şube, koç ve öğrenci koltuğu + AI Koç ve Envanter modülleri.</p><RankBars items={[{ l: "Öğrenci koltuğu", v: 400 }, { l: "Koç", v: 40 }, { l: "Şube", v: 8 }]} max={400} color="var(--warning)" /></div></Section>
        </div>
      </div>
      {renewOpen ? <RenewModal subjectKind="org" subject={o} onClose={() => setRenewOpen(false)} /> : null}
      <ConfirmModal open={confirm === "upgrade"} title="Franchise planına yükselt?" tone="primary" body={`${o.name} için kapasite Franchise seviyesine çıkacak (400 koltuk, 40 koç, 8 şube). Yeni ücret ${TRY(24900)}/ay.`} confirmLabel="Yükselt" onConfirm={() => { changeOrgPlan(o.id, "franchise"); toast("Franchise planına yükseltildi", { icon: "checkCircle" }); }} onClose={() => setConfirm(null)} />
    </div>
  );
}

/* ===== Koç — Geri Bildirimlerim (kuruma bağlı koç) ===== */
function CoachFeedback() {
  const a = useAdmin();
  const o = getActiveOrg();
  const coachId = (visibleOrgCoaches(o)[0] || {}).id || "";
  const me = visibleOrgCoaches(o).find((c) => c.id === coachId);
  const feedback = coachFeedback(coachId); const tasks = coachTasks(coachId); const avg = coachFbAvg(feedback);
  const fromStudents = feedback.filter((f) => f.role === "student").length;
  const fromParents = feedback.filter((f) => f.role === "parent").length;
  const openTasks = tasks.filter((t) => t.status === "open").length;
  return (
    <div className="stack rise">
      <PageHead title="Geri Bildirimlerim" sub={`${o.name} · öğrenci ve velilerinden gelen değerlendirmeler`} actions={<span className="badge badge-warning" style={{ height: 28 }}><Icon name="star" size={15} fill />{avg || "—"} ortalama</span>} />
      <div className="grid g-4">
        <StatCard icon="star" tone="warning" value={avg || "—"} label="Ortalama puan" />
        <StatCard icon="heart" tone="primary" value={feedback.length} label="Toplam değerlendirme" />
        <StatCard icon="cap" tone="info" value={fromStudents} label="Öğrenci geri bildirimi" />
        <StatCard icon="users" tone="success" value={fromParents} label="Veli geri bildirimi" />
      </div>
      <div className="grid col-main">
        <Section title="Öğrenci & veli geri bildirimleri" sub="En yeni önce">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {feedback.length === 0 ? <p className="muted" style={{ fontSize: 12.5 }}>Henüz geri bildirim yok.</p> : feedback.map((f) => (
              <div key={f.id} className="fb-card"><div className="fb-head"><Avatar name={f.author} size={34} /><div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13 }}>{f.author}</b><div className="muted" style={{ fontSize: 11 }}>{f.role === "parent" ? "Veli" : "Öğrenci"} · {fmtShort(f.date)}</div></div><StarRow value={f.rating} size={15} /></div><p className="fb-quote">“{f.comment}”</p></div>
            ))}
          </div>
        </Section>
        <Section title="Kurumdan gelen görevler" sub={openTasks + " açık görev"} action={<span className="badge badge-info" style={{ height: 24 }}>{o.name}</span>}>
          <div className="card-body" style={{ padding: 0 }}>
            {tasks.length === 0 ? <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Kurum henüz görev atamadı.</p> : tasks.map((t) => (
              <div key={t.id} className={`task-row${t.status === "done" ? " done" : ""}`}>
                <button className={`task-check${t.status === "done" ? " on" : ""}`} onClick={() => { completeTask(t.id); toast(t.status === "done" ? "Görev yeniden açıldı" : "Görev tamamlandı", { icon: "checkCircle" }); }} aria-label="Tamamla"><Icon name="check" size={13} /></button>
                <div style={{ flex: 1, minWidth: 0 }}><div className="row" style={{ gap: 8 }}><span className="task-title">{t.title}</span><PriorityBadge priority={t.priority} /></div>{t.detail ? <div className="task-detail">{t.detail}</div> : null}<div className="muted" style={{ fontSize: 11, marginTop: 3 }}>Son tarih: {fmtShort(t.due)}</div></div>
              </div>
            ))}
          </div>
        </Section>
      </div>
      {me ? <div className="alert-strip"><span className="as-ic" style={{ background: o.tone, color: "#fff" }}><Icon name="heart" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{me.branch} · {me.students} öğrenci</b><div className="muted" style={{ fontSize: 12 }}>Geri bildirimler kurum yöneticinizle paylaşılır.</div></div></div> : null}
    </div>
  );
}

Object.assign(window, { SALicenses, KurumManagers, KurumCoaches, KurumCoachDetail, KurumStudentDetail, KurumStudents, KurumLicense, CoachFeedback });
