// Koç (coach) mobil verisi — kaynak: uyanikkoc-mobil-source-v3 (uk-data-coach.jsx).

export type CoachOdev = {
  id: string; subject: string; topic: string; types: string[]; count?: number; source: string; due: string;
  status: "pending" | "submitted" | "done"; result?: { d: number; y: number; b: number } | null;
};
export type CoachStudent = {
  id: string; name: string; initials: string; grade: string; goal: string; sinav: string;
  status: "ok" | "risk" | "new";
  completion: number; net: number; streak: number; weekHours: number; lastActive: string;
  parent: string; parentPhone: string;
  odev: CoachOdev[];
  exams: { id: string; name: string; pub: string; type: string; date: string; net: number; rank: string; delta: string; parts: { n: string; net: number; max: number }[] }[];
  trend: { l: string; v: number }[];
  subjects: { name: string; pct: number; net: string; trend: string }[];
  reports: { id: string; week: string; date: string; completion: number; net: number; hours: number; note: string; status: string }[];
};

export const C_COACH = {
  name: "Dilek Emen", initials: "DE", title: "YKS Sayısal Koçu",
  phone: "+90 5•• ••• 47 80", email: "dilek.emen@uyanikkoc.com",
  studentCount: 8, rating: 4.9, yearsExp: 7,
};

export const C_STUDENTS: CoachStudent[] = [
  { id: "s1", name: "Elif Yıldız", initials: "EY", grade: "11. Sınıf · Sayısal", goal: "YKS 2026", sinav: "YKS", status: "ok", completion: 88, net: 312, streak: 12, weekHours: 23.5, lastActive: "8 dk önce", parent: "Ayşe Yıldız", parentPhone: "+90 5•• ••• 12 34",
    odev: [
      { id: "eo1", subject: "Matematik", topic: "Türev — kural tekrarı (40 soru)", types: ["soru"], count: 40, source: "Uyanık YKS SB", due: "2026-06-06", status: "pending" },
      { id: "eo2", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", types: ["test"], count: 20, source: "345 Yayınları", due: "2026-06-05", status: "submitted", result: { d: 16, y: 3, b: 1 } },
      { id: "eo3", subject: "Geometri", topic: "Üçgende açı — 25 soru", types: ["soru"], count: 25, source: "Apotemi", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
      { id: "eo5", subject: "Türkçe", topic: "Paragraf — hız çalışması (30 soru)", types: ["soru"], count: 30, source: "Bilgi Sarmal", due: "2026-06-08", status: "pending" },
    ],
    exams: [
      { id: "ee6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75", parts: [{ n: "Türkçe", net: 35.0, max: 40 }, { n: "Sosyal", net: 15.25, max: 20 }, { n: "Matematik", net: 28.5, max: 40 }, { n: "Fen", net: 9.5, max: 20 }] },
      { id: "ee5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5", parts: [] },
    ],
    trend: [{ l: "3.D", v: 79.5 }, { l: "4.D", v: 80.75 }, { l: "5.D", v: 86.25 }, { l: "6.D", v: 88 }],
    subjects: [{ name: "Türkçe", pct: 81, net: "35.0", trend: "up" }, { name: "Matematik", pct: 72, net: "28.5", trend: "up" }, { name: "Biyoloji", pct: 66, net: "14.0", trend: "flat" }, { name: "Kimya", pct: 41, net: "11.8", trend: "down" }],
    reports: [{ id: "er1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 82, net: 297, hours: 21.0, note: "Düzenli çalışma sürüyor. Deneme #6'da +1.75 net artışı.", status: "okundu" }] },
  { id: "s2", name: "Mert Demir", initials: "MD", grade: "12. Sınıf · Eşit Ağırlık", goal: "Hukuk Fakültesi", sinav: "YKS", status: "risk", completion: 41, net: 268, streak: 2, weekHours: 9.5, lastActive: "2 gün önce", parent: "Hakan Demir", parentPhone: "+90 5•• ••• 88 21",
    odev: [
      { id: "mo1", subject: "Matematik", topic: "Problemler — 30 soru", types: ["soru"], count: 30, source: "Karekök", due: "2026-06-03", status: "pending" },
      { id: "mo2", subject: "Türkçe", topic: "Paragraf — 40 soru", types: ["soru"], count: 40, source: "Bilgi Sarmal", due: "2026-06-04", status: "pending" },
      { id: "mo3", subject: "Tarih", topic: "İlk Türk devletleri — konu", types: ["konu"], source: "Benim Hocam", due: "2026-06-02", status: "pending" },
    ],
    exams: [{ id: "me4", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 71.5, rank: "~92.000", delta: "-3.25", parts: [] }],
    trend: [{ l: "3.D", v: 76 }, { l: "4.D", v: 74.25 }, { l: "5.D", v: 74.75 }, { l: "6.D", v: 71.5 }],
    subjects: [{ name: "Türkçe", pct: 70, net: "30.0", trend: "flat" }, { name: "Matematik", pct: 44, net: "19.5", trend: "down" }, { name: "Tarih", pct: 52, net: "12.0", trend: "down" }],
    reports: [{ id: "mr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 48, net: 274, hours: 11.0, note: "Çalışma süresi hedefin altında. Matematikte gerileme var, acil program revizyonu gerek.", status: "okundu" }] },
  { id: "s3", name: "Zeynep Kaya", initials: "ZK", grade: "12. Sınıf · Sayısal", goal: "Tıp Fakültesi", sinav: "YKS", status: "ok", completion: 94, net: 358, streak: 21, weekHours: 28.0, lastActive: "Az önce", parent: "Filiz Kaya", parentPhone: "+90 5•• ••• 33 09",
    odev: [
      { id: "zo1", subject: "Matematik", topic: "İntegral — 50 soru", types: ["soru"], count: 50, source: "Uyanık YKS SB", due: "2026-06-06", status: "submitted", result: { d: 44, y: 4, b: 2 } },
      { id: "zo2", subject: "Fizik", topic: "Elektrik — AYT deneme", types: ["test"], count: 14, source: "Endemik AYT", due: "2026-06-05", status: "done", result: { d: 12, y: 2, b: 0 } },
      { id: "zo3", subject: "Biyoloji", topic: "Sistemler — konu tekrarı", types: ["konu"], source: "Tonguç", due: "2026-06-07", status: "pending" },
    ],
    exams: [{ id: "ze6", name: "AYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "AYT", date: "1 Haz 2026", net: 64.5, rank: "~3.200", delta: "+2.5", parts: [] }],
    trend: [{ l: "3.D", v: 57 }, { l: "4.D", v: 59.5 }, { l: "5.D", v: 62 }, { l: "6.D", v: 64.5 }],
    subjects: [{ name: "Biyoloji", pct: 96, net: "13.0", trend: "up" }, { name: "Fizik", pct: 88, net: "12.0", trend: "up" }, { name: "Matematik", pct: 70, net: "28.0", trend: "up" }],
    reports: [{ id: "zr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 91, net: 348, hours: 27.0, note: "Mükemmel tempo. Matematik son düzlükte; net stabil yükseliyor.", status: "okundu" }] },
  { id: "s4", name: "Ada Şahin", initials: "AŞ", grade: "11. Sınıf · Sayısal", goal: "Mühendislik", sinav: "YKS", status: "new", completion: 0, net: 0, streak: 0, weekHours: 0, lastActive: "Henüz giriş yok", parent: "Murat Şahin", parentPhone: "+90 5•• ••• 70 14", odev: [], exams: [], trend: [], subjects: [], reports: [] },
  { id: "s5", name: "Burak Çelik", initials: "BÇ", grade: "12. Sınıf · Sayısal", goal: "Bilgisayar Müh.", sinav: "YKS", status: "ok", completion: 76, net: 301, streak: 8, weekHours: 19.0, lastActive: "1 saat önce", parent: "Sevil Çelik", parentPhone: "+90 5•• ••• 51 62",
    odev: [
      { id: "bo1", subject: "Matematik", topic: "Logaritma — 35 soru", types: ["soru"], count: 35, source: "Karekök", due: "2026-06-07", status: "pending" },
      { id: "bo2", subject: "Fizik", topic: "Optik — konu + video", types: ["konu", "video"], source: "Hocalara Geldik", due: "2026-06-06", status: "submitted", result: null },
    ],
    exams: [{ id: "be6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 84.0, rank: "~55.000", delta: "+2.0", parts: [] }],
    trend: [{ l: "3.D", v: 79 }, { l: "4.D", v: 80.5 }, { l: "5.D", v: 82 }, { l: "6.D", v: 84 }],
    subjects: [{ name: "Matematik", pct: 75, net: "27.0", trend: "up" }, { name: "Fizik", pct: 68, net: "13.5", trend: "up" }, { name: "Türkçe", pct: 78, net: "32.0", trend: "flat" }],
    reports: [{ id: "br1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 72, net: 295, hours: 18.0, note: "İstikrarlı ilerleme. Fizik optik konusuna ağırlık verilmeli.", status: "okundu" }] },
  { id: "s6", name: "Selin Aydın", initials: "SA", grade: "10. Sınıf · Sayısal", goal: "Erken hazırlık", sinav: "Okul", status: "ok", completion: 70, net: 214, streak: 6, weekHours: 15.5, lastActive: "3 saat önce", parent: "Derya Aydın", parentPhone: "+90 5•• ••• 26 47",
    odev: [{ id: "lo1", subject: "Matematik", topic: "Köklü sayılar — 25 soru", types: ["soru"], count: 25, source: "Okul SB", due: "2026-06-07", status: "pending" }],
    exams: [{ id: "le3", name: "Okul Deneme #3", pub: "Okul", type: "Genel", date: "30 May 2026", net: 214, rank: "Sınıf 3.", delta: "+9", parts: [] }],
    trend: [{ l: "1.D", v: 196 }, { l: "2.D", v: 205 }, { l: "3.D", v: 214 }],
    subjects: [{ name: "Türkçe", pct: 80, net: "18.0", trend: "up" }, { name: "Matematik", pct: 66, net: "16.0", trend: "up" }],
    reports: [{ id: "lr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 66, net: 205, hours: 14.0, note: "Yaşına göre çok düzenli. Temel matematik sağlam ilerliyor.", status: "okundu" }] },
  { id: "s7", name: "Kaan Yıldız", initials: "KY", grade: "9. Sınıf · Sayısal", goal: "Lise hazırlık", sinav: "Okul", status: "ok", completion: 62, net: 198, streak: 5, weekHours: 14.0, lastActive: "5 saat önce", parent: "Ayşe Yıldız", parentPhone: "+90 5•• ••• 12 34",
    odev: [{ id: "ko1", subject: "Matematik", topic: "Çarpanlara ayırma (20 soru)", types: ["soru"], count: 20, source: "Okul SB", due: "2026-06-07", status: "pending" }],
    exams: [{ id: "ke3", name: "Okul Deneme #3", pub: "Okul", type: "Genel", date: "30 May 2026", net: 198, rank: "Sınıf 4.", delta: "+12", parts: [] }],
    trend: [{ l: "1.D", v: 172 }, { l: "2.D", v: 186 }, { l: "3.D", v: 198 }],
    subjects: [{ name: "Türkçe", pct: 74, net: "18.0", trend: "up" }, { name: "Matematik", pct: 58, net: "15.0", trend: "up" }],
    reports: [{ id: "kr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 55, net: 186, hours: 12.5, note: "Fen konularına daha çok zaman ayırması iyi olur.", status: "okundu" }] },
  { id: "s8", name: "Emre Korkmaz", initials: "EK", grade: "12. Sınıf · Sayısal", goal: "Diş Hekimliği", sinav: "YKS", status: "risk", completion: 33, net: 245, streak: 0, weekHours: 6.0, lastActive: "4 gün önce", parent: "Nalan Korkmaz", parentPhone: "+90 5•• ••• 19 03",
    odev: [
      { id: "qo1", subject: "Biyoloji", topic: "Kalıtım — 30 soru", types: ["soru"], count: 30, source: "Tonguç", due: "2026-06-02", status: "pending" },
      { id: "qo2", subject: "Kimya", topic: "Tepkimeler — konu", types: ["konu"], source: "345 Yayınları", due: "2026-06-01", status: "pending" },
    ],
    exams: [{ id: "qe6", name: "AYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "AYT", date: "1 Haz 2026", net: 38.0, rank: "~28.000", delta: "-4.0", parts: [] }],
    trend: [{ l: "3.D", v: 46 }, { l: "4.D", v: 43 }, { l: "5.D", v: 42 }, { l: "6.D", v: 38 }],
    subjects: [{ name: "Biyoloji", pct: 55, net: "9.0", trend: "down" }, { name: "Kimya", pct: 48, net: "8.0", trend: "flat" }, { name: "Matematik", pct: 30, net: "14.0", trend: "down" }],
    reports: [{ id: "qr1", week: "26 May – 1 Haz", date: "Geçen hafta", completion: 38, net: 252, hours: 7.5, note: "Devamsızlık artıyor. Bu hafta veliyle görüşme ve birebir motivasyon şart.", status: "okundu" }] },
];

export const C_STATUS: Record<string, { label: string; tone: "success" | "danger" | "primary" }> = {
  ok: { label: "Yolunda", tone: "success" },
  risk: { label: "Risk", tone: "danger" },
  new: { label: "Yeni", tone: "primary" },
};

export type CoachReview = { id: string; sid: string; student: string; initials: string; subject: string; topic: string; result: { d: number; y: number; b: number } | null; time: string };
export const C_REVIEWS: CoachReview[] = [
  { id: "rv1", sid: "s3", student: "Zeynep Kaya", initials: "ZK", subject: "Matematik", topic: "İntegral — 50 soru", result: { d: 44, y: 4, b: 2 }, time: "12 dk önce" },
  { id: "rv2", sid: "s1", student: "Elif Yıldız", initials: "EY", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", result: { d: 16, y: 3, b: 1 }, time: "40 dk önce" },
  { id: "rv3", sid: "s5", student: "Burak Çelik", initials: "BÇ", subject: "Fizik", topic: "Optik — konu + video", result: null, time: "2 saat önce" },
];

export const C_TODAY = "Cmt";
export type CoachAppt = { id: string; sid: string; student: string; initials: string; day: string; date: string; time: string; end: string; mode: string; topic: string; status: string };
export const C_APPTS: CoachAppt[] = [
  { id: "ca1", sid: "s3", student: "Zeynep Kaya", initials: "ZK", day: "Cmt", date: "6 Haziran Cmt", time: "11:00", end: "11:45", mode: "Yüz yüze", topic: "Deneme #6 analizi", status: "onaylı" },
  { id: "ca2", sid: "s1", student: "Elif Yıldız", initials: "EY", day: "Cmt", date: "6 Haziran Cmt", time: "15:30", end: "16:15", mode: "Online", topic: "Haftalık değerlendirme", status: "onaylı" },
  { id: "ca3", sid: "s8", student: "Emre Korkmaz", initials: "EK", day: "Cmt", date: "6 Haziran Cmt", time: "18:00", end: "18:45", mode: "Telefon", topic: "Motivasyon görüşmesi", status: "onaylı" },
  { id: "ca4", sid: "s2", student: "Mert Demir", initials: "MD", day: "Paz", date: "7 Haziran Paz", time: "14:00", end: "14:45", mode: "Online", topic: "Program revizyonu", status: "bekliyor" },
  { id: "ca5", sid: "s5", student: "Burak Çelik", initials: "BÇ", day: "Pzt", date: "8 Haziran Pzt", time: "17:00", end: "17:45", mode: "Yüz yüze", topic: "Deneme analizi", status: "onaylı" },
];

export type CoachThread = { id: string; sid: string; name: string; initials: string; kind: string; last: string; time: string; unread: number; msgs: { from: string; text: string; time: string }[] };
export const C_THREADS: CoachThread[] = [
  { id: "t1", sid: "s2", name: "Mert Demir", initials: "MD", kind: "Öğrenci", last: "Hocam bugün hasta olduğum için çalışamadım", time: "16:42", unread: 2, msgs: [{ from: "them", text: "Hocam merhaba", time: "16:40" }, { from: "them", text: "Bugün hasta olduğum için çalışamadım, programı kaçırdım", time: "16:42" }] },
  { id: "t2", sid: "s8", name: "Nalan Korkmaz", initials: "NK", kind: "Veli", last: "Emre'nin son durumu hakkında konuşabilir miyiz?", time: "14:18", unread: 1, msgs: [{ from: "them", text: "Dilek Hanım merhaba, Emre'nin son durumu hakkında konuşabilir miyiz?", time: "14:18" }] },
  { id: "t3", sid: "s1", name: "Elif Yıldız", initials: "EY", kind: "Öğrenci", last: "Zincir kuralı kısmı. Olur, çok iyi olur 🙏", time: "09:18", unread: 0, msgs: [{ from: "me", text: "Elif merhaba! Bu haftaki türev testini gördüm, eline sağlık 👏", time: "09:12" }, { from: "them", text: "Teşekkürler hocam, birkaç soruda zorlandım", time: "09:15" }, { from: "me", text: "Hangi konuda? İstersen pazar randevusunda birlikte bakalım.", time: "09:16" }, { from: "them", text: "Zincir kuralı kısmı. Olur, çok iyi olur 🙏", time: "09:18" }] },
  { id: "t4", sid: "s3", name: "Zeynep Kaya", initials: "ZK", kind: "Öğrenci", last: "İntegral testini gönderdim hocam", time: "Dün", unread: 0, msgs: [{ from: "them", text: "İntegral testini gönderdim hocam, 44 doğru", time: "Dün" }, { from: "me", text: "Süpersin Zeynep! İnceleyip dönüş yapacağım.", time: "Dün" }] },
];

export type CoachActivity = { icon: string; tone: string; who: string; what: string; time: string };
export const C_ACTIVITY: CoachActivity[] = [
  { icon: "checkCircle", tone: "success", who: "Zeynep Kaya", what: "İntegral testini tamamladı · net 43.0", time: "12 dk önce" },
  { icon: "chart", tone: "primary", who: "Elif Yıldız", what: "Mol Kavramı denemesini gönderdi", time: "40 dk önce" },
  { icon: "flame", tone: "warning", who: "Zeynep Kaya", what: "21 günlük seriye ulaştı 🔥", time: "1 saat önce" },
  { icon: "clock", tone: "danger", who: "Emre Korkmaz", what: "2 ödevin teslim tarihi geçti", time: "Bugün" },
];

export type CoachTask = { id: string; text: string; sid: string | null; student: string | null; due: string; done: boolean; priority: "high" | "med" | "low" };
export const C_TASKS: CoachTask[] = [
  { id: "tk1", text: "Emre'nin velisini ara", sid: "s8", student: "Emre Korkmaz", due: "Bugün", done: false, priority: "high" },
  { id: "tk2", text: "Zeynep'in integral testini incele", sid: "s3", student: "Zeynep Kaya", due: "Bugün", done: false, priority: "med" },
  { id: "tk3", text: "Mert'in haftalık programını revize et", sid: "s2", student: "Mert Demir", due: "7 Haz", done: false, priority: "high" },
  { id: "tk5", text: "Ada'ya ilk ödev setini ata", sid: "s4", student: "Ada Şahin", due: "8 Haz", done: false, priority: "med" },
  { id: "tk6", text: "Deneme #6 sonuçlarını analiz et", sid: null, student: null, due: "5 Haz", done: true, priority: "low" },
];
export const C_TASK_PRIORITY: Record<string, { label: string; tone: "danger" | "warning" | "muted" }> = {
  high: { label: "Acil", tone: "danger" }, med: { label: "Orta", tone: "warning" }, low: { label: "Düşük", tone: "muted" },
};

export const C_AUDIENCES = ["Tüm öğrenciler", "Tüm veliler", "Risk altındakiler", "12. sınıflar"];
export type CoachAnnouncement = { id: string; title: string; body: string; audience: string; time: string; reach: number };
export const C_ANNOUNCEMENTS: CoachAnnouncement[] = [
  { id: "an1", title: "Pazar TYT Deneme #7", body: "8 Haziran Pazar 10:00'da TYT Genel Deneme #7 var. Erken uyuyun, yanınıza yedek kalem alın.", audience: "Tüm öğrenciler", time: "Dün 20:10", reach: 8 },
  { id: "an2", title: "Hafta sonu çalışma maratonu", body: "Cumartesi 09:00–12:00 arası birlikte çevrimiçi çalışacağız. Katılım serbest.", audience: "Risk altındakiler", time: "2 gün önce", reach: 2 },
  { id: "an3", title: "Deneme analizi hatırlatması", body: "Deneme sonrası mutlaka yanlış analizi yapın; boş bıraktıklarınızı da gözden geçirin.", audience: "12. sınıflar", time: "4 gün önce", reach: 4 },
];

export type CoachExamAssign = { id: string; name: string; type: string; date: string; audience: string; status: string; taken: { sid: string; name: string; initials: string; net: number | null }[] };
export const C_EXAM_ASSIGN: CoachExamAssign[] = [
  { id: "ex7", name: "TYT Genel Deneme #7", type: "TYT", date: "8 Haz 2026", audience: "Tüm öğrenciler", status: "yaklaşan", taken: [
    { sid: "s1", name: "Elif Yıldız", initials: "EY", net: null }, { sid: "s2", name: "Mert Demir", initials: "MD", net: null }, { sid: "s3", name: "Zeynep Kaya", initials: "ZK", net: null }, { sid: "s5", name: "Burak Çelik", initials: "BÇ", net: null }] },
  { id: "ex6", name: "TYT Genel Deneme #6", type: "TYT", date: "1 Haz 2026", audience: "Tüm öğrenciler", status: "tamamlandı", taken: [
    { sid: "s1", name: "Elif Yıldız", initials: "EY", net: 88.0 }, { sid: "s3", name: "Zeynep Kaya", initials: "ZK", net: 86.5 }, { sid: "s5", name: "Burak Çelik", initials: "BÇ", net: 84.0 }, { sid: "s2", name: "Mert Demir", initials: "MD", net: 71.5 }] },
];
export const C_EXAM_TYPES = ["TYT", "AYT", "YDT", "Branş"];

export function cStudent(id: string): CoachStudent | undefined {
  return C_STUDENTS.find((s) => s.id === id);
}
export function mNet(d: number, y: number): number {
  return Math.round((d - y / 4) * 100) / 100;
}
