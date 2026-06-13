/* Deneme Excel içe aktarıcı — tarayıcıda xlsx parse (DecompressionStream),
   ÖZDEBİR/ÖSYM tipi sıralı liste formatı. + Deneme store + İçe Aktar modalı. */

/* ---- Ders → ana TYT kategorisi eşlemesi ---- */
const CAT_OF = {
  "TÜRKÇE": "Türkçe",
  "TARİH": "Sosyal", "COĞRAFYA": "Sosyal", "FELSEFE": "Sosyal", "DİN KÜLTÜRÜ": "Sosyal", "DIN KULTURU": "Sosyal",
  "MATEMATİK": "Matematik",
  "FİZİK": "Fen", "KİMYA": "Fen", "BİYOLOJİ": "Fen",
};
const CAT_ORDER = ["Türkçe", "Sosyal", "Matematik", "Fen"];
const CAT_COLOR = { "Türkçe": "#B26A12", "Sosyal": "#A3582D", "Matematik": "#534AB7", "Fen": "#0F6E56" };

/* ---- xlsx unzip + parse ---- */
async function _inflate(bytes) {
  const ds = new DecompressionStream("deflate-raw");
  const w = ds.writable.getWriter(); w.write(bytes); w.close();
  return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer());
}
function _decodeEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function _colNum(ref) { const m = ref.match(/^([A-Z]+)/)[1]; let n = 0; for (const ch of m) n = n * 26 + (ch.charCodeAt(0) - 64); return n; }

async function parseDenemeXlsx(arrayBuffer) {
  const buf = new Uint8Array(arrayBuffer);
  const u16 = (o) => buf[o] | (buf[o + 1] << 8);
  const u32 = (o) => (buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16) | (buf[o + 3] << 24)) >>> 0;
  let i = 0; const files = {};
  while (i + 4 <= buf.length) {
    if (u32(i) !== 0x04034b50) break;
    const method = u16(i + 8), compSize = u32(i + 18), nameLen = u16(i + 26), extraLen = u16(i + 28);
    const nameStart = i + 30;
    const name = new TextDecoder().decode(buf.slice(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    const comp = buf.slice(dataStart, dataStart + compSize);
    if (/sharedStrings\.xml$|sheet1\.xml$/.test(name)) {
      files[name] = method === 0 ? new TextDecoder().decode(comp) : await _inflate(comp);
    }
    i = dataStart + compSize;
  }
  const ssXml = files["xl/sharedStrings.xml"] || "";
  const strs = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => {
    const ts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
    return _decodeEntities(ts.join(""));
  });
  const sheet = files["xl/worksheets/sheet1.xml"] || "";
  const rowsRaw = [...sheet.matchAll(/<row[^>]*?>([\s\S]*?)<\/row>/g)];
  const cellVal = (full) => {
    const t = (full.match(/ t="([^"]+)"/) || [])[1];
    const v = (full.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
    const is = (full.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1];
    if (t === "s") return strs[+v] ?? "";
    if (is != null && v == null) return _decodeEntities(is);
    return v != null ? v : "";
  };
  const grid = rowsRaw.map((r) => {
    const cells = [...r[1].matchAll(/<c r="([A-Z]+\d+)"[^>]*\/>|<c r="([A-Z]+\d+)"[^>]*>([\s\S]*?)<\/c>/g)];
    const row = {};
    for (const m of cells) { const ref = m[1] || m[2]; row[_colNum(ref)] = cellVal(m[0]); }
    return row;
  });

  // header satırı: "AD VE SOYAD" içeren
  let hIdx = grid.findIndex((row) => Object.values(row).some((v) => String(v).toUpperCase().includes("AD VE SOYAD")));
  if (hIdx < 0) throw new Error("Beklenen format değil: 'AD VE SOYAD' başlığı bulunamadı.");
  const header = grid[hIdx];
  const labelRow = grid[hIdx - 1] || {};
  const findCol = (pred) => { for (const c of Object.keys(header)) if (pred(String(header[c]).toUpperCase())) return +c; return -1; };
  const adCol = findCol((h) => h.includes("AD VE SOYAD"));
  const subeCol = findCol((h) => h.includes("UBE") && !h.includes("SUBE") ) >= 0 ? findCol((h) => h.includes("UBE")) : 2;
  const numaraCol = findCol((h) => h.includes("NUMARA"));
  const alanCol = findCol((h) => h === "ALAN");
  const puanCol = findCol((h) => h.includes("PUAN"));
  const genelCol = findCol((h) => h === "GENEL");

  // ders üçlüleri: header'da 'D' olan sütunlar (Y, N takip eder)
  const subjects = []; let total = null;
  for (const c of Object.keys(header).map(Number).sort((a, b) => a - b)) {
    if (String(header[c]).toUpperCase() === "D" && c >= 6) {
      const label = String(labelRow[c] || "").trim().toUpperCase();
      if (label === "TOPLAM" || String(header[c + 2]).toUpperCase() === "NET") { total = { dCol: c }; }
      else if (label) subjects.push({ name: label, dCol: c });
    }
  }

  const num = (x) => { const n = parseFloat(String(x).replace(",", ".")); return isNaN(n) ? 0 : n; };
  const students = [];
  for (let r = hIdx + 1; r < grid.length; r++) {
    const row = grid[r];
    const ad = String(row[adCol] || "").trim();
    if (!ad) continue;
    const byCat = {}; const detail = [];
    CAT_ORDER.forEach((k) => byCat[k] = { d: 0, y: 0, n: 0 });
    for (const s of subjects) {
      const d = num(row[s.dCol]), y = num(row[s.dCol + 1]), n = num(row[s.dCol + 2]);
      const cat = CAT_OF[s.name] || s.name;
      if (!byCat[cat]) byCat[cat] = { d: 0, y: 0, n: 0 };
      byCat[cat].d += d; byCat[cat].y += y; byCat[cat].n += n;
      detail.push({ ders: _titleCase(s.name), cat, d, y, n });
    }
    const toplamNet = total ? num(row[total.dCol + 2]) : Object.values(byCat).reduce((a, x) => a + x.n, 0);
    students.push({
      no: String(row[1] || students.length + 1),
      sube: String(row[subeCol] || "").trim(),
      numara: String(row[numaraCol] || "").trim(),
      ad: _titleCase(ad),
      alan: String(row[alanCol] || "").trim(),
      byCat, detail,
      toplamNet,
      puan: puanCol > 0 ? num(row[puanCol]) : 0,
      rank: genelCol > 0 ? parseInt(row[genelCol]) || null : null,
    });
  }
  students.sort((a, b) => b.toplamNet - a.toplamNet);
  return { name: "TYT Denemesi", subjects: subjects.map((s) => _titleCase(s.name)), students, importedAt: Date.now() };
}

function _titleCase(s) {
  return String(s).toLocaleLowerCase("tr-TR").replace(/(^|\s|-)([a-zçğıöşü])/g, (m, p, c) => p + c.toLocaleUpperCase("tr-TR"));
}

/* ---- Deneme store ---- */
const EXAMS_KEY = "uk_imported_exams_v1";
let _exams = (() => { try { const s = localStorage.getItem(EXAMS_KEY); if (s) return JSON.parse(s); } catch (e) {} return []; })();
const _eListeners = new Set();
function getExams() { return _exams; }
function addExam(ex) { _exams = [{ id: "ex" + Date.now(), ...ex }, ..._exams]; persistExams(); }
function removeExam(id) { _exams = _exams.filter((e) => e.id !== id); persistExams(); }
/* manuel/tekil sonuç ekle: aynı isimli deneme varsa öğrenciyi ekler/günceller, yoksa oluşturur */
function upsertResult(examName, student, subjects, meta) {
  let ex = _exams.find((e) => e.name.toLocaleLowerCase("tr-TR") === examName.toLocaleLowerCase("tr-TR"));
  if (!ex) {
    ex = { id: "ex" + Date.now(), name: examName, date: new Date().toLocaleDateString("tr-TR"), subjects: subjects || [], students: [], manual: true, examType: (meta && meta.examType) || "YKS", catOrder: meta && meta.catOrder };
    _exams = [ex, ..._exams];
  }
  ex.students = ex.students.filter((s) => s.ad !== student.ad);
  ex.students.push(student);
  ex.students.sort((a, b) => b.toplamNet - a.toplamNet);
  ex.students.forEach((s, i) => { if (s.rank == null) s._localRank = i + 1; });
  persistExams();
  return ex;
}
function persistExams() { try { localStorage.setItem(EXAMS_KEY, JSON.stringify(_exams)); } catch (e) {} _eListeners.forEach((l) => l()); }
function useExams() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _eListeners.add(l); return () => _eListeners.delete(l); }, []);
  return _exams;
}

/* ---- Demo deneme verisi (Excel'den içe aktarılmış gibi) — gerçek import yoksa ---- */
function _seedDemoExams() {
  if (_exams.length) return;
  const names = ["Elif Yıldız", "Kerem Aksoy", "Zeynep Demir", "Mert Çelik", "Ada Şahin", "Burak Yılmaz", "Defne Kaya", "Ege Arslan", "Naz Öztürk", "Can Doğan", "İrem Polat", "Yusuf Kara", "Selin Aydın", "Deniz Koç"];
  const subes = ["12-SAY-A", "12-SAY-B", "12-EA-A", "Mezun"];
  const CAPS = { "Türkçe": 40, "Sosyal": 20, "Matematik": 40, "Fen": 20 };
  const mkCat = (d, y) => ({ d, y, n: Math.max(0, +(d - y / 4).toFixed(2)) });
  const exams = [
    { id: "demo-5", name: "ÖZDEBİR TYT Genel Deneme #5", date: "12 May 2026", off: 0 },
    { id: "demo-6", name: "Apotemi TYT Genel Deneme #6", date: "26 May 2026", off: 1.6 },
    { id: "demo-7", name: "3D TYT Genel Deneme #7", date: "6 Haz 2026", off: 3.2 },
  ];
  exams.forEach((ex, ei) => {
    const students = names.map((ad, i) => {
      const skill = i === 0 ? 0.72 : 0.32 + ((i * 53) % 56) / 100; // Elif güçlü ve istikrarlı
      const prog = ex.off * (i === 0 ? 1.3 : 0.7 + ((i * 17) % 60) / 100);
      const mkc = (capName, mult) => {
        const cap = CAPS[capName];
        let d = Math.round(cap * (skill * mult) + prog * mult);
        d = Math.max(2, Math.min(cap, d));
        const y = Math.max(0, Math.round((cap - d) * 0.34 * (1.1 - skill)));
        return mkCat(d, y);
      };
      const byCat = { "Türkçe": mkc("Türkçe", 1.0), "Sosyal": mkc("Sosyal", 0.96), "Matematik": mkc("Matematik", 0.86), "Fen": mkc("Fen", 0.82) };
      const detail = [
        { ders: "Türkçe", cat: "Türkçe", ...byCat["Türkçe"] },
        { ders: "Tarih", cat: "Sosyal", ...mkCat(Math.round(byCat["Sosyal"].d * 0.4), Math.round(byCat["Sosyal"].y * 0.4)) },
        { ders: "Coğrafya", cat: "Sosyal", ...mkCat(Math.round(byCat["Sosyal"].d * 0.35), Math.round(byCat["Sosyal"].y * 0.35)) },
        { ders: "Matematik", cat: "Matematik", ...byCat["Matematik"] },
        { ders: "Fizik", cat: "Fen", ...mkCat(Math.round(byCat["Fen"].d * 0.4), Math.round(byCat["Fen"].y * 0.4)) },
        { ders: "Kimya", cat: "Fen", ...mkCat(Math.round(byCat["Fen"].d * 0.3), Math.round(byCat["Fen"].y * 0.3)) },
        { ders: "Biyoloji", cat: "Fen", ...mkCat(Math.round(byCat["Fen"].d * 0.3), Math.round(byCat["Fen"].y * 0.3)) },
      ];
      const toplamNet = +(CAT_ORDER.reduce((a, k) => a + byCat[k].n, 0)).toFixed(2);
      return { no: String(i + 1), sube: subes[i % subes.length], numara: String(1024 + i), ad, alan: "Sayısal", byCat, detail, toplamNet, puan: +(120 + toplamNet * 4.05).toFixed(1) };
    });
    students.sort((a, b) => b.toplamNet - a.toplamNet);
    students.forEach((s, idx) => { s.rank = idx + 1; });
    _exams.push({ id: ex.id, name: ex.name, date: ex.date, examType: "YKS", subjects: ["Türkçe", "Tarih", "Coğrafya", "Matematik", "Fizik", "Kimya", "Biyoloji"], students, importedAt: Date.now() - (3 - ei) * 86400000, demo: true });
  });
  _exams.reverse(); // en yeni en üstte
}
_seedDemoExams();

/* ---- İçe Aktar modalı ---- */
function DenemeImportModal({ open, onClose, onImported }) {
  const [stage, setStage] = useState("idle"); // idle | parsing | preview | error
  const [parsed, setParsed] = useState(null);
  const [examName, setExamName] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  useEffect(() => { if (open) { setStage("idle"); setParsed(null); setErr(""); setExamName(""); } }, [open]);
  if (!open) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setStage("parsing"); setErr("");
    try {
      const ab = await file.arrayBuffer();
      const res = await parseDenemeXlsx(ab);
      if (!res.students.length) throw new Error("Dosyada öğrenci satırı bulunamadı.");
      setParsed(res);
      setExamName(file.name.replace(/\.xlsx?$/i, "").replace(/[_(].*$/, "").trim() || "TYT Denemesi");
      setStage("preview");
    } catch (e) { setErr(e.message || "Dosya okunamadı."); setStage("error"); }
  };

  const doImport = () => {
    addExam({ name: examName || "TYT Denemesi", date: new Date().toLocaleDateString("tr-TR"), ...parsed });
    onImported && onImported(parsed);
    onClose();
  };

  const avg = parsed ? (parsed.students.reduce((a, s) => a + s.toplamNet, 0) / parsed.students.length).toFixed(1) : 0;

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-success" style={{ width: 36, height: 36 }}><Icon name="chart" size={18} /></span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>Deneme Sonucu İçe Aktar</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>Yayınevinden gelen Excel'i yükle (.xlsx)</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          {stage === "idle" || stage === "error" ? (
            <div className="dropzone" onClick={() => fileRef.current && fileRef.current.click()}>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
              <span className="stat-icon tone-primary" style={{ width: 54, height: 54, borderRadius: 16 }}><Icon name="plus" size={26} /></span>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>Excel dosyasını seç</div>
              <div className="muted" style={{ fontSize: 12.5 }}>Sıralı liste formatı (ÖZDEBİR / ÖSYM TG) · D / Y / N sütunları</div>
              {stage === "error" ? <div className="badge badge-danger" style={{ marginTop: 8 }}><Icon name="alert" size={13} />{err}</div> : null}
            </div>
          ) : null}

          {stage === "parsing" ? <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>Dosya işleniyor…</div> : null}

          {stage === "preview" && parsed ? (
            <>
              <div className="field">
                <label className="label">Deneme adı</label>
                <input className="input" value={examName} onChange={(e) => setExamName(e.target.value)} />
              </div>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <Badge tone="success" icon="checkCircle">{parsed.students.length} öğrenci okundu</Badge>
                <Badge tone="muted" icon="book">{parsed.subjects.length} ders</Badge>
                <Badge tone="primary" icon="target">Ort. {avg} net</Badge>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="card-body" style={{ padding: 0, maxHeight: 280, overflowY: "auto" }}>
                  <table className="tbl" style={{ minWidth: 520 }}>
                    <thead><tr><th>#</th><th>Ad Soyad</th><th>Şube</th>{CAT_ORDER.map((c) => <th key={c} style={{ textAlign: "center" }}>{c}</th>)}<th style={{ textAlign: "right" }}>Net</th></tr></thead>
                    <tbody>
                      {parsed.students.slice(0, 12).map((s, i) => (
                        <tr key={i}>
                          <td><span className="tnum muted">{i + 1}</span></td>
                          <td><b style={{ fontSize: 12.5 }}>{s.ad}</b></td>
                          <td><span className="muted" style={{ fontSize: 11.5 }}>{s.sube}</span></td>
                          {CAT_ORDER.map((c) => <td key={c} style={{ textAlign: "center" }}><span className="tnum" style={{ fontSize: 12 }}>{(s.byCat[c]?.n ?? 0).toFixed(2).replace(/\.00$/, "")}</span></td>)}
                          <td style={{ textAlign: "right" }}><b className="tnum">{s.toplamNet.toFixed(2).replace(/\.00$/, "")}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {parsed.students.length > 12 ? <div className="muted" style={{ fontSize: 11.5, textAlign: "center" }}>+{parsed.students.length - 12} öğrenci daha…</div> : null}
            </>
          ) : null}
        </div>

        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          {stage === "preview" ? <button className="btn btn-primary" onClick={doImport}><Icon name="checkCircle" size={16} />İçe Aktar ({parsed.students.length})</button> : null}
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Tüm denemeler listesi (koç net gelişimi + veli deneme sonuçları için ortak) ---- */
function ExamHistoryList({ studentName }) {
  const exams = useExams();
  const chrono = exams.slice().reverse().map((e) => { const f = (e.students || []).find((s) => s.ad === studentName); return f ? { id: e.id, name: e.name, type: e.examType, date: e.date, net: f.toplamNet, puan: f.puan, rank: f.rank } : null; }).filter(Boolean);
  chrono.forEach((r, i) => { r.delta = i > 0 ? +(r.net - chrono[i - 1].net).toFixed(2) : null; });
  const rows = chrono.slice().reverse();
  if (!rows.length) return <div style={{ padding: "26px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu öğrenci için içe aktarılmış deneme bulunamadı.</div>;
  const series = chrono.map((r) => r.net);
  const best = Math.max(...series);
  const avg = +(series.reduce((a, b) => a + b, 0) / series.length).toFixed(1);
  const f2 = (n) => n.toFixed(2).replace(/\.00$/, "");
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <span className="badge badge-primary"><Icon name="chart" size={13} />{rows.length} deneme</span>
        <span className="badge badge-success"><Icon name="trend" size={13} />En iyi {f2(best)} net</span>
        <span className="badge badge-muted">Ortalama {avg} net</span>
      </div>
      {series.length > 1 ? <Sparkline data={series} h={72} color="var(--primary)" /> : null}
      <div className="card" style={{ overflow: "hidden", boxShadow: "none" }}>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 460 }}>
            <thead><tr><th>Deneme</th><th>Tür</th><th style={{ textAlign: "right" }}>Net</th><th style={{ textAlign: "right" }}>Değişim</th><th style={{ textAlign: "right" }}>Sıra</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><b style={{ fontSize: 12.5 }}>{r.name}</b>{r.date ? <div className="muted" style={{ fontSize: 11 }}>{r.date}</div> : null}</td>
                  <td><span className="badge badge-muted" style={{ height: 21 }}>{r.type || "—"}</span></td>
                  <td style={{ textAlign: "right" }}><b className="tnum">{f2(r.net)}</b></td>
                  <td style={{ textAlign: "right" }}>{r.delta == null ? <span className="muted">—</span> : r.delta >= 0 ? <span className="delta up" style={{ fontSize: 11.5 }}><Icon name="arrowUp" size={11} />+{r.delta}</span> : <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--danger)" }}>{r.delta}</span>}</td>
                  <td style={{ textAlign: "right" }}><span className="tnum muted">{r.rank ? r.rank.toLocaleString("tr-TR") : "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { parseDenemeXlsx, getExams, addExam, removeExam, upsertResult, useExams, DenemeImportModal, ExamHistoryList, CAT_ORDER, CAT_COLOR, CAT_OF });
