/* Ödev store'u (kaynak, soru adedi, tür, not, bitiş, sonuç D/Y/B) + haftalar
   + öğrencinin kendi kaynak listesi. localStorage'da kalıcı. */

/* Hafta etiketleri (en yeni → eski) */
const WEEKS = [
  { id: "w0", label: "Bu hafta", range: "2 – 8 Haz" },
  { id: "w1", label: "Geçen hafta", range: "26 May – 1 Haz" },
  { id: "w2", label: "2 hafta önce", range: "19 – 25 May" },
  { id: "w3", label: "3 hafta önce", range: "12 – 18 May" },
];

const ODEV_TYPES = {
  soru:  { label: "Soru Çözümü", icon: "notebook", needsResult: true },
  video: { label: "Video İzleme", icon: "ai", needsResult: false },
  konu:  { label: "Konu Çalışması", icon: "book", needsResult: false },
  test:  { label: "Deneme/Test", icon: "chart", needsResult: true, fixed: true },
};
/* Deneme/Test sabit soru sayıları (öğretmen değiştiremez) */
const EXAM_SORU = { YKS: 120, LGS: 90 };

/* KAYNAK_HAVUZU + KAYNAK_DEFAULTS artık ulusal katalogdan (kaynak-catalog.jsx)
   türetilir; bu dosyadan önce yüklenir ve global olarak erişilir. */

/* ---- ödev store ---- */
const ODEV_KEY = "uk_odevler_v1";
const SOURCES_KEY = "uk_sources_v2";

let _odevler = (() => { try { const s = localStorage.getItem(ODEV_KEY); if (s) return JSON.parse(s); } catch (e) {} return seedOdev(); })();

function seedOdev() {
  // birkaç örnek ödev (Elif Yıldız) — demo
  return [
    { id: "o1", student: "Elif Yıldız", week: "w0", subject: "Matematik", topic: "Türev", source: "Apotemi AYT Matematik Soru Bankası", count: 40, type: "soru", note: "Karma test, süreli çöz", due: "2026-06-06", status: "done", result: { d: 31, y: 6, b: 3 }, assignedAt: Date.now() },
    { id: "o2", student: "Elif Yıldız", week: "w0", subject: "Fizik", topic: "Kuvvet ve Newton", source: "Tonguç Akademi Fizik Konu Föyleri", count: 0, type: "video", note: "Önce konu videolarını izle", due: "2026-06-05", status: "pending", result: null, assignedAt: Date.now() },
    { id: "o3", student: "Elif Yıldız", week: "w0", subject: "Türkçe", topic: "Paragraf", source: "Hız ve Renk Paragraf Soru Bankası", count: 30, type: "soru", note: "", due: "2026-06-07", status: "pending", result: null, assignedAt: Date.now() },
    { id: "o4", student: "Elif Yıldız", week: "w1", subject: "Kimya", topic: "Mol Kavramı", source: "Orbital Kimya Soru Bankası", count: 25, type: "soru", note: "", due: "2026-05-30", status: "done", result: { d: 18, y: 5, b: 2 }, assignedAt: Date.now() },
    { id: "o5", student: "Elif Yıldız", week: "w1", subject: "Geometri", topic: "Üçgenler", source: "Antrenmanlarla Geometri Soru Bankası", count: 0, type: "konu", note: "Konu anlatımını bitir", due: "2026-05-29", status: "done", result: null, assignedAt: Date.now() },
  ];
}

const _oListeners = new Set();
function persistOdev() { try { localStorage.setItem(ODEV_KEY, JSON.stringify(_odevler)); } catch (e) {} _oListeners.forEach((l) => l()); }
function getOdevler() { return _odevler; }
function addOdevler(list) { _odevler = [...list, ..._odevler]; persistOdev(); }
function updateOdev(id, patch) { _odevler = _odevler.map((o) => o.id === id ? { ...o, ...patch } : o); persistOdev(); }
function useOdevler() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _oListeners.add(l); return () => _oListeners.delete(l); }, []);
  return _odevler;
}

/* ---- öğrencinin kendi kaynakları (zengin: durum + ilerleme) ----
   item = { name, status: "beklemede"|"aktif"|"bitti", progress: 0..100 } */
const KAYNAK_DURUM = {
  beklemede: { label: "Beklemede", short: "Beklemede", tone: "muted",   icon: "clock",       hint: "Eklendi, henüz başlanmadı" },
  aktif:     { label: "Aktif",     short: "Aktif",     tone: "info",    icon: "book",        hint: "Şu an çalışılıyor" },
  bitti:     { label: "Tamamlandı",short: "Bitti",     tone: "success", icon: "checkCircle", hint: "Kitap bitirildi" },
};
const KAYNAK_DURUM_SIRA = ["aktif", "beklemede", "bitti"];

/* eski biçimi (string[]) zengin biçime taşı */
function _migrateSourceList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((x) => {
    if (typeof x === "string") return { name: x, status: "beklemede", progress: 0 };
    return { name: x.name, status: x.status || "beklemede", progress: typeof x.progress === "number" ? x.progress : 0 };
  });
}

let _sources = (() => {
  try { const s = localStorage.getItem(SOURCES_KEY); if (s) { const o = JSON.parse(s); Object.keys(o).forEach((k) => o[k] = _migrateSourceList(o[k])); return o; } } catch (e) {}
  return { "Elif Yıldız": [
    { name: "Apotemi AYT Matematik Soru Bankası", status: "aktif", progress: 62 },
    { name: "Hız ve Renk Paragraf Soru Bankası", status: "bitti", progress: 100 },
    { name: "Tonguç Akademi Fizik Konu Föyleri", status: "beklemede", progress: 0 },
    { name: "Orbital Kimya Soru Bankası", status: "aktif", progress: 38 },
    { name: "Antrenmanlarla Geometri Soru Bankası", status: "aktif", progress: 21 },
  ] };
})();
const _sListeners = new Set();
function persistSources() { try { localStorage.setItem(SOURCES_KEY, JSON.stringify(_sources)); } catch (e) {} _sListeners.forEach((l) => l()); }

/* geriye dönük: isim listesi döndürür (ödev seçici + konu takibi bunu kullanır) */
function getSources(student) { return (_sources[student] || []).map((s) => s.name); }
/* zengin kalemler */
function getSourceItems(student) { return _sources[student] || []; }
function addSource(student, name) {
  const cur = _sources[student] || [];
  if (!cur.some((s) => s.name === name)) _sources = { ..._sources, [student]: [...cur, { name, status: "beklemede", progress: 0 }] };
  persistSources();
}
function removeSource(student, name) { _sources = { ..._sources, [student]: (_sources[student] || []).filter((x) => x.name !== name) }; persistSources(); }
function updateSource(student, name, patch) {
  _sources = { ..._sources, [student]: (_sources[student] || []).map((s) => {
    if (s.name !== name) return s;
    const next = { ...s, ...patch };
    // ilerleme/durum tutarlılığı
    if (patch.progress != null) { next.progress = Math.max(0, Math.min(100, Math.round(patch.progress))); if (next.progress >= 100) next.status = "bitti"; else if (next.progress > 0 && next.status === "beklemede") next.status = "aktif"; }
    if (patch.status === "bitti" && patch.progress == null) next.progress = 100;
    if (patch.status === "beklemede" && patch.progress == null) next.progress = 0;
    return next;
  }) };
  persistSources();
}
function useSources(student) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _sListeners.add(l); return () => _sListeners.delete(l); }, []);
  return _sources[student] || [];
}

/* bir kaynağın ödevlerden + ödev harici çalışmadan türetilen gerçek aktivitesi */
function sourceActivity(student, name) {
  let soru = 0, d = 0, y = 0, b = 0, count = 0, lastUsed = 0;
  _odevler.forEach((o) => {
    if (o.student !== student || o.source !== name) return;
    count++;
    if (o.assignedAt && o.assignedAt > lastUsed) lastUsed = o.assignedAt;
    if (o.result) { d += o.result.d || 0; y += o.result.y || 0; b += o.result.b || 0; soru += (o.result.d || 0) + (o.result.y || 0) + (o.result.b || 0); }
  });
  const odevSoru = soru, odevCount = count;
  // ödev harici çalışma
  let selfSoru = 0, selfCount = 0, selfD = 0;
  (_self[student] || []).forEach((s) => {
    if (s.book !== name) return;
    selfCount++; count++;
    if (s.date && s.date > lastUsed) lastUsed = s.date;
    if (s.kind === "cozdum") { selfSoru += s.soru || 0; soru += s.soru || 0; if (s.dogru != null) { d += s.dogru; selfD += s.dogru; } }
  });
  const net = Math.max(0, d - y / 4);
  const acc = soru > 0 ? Math.round((d / soru) * 100) : null;
  return { soru, d, y, b, net: Math.round(net * 100) / 100, acc, count, lastUsed, odevSoru, odevCount, selfSoru, selfCount };
}

/* ---- ödev harici çalışma (self-study) ----
   entry = { id, book, kind: "cozdum"|"calistim", soru, dogru, date, subject } */
const SELF_KEY = "uk_selfstudy_v1";
let _self = (() => { try { const s = localStorage.getItem(SELF_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  "Elif Yıldız": [
    { id: "ss1", book: "Apotemi AYT Matematik Soru Bankası", kind: "cozdum", soru: 40, dogru: 31, subject: "Matematik", date: Date.now() - 2 * 86400000 },
    { id: "ss2", book: "Orbital Kimya Soru Bankası", kind: "cozdum", soru: 25, dogru: 17, subject: "Kimya", date: Date.now() - 4 * 86400000 },
    { id: "ss3", book: "Tonguç Akademi Fizik Konu Föyleri", kind: "calistim", soru: 0, dogru: null, subject: "Fizik", date: Date.now() - 1 * 86400000 },
  ],
}; })();
const _selfListeners = new Set();
function persistSelf() { try { localStorage.setItem(SELF_KEY, JSON.stringify(_self)); } catch (e) {} _selfListeners.forEach((l) => l()); _sListeners.forEach((l) => l()); }
function getSelfStudy(student) { return _self[student] || []; }
function addSelfStudy(student, entry) {
  const e = { id: "ss" + Date.now() + Math.floor(Math.random() * 999), date: Date.now(), dogru: null, soru: 0, ...entry };
  _self = { ..._self, [student]: [e, ...(_self[student] || [])] };
  persistSelf();
  // kaynağı otomatik aktif yap + ilerlemeyi hafifçe artır
  const items = _sources[student] || [];
  if (items.some((s) => s.name === entry.book)) {
    updateSource(student, entry.book, { status: (items.find((s) => s.name === entry.book).status === "bitti") ? "bitti" : "aktif" });
  }
  return e;
}
function removeSelfStudy(student, id) { _self = { ..._self, [student]: (_self[student] || []).filter((x) => x.id !== id) }; persistSelf(); }
function useSelfStudy(student) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _selfListeners.add(l); return () => _selfListeners.delete(l); }, []);
  return _self[student] || [];
}
/* katalogdan kaynağın soru sayısı */
function catalogSoru(name) { const k = (typeof katalogByLabel === "function") ? katalogByLabel(name) : null; return k ? (k.soru || 0) : null; }

function sourcesForSubject(subject, student) {
  const pool = KAYNAK_HAVUZU[subject] || [];
  const mine = getSources(student);
  return [...new Set([...mine.filter((m) => pool.includes(m) || true), ...pool, ...KAYNAK_DEFAULTS])];
}

Object.assign(window, {
  WEEKS, ODEV_TYPES, EXAM_SORU, KAYNAK_DURUM, KAYNAK_DURUM_SIRA,
  getOdevler, addOdevler, updateOdev, useOdevler,
  getSources, getSourceItems, addSource, removeSource, updateSource, useSources, sourceActivity, sourcesForSubject,
  getSelfStudy, addSelfStudy, removeSelfStudy, useSelfStudy, catalogSoru,
});
