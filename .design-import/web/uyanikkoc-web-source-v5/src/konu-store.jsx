/* ============================================================
   Paylaşılan KONU (topic) durumu — öğrenci ve koç AYNI veriyi görür/düzenler.
   Yapı: { [öğrenciAdı]: { "Ders::Konu": "todo"|"progress"|"done" } }
   Müfredattan (öğrenci+ders) deterministik tohumlanır; ilk yükleyen taraf
   ne olursa olsun aynı sonucu üretir. Hem öğrenci hem koç işaretleyebilir,
   localStorage'da kalıcı; iki panel arasında senkron.
   ============================================================ */
const KONU_KEY = "uk_konu_v2";
const KONU_STATES = ["todo", "progress", "done"];

function _konuHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function _konuK(subject, topic) { return subject + "::" + topic; }

let _konu = (() => { try { const s = localStorage.getItem(KONU_KEY); if (s) return JSON.parse(s); } catch (e) {} return {}; })();
const _konuListeners = new Set();
function _persistKonu(notify) { try { localStorage.setItem(KONU_KEY, JSON.stringify(_konu)); } catch (e) {} if (notify !== false) _konuListeners.forEach((l) => l()); }

function _seedKonuSubject(student, subject, konular) {
  const h = _konuHash(student + "::" + subject);
  const comp = 45 + (h % 45);
  const doneCount = Math.round(konular.length * comp / 100);
  const m = _konu[student];
  konular.forEach((n, i) => { m[_konuK(subject, n)] = i < doneCount ? "done" : (i === doneCount ? "progress" : "todo"); });
}

/* render sırasında çağrılabilir: eksik dersleri sessizce tohumlar (listener tetiklemez) */
function ensureKonuSeed(student, CURR) {
  if (!student || !CURR) return;
  if (!_konu[student]) _konu[student] = {};
  const m = _konu[student];
  let changed = false;
  Object.keys(CURR).forEach((s) => {
    const konular = CURR[s].flatMap((g) => g.konular);
    const hasAny = konular.some((n) => _konuK(s, n) in m);
    if (!hasAny && konular.length) { _seedKonuSubject(student, s, konular); changed = true; }
  });
  if (changed) _persistKonu(false);
}

function konuStatus(student, subject, topic) { const m = _konu[student]; const v = m && m[_konuK(subject, topic)]; return v || "todo"; }
function setKonuStatus(student, subject, topic, status) { if (!_konu[student]) _konu[student] = {}; _konu[student][_konuK(subject, topic)] = status; _persistKonu(true); }
function cycleKonuStatus(student, subject, topic) {
  const cur = konuStatus(student, subject, topic);
  const next = KONU_STATES[(KONU_STATES.indexOf(cur) + 1) % KONU_STATES.length];
  setKonuStatus(student, subject, topic, next);
  return next;
}
/* bir dersin konu listesini durumla birlikte döndür */
function konuList(student, subject, CURR) {
  const konular = (CURR[subject] || []).flatMap((g) => g.konular);
  return konular.map((n) => { const st = konuStatus(student, subject, n); return { n, s: st, p: st === "done" ? 100 : st === "progress" ? 50 : 0 }; });
}
function useKonu() {
  const [, f] = React.useState(0);
  React.useEffect(() => { const l = () => f((x) => x + 1); _konuListeners.add(l); return () => _konuListeners.delete(l); }, []);
  return _konu;
}

Object.assign(window, { konuStatus, setKonuStatus, cycleKonuStatus, ensureKonuSeed, konuList, useKonu, KONU_STATES });
