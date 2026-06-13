/* Uyanık Koç mobil — Veli (parent) verisi: çocuklar, raporlar, ödeme. */

/* Her çocuğun özet + kendi ödev/deneme/ders verisi (demo). */
const P_CHILDREN = [
  {
    id: "c1", name: "Elif Yıldız", initials: "EY", grade: "11. Sınıf · Sayısal",
    goal: "YKS 2026", coach: "Dilek Emen", coachInitials: "DE",
    streak: 12, weekHours: 23.5, net: 312, completion: 88, sinav: "YKS",
    odev: [
      { id: "co1", subject: "Matematik", topic: "Türev — kural tekrarı (40 soru)", types: ["soru"], count: 40, source: "Uyanık YKS SB", due: "2026-06-06", status: "pending" },
      { id: "co2", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", types: ["test"], count: 20, source: "345 Yayınları", due: "2026-06-05", status: "pending" },
      { id: "co3", subject: "Geometri", topic: "Üçgende açı — 25 soru", types: ["soru"], count: 25, source: "Apotemi", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
      { id: "co4", subject: "Biyoloji", topic: "Hücre bölünmesi — video", types: ["video"], source: "Tonguç", due: "2026-06-03", status: "done", result: null },
    ],
    exams: [
      { id: "ce6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75",
        parts: [{ n: "Türkçe", net: 35.0, max: 40 }, { n: "Sosyal", net: 15.25, max: 20 }, { n: "Matematik", net: 28.5, max: 40 }, { n: "Fen", net: 9.5, max: 20 }] },
      { id: "ce5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5",
        parts: [{ n: "Türkçe", net: 33.75, max: 40 }, { n: "Sosyal", net: 14.0, max: 20 }, { n: "Matematik", net: 27.75, max: 40 }, { n: "Fen", net: 11.0, max: 20 }] },
      { id: "ce4", name: "TYT Genel Deneme #4", pub: "Şube Denemesi", type: "TYT", date: "17 May 2026", net: 80.75, rank: "~61.000", delta: "+1.25",
        parts: [{ n: "Türkçe", net: 31.5, max: 40 }, { n: "Sosyal", net: 12.75, max: 20 }, { n: "Matematik", net: 25.25, max: 40 }, { n: "Fen", net: 12.0, max: 20 }] },
    ],
    trend: [{ l: "3.D", v: 79.5 }, { l: "4.D", v: 80.75 }, { l: "5.D", v: 86.25 }, { l: "6.D", v: 88 }],
    subjects: [
      { name: "Türkçe", pct: 81, net: "35.0", trend: "up" },
      { name: "Matematik", pct: 72, net: "28.5", trend: "up" },
      { name: "Biyoloji", pct: 66, net: "14.0", trend: "flat" },
      { name: "Kimya", pct: 41, net: "11.8", trend: "down" },
    ],
    upcoming: { name: "TYT Genel Deneme #7", org: "Uyanık Yayınları", date: "8 Haziran Pazar", time: "10:00" },
    reports: [
      { id: "r1", week: "2 – 8 Haziran", date: "Bu hafta", completion: 88, net: 312, hours: 23.5, note: "Türev ve paragrafta belirgin ilerleme var. Fen netini yükseltmek için Kimya tekrarı öneriliyor.", status: "yeni" },
      { id: "r2", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 82, net: 297, hours: 21.0, note: "Düzenli çalışma sürüyor. Deneme #6'da +1.75 net artışı.", status: "okundu" },
      { id: "r3", week: "19 – 25 May", date: "2 hafta önce", completion: 76, net: 284, hours: 19.5, note: "Hafta sonu programına uyum iyi. Geometri konularında hızlanmalı.", status: "okundu" },
    ],
  },
  {
    id: "c2", name: "Kaan Yıldız", initials: "KY", grade: "9. Sınıf · Sayısal",
    goal: "Lise hazırlık", coach: "Mert Aslan", coachInitials: "MA",
    streak: 5, weekHours: 14.0, net: 198, completion: 62, sinav: "Okul",
    odev: [
      { id: "ko1", subject: "Matematik", topic: "Çarpanlara ayırma (20 soru)", types: ["soru"], count: 20, source: "Okul SB", due: "2026-06-07", status: "pending" },
      { id: "ko2", subject: "Fizik", topic: "Kuvvet ve hareket — konu", types: ["konu"], source: "Tonguç", due: "2026-06-06", status: "pending" },
      { id: "ko3", subject: "Türkçe", topic: "Sözcükte anlam (15 soru)", types: ["soru"], count: 15, source: "3D Yayınları", due: "2026-06-04", status: "done", result: { d: 12, y: 2, b: 1 } },
    ],
    exams: [
      { id: "ke3", name: "Okul Deneme #3", pub: "Okul", type: "Genel", date: "30 May 2026", net: 198, rank: "Sınıf 4.", delta: "+12",
        parts: [{ n: "Türkçe", net: 18, max: 20 }, { n: "Matematik", net: 15, max: 20 }, { n: "Fen", net: 13, max: 20 }, { n: "Sosyal", net: 16, max: 20 }] },
      { id: "ke2", name: "Okul Deneme #2", pub: "Okul", type: "Genel", date: "16 May 2026", net: 186, rank: "Sınıf 6.", delta: "+8",
        parts: [{ n: "Türkçe", net: 17, max: 20 }, { n: "Matematik", net: 13, max: 20 }, { n: "Fen", net: 12, max: 20 }, { n: "Sosyal", net: 15, max: 20 }] },
    ],
    trend: [{ l: "1.D", v: 172 }, { l: "2.D", v: 186 }, { l: "3.D", v: 198 }],
    subjects: [
      { name: "Türkçe", pct: 74, net: "18.0", trend: "up" },
      { name: "Matematik", pct: 58, net: "15.0", trend: "up" },
      { name: "Fizik", pct: 49, net: "13.0", trend: "flat" },
    ],
    upcoming: { name: "Okul Deneme #4", org: "Okul", date: "12 Haziran Cuma", time: "09:30" },
    reports: [
      { id: "kr1", week: "2 – 8 Haziran", date: "Bu hafta", completion: 62, net: 198, hours: 14.0, note: "Matematikte gelişim var ama çalışma süresi artırılmalı. Düzenli program öneriliyor.", status: "yeni" },
      { id: "kr2", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 55, net: 186, hours: 12.5, note: "Fen konularına daha çok zaman ayırması iyi olur.", status: "okundu" },
    ],
  },
];

const P_PARENT = { name: "Ayşe Yıldız", initials: "AY", phone: "+90 5•• ••• 12 34" };

/* Ödeme / Abonelik */
const P_BILLING = {
  plan: "Aile Paketi — Yıllık",
  price: "₺7.990",
  cycle: "/yıl",
  renew: "12 Mart 2027",
  children: 2,
  card: { brand: "Visa", last4: "4242", exp: "08/27" },
  invoices: [
    { id: "f1", date: "12 Mart 2026", amount: "₺7.990", status: "ödendi", desc: "Aile Paketi — Yıllık" },
    { id: "f2", date: "12 Mart 2025", amount: "₺5.490", status: "ödendi", desc: "Aile Paketi — Yıllık" },
    { id: "f3", date: "12 Mart 2024", amount: "₺3.990", status: "ödendi", desc: "Tekli Paket — Yıllık" },
  ],
};

/* Veli ↔ koç mesajları (seçili çocuğun koçu) */
const P_MESSAGES = [
  { from: "coach", text: "Merhaba Ayşe Hanım, Elif'in bu haftaki gelişimi çok iyi 👏", time: "10:02" },
  { from: "me", text: "Teşekkürler hocam, evde de daha düzenli çalışıyor", time: "10:10" },
  { from: "coach", text: "Harika. Pazar günü deneme var, motivasyonunu yüksek tutalım.", time: "10:12" },
];

Object.assign(window, { P_CHILDREN, P_PARENT, P_BILLING, P_MESSAGES });
