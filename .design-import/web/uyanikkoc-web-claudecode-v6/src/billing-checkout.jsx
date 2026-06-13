/* Checkout (iyzico tarzı) + Kart Ekle modalları.
   Kart formu, taksit seçimi, sipariş özeti, 3D Secure simülasyonu. */

const CARD_BRAND = {
  visa: { label: "VISA", bg: "#1a1f71", fg: "#fff" },
  mastercard: { label: "MC", bg: "#1a1a1a", fg: "#fff" },
};
function brandFromNumber(num) {
  const n = (num || "").replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  return "visa";
}
function CardBrandBadge({ brand, size = "md" }) {
  const b = CARD_BRAND[brand] || CARD_BRAND.visa;
  const h = size === "sm" ? 18 : 24;
  return (
    <span style={{ display: "inline-grid", placeItems: "center", height: h, minWidth: h * 1.55, padding: "0 7px", borderRadius: 5, background: b.bg, color: b.fg, fontSize: size === "sm" ? 9.5 : 11.5, fontWeight: 800, letterSpacing: ".04em", fontStyle: brand === "visa" ? "italic" : "normal" }}>
      {b.label}
    </span>
  );
}

function fmtCardNum(v) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
function fmtExp(v) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; }

/* ---- Kart görseli ---- */
function CardVisual({ number, holder, exp, brand }) {
  return (
    <div className="cc-visual">
      <div className="cc-chip" />
      <CardBrandBadge brand={brand} />
      <div className="cc-number tnum">{number || "•••• •••• •••• ••••"}</div>
      <div className="cc-row">
        <div><span className="cc-cap">Kart Sahibi</span><div className="cc-val">{holder || "AD SOYAD"}</div></div>
        <div><span className="cc-cap">Son Kul.</span><div className="cc-val tnum">{exp || "AA/YY"}</div></div>
      </div>
    </div>
  );
}

/* ---- Checkout Modalı ---- */
function CheckoutModal({ open, onClose, planId, cycle, onDone }) {
  const billing = useBilling();
  const [useNew, setUseNew] = useState(false);
  const [cardId, setCardId] = useState(billing.cards.find((c) => c.isDefault)?.id || billing.cards[0]?.id || "");
  const [num, setNum] = useState(""); const [holder, setHolder] = useState(""); const [exp, setExp] = useState(""); const [cvc, setCvc] = useState("");
  const [taksit, setTaksit] = useState(TAKSIT[0]);
  const [save, setSave] = useState(true);
  const [stage, setStage] = useState("form"); // form | secure | done

  useEffect(() => {
    if (open) {
      const def = billing.cards.find((c) => c.isDefault) || billing.cards[0];
      setUseNew(billing.cards.length === 0); setCardId(def?.id || "");
      setNum(""); setHolder(""); setExp(""); setCvc(""); setTaksit(TAKSIT[0]); setSave(true); setStage("form");
    }
  }, [open]); // eslint-disable-line

  if (!open) return null;
  const p = planById(planId);
  const base = planPrice(p, cycle);
  const total = taksitTotal(base, taksit);
  const perInst = Math.round(total / taksit.n);
  const brand = useNew ? brandFromNumber(num) : (billing.cards.find((c) => c.id === cardId)?.brand || "visa");

  const canPay = useNew
    ? (num.replace(/\s/g, "").length >= 15 && holder.trim().length > 2 && exp.length === 5 && cvc.length >= 3)
    : !!cardId;

  const pay = () => {
    setStage("secure");
    setTimeout(() => {
      let cid = cardId;
      if (useNew) cid = addCard({ brand, last4: num.replace(/\s/g, "").slice(-4), holder: holder.trim(), exp, isDefault: billing.cards.length === 0 });
      const inv = subscribeTo(planId, cycle, cid, taksit.n);
      setStage("done");
      setTimeout(() => { onDone && onDone(inv); }, 1200);
    }, 1700);
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={stage === "form" ? onClose : undefined}>
      <div className="modal-panel checkout" style={{ maxWidth: 880 }} onClick={(e) => e.stopPropagation()}>
        {stage === "secure" ? (
          <div className="co-secure">
            <div className="co-spin"><Icon name="lock" size={26} /></div>
            <h3>3D Secure doğrulaması</h3>
            <p className="muted">Bankana yönlendiriliyorsun. Telefonuna gelen tek kullanımlık şifreyle ödemeyi onayla.</p>
            <div className="co-bankbar"><span className="co-bankdot" /> Güvenli bağlantı kuruldu…</div>
          </div>
        ) : stage === "done" ? (
          <div className="co-secure">
            <div className="co-ok"><Icon name="check" size={34} stroke={3} /></div>
            <h3>Ödeme başarılı 🎉</h3>
            <p className="muted">{p.name} ({cycle === "annual" ? "Yıllık" : "Aylık"}) aboneliğin aktif. Makbuzun fatura geçmişine eklendi.</p>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div className="row" style={{ gap: 11 }}>
                <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="lock" size={18} /></span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Güvenli Ödeme</h3>
                  <div className="muted" style={{ fontSize: 12 }}>256-bit SSL · iyzico altyapısı</div>
                </div>
              </div>
              <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
            </div>

            <div className="co-body">
              {/* SOL: ödeme yöntemi */}
              <div className="co-form">
                {billing.cards.length > 0 ? (
                  <div className="co-tabs">
                    <button className={!useNew ? "on" : ""} onClick={() => setUseNew(false)}>Kayıtlı kart</button>
                    <button className={useNew ? "on" : ""} onClick={() => setUseNew(true)}>Yeni kart</button>
                  </div>
                ) : null}

                {!useNew && billing.cards.length > 0 ? (
                  <div className="co-cards">
                    {billing.cards.map((c) => (
                      <button key={c.id} className={`co-card${cardId === c.id ? " on" : ""}`} onClick={() => setCardId(c.id)}>
                        <CardBrandBadge brand={c.brand} size="sm" />
                        <span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>•••• {c.last4}</span>
                        <span className="muted tnum" style={{ fontSize: 11.5, marginLeft: "auto" }}>{c.exp}</span>
                        <span className={`co-radio${cardId === c.id ? " on" : ""}`} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <CardVisual number={fmtCardNum(num)} holder={holder} exp={exp} brand={brand} />
                    <div className="field"><label className="label">Kart Numarası</label>
                      <div className="input-icon"><input className="input tnum" inputMode="numeric" placeholder="0000 0000 0000 0000" value={fmtCardNum(num)} onChange={(e) => setNum(fmtCardNum(e.target.value))} /><CardBrandBadge brand={brand} size="sm" /></div>
                    </div>
                    <div className="field"><label className="label">Kart Üzerindeki İsim</label>
                      <input className="input" placeholder="Ad Soyad" value={holder} onChange={(e) => setHolder(e.target.value.toLocaleUpperCase("tr-TR"))} />
                    </div>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="field" style={{ flex: 1 }}><label className="label">Son Kullanım</label>
                        <input className="input tnum" inputMode="numeric" placeholder="AA/YY" value={exp} onChange={(e) => setExp(fmtExp(e.target.value))} />
                      </div>
                      <div className="field" style={{ flex: 1 }}><label className="label">CVC</label>
                        <input className="input tnum" inputMode="numeric" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                      </div>
                    </div>
                    <label className="co-check"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /><span>Sonraki ödemeler için kartı güvenle kaydet</span></label>
                  </>
                )}

                {/* taksit */}
                <div style={{ marginTop: 4 }}>
                  <div className="label" style={{ marginBottom: 8 }}>Taksit Seçenekleri</div>
                  <div className="co-taksit">
                    {TAKSIT.map((t) => {
                      const tt = taksitTotal(base, t);
                      return (
                        <button key={t.n} className={`co-tk${taksit.n === t.n ? " on" : ""}`} onClick={() => setTaksit(t)}>
                          <span className="co-tk-n">{t.label}</span>
                          <span className="co-tk-pm tnum">{t.n === 1 ? TRY(tt) : TRY(Math.round(tt / t.n)) + " ×" + t.n}</span>
                          {t.rate > 0 ? <span className="co-tk-fark">+%{Math.round(t.rate * 100)} vade farkı</span> : <span className="co-tk-fark ok">vade farksız</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SAĞ: sipariş özeti */}
              <div className="co-summary">
                <div className="co-sum-head">
                  <span className="badge badge-primary" style={{ height: 22 }}>{cycle === "annual" ? "Yıllık" : "Aylık"} abonelik</span>
                  <h4>{p.name}</h4>
                  <p className="muted" style={{ fontSize: 12 }}>{p.tagline}</p>
                </div>
                <div className="co-sum-rows">
                  <div className="co-sum-row"><span>{p.name} ({cycle === "annual" ? "12 ay" : "1 ay"})</span><span className="tnum">{TRY(base)}</span></div>
                  {cycle === "annual" ? <div className="co-sum-row ok"><span>Yıllık indirim</span><span className="tnum">{annualSavingMonths(p)} ay bedava</span></div> : null}
                  {taksit.rate > 0 ? <div className="co-sum-row"><span>Vade farkı (%{Math.round(taksit.rate * 100)})</span><span className="tnum">{TRY(total - base)}</span></div> : null}
                  <div className="co-sum-row"><span>{taksit.label}</span><span className="tnum">{taksit.n === 1 ? "—" : TRY(perInst) + " / ay"}</span></div>
                </div>
                <div className="co-sum-total">
                  <span>Toplam</span>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{TRY(total)}</div>
                    {cycle === "annual" ? <div className="muted tnum" style={{ fontSize: 11 }}>≈ {TRY(planMonthlyEq(p, cycle))}/ay</div> : null}
                  </div>
                </div>
                <button className="btn btn-primary co-pay" disabled={!canPay} onClick={pay} style={{ opacity: canPay ? 1 : 0.5 }}>
                  <Icon name="lock" size={16} />{TRY(total)} Öde
                </button>
                <div className="co-trust">
                  <span><Icon name="shield" size={13} />KVKK uyumlu</span>
                  <span><Icon name="lock" size={13} />3D Secure</span>
                  <span><Icon name="refresh" size={13} />İstediğinde iptal</span>
                </div>
                <p className="co-fine muted">Devam ederek <b>Mesafeli Satış Sözleşmesi</b> ve <b>Ön Bilgilendirme Formu</b>'nu kabul etmiş olursun. Abonelik dönem sonunda otomatik yenilenir, dilediğinde iptal edebilirsin.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

/* ---- Kart Ekle Modalı ---- */
function AddCardModal({ open, onClose }) {
  const [num, setNum] = useState(""); const [holder, setHolder] = useState(""); const [exp, setExp] = useState(""); const [cvc, setCvc] = useState("");
  useEffect(() => { if (open) { setNum(""); setHolder(""); setExp(""); setCvc(""); } }, [open]);
  if (!open) return null;
  const brand = brandFromNumber(num);
  const ok = num.replace(/\s/g, "").length >= 15 && holder.trim().length > 2 && exp.length === 5 && cvc.length >= 3;
  const save = () => { addCard({ brand, last4: num.replace(/\s/g, "").slice(-4), holder: holder.trim(), exp }); onClose(); };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="card" size={18} /></span>
            <div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Kart Ekle</h3><div className="muted" style={{ fontSize: 12 }}>Kartların güvenle saklanır</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: 20, gap: 12 }}>
          <CardVisual number={fmtCardNum(num)} holder={holder} exp={exp} brand={brand} />
          <div className="field"><label className="label">Kart Numarası</label>
            <div className="input-icon"><input className="input tnum" inputMode="numeric" placeholder="0000 0000 0000 0000" value={fmtCardNum(num)} onChange={(e) => setNum(fmtCardNum(e.target.value))} /><CardBrandBadge brand={brand} size="sm" /></div>
          </div>
          <div className="field"><label className="label">Kart Üzerindeki İsim</label>
            <input className="input" placeholder="Ad Soyad" value={holder} onChange={(e) => setHolder(e.target.value.toLocaleUpperCase("tr-TR"))} />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label className="label">Son Kullanım</label><input className="input tnum" inputMode="numeric" placeholder="AA/YY" value={exp} onChange={(e) => setExp(fmtExp(e.target.value))} /></div>
            <div className="field" style={{ flex: 1 }}><label className="label">CVC</label><input className="input tnum" inputMode="numeric" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} /></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!ok} onClick={save} style={{ opacity: ok ? 1 : 0.5, marginLeft: "auto" }}><Icon name="check" size={16} />Kartı Kaydet</button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { CheckoutModal, AddCardModal, CardBrandBadge, CardVisual, brandFromNumber });
