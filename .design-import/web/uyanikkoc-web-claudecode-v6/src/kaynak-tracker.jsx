/* ============================================================
   Kaynak Takibi — paylaşımlı tracker
   <KaynakTracker student editable defaultExam />
   - editable=true  → öğrenci/koç: durum + ilerleme düzenler, katalogdan ekler
   - editable=false → veli: salt görüntüleme (durum + ilerleme + aktivite)
   Durum: beklemede → aktif → tamamlandı. İlerleme: % (elle) + ödevlerden
   türetilen gerçek aktivite (çözülen soru, doğru %, son kullanım).
   ============================================================ */

function ktTone(tone) {
  return { muted: "var(--faint)", info: "var(--info)", success: "var(--success)", primary: "var(--primary)", warning: "var(--warning)" }[tone] || "var(--primary)";
}
function ktSubjOf(name) { const k = (typeof katalogByLabel === "function") ? katalogByLabel(name) : null; return k ? k.s : "Diğer"; }
function ktTurOf(name) { const k = (typeof katalogByLabel === "function") ? katalogByLabel(name) : null; return k ? (KAYNAK_TUR[k.t] || KAYNAK_TUR.soru) : null; }
function ktRelTime(ts) {
  if (!ts) return null;
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return "bugün"; if (d === 1) return "dün"; if (d < 7) return d + " gün önce";
  if (d < 30) return Math.floor(d / 7) + " hafta önce"; return Math.floor(d / 30) + " ay önce";
}

/* tek kitap satırı */
function KaynakBook({ student, item, editable, open, onOpen }) {
  const dur = KAYNAK_DURUM[item.status] || KAYNAK_DURUM.beklemede;
  const tur = ktTurOf(item.name);
  const subj = ktSubjOf(item.name);
  const col = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[subj]) || "var(--primary)";
  const act = (typeof sourceActivity === "function") ? sourceActivity(student, item.name) : { soru: 0, acc: null, lastUsed: 0 };
  const barCol = item.status === "bitti" ? "var(--success)" : item.status === "aktif" ? col : "var(--border-strong)";

  return (
    <div className={"kt-book" + (open ? " on" : "")}>
      <button className={"kt-book-main" + (editable ? " tap" : "")} onClick={editable ? onOpen : undefined}>
        <span className="kt-ic" style={{ background: `color-mix(in srgb, ${col} 13%, transparent)`, color: col }}><Icon name={tur ? tur.icon : "book"} size={19} /></span>
        <div className="kt-info">
          <div className="kt-name">{item.name}</div>
          <div className="kt-meta">
            <span className="badge" style={{ height: 21, background: `color-mix(in srgb, ${ktTone(dur.tone)} 14%, transparent)`, color: ktTone(dur.tone), fontSize: 11 }}>
              <Icon name={dur.icon} size={12} />{dur.label}
            </span>
            {act.soru > 0 ? <span className="m">{act.soru.toLocaleString("tr-TR")} soru</span> : null}
            {act.acc != null ? <span className="m sep acc" style={{ color: act.acc >= 70 ? "var(--success)" : "var(--warning)" }}>%{act.acc} doğru</span> : null}
            {act.selfCount > 0 ? <span className="m sep" style={{ color: "var(--info)", fontWeight: 700 }}><Icon name="bolt" size={11} style={{ marginRight: 2, verticalAlign: "-1px" }} />ödev harici{act.selfSoru > 0 ? ` ${act.selfSoru}` : ""}</span> : null}
            {act.lastUsed ? <span className="m sep">{ktRelTime(act.lastUsed)}</span> : null}
          </div>
        </div>
        <div className="kt-right">
          <span className="kt-pct" style={{ color: barCol === "var(--border-strong)" ? "var(--faint)" : barCol }}>%{item.progress}</span>
          <span className="kt-bar"><span style={{ width: item.progress + "%", background: barCol }} /></span>
        </div>
      </button>
      {open && editable ? <KaynakBookEditor student={student} item={item} /> : null}
    </div>
  );
}

/* satır düzenleyici (durum + ilerleme + ödev harici çalışma + çıkar) */
function KaynakBookEditor({ student, item }) {
  const [prog, setProg] = useState(item.progress);
  useEffect(() => { setProg(item.progress); }, [item.progress]);
  const setStatus = (s) => updateSource(student, item.name, { status: s });
  const commitProg = (v) => updateSource(student, item.name, { progress: v });

  const self = (typeof useSelfStudy === "function") ? useSelfStudy(student).filter((s) => s.book === item.name) : [];
  const kSoru = (typeof catalogSoru === "function") ? catalogSoru(item.name) : null;
  const subj = ktSubjOf(item.name);
  const [mode, setMode] = useState(null);     // null | "cozdum"
  const [sv, setSv] = useState(""); const [dv, setDv] = useState("");
  const sN = parseInt(sv, 10) || 0, dN = Math.min(parseInt(dv, 10) || 0, sN);
  const saveCozdum = () => { if (sN <= 0) return; addSelfStudy(student, { book: item.name, kind: "cozdum", soru: sN, dogru: dv.trim() ? dN : null, subject: subj }); setSv(""); setDv(""); setMode(null); };
  const saveCalistim = () => { addSelfStudy(student, { book: item.name, kind: "calistim", soru: 0, subject: subj }); };

  return (
    <div className="kt-edit">
      <div>
        <div className="lbl">Durum</div>
        <div className="kt-statusrow">
          {KAYNAK_DURUM_SIRA.map((s) => {
            const d = KAYNAK_DURUM[s]; const on = item.status === s;
            return (
              <button key={s} className={"kt-stbtn" + (on ? " on" : "")} style={on ? { background: ktTone(d.tone) } : {}} onClick={() => setStatus(s)}>
                <Icon name={d.icon} size={14} />{d.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="lbl">İlerleme — kitabın ne kadarı bitti?{kSoru > 0 ? <span style={{ color: "var(--faint)", fontWeight: 600, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>· kitapta ~{kSoru.toLocaleString("tr-TR")} soru</span> : null}</div>
        <div className="kt-slider-row">
          <input className="kt-slider" type="range" min="0" max="100" step="5" value={prog}
            onChange={(e) => setProg(+e.target.value)} onMouseUp={(e) => commitProg(+e.target.value)} onTouchEnd={(e) => commitProg(prog)} onKeyUp={(e) => commitProg(prog)} />
          <span className="kt-slider-val">%{prog}</span>
        </div>
      </div>

      {/* ödev harici çalışma */}
      <div>
        <div className="lbl">Ödev harici çalışma</div>
        {mode === "cozdum" ? (
          <div className="kt-self-form">
            <div className="kt-self-fields">
              <label>Çözdüğüm soru<input type="number" min="0" value={sv} onChange={(e) => setSv(e.target.value)} autoFocus /></label>
              <label>Doğru <span>(ops.)</span><input type="number" min="0" value={dv} onChange={(e) => setDv(e.target.value)} /></label>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-light btn-sm" onClick={() => { setMode(null); setSv(""); setDv(""); }}>Vazgeç</button>
              <button className="btn btn-primary btn-sm" disabled={sN <= 0} onClick={saveCozdum}><Icon name="check" size={14} />Kaydet</button>
            </div>
          </div>
        ) : (
          <div className="kt-self-actions">
            <button className="kt-self-btn" onClick={() => setMode("cozdum")}><Icon name="notebook" size={15} /><b>Çözdüm</b><span>soru sayısı gir</span></button>
            <button className="kt-self-btn" onClick={saveCalistim}><Icon name="book" size={15} /><b>Çalıştım</b><span>konu çalışması</span></button>
          </div>
        )}
        {self.length > 0 ? (
          <div className="kt-self-log">
            {self.slice(0, 4).map((s) => (
              <div className="kt-self-row" key={s.id}>
                <Icon name={s.kind === "cozdum" ? "notebook" : "book"} size={13} style={{ color: s.kind === "cozdum" ? "var(--primary)" : "var(--info)" }} />
                <span className="t">{s.kind === "cozdum" ? `${s.soru} soru çözdüm${s.dogru != null ? ` · ${s.dogru} doğru` : ""}` : "Konu çalıştım"}</span>
                <span className="dt">{ktRelTime(s.date)}</span>
                <button onClick={() => removeSelfStudy(student, s.id)} aria-label="Sil"><Icon name="plus" size={12} style={{ transform: "rotate(45deg)" }} /></button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="kt-edit-foot">
        <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{(KAYNAK_DURUM[item.status] || {}).hint}</span>
        <button className="btn btn-light btn-sm" onClick={() => removeSource(student, item.name)} style={{ color: "var(--danger)" }}>
          <Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />Kitaptan çıkar
        </button>
      </div>
    </div>
  );
}

function KaynakTracker({ student, editable = false, defaultExam = "Tümü" }) {
  const items = useSources(student);
  const selfAll = (typeof useSelfStudy === "function") ? useSelfStudy(student) : [];
  const [katalog, setKatalog] = useState(false);
  const [openName, setOpenName] = useState(null);

  // özet sayımlar
  const counts = { aktif: 0, beklemede: 0, bitti: 0 };
  items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; });
  const totalSoru = items.reduce((a, i) => a + ((typeof sourceActivity === "function") ? sourceActivity(student, i.name).soru : 0), 0);

  // derse göre grupla
  const groups = {};
  items.forEach((i) => { const s = ktSubjOf(i.name); (groups[s] = groups[s] || []).push(i); });
  const order = ["Türkçe", "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji", "Fen Bilimleri", "T.C. İnkılap Tarihi", "Din Kültürü", "İngilizce", "Deneme", "Diğer"];
  const groupKeys = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  // grup içi sıralama: aktif → beklemede → bitti, sonra ilerleme
  groupKeys.forEach((g) => groups[g].sort((a, b) => {
    const oa = KAYNAK_DURUM_SIRA.indexOf(a.status), ob = KAYNAK_DURUM_SIRA.indexOf(b.status);
    if (oa !== ob) return oa - ob; return b.progress - a.progress;
  }));

  const head = (
    <div className="row" style={{ gap: 8 }}>
      <div className="kt-summary">
        {counts.aktif > 0 ? <span className="kt-pill"><span className="dot" style={{ background: "var(--info)" }} /><b>{counts.aktif}</b> aktif</span> : null}
        {counts.bitti > 0 ? <span className="kt-pill"><span className="dot" style={{ background: "var(--success)" }} /><b>{counts.bitti}</b> bitti</span> : null}
        {counts.beklemede > 0 ? <span className="kt-pill"><span className="dot" style={{ background: "var(--faint)" }} /><b>{counts.beklemede}</b> beklemede</span> : null}
        {totalSoru > 0 ? <span className="kt-pill q"><Icon name="notebook" size={13} /><b>{totalSoru.toLocaleString("tr-TR")}</b> soru</span> : null}
      </div>
      {editable ? <button className="btn btn-primary btn-sm" onClick={() => setKatalog(true)} style={{ marginLeft: "auto" }}><Icon name="plus" size={15} />Katalogdan ekle</button> : null}
    </div>
  );

  return (
    <Section title="Kaynak Takibi" sub={editable ? "Kitaplarının durumunu ve ne kadarının bittiğini takip et" : "Öğrencinin kitap ilerlemesi ve çözdüğü soru aktivitesi"} action={head}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {selfAll.length > 0 ? (
          <div className="kt-feed">
            <div className="kt-feed-head"><Icon name="bolt" size={14} /><b>Ödev harici çalışma</b><span>son {Math.min(selfAll.length, 5)} kayıt</span></div>
            <div className="kt-feed-list">
              {selfAll.slice(0, 5).map((s) => {
                const col = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[s.subject]) || "var(--primary)";
                return (
                  <div className="kt-feed-row" key={s.id}>
                    <span className="sw" style={{ background: col }} />
                    <span className="bk">{s.book}</span>
                    <span className="ac">{s.kind === "cozdum" ? `${s.soru} soru çözdü${s.dogru != null ? ` · ${s.dogru} D` : ""}` : "konu çalıştı"}</span>
                    <span className="dt">{ktRelTime(s.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        {items.length === 0 ? (
          editable ? (
            <button className="kt-empty" onClick={() => setKatalog(true)}>
              <Icon name="book" size={26} style={{ color: "var(--faint)" }} />
              <b>Henüz kaynak eklenmedi</b>
              <p>Bilinen yayınevi kitaplarını <b style={{ color: "var(--primary-600)" }}>katalogdan</b> ekle, durum ve ilerlemeyi takip et</p>
            </button>
          ) : <div style={{ padding: "28px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu öğrencinin eklenmiş kaynağı yok.</div>
        ) : groupKeys.map((g) => {
          const col = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[g]) || "var(--primary)";
          return (
            <div key={g} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="kt-grp"><span className="sw" style={{ background: col }} /><span className="nm">{g}</span><span className="ct">{groups[g].length}</span></div>
              {groups[g].map((it) => (
                <KaynakBook key={it.name} student={student} item={it} editable={editable} open={openName === it.name} onOpen={() => setOpenName(openName === it.name ? null : it.name)} />
              ))}
            </div>
          );
        })}
      </div>
      {editable ? <KaynakKatalogModal open={katalog} onClose={() => setKatalog(false)} student={student} defaultExam={defaultExam} /> : null}
    </Section>
  );
}

Object.assign(window, { KaynakTracker, KaynakBook });
