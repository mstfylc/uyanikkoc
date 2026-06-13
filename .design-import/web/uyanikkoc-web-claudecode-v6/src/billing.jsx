/* B2C Abonelik sayfası (öğrenci + veli) — sekmeli:
   Aboneliğim · Paketler · Faturalar · Ödeme Yöntemleri */

function fmtDate(ts) { return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); }
function daysLeft(ts) { return Math.max(0, Math.ceil((ts - Date.now()) / 86400000)); }

/* ---- Paketler (pricing) ---- */
function PricingScreen({ onBuy }) {
  const billing = useBilling();
  const [cycle, setCycle] = useState(billing.sub.cycle || "annual");
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="pricing-toggle-wrap">
        <div className="seg pricing-toggle">
          <button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Aylık</button>
          <button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Yıllık <span className="save-pill">2 ay bedava</span></button>
        </div>
      </div>
      <div className="pricing-grid">
        {PLANS.map((p) => {
          const isCurrent = billing.sub.planId === p.id && billing.sub.cycle === cycle && billing.sub.status !== "canceled";
          return (
            <div key={p.id} className={`plan-card${p.popular ? " popular" : ""}`}>
              {p.popular ? <span className="plan-flag">En çok tercih edilen</span> : null}
              <div className="plan-top">
                <span className="plan-dot" style={{ background: p.color }} />
                <h3>{p.name}</h3>
                <p className="muted">{p.tagline}</p>
              </div>
              <div className="plan-price">
                <span className="tnum amount">{TRY(planMonthlyEq(p, cycle))}</span>
                <span className="per muted">/ay{cycle === "annual" ? <span className="tnum"> · yıllık {TRY(p.annual)}</span> : null}</span>
              </div>
              {cycle === "annual"
                ? <div className="plan-saved"><Icon name="check" size={13} stroke={3} />Aylığa göre {TRY(p.monthly * 12 - p.annual)} tasarruf</div>
                : <div className="plan-saved muted" style={{ background: "transparent" }}>İstediğin zaman yıllığa geç</div>}
              <ul className="plan-feat">
                {p.features.map((f, i) => <li key={i}><Icon name="check" size={15} stroke={2.5} style={{ color: p.color }} />{f}</li>)}
              </ul>
              {isCurrent
                ? <button className="btn btn-light" disabled style={{ width: "100%", opacity: .7 }}><Icon name="check" size={16} />Mevcut planın</button>
                : <button className={`btn ${p.popular ? "btn-primary" : "btn-outline"}`} style={{ width: "100%" }} onClick={() => onBuy(p.id, cycle)}>{p.name} Seç<Icon name="chevronRight" size={16} /></button>}
            </div>
          );
        })}
      </div>
      <div className="pricing-note">
        <Icon name="shield" size={16} /> Tüm paketler KVKK uyumlu, 3D Secure korumalı. İlk 7 gün içinde iptal edersen ücret iadesi yapılır.
      </div>
    </div>
  );
}

/* ---- Aboneliğim ---- */
function SubscriptionTab({ onChangePlan, onBuy }) {
  const billing = useBilling();
  const s = billing.sub;
  const p = planById(s.planId);
  const card = billing.cards.find((c) => c.id === s.cardId);
  const canceled = s.status === "canceled";
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className={`sub-hero${canceled ? " canceled" : ""}`}>
        <div className="sub-hero-main">
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <span className="plan-dot" style={{ background: p.color, width: 12, height: 12 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{p.name}</h2>
            {canceled
              ? <span className="badge badge-danger" style={{ height: 24 }}>İptal edildi</span>
              : <span className="badge badge-success" style={{ height: 24 }}><span className="dot-live" />Aktif</span>}
            <span className="badge badge-muted" style={{ height: 24 }}>{s.cycle === "annual" ? "Yıllık" : "Aylık"}</span>
          </div>
          <p className="muted" style={{ fontSize: 13.5, maxWidth: 440 }}>{p.tagline}</p>
          <div className="sub-meta">
            <div><span className="muted">Başlangıç</span><b>{fmtDate(s.startedAt)}</b></div>
            <div><span className="muted">{canceled ? "Erişim sonu" : "Sonraki yenileme"}</span><b>{fmtDate(s.renewsAt)}</b></div>
            <div><span className="muted">Ödeme yöntemi</span><b className="row" style={{ gap: 6 }}>{card ? <><CardBrandBadge brand={card.brand} size="sm" /> •{card.last4}</> : "—"}</b></div>
          </div>
        </div>
        <div className="sub-hero-side">
          <div className="sub-countdown">
            <span className="tnum">{daysLeft(s.renewsAt)}</span>
            <span className="muted">gün {canceled ? "erişim" : "kaldı"}</span>
          </div>
          <div className="tnum" style={{ fontSize: 15, fontWeight: 800 }}>{TRY(planPrice(p, s.cycle))}<span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/{s.cycle === "annual" ? "yıl" : "ay"}</span></div>
        </div>
      </div>

      {canceled ? (
        <div className="notice warn">
          <Icon name="alert" size={18} />
          <div style={{ flex: 1 }}><b>Aboneliğin iptal edildi.</b><div className="muted" style={{ fontSize: 12.5 }}>{fmtDate(s.renewsAt)} tarihine kadar erişimin devam eder. Fikrini değiştirirsen tekrar aktifleştirebilirsin.</div></div>
          <button className="btn btn-primary btn-sm" onClick={() => resumeSubscription()}><Icon name="refresh" size={15} />Aboneliği Sürdür</button>
        </div>
      ) : (
        <Section title="Plan & Yenileme" sub="Planını yükselt, faturalama dönemini değiştir veya yenilemeyi yönet">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label className="renew-toggle">
              <div><b style={{ fontSize: 13.5 }}>Otomatik yenileme</b><div className="muted" style={{ fontSize: 12 }}>{s.cycle === "annual" ? "Yıl" : "Ay"} sonunda {TRY(planPrice(p, s.cycle))} otomatik tahsil edilir</div></div>
              <button className={`switch${s.autoRenew ? " on" : ""}`} onClick={() => setAutoRenew(!s.autoRenew)} aria-label="Otomatik yenileme"><span /></button>
            </label>
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={onChangePlan}><Icon name="arrowUp" size={16} />Planı Değiştir / Yükselt</button>
              {s.cycle === "monthly"
                ? <button className="btn btn-light" onClick={() => onBuy(s.planId, "annual")}><Icon name="star" size={15} />Yıllığa geç · 2 ay bedava</button>
                : null}
              <button className="btn btn-ghost-danger" style={{ marginLeft: "auto" }} onClick={() => setConfirmCancel(true)}>Aboneliği iptal et</button>
            </div>
          </div>
        </Section>
      )}

      {confirmCancel ? ReactDOM.createPortal((
        <div className="modal-overlay" onClick={() => setConfirmCancel(false)}>
          <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: 24, textAlign: "center", gap: 12 }}>
              <span className="stat-icon tone-danger" style={{ width: 48, height: 48, margin: "0 auto" }}><Icon name="alert" size={24} /></span>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Aboneliği iptal et?</h3>
              <p className="muted" style={{ fontSize: 13 }}>{fmtDate(s.renewsAt)} tarihine kadar tüm koçluk özelliklerine erişimin sürer. Sonrasında hesabın ücretsiz moda döner.</p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-light" onClick={() => setConfirmCancel(false)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ marginLeft: "auto" }} onClick={() => { cancelSubscription(); setConfirmCancel(false); }}>İptali Onayla</button>
            </div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}

/* ---- Faturalar ---- */
function InvoicesTab() {
  const billing = useBilling();
  const paidTotal = billing.invoices.filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="grid g-3">
        <StatCard icon="receipt" tone="primary" value={billing.invoices.length} label="Toplam fatura" />
        <StatCard icon="banknote" tone="success" value={TRY(paidTotal)} label="Ödenen tutar" />
        <StatCard icon="calendar" tone="info" value={billing.invoices[0] ? fmtDate(billing.invoices[0].date).split(" ").slice(1).join(" ") : "—"} label="Son ödeme" />
      </div>
      <Section title="Fatura & Ödeme Geçmişi" sub="Geçmiş ödemelerini görüntüle ve makbuzları indir">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 640 }}>
            <thead><tr><th>Fatura No</th><th>Tarih</th><th>Plan</th><th>Yöntem</th><th style={{ textAlign: "right" }}>Tutar</th><th style={{ textAlign: "center" }}>Durum</th><th></th></tr></thead>
            <tbody>
              {billing.invoices.map((inv) => {
                const p = planById(inv.planId);
                const st = inv.status === "paid" ? ["success", "Ödendi"] : inv.status === "pending" ? ["warning", "Bekliyor"] : ["danger", "Başarısız"];
                return (
                  <tr key={inv.id}>
                    <td><span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>{inv.id}</span></td>
                    <td><span className="muted" style={{ fontSize: 12.5 }}>{fmtDate(inv.date)}</span></td>
                    <td><div className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</span><span className="muted" style={{ fontSize: 11 }}>{inv.cycle === "annual" ? "Yıllık" : "Aylık"}{inv.taksit > 1 ? ` · ${inv.taksit}×` : ""}</span></div></td>
                    <td><span className="muted tnum" style={{ fontSize: 12 }}>{inv.method}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{TRY(inv.amount)}</span></td>
                    <td style={{ textAlign: "center" }}><span className={`badge badge-${st[0]}`} style={{ height: 22 }}>{st[1]}</span></td>
                    <td style={{ textAlign: "right" }}><button className="icon-btn" style={{ width: 32, height: 32 }} title="Makbuzu indir" aria-label="İndir" onClick={() => {
                      const lines = ["UYANIK KOÇ — ÖDEME MAKBUZU", "", "Fatura No: " + inv.id, "Tarih: " + fmtDate(inv.date), "Plan: " + p.name + " (" + (inv.cycle === "annual" ? "Yıllık" : "Aylık") + ")", "Ödeme yöntemi: " + inv.method, (inv.taksit > 1 ? "Taksit: " + inv.taksit + " ay" : "Tek çekim"), "Tutar: " + TRY(inv.amount), "Durum: Ödendi", "", "Bu belge bilgilendirme amaçlıdır."].join("\n");
                      downloadText("makbuz-" + inv.id + ".txt", lines); toast("Makbuz indirildi", { icon: "download" });
                    }}><Icon name="download" size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* ---- Ödeme Yöntemleri ---- */
function PaymentMethodsTab() {
  const billing = useBilling();
  const [add, setAdd] = useState(false);
  return (
    <div className="stack" style={{ gap: 14 }}>
      <Section title="Kayıtlı Kartlar" sub="Yenilemeler ve yeni ödemeler için kullanılır" action={<button className="btn btn-primary btn-sm" onClick={() => setAdd(true)}><Icon name="plus" size={15} />Kart Ekle</button>}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {billing.cards.length === 0 ? (
            <button onClick={() => setAdd(true)} className="dropzone" style={{ padding: "28px 24px" }}>
              <Icon name="card" size={26} style={{ color: "var(--faint)" }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-2)" }}>Kayıtlı kart yok</div>
              <div className="muted" style={{ fontSize: 12 }}>Hızlı ödeme için bir <b style={{ color: "var(--primary-600)" }}>kart ekle</b></div>
            </button>
          ) : billing.cards.map((c) => (
            <div key={c.id} className="pm-row">
              <CardBrandBadge brand={c.brand} />
              <div style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}><b className="tnum" style={{ fontSize: 14 }}>•••• •••• •••• {c.last4}</b>{c.isDefault ? <span className="badge badge-primary" style={{ height: 19, fontSize: 10 }}>Varsayılan</span> : null}</div>
                <div className="muted" style={{ fontSize: 12 }}>{c.holder} · son kul. {c.exp}</div>
              </div>
              <div className="row" style={{ gap: 6, marginLeft: "auto" }}>
                {!c.isDefault ? <button className="btn btn-light btn-sm" onClick={() => setDefaultCard(c.id)}>Varsayılan yap</button> : null}
                <button className="icon-btn" style={{ width: 34, height: 34, color: "var(--danger)" }} onClick={() => removeCard(c.id)} title="Kartı sil" aria-label="Sil"><Icon name="plus" size={16} style={{ transform: "rotate(45deg)" }} /></button>
              </div>
            </div>
          ))}
          <div className="pm-secure"><Icon name="lock" size={14} />Kart bilgilerin uygulamada saklanmaz; iyzico güvenli kasasında tutulur.</div>
        </div>
      </Section>
      <AddCardModal open={add} onClose={() => setAdd(false)} />
    </div>
  );
}

/* ---- Ana sayfa (sekmeli) ---- */
function BillingPage() {
  const [tab, setTab] = useState("sub");
  const [checkout, setCheckout] = useState(null); // {planId, cycle}
  const TABS = [
    { k: "sub", label: "Aboneliğim", icon: "star" },
    { k: "plans", label: "Paketler", icon: "bolt" },
    { k: "invoices", label: "Faturalar", icon: "receipt" },
    { k: "methods", label: "Ödeme Yöntemleri", icon: "card" },
  ];
  const buy = (planId, cycle) => setCheckout({ planId, cycle });

  return (
    <div className="stack rise">
      <PageHead title="Abonelik & Ödeme" sub="Koçluk paketini, faturalarını ve ödeme yöntemlerini yönet" />
      <div className="seg-tabs">
        {TABS.map((t) => (
          <button key={t.k} className={`seg-tab${tab === t.k ? " on" : ""}`} onClick={() => setTab(t.k)}>
            <Icon name={t.icon} size={16} />{t.label}
          </button>
        ))}
      </div>

      {tab === "sub" ? <SubscriptionTab onChangePlan={() => setTab("plans")} onBuy={buy} /> : null}
      {tab === "sub" && typeof DenemeUyelikSection === "function" ? <DenemeUyelikSection /> : null}
      {tab === "plans" ? <PricingScreen onBuy={buy} /> : null}
      {tab === "invoices" ? <InvoicesTab /> : null}
      {tab === "methods" ? <PaymentMethodsTab /> : null}

      <CheckoutModal
        open={!!checkout}
        planId={checkout?.planId}
        cycle={checkout?.cycle}
        onClose={() => setCheckout(null)}
        onDone={() => { setCheckout(null); setTab("sub"); }}
      />
    </div>
  );
}

Object.assign(window, { BillingPage, PricingScreen, SubscriptionTab, InvoicesTab, PaymentMethodsTab });
