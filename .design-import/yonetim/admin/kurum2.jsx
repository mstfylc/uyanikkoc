/* ============================================================
   KURUM / FRANCHISE YÖNETİCİSİ (2/2)
   Şubeler · Lisans & Kapasite · Gelir & Tahsilat · Raporlar · Ayarlar
   ============================================================ */

/* ---- Şube doluluk tahmini (kapasite alanı yoksa) ---- */
function branchCap(b) { return b.capacity || Math.max(b.students + 8, Math.round((b.students || 1) / 0.82)); }

/* ---- Şube yönetim ekranı (modal) ---- */
function BranchManageModal({ orgId, branch, onClose }) {
  const o = getActiveOrg();
  const live = (o.branches.find((x) => x.id === branch.id)) || branch;
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const coaches = (typeof orgCoaches === "function" ? orgCoaches(o) : []).filter((c) => c.branchId === live.id);
  const students = (typeof orgStudents === "function" ? orgStudents(o) : []).filter((s) => s.branch === live.name);
  const risk = students.filter((s) => s.status === "risk");
  const cap = branchCap(live);
  const occ = Math.min(100, Math.round((live.students / cap) * 100));
  const share = Math.round((live.collect / totalCollect) * 100);

  const [tab, setTab] = useState("genel");
  const [compose, setCompose] = useState(null);
  const [name, setName] = useState(live.name);
  const [city, setCity] = useState(live.city);
  const [status, setStatus] = useState(live.status);

  const saveInfo = () => { updateBranch(orgId, live.id, { name, city, status }); toast("Şube bilgileri güncellendi", { icon: "checkCircle" }); };
  const exportBranch = () => {
    downloadCSV("sube-" + live.id + ".csv", [
      ["Şube", live.name], ["Şehir", live.city], ["Öğrenci", live.students], ["Koç", live.coaches],
      ["Aylık tahsilat", live.collect], ["Doluluk %", occ], ["Gelir payı %", share], [],
      ["Koç", "Öğrenci", "Puan", "Doluluk %"], ...coaches.map((c) => [c.name, c.students, c.rating, c.load]),
    ]);
    toast(live.name + " raporu indirildi", { icon: "download" });
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 640, height: "min(720px, calc(100vh - 36px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 12 }}>
            <span className="org-logo" style={{ width: 44, height: 44, background: o.tone, borderRadius: 12 }}><Icon name="building" size={21} /></span>
            <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>{live.name}</h3><div className="muted" style={{ fontSize: 12.5 }}>{live.city} · {o.name}</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        <div className="modal-sub" style={{ gap: 8 }}>
          {[["genel", "Genel"], ["koclar", "Koçlar (" + coaches.length + ")"], ["ayarlar", "Ayarlar"]].map(([k, l]) => (
            <button key={k} className={`seg-tab${tab === k ? " on" : ""}`} style={{ height: 32 }} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="modal-body" style={{ padding: "16px 20px", gap: 16 }}>
          {tab === "genel" ? (
            <>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-primary"><Icon name="cap" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>{live.students}</div><div className="stat-label">öğrenci · %{occ} doluluk</div></div></div></div>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-info"><Icon name="users" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>{live.coaches}</div><div className="stat-label">koç</div></div></div></div>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-success"><Icon name="banknote" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>{TRY(live.collect)}</div><div className="stat-label">aylık tahsilat</div></div></div></div>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-warning"><Icon name="pie" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>%{share}</div><div className="stat-label">kurum gelir payı</div></div></div></div>
              </div>
              <div>
                <div className="between" style={{ marginBottom: 7 }}><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Kapasite doluluğu</span><span className="tnum" style={{ fontSize: 12, fontWeight: 700 }}>{live.students}/{cap}</span></div>
                <Bar value={occ} color={occ >= 85 ? "var(--success)" : occ >= 60 ? "var(--primary)" : "var(--warning)"} />
              </div>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="kpi-row" style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12 }}><span className="muted" style={{ fontSize: 12.5 }}>Öğrenci başına gelir</span><b className="tnum">{TRY(Math.round(live.collect / Math.max(1, live.students)))}</b></div>
                <div className="kpi-row" style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12 }}><span className="muted" style={{ fontSize: 12.5 }}>Risk altında</span><b className="tnum" style={{ color: risk.length ? "var(--danger)" : "var(--text)" }}>{risk.length} öğrenci</b></div>
              </div>
              {risk.length ? (
                <div className="alert-strip warn"><span className="as-ic"><Icon name="alert" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{risk.length} öğrenci risk altında</b><div className="muted" style={{ fontSize: 12 }}>{risk.slice(0, 3).map((s) => s.name).join(", ")}{risk.length > 3 ? " +" + (risk.length - 3) : ""}</div></div></div>
              ) : null}
            </>
          ) : null}

          {tab === "koclar" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {coaches.length === 0 ? <p className="muted" style={{ fontSize: 12.5 }}>Bu şubeye atanmış koç yok.</p> : coaches.map((c) => (
                <div key={c.id} className="lrow" style={{ padding: "11px 13px" }}>
                  <Avatar name={c.name} size={34} avatarKey={"coach:" + c.id} />
                  <div style={{ flex: 1, minWidth: 0 }}><div className="lr-title" style={{ fontSize: 13 }}>{c.name}</div><div className="muted" style={{ fontSize: 11.5 }}>{c.students} öğrenci · %{c.load} doluluk</div></div>
                  <span className="row" style={{ gap: 4, fontWeight: 700, fontSize: 12.5 }}><Icon name="star" size={13} fill style={{ color: "var(--warning)" }} />{c.rating}</span>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} title="Mesaj" onClick={() => setCompose({ toName: c.name, sub: live.name + " · koç" })}><Icon name="message" size={15} /></button>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "ayarlar" ? (
            <>
              <div className="field"><label className="label">Şube adı</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label className="label">Şehir</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div className="field"><label className="label">Durum</label>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Aktif</option>
                  <option value="warning">Düşük doluluk</option>
                  <option value="suspended">Donduruldu</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={saveInfo}><Icon name="check" size={16} />Kaydet</button>
            </>
          ) : null}
        </div>

        <div className="modal-foot">
          <button className="btn btn-light" onClick={() => setCompose({ toName: live.name + " müdürü", sub: o.name + " · " + live.city })}><Icon name="message" size={16} />Müdüre yaz</button>
          <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={exportBranch}><Icon name="download" size={16} />Şube raporu</button>
        </div>
      </div>
      {compose ? <MessageComposeModal toName={compose.toName} sub={compose.sub} by={o.owner.name} onClose={() => setCompose(null)} /> : null}
    </div>
  ), document.body);
}

/* ---- Şubeler ---- */
function KurumBranches() {
  const a = useAdmin();
  const o = getActiveOrg();
  const [manage, setManage] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [nb, setNb] = useState({ name: "", city: "" });

  if (o.type !== "franchise") {
    const b = o.branches[0];
    return (
      <div className="stack rise">
        <PageHead title="Şube" sub="Tek kurum — tüm öğrenci ve koçlar bu konuma bağlı" actions={<button className="btn btn-primary" onClick={() => changeOrgPlan(o.id, "franchise") || toast("Franchise planına geçildi", { icon: "building" })}><Icon name="building" size={16} />Franchise'a yükselt</button>} />
        <div className="alert-strip">
          <span className="as-ic" style={{ background: o.tone, color: "#fff" }}><Icon name="building" size={18} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{b.name}</b><div className="muted" style={{ fontSize: 12.5 }}>{b.city} · {b.students} öğrenci · {b.coaches} koç</div></div>
          <button className="btn btn-sm btn-light" onClick={() => setManage(b)}>Şubeyi yönet<Icon name="chevronRight" size={15} /></button>
        </div>
        <div className="grid g-3">
          <StatCard icon="cap" tone="primary" value={b.students} label="Öğrenci" />
          <StatCard icon="users" tone="info" value={b.coaches} label="Koç" />
          <StatCard icon="banknote" tone="success" value={TRY(b.collect)} label="Aylık tahsilat" />
        </div>
        {manage ? <BranchManageModal orgId={o.id} branch={manage} onClose={() => setManage(null)} /> : null}
      </div>
    );
  }
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const cap = orgPlanById(o.planId).branches;
  return (
    <div className="stack rise">
      <PageHead title="Şubeler" sub={`${o.branches.length} şube · ${cap} şube kapasitesi`}
        actions={<><button className="btn btn-light" onClick={() => downloadCSV("subeler.csv", [["Şube", "Şehir", "Öğrenci", "Koç", "Aylık tahsilat"], ...o.branches.map((b) => [b.name, b.city, b.students, b.coaches, b.collect])])}><Icon name="download" size={16} />Dışa aktar</button>
          <button className="btn btn-primary" disabled={o.branches.length >= cap} onClick={() => setAddOpen(true)}><Icon name="plus" size={16} />Şube ekle</button></>} />

      <div className="grid g-4">
        <StatCard icon="building" tone="primary" value={o.branches.length} label="Aktif şube" />
        <StatCard icon="cap" tone="info" value={o.branches.reduce((s, b) => s + b.students, 0)} label="Toplam öğrenci" />
        <StatCard icon="users" tone="success" value={o.branches.reduce((s, b) => s + b.coaches, 0)} label="Toplam koç" />
        <StatCard icon="banknote" tone="warning" value={TRY(totalCollect)} label="Aylık tahsilat" />
      </div>

      <div className="grid g-2">
        {o.branches.map((b) => {
          const share = Math.round((b.collect / totalCollect) * 100);
          const occ = Math.min(100, Math.round((b.students / branchCap(b)) * 100));
          return (
            <div key={b.id} className="card"><div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="row" style={{ gap: 13 }}>
                <span className="org-logo" style={{ background: o.tone, borderRadius: 12 }}><Icon name="building" size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 15, fontWeight: 800 }}>{b.name}</b><div className="muted" style={{ fontSize: 12.5 }}>{b.city}</div></div>
                <StatusBadge status={b.status} sm />
              </div>
              <div className="row" style={{ gap: 22, flexWrap: "wrap" }}>
                <div><div className="muted" style={{ fontSize: 11 }}>Öğrenci</div><b className="tnum" style={{ fontSize: 17 }}>{b.students}</b></div>
                <div><div className="muted" style={{ fontSize: 11 }}>Koç</div><b className="tnum" style={{ fontSize: 17 }}>{b.coaches}</b></div>
                <div><div className="muted" style={{ fontSize: 11 }}>Aylık tahsilat</div><b className="tnum" style={{ fontSize: 17 }}>{TRY(b.collect)}</b></div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}><div className="muted" style={{ fontSize: 11 }}>Gelir payı</div><b className="tnum" style={{ fontSize: 17, color: o.tone }}>%{share}</b></div>
              </div>
              <div>
                <div className="between" style={{ marginBottom: 6 }}><span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Doluluk · %{occ}</span></div>
                <div className="meter-bar"><span style={{ width: occ + "%", background: occ >= 85 ? "var(--success)" : occ >= 60 ? o.tone : "var(--warning)" }} /></div>
              </div>
              <button className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setManage(b)}>Şubeyi yönet<Icon name="chevronRight" size={15} /></button>
            </div></div>
          );
        })}
      </div>

      {manage ? <BranchManageModal orgId={o.id} branch={manage} onClose={() => setManage(null)} /> : null}

      {addOpen ? ReactDOM.createPortal((
        <div className="modal-overlay" onClick={() => setAddOpen(false)}>
          <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Yeni şube ekle</h3><p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{o.name} ağına yeni bir konum</p></div>
              <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setAddOpen(false)} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button></div>
            <div className="modal-body" style={{ padding: "16px 20px", gap: 14 }}>
              <div className="field"><label className="label">Şube adı</label><input className="input" value={nb.name} onChange={(e) => setNb({ ...nb, name: e.target.value })} placeholder="Örn. Üsküdar Şubesi" /></div>
              <div className="field"><label className="label">Şehir</label><input className="input" value={nb.city} onChange={(e) => setNb({ ...nb, city: e.target.value })} placeholder={o.city} /></div>
            </div>
            <div className="modal-foot"><button className="btn btn-light" onClick={() => setAddOpen(false)}>Vazgeç</button>
              <button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!nb.name.trim()} onClick={() => { addBranch(o.id, nb); toast(nb.name + " eklendi", { icon: "building" }); setNb({ name: "", city: "" }); setAddOpen(false); }}><Icon name="plus" size={15} />Şube ekle</button></div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}

/* ---- Lisans & Kapasite (kurum tarafı) ---- */
function KurumLicense() {
  const a = useAdmin();
  const o = getActiveOrg();
  const p = orgPlanById(o.planId);
  const [confirm, setConfirm] = useState(null);

  return (
    <div className="stack rise">
      <PageHead title="Lisans & Kapasite" sub="Planınızı, koltuk kullanımınızı ve modüllerinizi görüntüleyin" />
      <LicenseHero org={o} />

      <div className="grid col-main">
        <div className="stack">
          <Section title="Kapasite kullanımı">
            <div className="card-body" style={{ gap: 18, display: "flex", flexDirection: "column" }}>
              <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
              <Meter icon="users" label="Koç" used={o.coaches.used} total={o.coaches.total} />
              {o.type === "franchise" ? <Meter icon="building" label="Şube" used={o.branches.length} total={p.branches} /> : null}
              {(o.seats.used / o.seats.total) > 0.85 ? (
                <div className="alert-strip warn">
                  <span className="as-ic"><Icon name="alert" size={18} /></span>
                  <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Koltuk kapasiteniz doluyor</b><div className="muted" style={{ fontSize: 12 }}>Kalan {o.seats.total - o.seats.used} koltuk. Ek paket alabilirsiniz.</div></div>
                  <button className="btn btn-sm btn-primary" onClick={() => { addOrgSeats(o.id, 25); toast("25 öğrenci koltuğu eklendi", { icon: "plus" }); }}>+25 koltuk</button>
                </div>
              ) : null}
            </div>
          </Section>
          <Section title="Açık modüller" sub="Lisansınıza dahil özellikler — açma talebi için süper admine başvurun">
            <div className="card-body"><ModuleGrid modules={o.modules} readOnly /></div>
          </Section>
        </div>

        <div className="stack">
          <Section title="Plan & yenileme">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Mevcut plan</span><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><b style={{ fontSize: 13.5 }}>{p.name}</b></span></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Faturalama</span><b style={{ fontSize: 13.5 }}>{o.cycle === "annual" ? "Yıllık" : "Aylık"}</b></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Aylık ücret</span><b className="tnum" style={{ fontSize: 13.5 }}>{TRY(o.feeMonthly)}</b></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span><b className="tnum" style={{ fontSize: 13.5 }}>{fmtShort(o.renewsAt)}</b></div>
              <hr className="hr" style={{ margin: "4px 0" }} />
              <button className="btn btn-primary" onClick={() => setConfirm("upgrade")}><Icon name="arrowUp" size={16} />Planı yükselt</button>
              <button className="btn btn-light" onClick={() => { renewOrg(o.id); toast("Lisans yenilendi", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Şimdi yenile</button>
            </div>
          </Section>
          <Section title="Üst plan: Franchise" className="">
            <div className="card-body" style={{ gap: 10, display: "flex", flexDirection: "column" }}>
              <p className="muted" style={{ fontSize: 12.5 }}>Daha fazla şube, koç ve öğrenci koltuğu + AI Koç ve Envanter modülleri.</p>
              <RankBars items={[{ l: "Öğrenci koltuğu", v: 400 }, { l: "Koç", v: 40 }, { l: "Şube", v: 8 }]} max={400} fmt={(v) => v} color="var(--warning)" />
            </div>
          </Section>
        </div>
      </div>

      <ConfirmModal open={confirm === "upgrade"} title="Franchise planına yükselt?" tone="primary"
        body={`${o.name} için kapasite Franchise seviyesine çıkacak (400 koltuk, 40 koç, 8 şube) ve tüm premium modüller açılacak. Yeni ücret ${TRY(24900)}/ay.`}
        confirmLabel="Yükselt" onConfirm={() => { changeOrgPlan(o.id, "franchise"); toast("Franchise planına yükseltildi", { icon: "checkCircle" }); }} onClose={() => setConfirm(null)} />
    </div>
  );
}

/* ---- Gelir & Tahsilat (kurum tarafı) ---- */
function KurumRevenue() {
  const a = useAdmin();
  const o = getActiveOrg();
  const isFr = o.type === "franchise";
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const platformFee = o.feeMonthly;
  const net = totalCollect - platformFee;
  const series = [Math.round(totalCollect * .82), Math.round(totalCollect * .85), Math.round(totalCollect * .88), Math.round(totalCollect * .91), Math.round(totalCollect * .95), totalCollect];
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];
  const [sort, setSort] = useState("collect"); // collect | per | growth

  /* şube başına türetilmiş metrikler (deterministik) */
  const rows = o.branches.map((b, i) => {
    const share = Math.round((b.collect / totalCollect) * 100);
    const per = Math.round(b.collect / Math.max(1, b.students));
    const growth = ((i * 7) % 13) - 4; // -4..+8 arası örnek MoM %
    const feeShare = Math.round(platformFee * (b.collect / totalCollect));
    const profit = b.collect - feeShare;
    return { ...b, share, per, growth, feeShare, profit };
  });
  const sorted = [...rows].sort((x, y) => sort === "per" ? y.per - x.per : sort === "growth" ? y.growth - x.growth : y.collect - x.collect);
  const maxCollect = Math.max(...rows.map((r) => r.collect), 1);
  const best = [...rows].sort((x, y) => y.collect - x.collect)[0];
  const top = [...rows].sort((x, y) => y.per - x.per)[0];

  return (
    <div className="stack rise">
      <PageHead title="Gelir & Tahsilat" sub={isFr ? "Hangi şubeden ne kazandığını şube şube takip et" : "Öğrenci aboneliklerinden gelen tahsilat ve platform ücreti"}
        actions={<button className="btn btn-light" onClick={() => downloadCSV("gelir-sube.csv", [["Şube", "Öğrenci", "Aylık tahsilat", "Öğrenci başına", "Platform payı", "Net kâr", "Pay %", "Aylık değişim %"], ...rows.map((r) => [r.name, r.students, r.collect, r.per, r.feeShare, r.profit, r.share, r.growth])])}><Icon name="download" size={16} />Dışa aktar</button>} />

      <div className="grid g-4">
        <StatCard icon="banknote" tone="success" value={TRY(totalCollect)} label="Aylık brüt tahsilat" delta="+%6,2" deltaDir="up" />
        <StatCard icon="card" tone="danger" value={TRY(platformFee)} label="Platform ücreti" />
        <StatCard icon="wallet" tone="primary" value={TRY(net)} label="Net gelir" />
        <StatCard icon="cap" tone="info" value={TRY(Math.round(totalCollect / Math.max(1, o.seats.used)))} label="Öğrenci başına" />
      </div>

      {isFr ? (
        <Section title="Şube bazında gelir" sub={`En çok kazandıran: ${best.name} · öğrenci başına lider: ${top.name}`}
          action={<div className="seg" style={{ width: "fit-content" }}>
            <button type="button" className={sort === "collect" ? "on" : ""} onClick={() => setSort("collect")}>Tahsilat</button>
            <button type="button" className={sort === "per" ? "on" : ""} onClick={() => setSort("per")}>Öğrenci başına</button>
            <button type="button" className={sort === "growth" ? "on" : ""} onClick={() => setSort("growth")}>Büyüme</button>
          </div>}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {sorted.map((r) => (
              <div key={r.id} className="lrow" style={{ alignItems: "stretch", padding: "13px 15px", flexDirection: "column", gap: 9 }}>
                <div className="between" style={{ alignItems: "center" }}>
                  <div className="row" style={{ gap: 11, minWidth: 0 }}>
                    <span className="org-logo" style={{ width: 34, height: 34, background: o.tone, borderRadius: 10 }}><Icon name="building" size={16} /></span>
                    <div style={{ minWidth: 0 }}><b style={{ fontSize: 13.5 }}>{r.name}</b><div className="muted" style={{ fontSize: 11.5 }}>{r.city} · {r.students} öğrenci</div></div>
                  </div>
                  <div style={{ textAlign: "right" }}><b className="tnum" style={{ fontSize: 15 }}>{TRY(r.collect)}</b><div className="row" style={{ gap: 4, justifyContent: "flex-end", fontSize: 11.5, fontWeight: 700, color: r.growth >= 0 ? "var(--success)" : "var(--danger)" }}><Icon name={r.growth >= 0 ? "arrowUp" : "arrowDown"} size={12} />%{Math.abs(r.growth)}</div></div>
                </div>
                <div className="meter-bar"><span style={{ width: Math.round((r.collect / maxCollect) * 100) + "%", background: o.tone }} /></div>
                <div className="row" style={{ gap: 18, flexWrap: "wrap", fontSize: 11.5 }}>
                  <span className="muted">Pay: <b className="tnum" style={{ color: "var(--text)" }}>%{r.share}</b></span>
                  <span className="muted">Öğrenci başına: <b className="tnum" style={{ color: "var(--text)" }}>{TRY(r.per)}</b></span>
                  <span className="muted">Platform payı: <b className="tnum" style={{ color: "var(--text)" }}>{TRY(r.feeShare)}</b></span>
                  <span className="muted">Net kâr: <b className="tnum" style={{ color: "var(--success)" }}>{TRY(r.profit)}</b></span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <div className="grid col-main">
        <Section title="Aylık tahsilat gelişimi" sub="Son 6 ay">
          <div className="card-body">
            <Sparkline data={series} w={640} h={130} color="var(--success)" />
            <div className="chart" style={{ marginTop: 14 }}>
              {months.map((mo, i) => <div key={i} className="col"><label>{mo}</label></div>)}
            </div>
          </div>
        </Section>
        <Section title="Tahsilat dağılımı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Donut slices={[{ v: net, color: "var(--success)" }, { v: platformFee, color: "var(--surface-3)" }]} center={{ v: "%" + Math.round((net / totalCollect) * 100), l: "net kâr" }} />
            <div className="legend" style={{ width: "100%" }}>
              <div className="legend-item"><span className="sw" style={{ background: "var(--success)" }} /><span>Net gelir</span><span className="lv tnum">{TRY(net)}</span></div>
              <div className="legend-item"><span className="sw" style={{ background: "var(--surface-3)" }} /><span>Platform ücreti</span><span className="lv tnum">{TRY(platformFee)}</span></div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ---- Raporlar (kurum geneli) — özelleştirilebilir rapor oluşturucu ---- */
const REPORT_SECTIONS = [
  { key: "ozet", label: "Genel özet", icon: "dashboard", desc: "Öğrenci, koç, ortalama net ve devam" },
  { key: "net", label: "Net dağılımı", icon: "chart", desc: "Başarı bantlarına göre öğrenci sayısı" },
  { key: "brans", label: "Branş analizi", icon: "book", desc: "Branş bazında ortalama net" },
  { key: "devam", label: "Devam oranı", icon: "calendar", desc: "Ortalama derse katılım" },
  { key: "gelir", label: "Gelir özeti", icon: "banknote", desc: "Tahsilat, platform ücreti ve net" },
  { key: "koc", label: "Koç performansı", icon: "users", desc: "Koç başına öğrenci ve puan" },
  { key: "risk", label: "Risk listesi", icon: "alert", desc: "Düşüşte / risk altındaki öğrenciler" },
];
const REPORT_PERIODS = [["30", "Son 30 gün"], ["donem", "Bu dönem"], ["90", "Son 3 ay"], ["all", "Tüm zamanlar"]];

function KurumReports() {
  const a = useAdmin();
  const o = getActiveOrg();
  const isFr = o.type === "franchise";
  const allStudents = typeof orgStudents === "function" ? orgStudents(o) : [];
  const allCoaches = typeof orgCoaches === "function" ? orgCoaches(o) : [];

  const [scope, setScope] = useState("all");
  const [period, setPeriod] = useState("donem");
  const [tab, setTab] = useState("akademik");

  const branchName = scope === "all" ? null : (o.branches.find((b) => b.id === scope) || {}).name;
  const periodLabel = (REPORT_PERIODS.find((p) => p[0] === period) || [])[1];
  const students = scope === "all" ? allStudents : allStudents.filter((s) => s.branch === branchName);
  const coaches = scope === "all" ? allCoaches : allCoaches.filter((c) => c.branchId === scope);

  const avgNet = students.length ? Math.round(students.reduce((s, x) => s + x.net, 0) / students.length) : 0;
  const avgAttend = students.length ? Math.round(students.reduce((s, x) => s + x.attend, 0) / students.length) : 0;
  const risk = students.filter((s) => s.status === "risk");
  const dist = [
    { l: "150+ net", v: students.filter((s) => s.net >= 150).length, color: "var(--success)" },
    { l: "100-149", v: students.filter((s) => s.net >= 100 && s.net < 150).length, color: "var(--primary)" },
    { l: "60-99", v: students.filter((s) => s.net >= 60 && s.net < 100).length, color: "var(--warning)" },
    { l: "60 altı", v: students.filter((s) => s.net < 60).length, color: "var(--danger)" },
  ];
  const subjects = [{ l: "Türkçe", v: 32 }, { l: "Matematik", v: 28 }, { l: "Fen", v: 17 }, { l: "Sosyal", v: 15 }];
  const branchesScoped = scope === "all" ? o.branches : o.branches.filter((b) => b.id === scope);
  const collect = branchesScoped.reduce((s, b) => s + b.collect, 0);
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const fee = scope === "all" ? o.feeMonthly : Math.round(o.feeMonthly * (collect / totalCollect));
  const perStudent = students.length ? Math.round(collect / students.length) : 0;
  const avgRating = coaches.length ? (coaches.reduce((s, c) => s + (c.rating || 0), 0) / coaches.length).toFixed(1) : "—";
  const avgLoad = coaches.length ? Math.round(coaches.reduce((s, c) => s + (c.load || 0), 0) / coaches.length) : 0;
  const collectSeries = [Math.round(collect * 0.78 / 1000), Math.round(collect * 0.82 / 1000), Math.round(collect * 0.85 / 1000), Math.round(collect * 0.9 / 1000), Math.round(collect * 0.94 / 1000), Math.round(collect * 0.97 / 1000), Math.round(collect / 1000)];
  const topCoaches = [...coaches].sort((x, y) => y.students - x.students).slice(0, 7).map((c) => ({ l: c.name, v: c.students }));
  const branchRank = o.branches.map((b) => ({ l: b.name, v: b.collect })).sort((x, y) => y.v - x.v);

  const exportCsv = () => {
    const rows = [
      [o.name + " — KURUM RAPORU"], ["Kapsam", branchName || "Tüm kurum"], ["Dönem", periodLabel], ["Oluşturma", new Date().toLocaleDateString("tr-TR")], [],
      ["GENEL ÖZET"], ["Öğrenci", students.length], ["Koç", coaches.length], ["Ortalama net", avgNet], ["Devam %", avgAttend], ["Risk altında", risk.length], [],
      ["NET DAĞILIMI"], ...dist.map((d) => [d.l, d.v]), [],
      ["BRANŞ ORTALAMA NET"], ...subjects.map((x) => [x.l, x.v]), [],
      ["GELİR ÖZETİ"], ["Tahsilat", collect], ["Platform ücreti", fee], ["Net", collect - fee], ["Öğrenci başına", perStudent], [],
      ["KOÇ PERFORMANSI"], ["Koç", "Öğrenci", "Puan", "Doluluk %"], ...coaches.map((c) => [c.name, c.students, c.rating, c.load]), [],
      ["RİSK LİSTESİ (" + risk.length + ")"], ["Öğrenci", "Şube", "Net"], ...risk.map((s) => [s.name, s.branch, s.net]),
    ];
    if (isFr) { rows.push([], ["ŞUBE BAZINDA TAHSİLAT"], ["Şube", "Öğrenci", "Koç", "Tahsilat"], ...o.branches.map((b) => [b.name, b.students, b.coaches, b.collect])); }
    downloadCSV("kurum-raporu-" + (branchName ? branchName.replace(/\s+/g, "-").toLowerCase() : "tum") + ".csv", rows);
    toast("Rapor CSV olarak indirildi", { icon: "download" });
  };

  const TABS = [
    { k: "akademik", label: "Akademik", icon: "chart" },
    { k: "gelir", label: "Gelir & Tahsilat", icon: "banknote" },
    { k: "koc", label: isFr ? "Koç & Şube" : "Koçlar", icon: "users" },
    { k: "risk", label: "Risk", icon: "alert", count: risk.length },
  ];

  return (
    <div className="stack rise">
      <PageHead title="Raporlar" sub={(branchName || o.name) + " · " + periodLabel}
        actions={<>
          <select className="select" value={scope} onChange={(e) => setScope(e.target.value)} style={{ minWidth: 150 }}>
            <option value="all">Tüm kurum</option>
            {o.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="seg" style={{ flexWrap: "wrap" }}>{REPORT_PERIODS.map(([k, l]) => <button key={k} type="button" className={period === k ? "on" : ""} onClick={() => setPeriod(k)}>{l}</button>)}</div>
          <button className="btn btn-light" onClick={() => window.print()}><Icon name="receipt" size={16} />Yazdır / PDF</button>
          <button className="btn btn-primary" onClick={exportCsv}><Icon name="download" size={16} />CSV indir</button>
        </>} />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "akademik" ? (
        <div className="stack">
          <div className="grid g-4">
            <StatCard icon="target" tone="success" value={avgNet} label="Ortalama net" delta="+4,1" deltaDir="up" />
            <StatCard icon="checkCircle" tone="info" value={"%" + avgAttend} label="Devam oranı" />
            <StatCard icon="cap" tone="primary" value={students.length} label="Öğrenci" />
            <StatCard icon="alert" tone="danger" value={risk.length} label="Risk altında" />
          </div>
          <div className="grid col-main">
            <Section title="Net dağılımı" sub="Başarı bantlarına göre öğrenci">
              <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <Donut slices={dist} center={{ v: students.length, l: "öğrenci" }} />
                <div className="legend" style={{ width: "100%" }}>{dist.map((d, i) => <div key={i} className="legend-item"><span className="sw" style={{ background: d.color }} /><span>{d.l}</span><span className="lv tnum">{d.v}</span></div>)}</div>
              </div>
            </Section>
            <Section title="Branş bazında ortalama net">
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <RankBars items={subjects} max={40} color={o.tone} />
                <div><div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>Devam oranı</div><Meter icon="calendar" label="Ortalama katılım" used={avgAttend} total={100} unit="%" /></div>
              </div>
            </Section>
          </div>
        </div>
      ) : null}

      {tab === "gelir" ? (
        <div className="stack">
          <div className="grid g-4">
            <StatCard icon="banknote" tone="success" value={TRY(collect)} label="Aylık tahsilat" />
            <StatCard icon="card" tone="warning" value={TRY(fee)} label="Platform ücreti" />
            <StatCard icon="trend" tone="primary" value={TRY(collect - fee)} label="Net gelir" />
            <StatCard icon="cap" tone="info" value={TRY(perStudent)} label="Öğrenci başına" />
          </div>
          <Section title="Tahsilat gelişimi" sub={periodLabel + " · ₺ bin"}>
            <div className="card-body"><Sparkline data={collectSeries} w={640} h={120} color="var(--success)" /></div>
          </Section>
          {isFr ? (
            <Section title="Şube bazında tahsilat" sub="Aylık karşılaştırma">
              <div className="card-body"><RankBars items={branchRank} fmt={(v) => TRY(v)} color={o.tone} /></div>
            </Section>
          ) : null}
        </div>
      ) : null}

      {tab === "koc" ? (
        <div className="stack">
          <div className="grid g-3">
            <StatCard icon="users" tone="primary" value={coaches.length} label="Koç" />
            <StatCard icon="star" tone="warning" value={avgRating} label="Ortalama puan" />
            <StatCard icon="chart" tone="info" value={"%" + avgLoad} label="Ortalama doluluk" />
          </div>
          <Section title="En çok öğrencisi olan koçlar" sub="İlk 7">
            <div className="card-body">{coaches.length === 0 ? <EmptyState icon="users" title="Koç yok" /> : <RankBars items={topCoaches} color={o.tone} />}</div>
          </Section>
          <Section title="Koç performans tablosu">
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              <table className="tbl" style={{ minWidth: 540 }}>
                <thead><tr><th>Koç</th><th style={{ textAlign: "center" }}>Öğrenci</th><th style={{ textAlign: "center" }}>Puan</th><th style={{ textAlign: "center" }}>Doluluk</th></tr></thead>
                <tbody>
                  {coaches.map((c) => (
                    <tr key={c.id}>
                      <td><div className="name"><Avatar name={c.name} size={32} avatarKey={"coach:" + c.id} /><div><b>{c.name}</b></div></div></td>
                      <td style={{ textAlign: "center" }}><span className="tnum" style={{ fontWeight: 700 }}>{c.students}</span></td>
                      <td style={{ textAlign: "center" }}><span className="row tnum" style={{ gap: 3, justifyContent: "center", fontWeight: 700 }}><Icon name="star" size={13} fill style={{ color: "var(--warning)" }} />{c.rating}</span></td>
                      <td style={{ textAlign: "center" }}><span className="tnum">%{c.load}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      ) : null}

      {tab === "risk" ? (
        <div className="stack">
          <div className="grid g-3">
            <StatCard icon="alert" tone="danger" value={risk.length} label="Risk altında öğrenci" />
            <StatCard icon="cap" tone="primary" value={students.length} label="Toplam öğrenci" />
            <StatCard icon="trend" tone="warning" value={students.length ? "%" + Math.round((risk.length / students.length) * 100) : "%0"} label="Risk oranı" />
          </div>
          <Section title={"Risk listesi (" + risk.length + ")"} sub="Düşüşte / risk altındaki öğrenciler">
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              {risk.length === 0 ? <div style={{ padding: 20 }}><EmptyState icon="checkCircle" title="Risk altında öğrenci yok 🎉" sub="Tüm öğrenciler hedefte" /></div> : (
                <table className="tbl" style={{ minWidth: 520 }}>
                  <thead><tr><th>Öğrenci</th><th>Şube</th><th>Koç</th><th style={{ textAlign: "center" }}>Net</th></tr></thead>
                  <tbody>
                    {risk.map((s) => (
                      <tr key={s.id}>
                        <td><div className="name"><Avatar name={s.name} size={30} /><div><b>{s.name}</b><span>{s.grade}</span></div></div></td>
                        <td><span className="muted" style={{ fontSize: 12.5 }}>{s.branch}</span></td>
                        <td><span className="muted" style={{ fontSize: 12.5 }}>{s.coach}</span></td>
                        <td style={{ textAlign: "center" }}><span className="badge badge-danger" style={{ height: 22 }}>{s.net}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
}

/* ---- Ayarlar (kurum profili) ---- */
function KurumSettings() {
  const a = useAdmin();
  const o = getActiveOrg();
  const [name, setName] = useState(o.name);
  const [email, setEmail] = useState(o.owner.email);
  const [phone, setPhone] = useState(o.owner.phone);
  const [tone, setTone] = useState(o.tone);
  const tones = ["#5b6cff", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"];

  return (
    <div className="stack rise">
      <PageHead title="Ayarlar" sub="Kurum profili, marka ve faturalama bilgileri" />
      <div className="grid col-main">
        <div className="stack">
          <Section title="Kurum profili">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="row" style={{ gap: 14 }}>
                <OrgLogo name={name} tone={tone} size={56} />
                <div style={{ flex: 1 }}><label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Kurum adı</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} /></div>
              </div>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div><label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Yetkili e-posta</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} /></div>
                <div><label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Telefon</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} /></div>
              </div>
              <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => { updateOrg(o.id, { name, tone, owner: { ...o.owner, email, phone } }); toast("Profil güncellendi", { icon: "checkCircle" }); }}><Icon name="check" size={16} />Kaydet</button>
            </div>
          </Section>
          <Section title="Marka rengi" sub="Panel ve raporlarda kullanılır">
            <div className="card-body">
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                {tones.map((t) => <button key={t} onClick={() => setTone(t)} style={{ width: 40, height: 40, borderRadius: 11, background: t, border: tone === t ? "3px solid var(--text)" : "3px solid transparent", cursor: "pointer" }} aria-label={t}>{tone === t ? <Icon name="check" size={18} style={{ color: "#fff" }} /> : null}</button>)}
              </div>
            </div>
          </Section>
        </div>
        <div className="stack">
          <Section title="Faturalama bilgileri">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Plan</span><b style={{ fontSize: 13 }}>{orgPlanById(o.planId).name}</b></div>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Vergi no</span><b className="tnum" style={{ fontSize: 13 }}>123 456 7890</b></div>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Fatura adresi</span><b style={{ fontSize: 13 }}>{o.city}</b></div>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Ödeme yöntemi</span><b style={{ fontSize: 13 }}>Havale / EFT</b></div>
            </div>
          </Section>
          <Section title="Tehlikeli bölge">
            <div className="card-body" style={{ gap: 10, display: "flex", flexDirection: "column" }}>
              <div className="alert-strip" style={{ background: "var(--surface-2)" }}>
                <span className="as-ic" style={{ background: "var(--surface-3)", color: "var(--muted)" }}><Icon name="lock" size={16} /></span>
                <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Tüm kurum verisini dışa aktar</b><div className="muted" style={{ fontSize: 12 }}>Bu işlem yalnızca süper admin tarafından yapılabilir. Talep için destek ekibine yazın.</div></div>
                <button className="btn btn-sm btn-light" disabled style={{ opacity: .6, cursor: "not-allowed" }}><Icon name="lock" size={14} />Kapalı</button>
              </div>
              <button className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={() => toast("Veri dışa aktarma talebi süper admine iletildi", { icon: "send" })}><Icon name="send" size={16} />Süper adminden veri talep et</button>
              <button className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => toast("Bu işlem için süper admin onayı gerekir", { icon: "alert", tone: "danger" })}><Icon name="alert" size={16} />Lisansı iptal et</button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KurumBranches, KurumLicense, KurumRevenue, KurumReports, KurumSettings });
