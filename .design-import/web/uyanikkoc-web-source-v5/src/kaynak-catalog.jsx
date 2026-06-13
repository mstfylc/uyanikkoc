/* ============================================================
   Ulusal Kaynak Kataloğu — Türkiye geneli bilinen yayınevi kitapları.
   YKS (TYT/AYT) + LGS. Ders + yayınevi + tür ile filtrelenir.
   Özel durumlar için öğrenci/koç serbest kaynak da ekleyebilir.
   ------------------------------------------------------------
   entry: { n: seri/başlık (yayınevi hariç), p: yayınevi, s: ders,
            t: tür anahtarı, e: ["TYT"|"AYT"|"YDT"|"LGS"...] }
   Kullanılan/saklanan değer = etiket = `${p} ${n}` (kendini açıklar).
   ============================================================ */

const KAYNAK_TUR = {
  soru:   { label: "Soru Bankası",   short: "Soru B.",  icon: "notebook", tone: "primary" },
  konu:   { label: "Konu Anlatımlı", short: "Konu",     icon: "book",     tone: "info" },
  deneme: { label: "Deneme",         short: "Deneme",   icon: "chart",    tone: "warning" },
  foy:    { label: "Föy / Fasikül",  short: "Föy",      icon: "clipboard",tone: "muted" },
  video:  { label: "Dijital / Video",short: "Dijital",  icon: "ai",       tone: "success" },
};

const KAYNAK_KATALOG = [
  /* ---------------- YKS · Matematik ---------------- */
  { n: "TYT Matematik Soru Bankası", p: "Apotemi", s: "Matematik", t: "soru", e: ["TYT"] },
  { n: "AYT Matematik Soru Bankası", p: "Apotemi", s: "Matematik", t: "soru", e: ["AYT"] },
  { n: "TYT Matematik Soru Bankası", p: "345 Yayınları", s: "Matematik", t: "soru", e: ["TYT"] },
  { n: "TYT Matematik Soru Bankası", p: "Karekök", s: "Matematik", t: "soru", e: ["TYT"] },
  { n: "AYT Matematik Soru Bankası", p: "Limit", s: "Matematik", t: "soru", e: ["AYT"] },
  { n: "TYT Matematik Konu Anlatımı", p: "Bilgi Sarmalı", s: "Matematik", t: "konu", e: ["TYT"] },
  { n: "TYT Matematik Tamamı Çözümlü", p: "Acil Yayınları", s: "Matematik", t: "soru", e: ["TYT"] },
  { n: "Matematik Konu Föyleri", p: "Tonguç Akademi", s: "Matematik", t: "foy", e: ["TYT", "AYT"] },
  { n: "AYT Matematik Soru Bankası", p: "3D Yayınları", s: "Matematik", t: "soru", e: ["AYT"] },
  { n: "Üniversiteye Hazırlık Matematik", p: "Esen", s: "Matematik", t: "soru", e: ["TYT", "AYT"] },

  /* ---------------- YKS · Geometri ---------------- */
  { n: "Geometri Soru Bankası", p: "Antrenmanlarla", s: "Geometri", t: "soru", e: ["TYT", "AYT"] },
  { n: "Geometri Soru Bankası", p: "Karekök", s: "Geometri", t: "soru", e: ["TYT", "AYT"] },
  { n: "Geometri Konu Föyleri", p: "Tonguç Akademi", s: "Geometri", t: "foy", e: ["TYT", "AYT"] },
  { n: "Geometri Soru Bankası", p: "Apotemi", s: "Geometri", t: "soru", e: ["TYT", "AYT"] },
  { n: "Geometri Soru Bankası", p: "Limit", s: "Geometri", t: "soru", e: ["TYT", "AYT"] },
  { n: "Geometri Konu Anlatımı", p: "Bilgi Sarmalı", s: "Geometri", t: "konu", e: ["TYT", "AYT"] },

  /* ---------------- YKS · Fizik ---------------- */
  { n: "TYT Fizik Soru Bankası", p: "Palme", s: "Fizik", t: "soru", e: ["TYT"] },
  { n: "AYT Fizik Soru Bankası", p: "Palme", s: "Fizik", t: "soru", e: ["AYT"] },
  { n: "TYT Fizik Soru Bankası", p: "3D Yayınları", s: "Fizik", t: "soru", e: ["TYT"] },
  { n: "Fizik Soru Bankası", p: "Paraf", s: "Fizik", t: "soru", e: ["TYT", "AYT"] },
  { n: "Fizik Konu Anlatımı", p: "Bilgi Sarmalı", s: "Fizik", t: "konu", e: ["TYT", "AYT"] },
  { n: "AYT Fizik Soru Bankası", p: "Çap", s: "Fizik", t: "soru", e: ["AYT"] },
  { n: "Fizik Konu Föyleri", p: "Tonguç Akademi", s: "Fizik", t: "foy", e: ["TYT", "AYT"] },

  /* ---------------- YKS · Kimya ---------------- */
  { n: "TYT Kimya Soru Bankası", p: "Palme", s: "Kimya", t: "soru", e: ["TYT"] },
  { n: "Kimya Soru Bankası", p: "Orbital", s: "Kimya", t: "soru", e: ["TYT", "AYT"] },
  { n: "AYT Kimya Soru Bankası", p: "3D Yayınları", s: "Kimya", t: "soru", e: ["AYT"] },
  { n: "Kimya Soru Bankası", p: "Aydın", s: "Kimya", t: "soru", e: ["TYT", "AYT"] },
  { n: "Kimya Soru Bankası", p: "Çap", s: "Kimya", t: "soru", e: ["TYT", "AYT"] },
  { n: "Kimya Konu Anlatımı", p: "Bilgi Sarmalı", s: "Kimya", t: "konu", e: ["TYT", "AYT"] },
  { n: "Kimya Konu Föyleri", p: "Tonguç Akademi", s: "Kimya", t: "foy", e: ["TYT", "AYT"] },

  /* ---------------- YKS · Biyoloji ---------------- */
  { n: "AYT Biyoloji Soru Bankası", p: "Biyotik", s: "Biyoloji", t: "soru", e: ["AYT"] },
  { n: "TYT Biyoloji Soru Bankası", p: "Palme", s: "Biyoloji", t: "soru", e: ["TYT"] },
  { n: "Biyoloji Soru Bankası", p: "3D Yayınları", s: "Biyoloji", t: "soru", e: ["TYT", "AYT"] },
  { n: "Biyoloji Soru Bankası", p: "Eksen", s: "Biyoloji", t: "soru", e: ["TYT", "AYT"] },
  { n: "Biyoloji Soru Bankası", p: "Aydın", s: "Biyoloji", t: "soru", e: ["TYT", "AYT"] },
  { n: "Biyoloji Konu Föyleri", p: "Tonguç Akademi", s: "Biyoloji", t: "foy", e: ["TYT", "AYT"] },

  /* ---------------- YKS · Türkçe / Edebiyat ---------------- */
  { n: "TYT Türkçe Soru Bankası", p: "Hız ve Renk", s: "Türkçe", t: "soru", e: ["TYT"] },
  { n: "Paragraf Soru Bankası", p: "Hız ve Renk", s: "Türkçe", t: "soru", e: ["TYT"] },
  { n: "TYT Türkçe Soru Bankası", p: "Bilgi Sarmalı", s: "Türkçe", t: "soru", e: ["TYT"] },
  { n: "TYT Türkçe Soru Bankası", p: "Yargı", s: "Türkçe", t: "soru", e: ["TYT"] },
  { n: "Paragraf Soru Bankası", p: "Apotemi", s: "Türkçe", t: "soru", e: ["TYT"] },
  { n: "TYT Türkçe Soru Bankası", p: "Yediiklim", s: "Türkçe", t: "soru", e: ["TYT"] },
  { n: "AYT Edebiyat Soru Bankası", p: "3D Yayınları", s: "Türkçe", t: "soru", e: ["AYT"] },
  { n: "AYT Edebiyat Soru Bankası", p: "Benim Hocam", s: "Türkçe", t: "soru", e: ["AYT"] },
  { n: "Türkçe Konu Föyleri", p: "Tonguç Akademi", s: "Türkçe", t: "foy", e: ["TYT", "AYT"] },

  /* ---------------- LGS · Matematik ---------------- */
  { n: "LGS Matematik Soru Bankası", p: "Tonguç Akademi", s: "Matematik", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf Matematik Soru Bankası", p: "3D Yayınları", s: "Matematik", t: "soru", e: ["LGS"] },
  { n: "LGS Matematik Soru Bankası", p: "Hız ve Renk", s: "Matematik", t: "soru", e: ["LGS"] },
  { n: "LGS Matematik Soru Bankası", p: "Nartest", s: "Matematik", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf Matematik", p: "Bilfen", s: "Matematik", t: "soru", e: ["LGS"] },
  { n: "LGS Matematik Branş Denemesi", p: "Nartest", s: "Matematik", t: "deneme", e: ["LGS"] },

  /* ---------------- LGS · Türkçe ---------------- */
  { n: "LGS Türkçe Soru Bankası", p: "Tonguç Akademi", s: "Türkçe", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf Türkçe Soru Bankası", p: "3D Yayınları", s: "Türkçe", t: "soru", e: ["LGS"] },
  { n: "LGS Türkçe Soru Bankası", p: "Hız ve Renk", s: "Türkçe", t: "soru", e: ["LGS"] },
  { n: "LGS Türkçe Soru Bankası", p: "Nartest", s: "Türkçe", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf Türkçe", p: "Bilfen", s: "Türkçe", t: "soru", e: ["LGS"] },

  /* ---------------- LGS · Fen Bilimleri ---------------- */
  { n: "LGS Fen Bilimleri Soru Bankası", p: "Tonguç Akademi", s: "Fen Bilimleri", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf Fen Bilimleri Soru Bankası", p: "3D Yayınları", s: "Fen Bilimleri", t: "soru", e: ["LGS"] },
  { n: "LGS Fen Bilimleri Soru Bankası", p: "Hız ve Renk", s: "Fen Bilimleri", t: "soru", e: ["LGS"] },
  { n: "LGS Fen Bilimleri Soru Bankası", p: "Nartest", s: "Fen Bilimleri", t: "soru", e: ["LGS"] },
  { n: "LGS Fen Bilimleri Konu Anlatımı", p: "Aydın", s: "Fen Bilimleri", t: "konu", e: ["LGS"] },

  /* ---------------- LGS · T.C. İnkılap Tarihi ---------------- */
  { n: "LGS İnkılap Tarihi Soru Bankası", p: "Tonguç Akademi", s: "T.C. İnkılap Tarihi", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf İnkılap Tarihi", p: "3D Yayınları", s: "T.C. İnkılap Tarihi", t: "soru", e: ["LGS"] },
  { n: "LGS İnkılap Tarihi Soru Bankası", p: "Hız ve Renk", s: "T.C. İnkılap Tarihi", t: "soru", e: ["LGS"] },

  /* ---------------- LGS · Din Kültürü ---------------- */
  { n: "LGS Din Kültürü Soru Bankası", p: "Tonguç Akademi", s: "Din Kültürü", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf Din Kültürü", p: "3D Yayınları", s: "Din Kültürü", t: "soru", e: ["LGS"] },

  /* ---------------- LGS · İngilizce ---------------- */
  { n: "LGS İngilizce Soru Bankası", p: "Tonguç Akademi", s: "İngilizce", t: "soru", e: ["LGS"] },
  { n: "8. Sınıf İngilizce", p: "3D Yayınları", s: "İngilizce", t: "soru", e: ["LGS"] },
  { n: "LGS İngilizce Soru Bankası", p: "Nartest", s: "İngilizce", t: "soru", e: ["LGS"] },

  /* ---------------- YKS · İngilizce (YDT) ---------------- */
  { n: "YDT İngilizce Soru Bankası", p: "Modadil", s: "İngilizce", t: "soru", e: ["YDT"] },
  { n: "İngilizce Soru Bankası", p: "Yargı", s: "İngilizce", t: "soru", e: ["YDT"] },
  { n: "İngilizce Konu Föyleri", p: "Tonguç Akademi", s: "İngilizce", t: "foy", e: ["YDT"] },

  /* ---------------- Genel Denemeler ---------------- */
  { n: "TYT Genel Deneme", p: "Apotemi", s: "Deneme", t: "deneme", e: ["TYT"] },
  { n: "AYT Genel Deneme", p: "Limit", s: "Deneme", t: "deneme", e: ["AYT"] },
  { n: "TYT-AYT Deneme Seti", p: "3D Yayınları", s: "Deneme", t: "deneme", e: ["TYT", "AYT"] },
  { n: "LGS Genel Deneme", p: "Nartest", s: "Deneme", t: "deneme", e: ["LGS"] },
  { n: "LGS 5'li Deneme", p: "Tonguç Akademi", s: "Deneme", t: "deneme", e: ["LGS"] },
];

/* ============================================================
   Ölçekli katalog üretimi — DB'yi temsilen.
   Gerçekte 10.500+ satır veritabanından çekilir; burada gerçek yayınevleri ×
   ders × tür × sınav ile geniş, temsili bir set üretilir. Soru sayıları
   gerçekçi-temsilidir (gerçek değil); konu anlatımı / föy = 0.
   ============================================================ */
function _genRng(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const _GEN_PUBS = [
  ["Apotemi", { "Matematik": ["TYT", "AYT"], "Geometri": ["TYT", "AYT"], "Türkçe": ["TYT"] }, ["soru", "konu", "deneme"]],
  ["345 Yayınları", { "Matematik": ["TYT", "AYT"] }, ["soru", "konu", "deneme"]],
  ["Karekök", { "Matematik": ["TYT", "AYT"], "Geometri": ["TYT", "AYT"] }, ["soru", "konu"]],
  ["Limit", { "Matematik": ["TYT", "AYT"], "Geometri": ["TYT", "AYT"], "Türkçe": ["AYT"], "Tarih": ["TYT", "AYT"], "Coğrafya": ["TYT", "AYT"], "Biyoloji": ["TYT", "AYT"] }, ["soru", "deneme"]],
  ["Palme", { "Fizik": ["TYT", "AYT"], "Kimya": ["TYT", "AYT"], "Biyoloji": ["TYT", "AYT"] }, ["soru", "konu"]],
  ["3D Yayınları", { "Matematik": ["TYT", "AYT"], "Fizik": ["TYT", "AYT"], "Kimya": ["TYT", "AYT"], "Biyoloji": ["TYT", "AYT"], "Türkçe": ["TYT"], "Tarih": ["TYT", "AYT"], "Coğrafya": ["TYT", "AYT"] }, ["soru", "konu", "deneme"]],
  ["Bilgi Sarmal", { "Matematik": ["TYT", "AYT"], "Fizik": ["TYT", "AYT"], "Kimya": ["TYT", "AYT"], "Biyoloji": ["TYT", "AYT"], "Türkçe": ["TYT"] }, ["soru", "konu"]],
  ["Tonguç Akademi", { "Matematik": ["TYT", "AYT"], "Fizik": ["TYT", "AYT"], "Kimya": ["TYT", "AYT"], "Biyoloji": ["TYT", "AYT"], "Türkçe": ["TYT", "AYT"], "Tarih": ["TYT", "AYT"], "Coğrafya": ["TYT", "AYT"] }, ["foy", "deneme"]],
  ["Hız ve Renk", { "Türkçe": ["TYT"], "Matematik": ["TYT"] }, ["soru", "konu"]],
  ["Yargı", { "Türkçe": ["TYT", "AYT"], "Tarih": ["TYT", "AYT"], "Coğrafya": ["TYT", "AYT"], "Felsefe": ["TYT", "AYT"], "İngilizce": ["YDT"] }, ["soru"]],
  ["Orbital", { "Kimya": ["TYT", "AYT"] }, ["soru", "konu"]],
  ["Çap", { "Matematik": ["AYT"], "Fizik": ["AYT"], "Kimya": ["AYT"], "Biyoloji": ["AYT"] }, ["soru"]],
  ["Acil Yayınları", { "Matematik": ["TYT"], "Türkçe": ["TYT"] }, ["soru"]],
  ["Esen", { "Matematik": ["TYT", "AYT"], "Fizik": ["TYT", "AYT"] }, ["soru"]],
  ["Eksen", { "Biyoloji": ["TYT", "AYT"] }, ["soru", "konu"]],
  ["Aydın", { "Kimya": ["TYT", "AYT"], "Biyoloji": ["TYT", "AYT"] }, ["soru", "konu"]],
  ["Benim Hocam", { "Türkçe": ["AYT"], "Tarih": ["AYT"], "Coğrafya": ["AYT"], "Felsefe": ["AYT"] }, ["soru", "konu"]],
  ["Paraf", { "Fizik": ["TYT", "AYT"], "Matematik": ["TYT"] }, ["soru"]],
  ["Antrenmanlarla", { "Matematik": ["TYT", "AYT"], "Geometri": ["TYT", "AYT"] }, ["soru"]],
  ["Biyotik", { "Biyoloji": ["AYT"] }, ["soru"]],
  ["Modadil", { "İngilizce": ["YDT"] }, ["soru", "konu"]],
  ["Endemik", { "Deneme": ["TYT", "AYT"] }, ["deneme"]],
  ["Final", { "Deneme": ["TYT", "AYT"], "Türkçe": ["TYT"] }, ["soru", "deneme"]],
  ["Nartest", { "Matematik": ["LGS"], "Türkçe": ["LGS"], "Fen Bilimleri": ["LGS"], "İngilizce": ["LGS"], "Deneme": ["LGS"] }, ["soru", "deneme"]],
  ["Bilfen", { "Matematik": ["LGS"], "Türkçe": ["LGS"], "Fen Bilimleri": ["LGS"], "T.C. İnkılap Tarihi": ["LGS"], "Din Kültürü": ["LGS"], "İngilizce": ["LGS"] }, ["soru", "konu"]],
  ["Arı Yayıncılık", { "Matematik": ["LGS"], "Türkçe": ["LGS"], "Fen Bilimleri": ["LGS"] }, ["soru", "deneme"]],
  ["Çalış Kazan", { "Matematik": ["LGS"], "Türkçe": ["LGS"], "Fen Bilimleri": ["LGS"], "T.C. İnkılap Tarihi": ["LGS"], "Din Kültürü": ["LGS"], "İngilizce": ["LGS"] }, ["soru"]],
];
const _GEN_YEARS = ["", "2023", "2024", "2025"];
const _TUR_TITLE = { soru: "Soru Bankası", konu: "Konu Anlatımlı", deneme: "Denemeleri", foy: "Konu Föyleri" };

(function buildGenerated() {
  const seen = new Set(KAYNAK_KATALOG.map((k) => `${k.p}|${k.n}`));
  _GEN_PUBS.forEach(([pub, subjMap, types]) => {
    Object.keys(subjMap).forEach((subj) => {
      subjMap[subj].forEach((exam) => {
        types.forEach((t) => {
          const rng = _genRng(pub + subj + exam + t);
          const yearCount = rng() < 0.5 ? 1 : 2;
          for (let yi = 0; yi < yearCount; yi++) {
            const year = yi === 0 ? "" : _GEN_YEARS[1 + Math.floor(rng() * (_GEN_YEARS.length - 1))];
            const base = subj === "Deneme" ? `${exam} ${_TUR_TITLE[t]}` : `${exam} ${subj} ${_TUR_TITLE[t]}`;
            const n = year ? `${base} (${year})` : base;
            if (seen.has(`${pub}|${n}`)) continue;
            seen.add(`${pub}|${n}`);
            KAYNAK_KATALOG.push({ n, p: pub, s: subj, t, e: [exam] });
          }
        });
      });
    });
  });
})();

/* her kayda kararlı id + sınav kümesi + soru sayısı + ISBN ekle
   (soru sayısı temsili; konu anlatımı/föy = 0) */
function _genSoru(seed, t) {
  if (t === "konu" || t === "foy") return 0;
  const r = _genRng(seed);
  if (t === "deneme") return 5 * (8 + Math.floor(r() * 25));        // ~40–160 (deneme×~?) → temsili
  return 600 + Math.floor(r() * 2100);                              // soru bankası 600–2700
}
function _genIsbn(seed) {
  const r = _genRng("isbn" + seed);
  let d = "978605"; for (let i = 0; i < 6; i++) d += Math.floor(r() * 10);
  return d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6, 9) + "-" + d.slice(9);
}
KAYNAK_KATALOG.forEach((k, i) => {
  k.id = "kk" + i;
  k.exam = k.e.includes("LGS") ? "LGS" : "YKS"; // üst sınav kümesi
  if (k.soru == null) k.soru = _genSoru(k.p + k.n, k.t);
  if (!k.isbn) k.isbn = _genIsbn(k.p + k.n);
});

/* etiket = saklanan/kullanılan tek string değer */
function kLabel(k) { return `${k.p} ${k.n}`; }

/* katalogdaki dersler (sınav kümesine göre) */
const KAYNAK_DERSLER = {
  YKS: ["Türkçe", "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "İngilizce", "Deneme"],
  LGS: ["Türkçe", "Matematik", "Fen Bilimleri", "T.C. İnkılap Tarihi", "Din Kültürü", "İngilizce", "Deneme"],
};

/* filtreli liste */
function katalogList({ exam = "Tümü", subject = "Tümü", pub = "Tümü", type = "Tümü", q = "" } = {}) {
  const norm = (s) => (s || "").toLocaleLowerCase("tr-TR");
  const nq = norm(q.trim());
  return KAYNAK_KATALOG.filter((k) => {
    if (exam !== "Tümü" && k.exam !== exam) return false;
    if (subject !== "Tümü" && k.s !== subject) return false;
    if (pub !== "Tümü" && k.p !== pub) return false;
    if (type !== "Tümü" && k.t !== type) return false;
    if (nq) {
      const qDigits = nq.replace(/[^0-9]/g, "");
      const labelHit = norm(kLabel(k)).includes(nq);
      const isbnHit = qDigits.length >= 3 && (k.isbn || "").replace(/[^0-9]/g, "").includes(qDigits);
      if (!labelHit && !isbnHit) return false;
    }
    return true;
  });
}

/* belirli filtreye uygun yayınevleri (alfabetik) */
function katalogPublishers({ exam = "Tümü", subject = "Tümü" } = {}) {
  const set = new Set();
  KAYNAK_KATALOG.forEach((k) => {
    if (exam !== "Tümü" && k.exam !== exam) return;
    if (subject !== "Tümü" && k.s !== subject) return;
    set.add(k.p);
  });
  return [...set].sort((a, b) => a.localeCompare(b, "tr-TR"));
}

/* derse göre etiket havuzu (geri uyum: koç ödev seçici + sourcesForSubject) */
const KAYNAK_HAVUZU = (() => {
  const map = {};
  KAYNAK_KATALOG.forEach((k) => {
    if (k.s === "Deneme") return;
    (map[k.s] = map[k.s] || []).push(kLabel(k));
  });
  return map;
})();

const KAYNAK_DEFAULTS = ["Konu Anlatım Föyü", "Soru Bankası", "Deneme / Branş Denemesi", "Video Ders"];

/* bir etiketten katalog kaydını bul (chip ikonları için) */
function katalogByLabel(label) {
  return KAYNAK_KATALOG.find((k) => kLabel(k) === label) || null;
}

Object.assign(window, {
  KAYNAK_TUR, KAYNAK_KATALOG, KAYNAK_DERSLER, KAYNAK_HAVUZU, KAYNAK_DEFAULTS,
  kLabel, katalogList, katalogPublishers, katalogByLabel,
});
