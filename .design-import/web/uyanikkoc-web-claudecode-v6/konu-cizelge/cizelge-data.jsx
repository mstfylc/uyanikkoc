/* Yıllık Konu Takip Çizelgesi — müfredat + deterministik çalışma kayıtları
   Kayıt modeli: her konu için { date, soru, dogru } oturumları.
   Görünümler bu kayıtlardan türetilir (Tekrar / Günlük / Haftalık). */

/* ---- Ders renkleri (marka moruyla uyumlu, eş kroma) ---- */
const CIZ_SUBJ_COLOR = {
  "Türkçe":    "#534AB7",
  "Matematik": "#2F6BD6",
  "Geometri":  "#0E8C6F",
  "Fizik":     "#B26A12",
  "Kimya":     "#A33E73",
  "Biyoloji":  "#3F8E45",
};

/* ---- Müfredat: ders → konu grubu → konular ---- */
const CIZ_CURR = {
  "Türkçe": [
    { grup: "Dil Bilgisi", konular: ["Sözcükte Yapı", "Ses Bilgisi", "İsimler", "Zamirler", "Sıfatlar", "Zarflar", "Edat – Bağlaç – Ünlem", "Fiiller", "Fiilimsiler", "Cümlenin Ögeleri"] },
    { grup: "Anlam Bilgisi", konular: ["Sözcükte Anlam", "Cümlede Anlam", "Paragrafta Anlam", "Paragrafta Yapı", "Anlatım Bozuklukları"] },
  ],
  "Matematik": [
    { grup: "Sayılar & Cebir", konular: ["Temel Kavramlar", "Bölme – Bölünebilme", "EBOB – EKOK", "Rasyonel Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar"] },
    { grup: "Problemler", konular: ["Sayı Problemleri", "Kesir Problemleri", "Yüzde – Faiz", "Hız Problemleri", "İşçi – Havuz"] },
    { grup: "Fonksiyon & Analiz", konular: ["Fonksiyonlar", "Polinomlar", "2. Dereceden Denklemler"] },
  ],
  "Geometri": [
    { grup: "Üçgenler", konular: ["Açılar", "Üçgende Açı", "Üçgende Alan", "Dik Üçgen", "Açıortay – Kenarortay", "Benzerlik"] },
    { grup: "Çokgenler & Dörtgenler", konular: ["Çokgenler", "Dörtgenler", "Paralelkenar", "Yamuk", "Deltoid"] },
    { grup: "Çember & Analitik", konular: ["Çemberde Açı", "Çemberde Uzunluk", "Analitik Geometri"] },
  ],
  "Fizik": [
    { grup: "Mekanik", konular: ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket – Kuvvet", "Dinamik", "İş – Güç – Enerji", "Basınç"] },
    { grup: "Elektrik & Manyetizma", konular: ["Elektrostatik", "Elektrik Akımı", "Manyetizma"] },
    { grup: "Dalgalar & Optik", konular: ["Dalgalar", "Optik"] },
  ],
  "Kimya": [
    { grup: "Temel Kimya", konular: ["Kimya Bilimi", "Atom ve Yapısı", "Periyodik Sistem", "Kimyasal Türler Arası Etkileşim", "Kimyanın Temel Kanunları"] },
    { grup: "Karışım & Tepkime", konular: ["Mol Kavramı", "Karışımlar", "Asit – Baz – Tuz", "Kimyasal Tepkimeler"] },
  ],
  "Biyoloji": [
    { grup: "Hücre & Canlılar", konular: ["Canlıların Ortak Özellikleri", "Hücre", "Hücre Bölünmeleri", "Canlıların Sınıflandırılması"] },
    { grup: "Sistemler", konular: ["Kalıtım", "Ekosistem", "Sinir Sistemi", "Dolaşım Sistemi"] },
  ],
};

/* ---- Deterministik RNG (mulberry32 + fnv seed) ---- */
function cizSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- 12 haftalık pencere: hafta 0 (en eski) → hafta 11 (bu hafta) ---- */
const CIZ_WEEKS = 12;
const CIZ_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const CIZ_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/* bu haftanın pazartesisi (referans: 1 Haz 2026 Pazartesi) */
function cizMonday(w) {
  const base = new Date(2026, 5, 1); // 1 Haziran 2026, Pazartesi
  const d = new Date(base);
  d.setDate(base.getDate() - (CIZ_WEEKS - 1 - w) * 7);
  return d;
}
function cizFmtDay(d) { return d.getDate() + " " + CIZ_MONTHS[d.getMonth()]; }
function cizFmtFull(d) { const p = (n) => String(n).padStart(2, "0"); return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear(); }
function cizWeekRange(w) {
  const m = cizMonday(w); const s = new Date(m); s.setDate(m.getDate() + 6);
  return cizFmtDay(m) + " – " + cizFmtDay(s);
}

/* ---- Konu başına oturum üretimi ---- */
function cizBuildSessions(subject, topic, importanceIdx, total) {
  const rng = cizSeed(subject + "::" + topic);
  // erken konular daha çok çalışılmış olsun (müfredat sırası)
  const progress = 1 - importanceIdx / Math.max(1, total); // 1 → erken, 0 → son
  const pStudy = 0.30 + 0.55 * progress;                    // haftalık çalışma olasılığı
  const sessions = [];
  for (let w = 0; w < CIZ_WEEKS; w++) {
    // son konular henüz başlanmamış olabilir
    if (rng() > pStudy) continue;
    const cnt = rng() < 0.25 ? 2 : 1;
    for (let c = 0; c < cnt; c++) {
      const dow = Math.floor(rng() * 6); // Pzt–Cmt
      const date = cizMonday(w); date.setDate(date.getDate() + dow);
      const soru = 10 + Math.floor(rng() * 41);            // 10–50
      const rate = 0.48 + 0.47 * rng() + 0.05 * progress;  // erken konularda biraz daha iyi
      const dogru = Math.min(soru, Math.round(soru * Math.min(0.98, rate)));
      sessions.push({ date, w, soru, dogru, id: subject + ":" + topic + ":" + w + ":" + c });
    }
  }
  sessions.sort((a, b) => a.date - b.date);
  return sessions;
}

/* tüm dersler için kayıtları hazırla: { subject: { topic: [sessions] } } */
function cizBuildAll() {
  const out = {};
  Object.keys(CIZ_CURR).forEach((subj) => {
    out[subj] = {};
    const flat = CIZ_CURR[subj].flatMap((g) => g.konular);
    flat.forEach((t, i) => { out[subj][t] = cizBuildSessions(subj, t, i, flat.length); });
  });
  return out;
}

window.CIZ_SUBJ_COLOR = CIZ_SUBJ_COLOR;
window.CIZ_CURR = CIZ_CURR;
window.CIZ_WEEKS = CIZ_WEEKS;
window.CIZ_DAYS = CIZ_DAYS;
window.cizMonday = cizMonday;
window.cizFmtDay = cizFmtDay;
window.cizFmtFull = cizFmtFull;
window.cizWeekRange = cizWeekRange;
window.cizBuildAll = cizBuildAll;
