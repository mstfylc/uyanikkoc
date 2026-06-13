/* Uyanık Koç mobil — Koç (coach) verisi: kadro, randevular, mesaj kutusu,
   inceleme kuyruğu, aktivite akışı. Öğrenci şekilleri Veli verisiyle aynı. */

const C_COACH = {
  name: "Dilek Emen", initials: "DE", title: "YKS Sayısal Koçu",
  phone: "+90 5•• ••• 47 80", email: "dilek.emen@uyanikkoc.com",
  studentCount: 8, rating: 4.9, yearsExp: 7,
};

/* Bugün 6 Haziran 2026 (Cmt) kabul. */

/* ---- Kadro: her öğrenci özet + detay (odev/exams/trend/subjects/reports). ---- */
const C_STUDENTS = [
  {
    id: "s1", name: "Elif Yıldız", initials: "EY", grade: "11. Sınıf · Sayısal",
    goal: "YKS 2026", sinav: "YKS", status: "ok",
    completion: 88, net: 312, streak: 12, weekHours: 23.5, lastActive: "8 dk önce",
    parent: "Ayşe Yıldız", parentPhone: "+90 5•• ••• 12 34",
    odev: [
      { id: "eo1", subject: "Matematik", topic: "Türev — kural tekrarı (40 soru)", types: ["soru"], count: 40, source: "Uyanık YKS SB", due: "2026-06-06", status: "pending" },
      { id: "eo2", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", types: ["test"], count: 20, source: "345 Yayınları", due: "2026-06-05", status: "submitted", result: { d: 16, y: 3, b: 1 } },
      { id: "eo3", subject: "Geometri", topic: "Üçgende açı — 25 soru", types: ["soru"], count: 25, source: "Apotemi", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
      { id: "eo4", subject: "Biyoloji", topic: "Hücre bölünmesi — video", types: ["video"], source: "Tonguç", due: "2026-06-03", status: "done", result: null },
      { id: "eo5", subject: "Türkçe", topic: "Paragraf — hız çalışması (30 soru)", types: ["soru"], count: 30, source: "Bilgi Sarmal", due: "2026-06-08", status: "pending" },
    ],
    exams: [
      { id: "ee6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75",
        parts: [{ n: "Türkçe", net: 35.0, max: 40 }, { n: "Sosyal", net: 15.25, max: 20 }, { n: "Matematik", net: 28.5, max: 40 }, { n: "Fen", net: 9.5, max: 20 }] },
      { id: "ee5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5",
        parts: [{ n: "Türkçe", net: 33.75, max: 40 }, { n: "Sosyal", net: 14.0, max: 20 }, { n: "Matematik", net: 27.75, max: 40 }, { n: "Fen", net: 11.0, max: 20 }] },
      { id: "ee4", name: "TYT Genel Deneme #4", pub: "Şube Denemesi", type: "TYT", date: "17 May 2026", net: 80.75, rank: "~61.000", delta: "+1.25",
        parts: [{ n: "Türkçe", net: 31.5, max: 40 }, { n: "Sosyal", net: 12.75, max: 20 }, { n: "Matematik", net: 25.25, max: 40 }, { n: "Fen", net: 12.0, max: 20 }] },
    ],
    trend: [{ l: "3.D", v: 79.5 }, { l: "4.D", v: 80.75 }, { l: "5.D", v: 86.25 }, { l: "6.D", v: 88 }],
    subjects: [
      { name: "Türkçe", pct: 81, net: "35.0", trend: "up" },
      { name: "Matematik", pct: 72, net: "28.5", trend: "up" },
      { name: "Biyoloji", pct: 66, net: "14.0", trend: "flat" },
      { name: "Kimya", pct: 41, net: "11.8", trend: "down" },
    ],
    reports: [
      { id: "er1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 82, net: 297, hours: 21.0, note: "Düzenli çalışma sürüyor. Deneme #6'da +1.75 net artışı.", status: "okundu" },
    ],
  },
  {
    id: "s2", name: "Mert Demir", initials: "MD", grade: "12. Sınıf · Eşit Ağırlık",
    goal: "Hukuk Fakültesi", sinav: "YKS", status: "risk",
    completion: 41, net: 268, streak: 2, weekHours: 9.5, lastActive: "2 gün önce",
    parent: "Hakan Demir", parentPhone: "+90 5•• ••• 88 21",
    odev: [
      { id: "mo1", subject: "Matematik", topic: "Problemler — 30 soru", types: ["soru"], count: 30, source: "Karekök", due: "2026-06-03", status: "pending" },
      { id: "mo2", subject: "Türkçe", topic: "Paragraf — 40 soru", types: ["soru"], count: 40, source: "Bilgi Sarmal", due: "2026-06-04", status: "pending" },
      { id: "mo3", subject: "Tarih", topic: "İlk Türk devletleri — konu", types: ["konu"], source: "Benim Hocam", due: "2026-06-02", status: "pending" },
      { id: "mo4", subject: "Matematik", topic: "Fonksiyonlar — 25 soru", types: ["soru"], count: 25, source: "Karekök", due: "2026-05-30", status: "done", result: { d: 14, y: 9, b: 2 } },
    ],
    exams: [
      { id: "me4", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 71.5, rank: "~92.000", delta: "-3.25",
        parts: [{ n: "Türkçe", net: 30.0, max: 40 }, { n: "Sosyal", net: 16.0, max: 20 }, { n: "Matematik", net: 19.5, max: 40 }, { n: "Fen", net: 6.0, max: 20 }] },
      { id: "me3", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 74.75, rank: "~84.000", delta: "+0.5",
        parts: [{ n: "Türkçe", net: 31.0, max: 40 }, { n: "Sosyal", net: 16.5, max: 20 }, { n: "Matematik", net: 21.0, max: 40 }, { n: "Fen", net: 6.25, max: 20 }] },
    ],
    trend: [{ l: "3.D", v: 76 }, { l: "4.D", v: 74.25 }, { l: "5.D", v: 74.75 }, { l: "6.D", v: 71.5 }],
    subjects: [
      { name: "Türkçe", pct: 70, net: "30.0", trend: "flat" },
      { name: "Matematik", pct: 44, net: "19.5", trend: "down" },
      { name: "Tarih", pct: 52, net: "12.0", trend: "down" },
      { name: "Coğrafya", pct: 48, net: "9.0", trend: "flat" },
    ],
    reports: [
      { id: "mr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 48, net: 274, hours: 11.0, note: "Çalışma süresi hedefin altında. Matematikte gerileme var, acil program revizyonu gerek.", status: "okundu" },
    ],
  },
  {
    id: "s3", name: "Zeynep Kaya", initials: "ZK", grade: "12. Sınıf · Sayısal",
    goal: "Tıp Fakültesi", sinav: "YKS", status: "ok",
    completion: 94, net: 358, streak: 21, weekHours: 28.0, lastActive: "Az önce",
    parent: "Filiz Kaya", parentPhone: "+90 5•• ••• 33 09",
    odev: [
      { id: "zo1", subject: "Matematik", topic: "İntegral — 50 soru", types: ["soru"], count: 50, source: "Uyanık YKS SB", due: "2026-06-06", status: "submitted", result: { d: 44, y: 4, b: 2 } },
      { id: "zo2", subject: "Fizik", topic: "Elektrik — AYT deneme", types: ["test"], count: 14, source: "Endemik AYT", due: "2026-06-05", status: "done", result: { d: 12, y: 2, b: 0 } },
      { id: "zo3", subject: "Biyoloji", topic: "Sistemler — konu tekrarı", types: ["konu"], source: "Tonguç", due: "2026-06-07", status: "pending" },
    ],
    exams: [
      { id: "ze6", name: "AYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "AYT", date: "1 Haz 2026", net: 64.5, rank: "~3.200", delta: "+2.5",
        parts: [{ n: "Matematik", net: 28.0, max: 40 }, { n: "Fizik", net: 12.0, max: 14 }, { n: "Kimya", net: 11.5, max: 13 }, { n: "Biyoloji", net: 13.0, max: 13 }] },
      { id: "ze5", name: "AYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "AYT", date: "24 May 2026", net: 62.0, rank: "~3.900", delta: "+3.0",
        parts: [{ n: "Matematik", net: 26.5, max: 40 }, { n: "Fizik", net: 11.5, max: 14 }, { n: "Kimya", net: 11.0, max: 13 }, { n: "Biyoloji", net: 13.0, max: 13 }] },
    ],
    trend: [{ l: "3.D", v: 57 }, { l: "4.D", v: 59.5 }, { l: "5.D", v: 62 }, { l: "6.D", v: 64.5 }],
    subjects: [
      { name: "Biyoloji", pct: 96, net: "13.0", trend: "up" },
      { name: "Fizik", pct: 88, net: "12.0", trend: "up" },
      { name: "Kimya", pct: 85, net: "11.5", trend: "flat" },
      { name: "Matematik", pct: 70, net: "28.0", trend: "up" },
    ],
    reports: [
      { id: "zr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 91, net: 348, hours: 27.0, note: "Mükemmel tempo. Matematik son düzlükte; net stabil yükseliyor.", status: "okundu" },
    ],
  },
  {
    id: "s4", name: "Ada Şahin", initials: "AŞ", grade: "11. Sınıf · Sayısal",
    goal: "Mühendislik", sinav: "YKS", status: "new",
    completion: 0, net: 0, streak: 0, weekHours: 0, lastActive: "Henüz giriş yok",
    parent: "Murat Şahin", parentPhone: "+90 5•• ••• 70 14",
    odev: [],
    exams: [],
    trend: [],
    subjects: [],
    reports: [],
  },
  {
    id: "s5", name: "Burak Çelik", initials: "BÇ", grade: "12. Sınıf · Sayısal",
    goal: "Bilgisayar Müh.", sinav: "YKS", status: "ok",
    completion: 76, net: 301, streak: 8, weekHours: 19.0, lastActive: "1 saat önce",
    parent: "Sevil Çelik", parentPhone: "+90 5•• ••• 51 62",
    odev: [
      { id: "bo1", subject: "Matematik", topic: "Logaritma — 35 soru", types: ["soru"], count: 35, source: "Karekök", due: "2026-06-07", status: "pending" },
      { id: "bo2", subject: "Fizik", topic: "Optik — konu + video", types: ["konu", "video"], source: "Hocalara Geldik", due: "2026-06-06", status: "submitted", result: null },
      { id: "bo3", subject: "Kimya", topic: "Asit-baz — 20 soru", types: ["soru"], count: 20, source: "345 Yayınları", due: "2026-06-04", status: "done", result: { d: 17, y: 2, b: 1 } },
    ],
    exams: [
      { id: "be6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 84.0, rank: "~55.000", delta: "+2.0",
        parts: [{ n: "Türkçe", net: 32.0, max: 40 }, { n: "Sosyal", net: 14.0, max: 20 }, { n: "Matematik", net: 27.0, max: 40 }, { n: "Fen", net: 11.0, max: 20 }] },
      { id: "be5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 82.0, rank: "~59.000", delta: "+1.5",
        parts: [{ n: "Türkçe", net: 31.0, max: 40 }, { n: "Sosyal", net: 13.5, max: 20 }, { n: "Matematik", net: 26.5, max: 40 }, { n: "Fen", net: 11.0, max: 20 }] },
    ],
    trend: [{ l: "3.D", v: 79 }, { l: "4.D", v: 80.5 }, { l: "5.D", v: 82 }, { l: "6.D", v: 84 }],
    subjects: [
      { name: "Matematik", pct: 75, net: "27.0", trend: "up" },
      { name: "Fizik", pct: 68, net: "13.5", trend: "up" },
      { name: "Türkçe", pct: 78, net: "32.0", trend: "flat" },
      { name: "Kimya", pct: 60, net: "12.0", trend: "up" },
    ],
    reports: [
      { id: "br1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 72, net: 295, hours: 18.0, note: "İstikrarlı ilerleme. Fizik optik konusuna ağırlık verilmeli.", status: "okundu" },
    ],
  },
  {
    id: "s6", name: "Selin Aydın", initials: "SA", grade: "10. Sınıf · Sayısal",
    goal: "Erken hazırlık", sinav: "Okul", status: "ok",
    completion: 70, net: 214, streak: 6, weekHours: 15.5, lastActive: "3 saat önce",
    parent: "Derya Aydın", parentPhone: "+90 5•• ••• 26 47",
    odev: [
      { id: "lo1", subject: "Matematik", topic: "Köklü sayılar — 25 soru", types: ["soru"], count: 25, source: "Okul SB", due: "2026-06-07", status: "pending" },
      { id: "lo2", subject: "Geometri", topic: "Üçgenler — konu", types: ["konu"], source: "Apotemi", due: "2026-06-05", status: "done", result: null },
    ],
    exams: [
      { id: "le3", name: "Okul Deneme #3", pub: "Okul", type: "Genel", date: "30 May 2026", net: 214, rank: "Sınıf 3.", delta: "+9",
        parts: [{ n: "Türkçe", net: 18.0, max: 20 }, { n: "Matematik", net: 16.0, max: 20 }, { n: "Fen", net: 14.0, max: 20 }, { n: "Sosyal", net: 16.0, max: 20 }] },
    ],
    trend: [{ l: "1.D", v: 196 }, { l: "2.D", v: 205 }, { l: "3.D", v: 214 }],
    subjects: [
      { name: "Türkçe", pct: 80, net: "18.0", trend: "up" },
      { name: "Matematik", pct: 66, net: "16.0", trend: "up" },
      { name: "Geometri", pct: 58, net: "13.0", trend: "flat" },
    ],
    reports: [
      { id: "lr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 66, net: 205, hours: 14.0, note: "Yaşına göre çok düzenli. Temel matematik sağlam ilerliyor.", status: "okundu" },
    ],
  },
  {
    id: "s7", name: "Kaan Yıldız", initials: "KY", grade: "9. Sınıf · Sayısal",
    goal: "Lise hazırlık", sinav: "Okul", status: "ok",
    completion: 62, net: 198, streak: 5, weekHours: 14.0, lastActive: "5 saat önce",
    parent: "Ayşe Yıldız", parentPhone: "+90 5•• ••• 12 34",
    odev: [
      { id: "ko1", subject: "Matematik", topic: "Çarpanlara ayırma (20 soru)", types: ["soru"], count: 20, source: "Okul SB", due: "2026-06-07", status: "pending" },
      { id: "ko2", subject: "Fizik", topic: "Kuvvet ve hareket — konu", types: ["konu"], source: "Tonguç", due: "2026-06-06", status: "pending" },
      { id: "ko3", subject: "Türkçe", topic: "Sözcükte anlam (15 soru)", types: ["soru"], count: 15, source: "3D Yayınları", due: "2026-06-04", status: "done", result: { d: 12, y: 2, b: 1 } },
    ],
    exams: [
      { id: "ke3", name: "Okul Deneme #3", pub: "Okul", type: "Genel", date: "30 May 2026", net: 198, rank: "Sınıf 4.", delta: "+12",
        parts: [{ n: "Türkçe", net: 18, max: 20 }, { n: "Matematik", net: 15, max: 20 }, { n: "Fen", net: 13, max: 20 }, { n: "Sosyal", net: 16, max: 20 }] },
    ],
    trend: [{ l: "1.D", v: 172 }, { l: "2.D", v: 186 }, { l: "3.D", v: 198 }],
    subjects: [
      { name: "Türkçe", pct: 74, net: "18.0", trend: "up" },
      { name: "Matematik", pct: 58, net: "15.0", trend: "up" },
      { name: "Fizik", pct: 49, net: "13.0", trend: "flat" },
    ],
    reports: [
      { id: "kr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 55, net: 186, hours: 12.5, note: "Fen konularına daha çok zaman ayırması iyi olur.", status: "okundu" },
    ],
  },
  {
    id: "s8", name: "Emre Korkmaz", initials: "EK", grade: "12. Sınıf · Sayısal",
    goal: "Diş Hekimliği", sinav: "YKS", status: "risk",
    completion: 33, net: 245, streak: 0, weekHours: 6.0, lastActive: "4 gün önce",
    parent: "Nalan Korkmaz", parentPhone: "+90 5•• ••• 19 03",
    odev: [
      { id: "qo1", subject: "Biyoloji", topic: "Kalıtım — 30 soru", types: ["soru"], count: 30, source: "Tonguç", due: "2026-06-02", status: "pending" },
      { id: "qo2", subject: "Kimya", topic: "Tepkimeler — konu", types: ["konu"], source: "345 Yayınları", due: "2026-06-01", status: "pending" },
    ],
    exams: [
      { id: "qe6", name: "AYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "AYT", date: "1 Haz 2026", net: 38.0, rank: "~28.000", delta: "-4.0",
        parts: [{ n: "Matematik", net: 14.0, max: 40 }, { n: "Fizik", net: 7.0, max: 14 }, { n: "Kimya", net: 8.0, max: 13 }, { n: "Biyoloji", net: 9.0, max: 13 }] },
    ],
    trend: [{ l: "3.D", v: 46 }, { l: "4.D", v: 43 }, { l: "5.D", v: 42 }, { l: "6.D", v: 38 }],
    subjects: [
      { name: "Biyoloji", pct: 55, net: "9.0", trend: "down" },
      { name: "Kimya", pct: 48, net: "8.0", trend: "flat" },
      { name: "Matematik", pct: 30, net: "14.0", trend: "down" },
    ],
    reports: [
      { id: "qr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 38, net: 252, hours: 7.5, note: "Devamsızlık artıyor. Bu hafta veliyle görüşme ve birebir motivasyon şart.", status: "okundu" },
    ],
  },
];

/* ---- İnceleme kuyruğu: öğrencinin gönderdiği, koçun onaylayacağı ödevler ---- */
const C_REVIEWS = [
  { id: "rv1", sid: "s3", student: "Zeynep Kaya", initials: "ZK", subject: "Matematik", topic: "İntegral — 50 soru", result: { d: 44, y: 4, b: 2 }, time: "12 dk önce" },
  { id: "rv2", sid: "s1", student: "Elif Yıldız", initials: "EY", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", result: { d: 16, y: 3, b: 1 }, time: "40 dk önce" },
  { id: "rv3", sid: "s5", student: "Burak Çelik", initials: "BÇ", subject: "Fizik", topic: "Optik — konu + video", result: null, time: "2 saat önce" },
];

/* ---- Koç randevuları (gün → bloklar). Bugün Cmt. ---- */
const C_TODAY = "Cmt";
const C_APPTS = [
  { id: "ca1", sid: "s3", student: "Zeynep Kaya", initials: "ZK", day: "Cmt", date: "6 Haziran Cmt", time: "11:00", end: "11:45", mode: "Yüz yüze", topic: "Deneme #6 analizi", status: "onaylı" },
  { id: "ca2", sid: "s1", student: "Elif Yıldız", initials: "EY", day: "Cmt", date: "6 Haziran Cmt", time: "15:30", end: "16:15", mode: "Online", topic: "Haftalık değerlendirme", status: "onaylı" },
  { id: "ca3", sid: "s8", student: "Emre Korkmaz", initials: "EK", day: "Cmt", date: "6 Haziran Cmt", time: "18:00", end: "18:45", mode: "Telefon", topic: "Motivasyon görüşmesi", status: "onaylı" },
  { id: "ca4", sid: "s2", student: "Mert Demir", initials: "MD", day: "Paz", date: "7 Haziran Paz", time: "14:00", end: "14:45", mode: "Online", topic: "Program revizyonu", status: "bekliyor" },
  { id: "ca5", sid: "s5", student: "Burak Çelik", initials: "BÇ", day: "Pzt", date: "8 Haziran Pzt", time: "17:00", end: "17:45", mode: "Yüz yüze", topic: "Deneme analizi", status: "onaylı" },
  { id: "ca6", sid: "s6", student: "Selin Aydın", initials: "SA", day: "Pzt", date: "8 Haziran Pzt", time: "18:30", end: "19:00", mode: "Online", topic: "Aylık değerlendirme", status: "bekliyor" },
  { id: "ca7", sid: "s7", student: "Kaan Yıldız", initials: "KY", day: "Çar", date: "10 Haziran Çar", time: "16:30", end: "17:00", mode: "Yüz yüze", topic: "Konu planlaması", status: "onaylı" },
];

/* ---- Mesaj kutusu (her thread bir öğrenci ya da veli) ---- */
const C_THREADS = [
  { id: "t1", sid: "s2", name: "Mert Demir", initials: "MD", kind: "Öğrenci", last: "Hocam bugün hasta olduğum için çalışamadım", time: "16:42", unread: 2,
    msgs: [
      { from: "them", text: "Hocam merhaba", time: "16:40" },
      { from: "them", text: "Bugün hasta olduğum için çalışamadım, programı kaçırdım", time: "16:42" },
    ] },
  { id: "t2", sid: "s8", name: "Nalan Korkmaz", initials: "NK", kind: "Veli", last: "Emre'nin son durumu hakkında konuşabilir miyiz?", time: "14:18", unread: 1,
    msgs: [
      { from: "them", text: "Dilek Hanım merhaba, Emre'nin son durumu hakkında konuşabilir miyiz?", time: "14:18" },
    ] },
  { id: "t3", sid: "s1", name: "Elif Yıldız", initials: "EY", kind: "Öğrenci", last: "Zincir kuralı kısmı. Olur, çok iyi olur 🙏", time: "09:18", unread: 0,
    msgs: [
      { from: "me", text: "Elif merhaba! Bu haftaki türev testini gördüm, eline sağlık 👏", time: "09:12" },
      { from: "them", text: "Teşekkürler hocam, birkaç soruda zorlandım", time: "09:15" },
      { from: "me", text: "Hangi konuda? İstersen pazar randevusunda birlikte bakalım.", time: "09:16" },
      { from: "them", text: "Zincir kuralı kısmı. Olur, çok iyi olur 🙏", time: "09:18" },
    ] },
  { id: "t4", sid: "s3", name: "Zeynep Kaya", initials: "ZK", kind: "Öğrenci", last: "İntegral testini gönderdim hocam", time: "Dün", unread: 0,
    msgs: [
      { from: "them", text: "İntegral testini gönderdim hocam, 44 doğru", time: "Dün" },
      { from: "me", text: "Süpersin Zeynep! İnceleyip dönüş yapacağım.", time: "Dün" },
    ] },
  { id: "t5", sid: "s5", name: "Burak Çelik", initials: "BÇ", kind: "Öğrenci", last: "Tamamdır hocam, teşekkürler", time: "2 gün önce", unread: 0,
    msgs: [
      { from: "me", text: "Burak, optik konusunu bu hafta bitirelim.", time: "2 gün önce" },
      { from: "them", text: "Tamamdır hocam, teşekkürler", time: "2 gün önce" },
    ] },
];

/* ---- Bugünün aktivite akışı ---- */
const C_ACTIVITY = [
  { icon: "checkCircle", tone: "success", who: "Zeynep Kaya", what: "İntegral testini tamamladı · net 43.0", time: "12 dk önce" },
  { icon: "chart", tone: "primary", who: "Elif Yıldız", what: "Mol Kavramı denemesini gönderdi", time: "40 dk önce" },
  { icon: "flame", tone: "warning", who: "Zeynep Kaya", what: "21 günlük seriye ulaştı 🔥", time: "1 saat önce" },
  { icon: "clock", tone: "danger", who: "Emre Korkmaz", what: "2 ödevin teslim tarihi geçti", time: "Bugün" },
  { icon: "user", tone: "info", who: "Ada Şahin", what: "Yeni öğrenci olarak atandı", time: "Dün" },
];

/* ---- Koç bildirimleri (zil) ---- */
const C_NOTIFS = [
  { icon: "chart", tone: "primary", title: "Zeynep deneme gönderdi", desc: "İntegral — 50 soru · net 43.0 onayını bekliyor", time: "12 dk önce", unread: true },
  { icon: "message", tone: "warning", title: "Mert Demir mesaj attı", desc: "“Bugün hasta olduğum için çalışamadım”", time: "16:42", unread: true },
  { icon: "clock", tone: "danger", title: "Emre Korkmaz geç kaldı", desc: "2 ödevin teslim tarihi geçti", time: "Bugün", unread: true },
  { icon: "users", tone: "info", title: "Yeni öğrenci atandı", desc: "Ada Şahin kadrona eklendi", time: "Dün", unread: false },
  { icon: "calendar", tone: "success", title: "Randevu onayı", desc: "Zeynep Kaya · bugün 11:00 yüz yüze", time: "Dün", unread: false },
];

/* ---- Koça özel gizli notlar (öğrenci başına) ---- */
const C_NOTES = {
  s1: [
    { id: "n1", text: "Zincir kuralında zorlanıyor; pazar randevusunda birlikte çalışılacak.", date: "4 Haz" },
    { id: "n2", text: "Motivasyonu yüksek, deneme temposu bir tık artırılabilir.", date: "1 Haz" },
  ],
  s2: [
    { id: "n3", text: "Devamsızlık eğilimi başladı. Veliyle görüşme planlandı.", date: "3 Haz" },
  ],
  s3: [
    { id: "n4", text: "Son düzlükte; matematik hızını korumalı. Çok stabil.", date: "2 Haz" },
  ],
  s8: [
    { id: "n5", text: "ACİL: net düşüşte, devamsızlık var. Birebir motivasyon + veli görüşmesi şart.", date: "2 Haz" },
  ],
};

/* ---- Koç görev listesi (yapılacaklar) ---- */
const C_TASKS = [
  { id: "tk1", text: "Emre'nin velisini ara", sid: "s8", student: "Emre Korkmaz", due: "Bugün", done: false, priority: "high" },
  { id: "tk2", text: "Zeynep'in integral testini incele", sid: "s3", student: "Zeynep Kaya", due: "Bugün", done: false, priority: "med" },
  { id: "tk3", text: "Mert'in haftalık programını revize et", sid: "s2", student: "Mert Demir", due: "7 Haz", done: false, priority: "high" },
  { id: "tk4", text: "Haftalık raporları hazırla (4 öğrenci)", sid: null, student: null, due: "7 Haz", done: false, priority: "med" },
  { id: "tk5", text: "Ada'ya ilk ödev setini ata", sid: "s4", student: "Ada Şahin", due: "8 Haz", done: false, priority: "med" },
  { id: "tk6", text: "Deneme #6 sonuçlarını analiz et", sid: null, student: null, due: "5 Haz", done: true, priority: "low" },
];
const C_TASK_PRIORITY = { high: { label: "Acil", tone: "danger" }, med: { label: "Orta", tone: "warning" }, low: { label: "Düşük", tone: "muted" } };

/* ---- Toplu duyuru / grup mesajı ---- */
const C_AUDIENCES = ["Tüm öğrenciler", "Tüm veliler", "Risk altındakiler", "12. sınıflar"];
const C_ANNOUNCEMENTS = [
  { id: "an1", title: "Pazar TYT Deneme #7", body: "8 Haziran Pazar 10:00'da TYT Genel Deneme #7 var. Erken uyuyun, yanınıza yedek kalem alın.", audience: "Tüm öğrenciler", time: "Dün 20:10", reach: 8 },
  { id: "an2", title: "Hafta sonu çalışma maratonu", body: "Cumartesi 09:00–12:00 arası birlikte çevrimiçi çalışacağız. Katılım serbest, linki gruptan paylaşacağım.", audience: "Risk altındakiler", time: "2 gün önce", reach: 2 },
  { id: "an3", title: "Deneme analizi hatırlatması", body: "Deneme sonrası mutlaka yanlış analizi yapın; boş bıraktıklarınızı da gözden geçirin.", audience: "12. sınıflar", time: "4 gün önce", reach: 4 },
];

/* ---- Deneme atama & takibi ---- */
const C_EXAM_ASSIGN = [
  { id: "ex7", name: "TYT Genel Deneme #7", type: "TYT", date: "8 Haz 2026", audience: "Tüm öğrenciler", status: "yaklaşan",
    taken: [
      { sid: "s1", name: "Elif Yıldız", initials: "EY", net: null },
      { sid: "s2", name: "Mert Demir", initials: "MD", net: null },
      { sid: "s3", name: "Zeynep Kaya", initials: "ZK", net: null },
      { sid: "s5", name: "Burak Çelik", initials: "BÇ", net: null },
      { sid: "s6", name: "Selin Aydın", initials: "SA", net: null },
      { sid: "s8", name: "Emre Korkmaz", initials: "EK", net: null },
    ] },
  { id: "ex6", name: "TYT Genel Deneme #6", type: "TYT", date: "1 Haz 2026", audience: "Tüm öğrenciler", status: "tamamlandı",
    taken: [
      { sid: "s1", name: "Elif Yıldız", initials: "EY", net: 88.0 },
      { sid: "s3", name: "Zeynep Kaya", initials: "ZK", net: 86.5 },
      { sid: "s5", name: "Burak Çelik", initials: "BÇ", net: 84.0 },
      { sid: "s6", name: "Selin Aydın", initials: "SA", net: 80.25 },
      { sid: "s2", name: "Mert Demir", initials: "MD", net: 71.5 },
      { sid: "s8", name: "Emre Korkmaz", initials: "EK", net: null },
    ] },
  { id: "ex5", name: "TYT Genel Deneme #5", type: "TYT", date: "24 May 2026", audience: "Tüm öğrenciler", status: "tamamlandı",
    taken: [
      { sid: "s1", name: "Elif Yıldız", initials: "EY", net: 86.25 },
      { sid: "s3", name: "Zeynep Kaya", initials: "ZK", net: 84.0 },
      { sid: "s5", name: "Burak Çelik", initials: "BÇ", net: 82.0 },
      { sid: "s2", name: "Mert Demir", initials: "MD", net: 74.75 },
      { sid: "s6", name: "Selin Aydın", initials: "SA", net: 77.5 },
      { sid: "s8", name: "Emre Korkmaz", initials: "EK", net: 52.0 },
    ] },
];
const C_EXAM_TYPES = ["TYT", "AYT", "YDT", "Branş"];

/* ---- Çalışma programı tohumu (haftalık plan; koç düzenler) ---- */
const C_PROGRAM_SEED = {
  "Pzt": [
    { t: "16:00", e: "17:30", subj: "Matematik", topic: "Türev — kural tekrarı", type: "Konu" },
    { t: "18:00", e: "19:00", subj: "Türkçe", topic: "Paragraf hız çalışması", type: "Soru" },
    { t: "20:30", e: "21:30", subj: "Fizik", topic: "Newton yasaları videoları", type: "Konu" },
  ],
  "Sal": [
    { t: "16:00", e: "17:00", subj: "Kimya", topic: "Mol kavramı — örnek soru", type: "Soru" },
    { t: "17:30", e: "19:00", subj: "Geometri", topic: "Üçgende açı", type: "Konu" },
  ],
  "Çar": [
    { t: "16:30", e: "18:00", subj: "Matematik", topic: "Fonksiyonlar tekrar", type: "Konu" },
    { t: "20:00", e: "21:00", subj: "Biyoloji", topic: "Hücre bölünmesi", type: "Konu" },
  ],
  "Per": [
    { t: "16:00", e: "17:30", subj: "Türkçe", topic: "Sözcük türleri", type: "Konu" },
    { t: "18:00", e: "19:30", subj: "Fizik", topic: "Dalgalar soru bankası", type: "Soru" },
  ],
  "Cum": [
    { t: "16:00", e: "17:00", subj: "Kimya", topic: "Karışımlar tekrar", type: "Konu" },
  ],
  "Cmt": [
    { t: "09:00", e: "10:30", subj: "Matematik", topic: "Türev — 40 soruluk test", type: "Test" },
    { t: "13:30", e: "15:30", subj: "Kimya", topic: "TYT deneme bölümü", type: "Deneme" },
  ],
  "Paz": [
    { t: "10:00", e: "13:00", subj: "Matematik", topic: "TYT Genel Deneme #7", type: "Deneme" },
    { t: "15:00", e: "16:30", subj: "Biyoloji", topic: "Deneme analizi", type: "Analiz" },
  ],
};
const C_BLOCK_TYPES = ["Konu", "Soru", "Test", "Deneme", "Analiz", "Video"];

/* ---- Atama için katalog (kaynaklar + tipler uk-data.jsx ile uyumlu) ---- */
const C_ASSIGN_SOURCES = [
  "Uyanık YKS Soru Bankası", "345 Yayınları TYT", "Apotemi Geometri",
  "Bilgi Sarmal Paragraf", "Hocalara Geldik Fizik", "Karekök Kimya",
  "Tonguç Akademi", "Endemik AYT Deneme",
];

/* yardımcı: id → öğrenci */
function cStudent(id) { return C_STUDENTS.find((s) => s.id === id); }

/* durum etiketi */
const C_STATUS = {
  ok: { label: "Yolunda", tone: "success" },
  risk: { label: "Risk", tone: "danger" },
  new: { label: "Yeni", tone: "primary" },
};

Object.assign(window, {
  C_COACH, C_STUDENTS, C_REVIEWS, C_TODAY, C_APPTS, C_THREADS, C_ACTIVITY,
  C_ASSIGN_SOURCES, cStudent, C_STATUS, C_NOTIFS,
  C_NOTES, C_TASKS, C_TASK_PRIORITY, C_AUDIENCES, C_ANNOUNCEMENTS,
  C_EXAM_ASSIGN, C_EXAM_TYPES, C_PROGRAM_SEED, C_BLOCK_TYPES,
});
