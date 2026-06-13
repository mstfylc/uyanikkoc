/* ============================================================
   Deneme Kayıt + Üyelik sistemi
   - Koç deneme oluşturur (DENEME_EVENTS)
   - Öğrenci denemeye kayıt olur; ödeme mi paket kapsamı mı belli olur
   - 2 deneme üyeliği: Yüz Yüze Deneme Paketi · Aylık Kargo Üyeliği
   - Kargo üyeliği olan denemeyi ONLINE OPTİK formdan doldurmak zorunda
   localStorage'da kalıcı.
   ============================================================ */
const _tryFmt = (n) => (typeof TRY === "function" ? TRY(n) : "₺" + Number(n).toLocaleString("tr-TR"));

/* ---- Üyelik planları ---- */
const DENEME_PLANS = [
  {
    id: "yuzyuze", name: "Yüz Yüze Deneme Paketi", mode: "yuzyuze", color: "var(--primary)", price: 1200, popular: true,
    tagline: "Kurumda gözetmenli, kağıt deneme",
    perks: ["Ayda 4 yüz yüze deneme", "Kurumda optik okuma", "Anında net & sıralama", "Salonda sınav provası deneyimi"],
  },
  {
    id: "kargo", name: "Aylık Kargo Üyeliği", mode: "kargo", color: "var(--info)", price: 750,
    tagline: "Denemeler adresine gelir, online optik",
    perks: ["Denemeler her ay kargoyla adresine", "Online optik formdan giriş", "Net anında otomatik hesaplanır", "Dilediğin yerde, dilediğin saatte"],
    note: "Bu üyelikte kayıt olduğun denemeleri online optik formdan doldurman gerekir.",
  },
];
function denemePlanById(id) { return DENEME_PLANS.find((p) => p.id === id) || null; }

/* ---- Store ---- */
const DK_EVENTS_KEY = "uk_deneme_events_v1";
const DK_REGS_KEY = "uk_deneme_regs_v1";
const DK_MEMBER_KEY = "uk_deneme_members_v1";

let _dkEvents = (() => { try { const s = localStorage.getItem(DK_EVENTS_KEY); if (s) return JSON.parse(s); } catch (e) {} return [
  { id: "ev1", name: "TYT Genel Deneme #8", examType: "TYT", date: "14 Haz 2026", time: "10:00", place: "Kampüs Koç · Kadıköy", soru: 120, price: 150 },
  { id: "ev2", name: "AYT Sayısal Deneme #4", examType: "AYT", date: "21 Haz 2026", time: "10:00", place: "Kampüs Koç · Kadıköy", soru: 80, price: 150 },
  { id: "ev3", name: "LGS Genel Deneme #6", examType: "LGS", date: "22 Haz 2026", time: "10:00", place: "Online / Kargo", soru: 90, price: 120 },
  { id: "ev4", name: "TYT Kamp Denemesi", examType: "TYT", date: "28 Haz 2026", time: "13:30", place: "Online / Kargo", soru: 120, price: 120 },
]; })();
let _dkRegs = (() => { try { const s = localStorage.getItem(DK_REGS_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  ev1: { "Kerem Aksoy": { payment: "paket", mode: "yuzyuze", at: Date.now() - 2 * 86400000 }, "Zeynep Demir": { payment: "odendi", mode: "yuzyuze", at: Date.now() - 86400000 }, "Defne Kaya": { payment: "paket", mode: "yuzyuze", at: Date.now() - 3 * 86400000 }, "Elif Yıldız": { payment: "paket", mode: "online", at: Date.now() - 86400000 } },
  ev2: { "Kerem Aksoy": { payment: "paket", mode: "yuzyuze", at: Date.now() - 86400000 }, "Ege Arslan": { payment: "odendi", mode: "yuzyuze", at: Date.now() - 2 * 86400000 } },
}; })();
let _dkMembers = (() => { try { const s = localStorage.getItem(DK_MEMBER_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  "Elif Yıldız": "kargo", "Kerem Aksoy": "yuzyuze", "Defne Kaya": "yuzyuze",
}; })();

const _dkListeners = new Set();
function _dkPersist() {
  try {
    localStorage.setItem(DK_EVENTS_KEY, JSON.stringify(_dkEvents));
    localStorage.setItem(DK_REGS_KEY, JSON.stringify(_dkRegs));
    localStorage.setItem(DK_MEMBER_KEY, JSON.stringify(_dkMembers));
  } catch (e) {}
  _dkListeners.forEach((l) => l());
}
function useDeneme() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _dkListeners.add(l); return () => _dkListeners.delete(l); }, []);
  return { events: _dkEvents, regs: _dkRegs, members: _dkMembers };
}
function studentMembership(name) { return _dkMembers[name] || null; }
function setStudentMembership(name, type) { _dkMembers = { ..._dkMembers, [name]: type }; _dkPersist(); }
function addDenemeEvent(ev) { _dkEvents = [...(_dkEvents), { id: "ev" + Date.now(), ...ev }]; _dkPersist(); }
function removeDenemeEvent(id) { _dkEvents = _dkEvents.filter((e) => e.id !== id); const r = { ..._dkRegs }; delete r[id]; _dkRegs = r; _dkPersist(); }
function regsOf(examId) { return Object.entries(_dkRegs[examId] || {}).map(([student, rec]) => ({ student, ...rec })); }
function countRegistered(examId) { return Object.keys(_dkRegs[examId] || {}).length; }
function isRegistered(examId, name) { return !!(_dkRegs[examId] && _dkRegs[examId][name]); }
function registerExam(examId, name) {
  const m = studentMembership(name);
  const mode = m === "kargo" ? "online" : "yuzyuze";
  const payment = m ? "paket" : "odendi";
  _dkRegs = { ..._dkRegs, [examId]: { ...(_dkRegs[examId] || {}), [name]: { payment, mode, at: Date.now() } } };
  _dkPersist();
  return { payment, mode };
}
function unregisterExam(examId, name) { if (_dkRegs[examId]) { const e = { ...(_dkRegs[examId]) }; delete e[name]; _dkRegs = { ..._dkRegs, [examId]: e }; _dkPersist(); } }

/* helpers */
const _examTypeTone = { TYT: "primary", AYT: "info", LGS: "success", YKS: "primary" };
function _denemeMe() { return (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız"; }

/* ---- Öğrenci: Denemeye Kayıt modalı ---- */
function DenemeKayitModal({ open, onClose }) {
  const me = _denemeMe();
  const { events, regs } = useDeneme();
  const membership = studentMembership(me);
  const plan = denemePlanById(membership);
  const [done, setDone] = useState(null);
  if (!open) return null;
  const sinav = (typeof loadAuth === "function" && /LGS/i.test(loadAuth()?.sub || "")) ? "LGS" : "YKS";
  const list = events.filter((e) => sinav === "LGS" ? e.examType === "LGS" : e.examType !== "LGS");
  const doReg = (ev) => { const r = registerExam(ev.id, me); if (typeof toast === "function") toast("“" + ev.name + "” için kaydın alındı", { icon: "checkCircle" }); setDone({ ev, ...r }); };
  const goOnline = () => { window.__ukExamTab = "online"; window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "exams" } })); onClose(); };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 540, height: "min(700px, calc(100vh - 40px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="chart" size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Denemeye Kayıt Ol</h3><div className="muted" style={{ fontSize: 12 }}>Yaklaşan denemelerden seç</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        {done ? (
          <div className="modal-body" style={{ padding: 26, textAlign: "center", gap: 12, alignItems: "center" }}>
            <span className="stat-icon tone-success" style={{ width: 56, height: 56 }}><Icon name="checkCircle" size={28} /></span>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Kaydın alındı!</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}><b style={{ color: "var(--text)" }}>{done.ev.name}</b> · {done.ev.date} {done.ev.time}</p>
            {done.mode === "online" ? (
              <div className="notice" style={{ background: "var(--info-soft)", borderColor: "color-mix(in srgb, var(--info) 25%, transparent)", textAlign: "left" }}>
                <Icon name="notebook" size={18} style={{ color: "var(--info)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12.5 }}><b>Kargo üyeliği</b> — bu denemeyi <b>online optik formdan</b> doldurman gerekir. Deneme kitapçığın adresine kargolanır.</div>
              </div>
            ) : (
              <div className="notice" style={{ background: "var(--primary-soft)", borderColor: "color-mix(in srgb, var(--primary) 22%, transparent)", textAlign: "left" }}>
                <Icon name="calendar" size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12.5 }}><b>Yüz yüze</b> — {done.ev.place}. Sınav günü kimliğinle hazır ol.</div>
              </div>
            )}
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              {done.mode === "online" ? <button className="btn btn-primary" onClick={goOnline}><Icon name="notebook" size={15} />Online optik forma git</button> : null}
              <button className="btn btn-light" onClick={() => setDone(null)}>Başka denemeye kayıt</button>
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ padding: 18, gap: 12, overflowY: "auto" }}>
            {plan ? (
              <div className="notice" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="stat-icon" style={{ width: 34, height: 34, background: "color-mix(in srgb, " + plan.color + " 14%, transparent)", color: plan.color }}><Icon name={plan.mode === "kargo" ? "notebook" : "checkCircle"} size={17} /></span>
                <div style={{ flex: 1, fontSize: 12.5 }}><b>Aktif üyeliğin: {plan.name}</b><div className="muted">{plan.mode === "kargo" ? "Denemeler kargoyla gelir, online optik doldurursun." : "Denemeler paketine dahil, kurumda yüz yüze."}</div></div>
              </div>
            ) : (
              <div className="notice" style={{ background: "var(--warning-soft)", borderColor: "color-mix(in srgb, var(--warning) 25%, transparent)" }}>
                <Icon name="alert" size={18} style={{ color: "var(--warning)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12.5 }}>Deneme üyeliğin yok — her deneme için ayrı ücret. <button className="link-btn" style={{ display: "inline" }} onClick={() => { window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "billing" } })); onClose(); }}>Üyelik al</button></div>
              </div>
            )}
            {list.map((ev) => {
              const reg = isRegistered(ev.id, me);
              const covered = !!membership;
              return (
                <div className="lrow" key={ev.id} style={{ alignItems: "center", padding: "13px 14px" }}>
                  <span className="lr-icon" style={{ background: "var(--" + (_examTypeTone[ev.examType] || "primary") + "-soft)", color: "var(--" + (_examTypeTone[ev.examType] || "primary") + ")", flexShrink: 0 }}><Icon name="chart" size={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{ev.name}</div>
                    <div className="lr-meta"><span className="badge badge-muted" style={{ height: 19, fontSize: 10 }}>{ev.examType}</span><span className="d">{ev.date} · {ev.time}</span><span className="d">{ev.place}</span><span className="d">{ev.soru} soru</span></div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 6, color: covered ? "var(--success)" : "var(--text)" }}>{covered ? "Paketine dahil" : _tryFmt(ev.price)}</div>
                    {reg ? <Badge tone="success" icon="check">Kayıtlı</Badge> : <button className="btn btn-primary btn-sm" onClick={() => doReg(ev)}><Icon name="plus" size={14} />{covered ? "Kayıt ol" : "Kayıt ol & öde"}</button>}
                  </div>
                </div>
              );
            })}
            {list.length === 0 ? <div style={{ padding: 24, textAlign: "center" }}><EmptyState icon="chart" title="Yaklaşan deneme yok" sub="Koçun yeni deneme eklediğinde burada görünür" /></div> : null}
          </div>
        )}
      </div>
    </div>
  ), document.body);
}

/* ---- Koç: Deneme Oluştur modalı ---- */
function CoachDenemeOlusturModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [place, setPlace] = useState("Kampüs Koç · Kadıköy");
  const [soru, setSoru] = useState("120");
  const [price, setPrice] = useState("150");
  useEffect(() => { if (open) { setName(""); setExamType("TYT"); setDate(""); setTime("10:00"); setPlace("Kampüs Koç · Kadıköy"); setSoru("120"); setPrice("150"); } }, [open]);
  if (!open) return null;
  const ok = name.trim().length > 2 && date.trim();
  const submit = () => { addDenemeEvent({ name: name.trim(), examType, date: date.trim(), time, place: place.trim(), soru: parseInt(soru, 10) || 0, price: parseInt(price, 10) || 0 }); if (typeof toast === "function") toast("Deneme oluşturuldu — öğrenciler kayıt olabilir", { icon: "checkCircle" }); onClose(); };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}><span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}><Icon name="plus" size={18} /></span><div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Deneme Oluştur</h3><div className="muted" style={{ fontSize: 12.5 }}>Öğrencilerin kayıt olabileceği yeni deneme</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 13 }}>
          <div className="field"><label className="label">Deneme adı</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. TYT Genel Deneme #9" autoFocus /></div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field"><label className="label">Tür</label><select className="select" value={examType} onChange={(e) => setExamType(e.target.value)}>{["TYT", "AYT", "LGS"].map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="field"><label className="label">Soru sayısı</label><input className="input tnum" inputMode="numeric" value={soru} onChange={(e) => setSoru(e.target.value.replace(/\D/g, ""))} /></div>
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field"><label className="label">Tarih</label><input type="date" className="input tnum" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field"><label className="label">Saat</label><input type="time" className="input tnum" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
          <div className="field"><label className="label">Yer / yöntem</label><input className="input" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Kurum adı veya Online / Kargo" /></div>
          <div className="field"><label className="label">Ücret (₺) <span className="muted" style={{ fontWeight: 600 }}>· üyeliği olmayan öğrenciler için</span></label><input className="input tnum" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} /></div>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={submit}><Icon name="plus" size={16} />Oluştur</button>
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Koç: Deneme Takvimi & Kayıtlar ---- */
function CoachDenemeManager() {
  const { events, regs } = useDeneme();
  const [create, setCreate] = useState(false);
  const [exp, setExp] = useState(null);
  const totalReg = events.reduce((a, e) => a + countRegistered(e.id), 0);
  return (
    <Section title="Deneme Takvimi & Kayıtlar" sub={`${events.length} deneme · ${totalReg} kayıt`}
      action={<button className="btn btn-primary btn-sm" onClick={() => setCreate(true)}><Icon name="plus" size={16} />Deneme Oluştur</button>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.length === 0 ? <EmptyState icon="chart" title="Henüz deneme yok" sub="“Deneme Oluştur” ile başla" /> : null}
        {events.map((ev) => {
          const list = regsOf(ev.id);
          const open = exp === ev.id;
          const paid = list.filter((r) => r.payment === "odendi").length;
          const pkg = list.filter((r) => r.payment === "paket").length;
          return (
            <div key={ev.id} style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", background: open ? "var(--surface-2)" : "transparent" }}>
              <div className="lrow" style={{ padding: "13px 14px", cursor: "pointer", background: "transparent" }} onClick={() => setExp(open ? null : ev.id)}>
                <span className="lr-icon" style={{ background: "var(--" + (_examTypeTone[ev.examType] || "primary") + "-soft)", color: "var(--" + (_examTypeTone[ev.examType] || "primary") + ")", flexShrink: 0 }}><Icon name="chart" size={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{ev.name}</div>
                  <div className="lr-meta"><span className="badge badge-muted" style={{ height: 19, fontSize: 10 }}>{ev.examType}</span><span className="d">{ev.date} · {ev.time}</span><span className="d">{ev.place}</span></div>
                </div>
                <div className="row" style={{ gap: 10, flexShrink: 0 }}>
                  <span className="row" style={{ gap: 6 }}><Icon name="users" size={15} style={{ color: "var(--muted)" }} /><b className="tnum" style={{ fontSize: 14 }}>{list.length}</b><span className="muted" style={{ fontSize: 11.5 }}>kayıt</span></span>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={(e) => { e.stopPropagation(); if (confirm(ev.name + " silinsin mi?")) removeDenemeEvent(ev.id); }} title="Sil"><Icon name="plus" size={15} style={{ transform: "rotate(45deg)", color: "var(--danger)" }} /></button>
                  <Icon name="chevronDown" size={16} style={{ color: "var(--faint)", transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
                </div>
              </div>
              {open ? (
                <div style={{ padding: "0 14px 14px" }}>
                  <div className="row" style={{ gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <Badge tone="primary" icon="users">{list.length} kayıtlı</Badge>
                    <Badge tone="success" icon="checkCircle">{pkg} paket kapsamı</Badge>
                    <Badge tone="info" icon="banknote">{paid} ödemeli</Badge>
                  </div>
                  {list.length === 0 ? <div className="muted" style={{ fontSize: 12.5, padding: "8px 0" }}>Henüz kayıt yok.</div> : (
                    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 11 }}>
                      <table className="tbl" style={{ minWidth: 460 }}>
                        <thead><tr><th>Öğrenci</th><th style={{ textAlign: "center" }}>Ödeme durumu</th><th style={{ textAlign: "right" }}>Katılım</th></tr></thead>
                        <tbody>
                          {list.map((r) => (
                            <tr key={r.student}>
                              <td><div className="name"><Avatar name={r.student} size={28} /><b style={{ fontSize: 12.5 }}>{r.student}</b></div></td>
                              <td style={{ textAlign: "center" }}>{r.payment === "paket" ? <Badge tone="success" icon="checkCircle">Aktif pakete dahil</Badge> : <Badge tone="info" icon="banknote">Ödemesi yapıldı</Badge>}</td>
                              <td style={{ textAlign: "right" }}>{r.mode === "online" ? <Badge tone="muted" icon="notebook">Online optik</Badge> : <Badge tone="muted" icon="calendar">Yüz yüze</Badge>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <CoachDenemeOlusturModal open={create} onClose={() => setCreate(false)} />
    </Section>
  );
}

/* ---- Abonelik: Deneme Üyeliği bölümü (öğrenci/veli) ---- */
function DenemeUyelikSection() {
  const me = _denemeMe();
  const { members } = useDeneme();
  const cur = studentMembership(me);
  const choose = (id) => { setStudentMembership(me, id); if (typeof toast === "function") toast(denemePlanById(id).name + " aktif edildi", { icon: "checkCircle" }); };
  return (
    <Section title="Deneme Üyeliği" sub="Deneme sınavlarına erişim için paket seç" action={cur ? <Badge tone="success" icon="checkCircle">{denemePlanById(cur).name}</Badge> : <Badge tone="muted">Üyelik yok</Badge>}>
      <div className="card-body">
        <div className="grid g-2" style={{ gap: 14 }}>
          {DENEME_PLANS.map((p) => {
            const isCur = cur === p.id;
            return (
              <div key={p.id} className={`plan-card${p.popular ? " popular" : ""}`} style={{ padding: 18 }}>
                {p.popular ? <span className="plan-flag">En çok tercih edilen</span> : null}
                <div className="plan-top"><span className="plan-dot" style={{ background: p.color }} /><h3>{p.name}</h3><p className="muted">{p.tagline}</p></div>
                <div className="plan-price"><span className="tnum amount">{_tryFmt(p.price)}</span><span className="per muted">/ay</span></div>
                <ul className="plan-feat">{p.perks.map((f, i) => <li key={i}><Icon name="check" size={15} stroke={2.5} style={{ color: p.color }} />{f}</li>)}</ul>
                {p.note ? <div className="notice" style={{ background: "var(--info-soft)", borderColor: "color-mix(in srgb, var(--info) 22%, transparent)", padding: "9px 11px" }}><Icon name="notebook" size={15} style={{ color: "var(--info)", flexShrink: 0 }} /><span style={{ fontSize: 11.5 }}>{p.note}</span></div> : null}
                {isCur
                  ? <button className="btn btn-light" disabled style={{ width: "100%", opacity: .75 }}><Icon name="check" size={16} />Mevcut üyeliğin</button>
                  : <button className={`btn ${p.popular ? "btn-primary" : "btn-outline"}`} style={{ width: "100%" }} onClick={() => choose(p.id)}>{p.name} Seç<Icon name="chevronRight" size={16} /></button>}
              </div>
            );
          })}
        </div>
        {cur ? <button className="btn btn-ghost-danger btn-sm" style={{ marginTop: 12 }} onClick={() => { setStudentMembership(me, null); if (typeof toast === "function") toast("Deneme üyeliğin iptal edildi", { icon: "alert" }); }}>Üyeliği iptal et</button> : null}
      </div>
    </Section>
  );
}

Object.assign(window, {
  DENEME_PLANS, denemePlanById, useDeneme, studentMembership, setStudentMembership,
  addDenemeEvent, removeDenemeEvent, regsOf, countRegistered, isRegistered, registerExam, unregisterExam,
  DenemeKayitModal, CoachDenemeOlusturModal, CoachDenemeManager, DenemeUyelikSection,
});
