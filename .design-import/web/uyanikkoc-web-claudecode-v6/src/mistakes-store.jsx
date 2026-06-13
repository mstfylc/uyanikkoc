/* Yanlış Defteri + Hata Frekansı + Sıfır Hata Döngüsü — veri modeli & store.
   localStorage'da kalıcı. Demo zaman çizgisi 2026-06-05 baz alınır. */

const MIS_TODAY = new Date("2026-06-05");
function _misYmd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function _misAddDays(base, n) { return new Date(base.getTime() + n * 86400000); }
const MIS_INTERVALS = [1, 3, 7, 21]; // sıfır hata döngüsü (gün)

const HATA_TIPI = {
  bilgi:  { label: "Bilgi eksiği", short: "Bilgi", tone: "danger",  icon: "book" },
  islem:  { label: "İşlem hatası", short: "İşlem", tone: "info",    icon: "notebook" },
  sure:   { label: "Süre",         short: "Süre",  tone: "warning", icon: "clock" },
  dikkat: { label: "Dikkat",       short: "Dikkat",tone: "primary", icon: "target" },
  yorum:  { label: "Yorum",        short: "Yorum", tone: "info",    icon: "ai" },
  unutma: { label: "Unutma",       short: "Unutma",tone: "muted",   icon: "clock" },
};
const SORU_TURU = { yeninesil: "Yeni nesil", klasik: "Klasik", islem: "İşlem", yorum: "Yorum", grafik: "Grafik / Tablo" };
const TEKRAR_DURUM = {
  acik:    { label: "Açık",          tone: "warning", icon: "clock" },
  tekrar:  { label: "Tekrar edildi", tone: "info",    icon: "ai" },
  kapandi: { label: "Kapandı",       tone: "success", icon: "checkCircle" },
};

const MIS_KEY = "uk_mistakes_v1";

function _misSeed() {
  // Elif Yıldız için son ~14 güne yayılmış örnek yanlışlar (hata frekansı için)
  const S = "Elif Yıldız";
  const raw = [
    ["Matematik", "Problemler", "Yaş problemi", "islem", "Apotemi TYT Matematik", "yorum", -1, 0],
    ["Matematik", "Problemler", "Hız problemi", "sure", "Apotemi TYT Matematik", "yorum", -2, 0],
    ["Matematik", "Problemler", "Karışım", "islem", "345 Yayınları TYT", "islem", -2, 0],
    ["Matematik", "Türev", "Maksimum-minimum", "islem", "Bilgi Sarmal AYT", "klasik", -3, 1],
    ["Matematik", "Türev", "L'Hospital", "bilgi", "Bilgi Sarmal AYT", "klasik", -4, 1],
    ["Türkçe", "Paragraf", "Anlam bütünlüğü", "sure", "Hız ve Renk Paragraf", "yorum", -1, 0],
    ["Türkçe", "Paragraf", "Ana düşünce", "yorum", "Hız ve Renk Paragraf", "yorum", -3, 1],
    ["Türkçe", "Cümlede Anlam", "Kesin yargı", "dikkat", "Orijinal TYT Türkçe", "klasik", -5, 1],
    ["Fizik", "Elektrik", "Devreler", "islem", "Tonguç Fizik", "islem", -2, 0],
    ["Fizik", "Elektrik", "Eşdeğer direnç", "islem", "Tonguç Fizik", "grafik", -4, 1],
    ["Fizik", "Kuvvet ve Newton", "Sürtünme", "bilgi", "Orijinal AYT Fizik", "klasik", -6, 2],
    ["Kimya", "Mol Kavramı", "Mol-kütle", "islem", "Orbital Kimya", "islem", -3, 1],
    ["Kimya", "Asitler ve Bazlar", "pH hesabı", "sure", "Orbital Kimya", "islem", -7, 2],
    ["Biyoloji", "Hücre", "Organeller", "unutma", "345 Yayınları AYT", "klasik", -8, 2],
    ["Matematik", "Problemler", "İşçi problemi", "sure", "345 Yayınları TYT", "yorum", -1, 0],
    ["Türkçe", "Noktalama", "Virgül", "dikkat", "Orijinal TYT Türkçe", "klasik", -9, 2],
  ];
  const out = [];
  raw.forEach((r, i) => {
    const [subject, topic, subtopic, errorType, source, qType, dayOff, stage] = r;
    const createdAt = _misAddDays(MIS_TODAY, dayOff).getTime();
    // nextDue: oluşturma + ilgili stage aralığı (bazıları bugüne/geçmişe denk gelir)
    const nd = _misAddDays(new Date(createdAt), MIS_INTERVALS[Math.min(stage, MIS_INTERVALS.length - 1)]);
    out.push({
      id: "mk" + (1000 + i), student: S, createdAt,
      subject, topic, subtopic, errorType, source, qType,
      note: "", photo: null,
      status: stage === 0 ? "acik" : "tekrar",
      stage, nextDue: _misYmd(nd),
      history: [],
    });
  });
  return out;
}

let _mistakes = (() => { try { const s = localStorage.getItem(MIS_KEY); if (s) return JSON.parse(s); } catch (e) {} return _misSeed(); })();
const _mkListeners = new Set();
function _persistMistakes() { try { localStorage.setItem(MIS_KEY, JSON.stringify(_mistakes)); } catch (e) {} _mkListeners.forEach((l) => l()); }
function getMistakes(student) { return student ? _mistakes.filter((m) => m.student === student) : _mistakes; }
function addMistake(data) {
  const nd = _misAddDays(MIS_TODAY, MIS_INTERVALS[0]);
  const m = {
    id: "mk" + Date.now(), student: data.student, createdAt: Date.now(),
    subject: data.subject, topic: data.topic, subtopic: data.subtopic || "",
    errorType: data.errorType, source: data.source || "", qType: data.qType || "klasik",
    note: data.note || "", photo: data.photo || null,
    status: "acik", stage: 0, nextDue: _misYmd(nd), history: [],
  };
  _mistakes = [m, ..._mistakes]; _persistMistakes(); return m;
}
function updateMistake(id, patch) { _mistakes = _mistakes.map((m) => m.id === id ? { ...m, ...patch } : m); _persistMistakes(); }
function removeMistake(id) { _mistakes = _mistakes.filter((m) => m.id !== id); _persistMistakes(); }
/* sıfır hata döngüsü: tekrar et → bir sonraki aralığa geç, son aralıktan sonra kapanır */
function reviewMistake(id) {
  _mistakes = _mistakes.map((m) => {
    if (m.id !== id) return m;
    const hist = [...(m.history || []), { ymd: _misYmd(MIS_TODAY), at: Date.now() }];
    const next = m.stage + 1;
    if (next >= MIS_INTERVALS.length) return { ...m, status: "kapandi", stage: next, nextDue: null, history: hist };
    return { ...m, status: "tekrar", stage: next, nextDue: _misYmd(_misAddDays(MIS_TODAY, MIS_INTERVALS[next])), history: hist };
  });
  _persistMistakes();
}
function useMistakes(student) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _mkListeners.add(l); return () => _mkListeners.delete(l); }, []);
  return getMistakes(student);
}

/* bugüne/geçmişe denk gelen (tekrar edilecek) yanlışlar */
function dueMistakes(student) {
  const today = _misYmd(MIS_TODAY);
  return getMistakes(student).filter((m) => m.status !== "kapandi" && m.nextDue && m.nextDue <= today)
    .sort((a, b) => (a.nextDue < b.nextDue ? -1 : 1));
}

/* Hata frekansı — son N günde hata tipi dağılımı + teşhis cümlesi */
function mistakeFrequency(student, days) {
  const N = days || 14;
  const since = MIS_TODAY.getTime() - (N - 1) * 86400000;
  const list = getMistakes(student).filter((m) => m.createdAt >= since);
  const byType = {};
  Object.keys(HATA_TIPI).forEach((k) => { byType[k] = 0; });
  list.forEach((m) => { byType[m.errorType] = (byType[m.errorType] || 0) + 1; });
  const ranked = Object.keys(byType).filter((k) => byType[k] > 0).sort((a, b) => byType[b] - byType[a]);
  const total = list.length;
  const bilgi = byType.bilgi || 0;
  const cozum = (byType.islem || 0) + (byType.sure || 0);
  let diagnosis;
  if (total === 0) diagnosis = "Bu dönemde kayıtlı yanlış yok.";
  else if (bilgi / total > 0.45) diagnosis = "Ağırlıklı bilgi eksiği — önce konu tekrarı gerekiyor.";
  else if (cozum / total >= 0.5) diagnosis = "Asıl sorun konu bilmemek değil; çözüm disiplini ve süre yönetimi.";
  else diagnosis = "Dikkat ve dağınık hatalar öne çıkıyor — kontrollü çözüm şart.";
  // konu bazlı en sık tekrar eden yanlışlar
  const byTopic = {};
  list.forEach((m) => { const k = m.subject + " · " + m.topic; byTopic[k] = (byTopic[k] || 0) + 1; });
  const topTopics = Object.keys(byTopic).sort((a, b) => byTopic[b] - byTopic[a]).slice(0, 3).map((k) => ({ k, n: byTopic[k] }));
  return { days: N, total, byType, ranked, diagnosis, topTopics };
}

/* fotoğraf yeniden boyutlandır → dataURL (cihazda, DB'ye yük yok) */
function misResizeImage(file, max, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const cw = Math.round(img.width * sc), ch = Math.round(img.height * sc);
      const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
      cv.getContext("2d").drawImage(img, 0, 0, cw, ch);
      try { cb(cv.toDataURL("image/jpeg", 0.78)); } catch (e) { cb(null); }
    };
    img.onerror = () => cb(null);
    img.src = r.result;
  };
  r.onerror = () => cb(null);
  r.readAsDataURL(file);
}

Object.assign(window, {
  MIS_TODAY, MIS_INTERVALS, HATA_TIPI, SORU_TURU, TEKRAR_DURUM,
  getMistakes, addMistake, updateMistake, removeMistake, reviewMistake, useMistakes,
  dueMistakes, mistakeFrequency, misResizeImage, _misYmd,
});
