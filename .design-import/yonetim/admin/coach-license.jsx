/* ============================================================
   BİREYSEL KOÇ — kendi lisansını yöneten koç (web)
   Lisansım · Planlar & Yükselt (satın alma akışı) · Faturalar
   myCoach = getMyCoach()
   ============================================================ */

/* ---- Satın alma / yükseltme modalı ---- */
function CoachCheckout({ open, planId, cycle, onClose, onDone }) {
  const [step, setStep] = useState("review"); // review · pay · done
  const [num, setNum] = useState("4242 4242 4242 4242");
  const [holder, setHolder] = useState("SELİN YILMAZ");
  const [exp, setExp] = useState("08/27");
  const [cvc, setCvc] = useState("123");
  useEffect(() => { if (open) setStep("review"); }, [open, planId]);
  if (!open) return null;
  const p = coachPlanById(planId);
  const amount = cycle === "annual" ? p.annual : p.monthly;
  const my = getMyCoach();

  const pay = () => {
    setStep("processing");
    setTimeout(() => {
      buyCoachPlan(my.id, planId, cycle);
      setStep("done");
      toast(p.name + " planı aktif edildi", { icon: "checkCircle" });
    }, 1100);
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>{step === "done" ? "Ödeme tamamlandı" : p.name + " — " + (cycle === "annual" ? "Yıllık" : "Aylık")}</h3><div className="muted" style={{ fontSize: 12.5 }}>{step === "done" ? "Lisansın aktif" : "Güvenli ödeme · 3D Secure"}</div></div>
          <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={onClose}><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        {step === "review" || step === "pay" || step === "processing" ? (
          <div className="modal-body" style={{ padding: 20, gap: 14 }}>
            <div className="card" style={{ background: "var(--surface-2)" }}><div className="card-pad" style={{ padding: 16 }}>
              <div className="between"><span className="row" style={{ gap: 8 }}><span className="plan-dot" style={{ background: p.color }} /><b>{p.name}</b></span><b className="tnum">{TRY(amount)}</b></div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{p.seats >= 999 ? "Sınırsız öğrenci" : p.seats + " öğrenciye kadar"} · {cycle === "annual" ? "yıllık fatura" : "aylık fatura"}</div>
            </div></div>

            <div className="field"><label className="label">Kart Numarası</label><input className="input tnum" value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" /></div>
            <div className="field"><label className="label">Kart Üzerindeki İsim</label><input className="input" value={holder} onChange={(e) => setHolder(e.target.value)} /></div>
            <div className="row" style={{ gap: 10 }}>
              <div className="field" style={{ flex: 1 }}><label className="label">Son Kullanım</label><input className="input tnum" value={exp} onChange={(e) => setExp(e.target.value)} /></div>
              <div className="field" style={{ flex: 1 }}><label className="label">CVC</label><input className="input tnum" value={cvc} onChange={(e) => setCvc(e.target.value)} /></div>
            </div>
            <div className="pm-secure" style={{ fontSize: 11.5 }}><Icon name="lock" size={14} />Kart bilgilerin saklanmaz; iyzico güvenli kasasında işlenir.</div>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="modal-body" style={{ padding: 28, textAlign: "center", gap: 12, alignItems: "center" }}>
            <span className="stat-icon tone-success" style={{ width: 56, height: 56 }}><Icon name="checkCircle" size={28} /></span>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Harika! {p.name} aktif</h3>
            <p className="muted" style={{ fontSize: 13 }}>{p.seats >= 999 ? "Sınırsız" : p.seats} öğrenci kapasitesi ve tüm dahil modüller hesabına tanımlandı.</p>
          </div>
        ) : null}

        <div className="modal-foot">
          {step === "done"
            ? <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onDone}>Lisansıma git</button>
            : <>
              <div><div className="muted" style={{ fontSize: 11 }}>Toplam</div><b className="tnum" style={{ fontSize: 16 }}>{TRY(amount)}</b></div>
              <button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={step === "processing"} onClick={pay}>{step === "processing" ? "İşleniyor..." : <>{TRY(amount)} Öde<Icon name="lock" size={15} /></>}</button>
            </>}
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Lisansım ---- */
function CoachMyLicense({ goto }) {
  const a = useAdmin();
  const c = getMyCoach();
  const p = coachPlanById(c.planId);
  const dl = daysLeft(c.renewsAt);
  const unl = c.seats.total >= 999;
  const [confirm, setConfirm] = useState(null);
  const heroOrg = { ...c, name: c.name, type: "coach", city: c.city, planId: c.planId, feeMonthly: c.feeMonthly, cycle: c.cycle, renewsAt: c.renewsAt, status: c.status, seats: c.seats, coaches: { used: 0, total: 0 }, branches: [] };

  const tone = c.status === "overdue" || c.status === "suspended" ? "danger" : c.status === "trial" || dl <= 14 ? "warn" : "";

  return (
    <div className="stack rise">
      <PageHead title="Lisansım" sub="Bireysel koç aboneliğini yönet" />

      {(c.status === "trial" || dl <= 14 || c.status === "overdue") ? (
        <div className={`alert-strip ${c.status === "overdue" ? "danger" : "warn"}`}>
          <span className="as-ic"><Icon name={c.status === "overdue" ? "alert" : "clock"} size={18} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{c.status === "trial" ? "Deneme sürümündesin" : c.status === "overdue" ? "Ödemen gecikti" : "Lisansın yakında yenilenecek"}</b>
            <div className="muted" style={{ fontSize: 12.5 }}>{dl < 0 ? `${-dl} gün önce doldu.` : `${dl} gün kaldı.`} {c.autoRenew ? "Otomatik yenileme açık." : "Otomatik yenileme kapalı."}</div></div>
          <button className="btn btn-sm btn-primary" onClick={() => goto("bk-planlar")}>{c.status === "trial" ? "Planı etkinleştir" : "Şimdi yenile"}</button>
        </div>
      ) : null}

      {/* hero */}
      <div className={`lic-hero ${tone}`}>
        <div className="lh-glow" />
        <div className="lh-top">
          <div>
            <div className="row" style={{ gap: 10, marginBottom: 4 }}><span className="lh-badge">Bireysel koç</span><span className="lh-badge">{p.name}</span><span className="lh-badge">{c.cycle === "annual" ? "Yıllık" : "Aylık"}</span></div>
            <h2>{c.name}</h2>
            <p className="lh-sub">{c.city} · {TRY(c.feeMonthly)}/ay {c.cycle === "annual" ? "(yıllık ödenmiş)" : ""}</p>
          </div>
          <div style={{ textAlign: "right" }}><div className="tnum" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{dl < 0 ? 0 : dl}</div><div style={{ fontSize: 11.5, opacity: .85, fontWeight: 600 }}>gün kaldı</div></div>
        </div>
        <div className="lh-stats">
          <div className="lh-stat"><div className="v tnum">{c.seats.used}<span style={{ opacity: .6, fontSize: 16 }}>/{unl ? "∞" : c.seats.total}</span></div><div className="l">Öğrenci</div></div>
          <div className="lh-stat"><div className="v">{fmtShort(c.renewsAt)}</div><div className="l">Yenileme</div></div>
          <div className="lh-stat"><div className="v tnum">★ {c.rating || "—"}</div><div className="l">Puan</div></div>
        </div>
      </div>

      <div className="grid col-main">
        <div className="stack">
          <Section title="Plan & yenileme">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label className="renew-toggle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div><b style={{ fontSize: 13.5 }}>Otomatik yenileme</b><div className="muted" style={{ fontSize: 12 }}>{c.cycle === "annual" ? "Yıl" : "Ay"} sonunda {TRY(c.feeMonthly * (c.cycle === "annual" ? 12 : 1))} tahsil edilir</div></div>
                <button className={`switch${c.autoRenew ? " on" : ""}`} onClick={() => { setCoachAutoRenew(c.id, !c.autoRenew); toast("Otomatik yenileme " + (c.autoRenew ? "kapatıldı" : "açıldı")); }}><span /></button>
              </label>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => goto("bk-planlar")}><Icon name="arrowUp" size={16} />Planı yükselt</button>
                <button className="btn btn-light" onClick={() => { buyCoachPlan(c.id, c.planId, c.cycle); toast("Lisans yenilendi", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Şimdi yenile</button>
                <button className="btn btn-ghost-danger" style={{ marginLeft: "auto" }} onClick={() => setConfirm("cancel")}>İptal et</button>
              </div>
            </div>
          </Section>
          <Section title="Kapasite kullanımı">
            <div className="card-body"><Meter icon="cap" label="Öğrenci kapasitesi" used={c.seats.used} total={c.seats.total} unlimited={unl} /></div>
          </Section>
          <Section title="Dahil modüller">
            <div className="card-body"><ModuleGrid modules={c.modules} readOnly /></div>
          </Section>
        </div>

        <div className="stack">
          <Section title="Hızlı bakış">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Plan</span><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><b style={{ fontSize: 13 }}>{p.name}</b></span></div>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Durum</span><StatusBadge status={c.status} sm /></div>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Aylık ücret</span><b className="tnum" style={{ fontSize: 13 }}>{TRY(c.feeMonthly)}</b></div>
              <div className="kpi-row" style={{ padding: "13px 18px" }}><span className="muted" style={{ fontSize: 12.5 }}>Başlangıç</span><b className="tnum" style={{ fontSize: 13 }}>{fmtShort(c.startedAt)}</b></div>
            </div>
          </Section>
          <Section title="Faturalar" action={<button className="link-btn" onClick={() => goto("bk-faturalar")}>Tümü</button>}>
            <div className="card-body" style={{ padding: 0 }}>
              {(c.invoices || []).slice(0, 3).map((i) => (
                <div key={i.id} className="kpi-row" style={{ padding: "12px 18px" }}>
                  <div><b className="tnum" style={{ fontSize: 12.5 }}>{i.id}</b><div className="muted tnum" style={{ fontSize: 11 }}>{fmtShort(i.date)}</div></div>
                  <div className="row" style={{ gap: 8 }}><span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>{TRY(i.amount)}</span><span className={`badge badge-${i.status === "paid" ? "success" : i.status === "failed" ? "danger" : "warning"}`} style={{ height: 20, fontSize: 10 }}>{i.status === "paid" ? "Ödendi" : i.status === "failed" ? "Başarısız" : "Bekliyor"}</span></div>
                </div>
              ))}
              {(!c.invoices || c.invoices.length === 0) ? <div style={{ padding: 16 }}><span className="muted" style={{ fontSize: 12.5 }}>Henüz fatura yok.</span></div> : null}
            </div>
          </Section>
        </div>
      </div>

      <ConfirmModal open={confirm === "cancel"} title="Aboneliği iptal et?" tone="danger"
        body={`${fmtDate(c.renewsAt)} tarihine kadar erişimin sürer. Sonrasında hesabın ücretsiz moda döner ve öğrenci kapasiten kısıtlanır.`}
        confirmLabel="İptali onayla" onConfirm={() => { cancelCoach(c.id); toast("Abonelik iptal edildi", { icon: "alert", tone: "danger" }); }} onClose={() => setConfirm(null)} />
    </div>
  );
}

/* ---- Planlar & Yükselt (satın alma) ---- */
function CoachPlans({ goto }) {
  const a = useAdmin();
  const c = getMyCoach();
  const [cycle, setCycle] = useState(c.cycle || "monthly");
  const [checkout, setCheckout] = useState(null);

  return (
    <div className="stack rise">
      <PageHead title="Planlar & Yükseltme" sub="İhtiyacına göre öğrenci kapasiteni ve modüllerini seç" />

      <div className="pricing-toggle-wrap" style={{ display: "flex", justifyContent: "center" }}>
        <div className="seg pricing-toggle">
          <button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Aylık</button>
          <button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Yıllık <span className="save-pill">2 ay bedava</span></button>
        </div>
      </div>

      <div className="grid g-3">
        {coachPlans().map((p) => {
          const isCurrent = p.id === c.planId && c.status !== "canceled";
          const price = cycle === "annual" ? Math.round(p.annual / 12) : p.monthly;
          return (
            <div key={p.id} className={`plan-card${p.popular ? " popular" : ""}`}>
              {p.popular ? <span className="plan-flag">En çok tercih edilen</span> : null}
              <div className="plan-top">
                <span className="plan-dot" style={{ background: p.color }} />
                <h3>{p.name}</h3>
                <p className="muted">{p.tagline}</p>
              </div>
              <div className="plan-price"><span className="tnum amount">{TRY(price)}</span><span className="per muted">/ay{cycle === "annual" ? <span className="tnum"> · yıllık {TRY(p.annual)}</span> : null}</span></div>
              {cycle === "annual"
                ? <div className="plan-saved"><Icon name="check" size={13} stroke={3} />Aylığa göre {TRY(p.monthly * 12 - p.annual)} tasarruf</div>
                : <div className="plan-saved muted" style={{ background: "transparent" }}>İstediğin zaman yıllığa geç</div>}
              <ul className="plan-feat">{p.features.map((f, i) => <li key={i}><Icon name="check" size={15} stroke={2.5} style={{ color: p.color }} />{f}</li>)}</ul>
              {isCurrent
                ? <button className="btn btn-light" disabled style={{ width: "100%", opacity: .7 }}><Icon name="check" size={16} />Mevcut planın</button>
                : <button className={`btn ${p.popular ? "btn-primary" : "btn-outline"}`} style={{ width: "100%" }} onClick={() => setCheckout({ planId: p.id, cycle })}>{p.name} Seç<Icon name="chevronRight" size={16} /></button>}
            </div>
          );
        })}
      </div>

      <div className="pricing-note"><Icon name="shield" size={16} />Tüm planlar KVKK uyumlu, 3D Secure korumalı. İlk 7 gün içinde iptal edersen ücret iadesi yapılır.</div>

      <CoachCheckout open={!!checkout} planId={checkout?.planId} cycle={checkout?.cycle} onClose={() => setCheckout(null)} onDone={() => { setCheckout(null); goto("bk-lisans"); }} />
    </div>
  );
}

/* ---- Faturalar ---- */
function CoachInvoices() {
  const a = useAdmin();
  const c = getMyCoach();
  const invoices = c.invoices || [];
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="stack rise">
      <PageHead title="Faturalar" sub="Lisans ödemelerin ve makbuzların"
        actions={<button className="btn btn-light" onClick={() => downloadCSV("koc-faturalar.csv", [["Fatura", "Tarih", "Plan", "Tutar", "Durum"], ...invoices.map((i) => [i.id, fmtShort(i.date), coachPlanById(i.planId).name, i.amount, i.status])])}><Icon name="download" size={16} />CSV indir</button>} />

      <div className="grid g-3">
        <StatCard icon="receipt" tone="primary" value={invoices.length} label="Toplam fatura" />
        <StatCard icon="banknote" tone="success" value={TRY(paid)} label="Ödenen tutar" />
        <StatCard icon="calendar" tone="info" value={invoices[0] ? fmtShort(invoices[0].date) : "—"} label="Son ödeme" />
      </div>

      <Section title="Ödeme geçmişi">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 600 }}>
            <thead><tr><th>Fatura No</th><th>Tarih</th><th>Plan</th><th>Yöntem</th><th style={{ textAlign: "right" }}>Tutar</th><th style={{ textAlign: "center" }}>Durum</th><th></th></tr></thead>
            <tbody>
              {invoices.map((i) => {
                const p = coachPlanById(i.planId);
                const st = i.status === "paid" ? ["success", "Ödendi"] : i.status === "failed" ? ["danger", "Başarısız"] : ["warning", "Bekliyor"];
                return (
                  <tr key={i.id}>
                    <td><span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>{i.id}</span></td>
                    <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(i.date)}</span></td>
                    <td><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</span></span></td>
                    <td><span className="muted tnum" style={{ fontSize: 12 }}>{i.method}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(i.amount)}</span></td>
                    <td style={{ textAlign: "center" }}><span className={`badge badge-${st[0]}`} style={{ height: 22 }}>{st[1]}</span></td>
                    <td style={{ textAlign: "right" }}><button className="icon-btn" style={{ width: 32, height: 32 }} title="Makbuz" onClick={() => { downloadText("makbuz-" + i.id + ".txt", ["UYANIK KOÇ — MAKBUZ", "", "Fatura: " + i.id, "Tarih: " + fmtDate(i.date), "Plan: " + p.name, "Tutar: " + TRY(i.amount), "Durum: " + st[1]].join("\n")); toast("Makbuz indirildi", { icon: "download" }); }}><Icon name="download" size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 ? <div style={{ padding: 20 }}><EmptyState icon="receipt" title="Henüz fatura yok" sub="İlk ödemen sonrası burada görünecek" /></div> : null}
      </Section>
    </div>
  );
}

Object.assign(window, { CoachMyLicense, CoachPlans, CoachInvoices, CoachCheckout });
