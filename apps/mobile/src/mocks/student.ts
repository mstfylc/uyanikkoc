/* Uyanık Koç mobil — öğrenci mock verisi.
 * KURAL: Mobil mock/fixture YALNIZCA bu klasörde tutulur.
 * Login/Ana Sayfa dilimlerinde gerçek API (apiClient + /api/me) ile değiştirilecek. */

import type {
  Achievement,
  Appointment,
  AppointmentSlot,
  ChatMessage,
  Exam,
  MotivationNote,
  Odev,
  OdevTypeKey,
  OdevTypeMeta,
  ScheduleBlock,
  SourceBook,
  Student,
  SubjectProgress,
  Topic,
  TrendPoint,
  Upcoming,
  Week,
} from "../types";

export const SUBJECT_COLORS: Record<string, string> = {
  Matematik: "#534AB7",
  Fizik: "#2F6BD6",
  Kimya: "#0F6E56",
  Biyoloji: "#3A9D6A",
  Türkçe: "#B26A12",
  Geometri: "#7A4AD6",
};

export const ODEV_TYPES: Record<OdevTypeKey, OdevTypeMeta> = {
  soru: { label: "Soru Çözümü", icon: "notebook", needsResult: true },
  video: { label: "Video İzleme", icon: "ai", needsResult: false },
  konu: { label: "Konu Çalışması", icon: "book", needsResult: false },
  test: { label: "Deneme/Test", icon: "chart", needsResult: true },
};

export const STUDENT: Student = {
  name: "Elif Yıldız",
  first: "Elif",
  grade: "11. Sınıf · Sayısal",
  goal: "YKS 2026",
  coach: "Dilek Emen",
  streak: 12,
  weekHours: 23.5,
  net: 312,
};

export const WEEKS: Week[] = [
  { id: "w0", label: "Bu hafta", range: "2 – 8 Haziran" },
  { id: "w1", label: "Geçen hafta", range: "26 May – 1 Haz" },
  { id: "w2", label: "2 hafta önce", range: "19 – 25 May" },
];

/* Öğrencinin ödevleri (haftaya göre). due = bitiş tarihi. Bugün 6 Haz kabul. */
export const ODEVLER: Odev[] = [
  { id: "o1", week: "w0", subject: "Matematik", topic: "Türev — kural tekrarı (40 soru)", types: ["soru"], count: 40, source: "Uyanık YKS Soru Bankası", due: "2026-06-06", status: "pending" },
  { id: "o2", week: "w0", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", types: ["test"], count: 20, source: "345 Yayınları TYT", due: "2026-06-05", status: "pending" },
  { id: "o3", week: "w0", subject: "Fizik", topic: "Newton'un Yasaları — konu özeti + video", types: ["konu", "video"], source: "Hocalara Geldik", due: "2026-06-07", status: "pending", note: "Video sonrası 10 soru çöz" },
  { id: "o4", week: "w0", subject: "Türkçe", topic: "Paragraf — hız çalışması (30 soru)", types: ["soru"], count: 30, source: "Bilgi Sarmal Paragraf", due: "2026-06-08", status: "pending" },
  { id: "o5", week: "w0", subject: "Geometri", topic: "Üçgende açı — 25 soru", types: ["soru"], count: 25, source: "Apotemi Geometri", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
  { id: "o6", week: "w0", subject: "Biyoloji", topic: "Hücre bölünmesi — video izle", types: ["video"], source: "Tonguç Akademi", due: "2026-06-03", status: "done", result: null },
  { id: "o7", week: "w1", subject: "Matematik", topic: "Fonksiyonlar — karma test (35 soru)", types: ["soru"], count: 35, source: "Uyanık YKS Soru Bankası", due: "2026-05-30", status: "done", result: { d: 28, y: 5, b: 2 } },
  { id: "o8", week: "w1", subject: "Türkçe", topic: "Sözcük türleri konu tekrarı", types: ["konu"], source: "Limit Yayınları", due: "2026-05-29", status: "done", result: null },
];

/* Deneme geçmişi */
export const EXAMS: Exam[] = [
  { id: "e6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75", parts: [{ n: "Türkçe", net: 35.0, max: 40 }, { n: "Sosyal Bilimler", net: 15.25, max: 20 }, { n: "Matematik", net: 28.5, max: 40 }, { n: "Fen Bilimleri", net: 9.5, max: 20 }] },
  { id: "e5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5", parts: [{ n: "Türkçe", net: 33.75, max: 40 }, { n: "Sosyal Bilimler", net: 14.0, max: 20 }, { n: "Matematik", net: 27.75, max: 40 }, { n: "Fen Bilimleri", net: 11.0, max: 20 }] },
  { id: "e4", name: "TYT Genel Deneme #4", pub: "Şube Denemesi", type: "TYT", date: "17 May 2026", net: 80.75, rank: "~61.000", delta: "+1.25", parts: [{ n: "Türkçe", net: 31.5, max: 40 }, { n: "Sosyal Bilimler", net: 12.75, max: 20 }, { n: "Matematik", net: 25.25, max: 40 }, { n: "Fen Bilimleri", net: 12.0, max: 20 }] },
  { id: "e3", name: "TYT Genel Deneme #3", pub: "Uyanık Yayınları", type: "TYT", date: "10 May 2026", net: 79.5, rank: "~64.000", delta: "-2.5", parts: [{ n: "Türkçe", net: 30.25, max: 40 }, { n: "Sosyal Bilimler", net: 11.5, max: 20 }, { n: "Matematik", net: 24.5, max: 40 }, { n: "Fen Bilimleri", net: 13.25, max: 20 }] },
];

export const EXAM_TREND: TrendPoint[] = [
  { l: "1.D", v: 68 },
  { l: "2.D", v: 74 },
  { l: "3.D", v: 79.5 },
  { l: "4.D", v: 80.75 },
  { l: "5.D", v: 86.25 },
  { l: "6.D", v: 88 },
];

export const UPCOMING: Upcoming = { name: "TYT Genel Deneme #7", org: "Uyanık Yayınları", date: "8 Haziran Pazar", time: "10:00" };

export const SUBJECTS: SubjectProgress[] = [
  { name: "Türkçe", pct: 81, net: "35.0", trend: "up" },
  { name: "Matematik", pct: 72, net: "28.5", trend: "up" },
  { name: "Biyoloji", pct: 66, net: "14.0", trend: "flat" },
  { name: "Fizik", pct: 58, net: "16.2", trend: "up" },
  { name: "Kimya", pct: 41, net: "11.8", trend: "down" },
];

export const SCHEDULE: Record<string, ScheduleBlock[]> = {
  Pzt: [
    { t: "16:00", e: "17:30", subj: "Matematik", topic: "Türev — kural tekrarı", type: "Konu" },
    { t: "18:00", e: "19:00", subj: "Türkçe", topic: "Paragraf hız çalışması", type: "Soru" },
    { t: "20:30", e: "21:30", subj: "Fizik", topic: "Newton yasaları videoları", type: "Konu" },
  ],
  Sal: [
    { t: "16:00", e: "17:00", subj: "Kimya", topic: "Mol kavramı — örnek soru", type: "Soru" },
    { t: "17:30", e: "19:00", subj: "Geometri", topic: "Üçgende açı", type: "Konu" },
  ],
  Çar: [
    { t: "16:30", e: "18:00", subj: "Matematik", topic: "Fonksiyonlar tekrar", type: "Konu" },
    { t: "20:00", e: "21:00", subj: "Biyoloji", topic: "Hücre bölünmesi", type: "Konu" },
  ],
  Per: [
    { t: "16:00", e: "17:30", subj: "Türkçe", topic: "Sözcük türleri", type: "Konu" },
    { t: "18:00", e: "19:30", subj: "Fizik", topic: "Dalgalar soru bankası", type: "Soru" },
    { t: "20:30", e: "21:30", subj: "Matematik", topic: "Köklü sayılar", type: "Soru" },
  ],
  Cum: [
    { t: "16:00", e: "17:00", subj: "Kimya", topic: "Karışımlar tekrar", type: "Konu" },
    { t: "18:00", e: "19:00", subj: "Geometri", topic: "Çember giriş", type: "Konu" },
  ],
  Cmt: [
    { t: "09:00", e: "10:30", subj: "Matematik", topic: "Türev — 40 soruluk test", type: "Test", done: true },
    { t: "13:30", e: "15:30", subj: "Kimya", topic: "TYT deneme bölümü", type: "Deneme" },
    { t: "16:00", e: "17:00", subj: "Türkçe", topic: "Paragraf — 30 soru", type: "Soru" },
  ],
  Paz: [
    { t: "10:00", e: "13:00", subj: "Matematik", topic: "TYT Genel Deneme #7", type: "Deneme" },
    { t: "15:00", e: "16:30", subj: "Biyoloji", topic: "Deneme analizi", type: "Analiz" },
  ],
};

export const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const DAYS_FULL: Record<string, string> = {
  Pzt: "Pazartesi",
  Sal: "Salı",
  Çar: "Çarşamba",
  Per: "Perşembe",
  Cum: "Cuma",
  Cmt: "Cumartesi",
  Paz: "Pazar",
};
export const TODAY = "Cmt";

export const ACHIEVEMENTS: Achievement[] = [
  { name: "12 Gün Seri", icon: "flame", earned: true },
  { name: "Deneme Avcısı", icon: "target", earned: true },
  { name: "Matematik Atağı", icon: "award", earned: true },
  { name: "Net Patlaması", icon: "bolt", earned: true },
  { name: "Erken Kuş", icon: "star", earned: false },
  { name: "Tam Hafta", icon: "checkCircle", earned: false },
];

export const TOPICS: Record<string, Topic[]> = {
  Matematik: [
    { n: "Temel Kavramlar", s: "done" }, { n: "Bölünebilme", s: "done" },
    { n: "Rasyonel Sayılar", s: "done" }, { n: "Üslü Sayılar", s: "done" },
    { n: "Köklü Sayılar", s: "progress", p: 70 }, { n: "Mutlak Değer", s: "progress", p: 40 },
    { n: "Çarpanlara Ayırma", s: "todo" }, { n: "Oran – Orantı", s: "todo" },
    { n: "Fonksiyonlar", s: "progress", p: 50 }, { n: "Türev", s: "progress", p: 35 }, { n: "İntegral", s: "todo" },
  ],
  Fizik: [
    { n: "Fiziğe Giriş", s: "done" }, { n: "Madde ve Özellikleri", s: "done" },
    { n: "Hareket (Kinematik)", s: "progress", p: 65 }, { n: "Newton Yasaları", s: "progress", p: 30 },
    { n: "İş, Güç, Enerji", s: "todo" }, { n: "Elektrostatik", s: "todo" }, { n: "Dalgalar", s: "progress", p: 45 },
  ],
  Kimya: [
    { n: "Kimya Bilimi", s: "done" }, { n: "Atom ve Periyodik Sistem", s: "done" },
    { n: "Mol Kavramı", s: "progress", p: 60 }, { n: "Maddenin Halleri", s: "progress", p: 35 },
    { n: "Kimyasal Tepkimeler", s: "todo" }, { n: "Asitler ve Bazlar", s: "todo" },
  ],
  Biyoloji: [
    { n: "Canlıların Özellikleri", s: "done" }, { n: "Hücre", s: "progress", p: 70 },
    { n: "Hücre Bölünmesi", s: "progress", p: 40 }, { n: "Kalıtım", s: "todo" }, { n: "Sistemler", s: "todo" },
  ],
  Türkçe: [
    { n: "Sözcükte Anlam", s: "done" }, { n: "Cümlede Anlam", s: "done" },
    { n: "Paragraf", s: "progress", p: 75 }, { n: "Yazım Kuralları", s: "progress", p: 60 },
    { n: "Sözcük Türleri", s: "progress", p: 50 }, { n: "Anlatım Bozuklukları", s: "todo" },
  ],
  Geometri: [
    { n: "Açılar", s: "done" }, { n: "Üçgenler", s: "progress", p: 55 },
    { n: "Çokgenler", s: "todo" }, { n: "Çember", s: "todo" }, { n: "Analitik Geometri", s: "todo" },
  ],
};

export const TOPIC_STATUS: Record<string, { label: string; tone: string }> = {
  done: { label: "Tamamlandı", tone: "success" },
  progress: { label: "Devam ediyor", tone: "warning" },
  todo: { label: "Başlanmadı", tone: "muted" },
};

export const SOURCES: SourceBook[] = [
  { name: "Uyanık YKS Soru Bankası", subj: "Genel", tur: "soru" },
  { name: "345 Yayınları TYT Deneme", subj: "Genel", tur: "deneme" },
  { name: "Apotemi Geometri", subj: "Geometri", tur: "soru" },
  { name: "Bilgi Sarmal Paragraf", subj: "Türkçe", tur: "soru" },
  { name: "Hocalara Geldik Fizik", subj: "Fizik", tur: "konu" },
];

export const CATALOG: SourceBook[] = [
  { name: "Limit Yayınları Matematik SB", subj: "Matematik", tur: "soru" },
  { name: "Tonguç Biyoloji Konu", subj: "Biyoloji", tur: "konu" },
  { name: "Karekök Kimya SB", subj: "Kimya", tur: "soru" },
  { name: "3D Yayınları TYT Türkçe", subj: "Türkçe", tur: "soru" },
  { name: "Endemik AYT Deneme", subj: "Genel", tur: "deneme" },
];

export const KAYNAK_TUR: Record<string, { label: string; icon: string }> = {
  soru: { label: "Soru Bankası", icon: "notebook" },
  konu: { label: "Konu Anlatımı", icon: "book" },
  deneme: { label: "Deneme", icon: "chart" },
};

export const APPTS: Appointment[] = [
  { id: "ap1", date: "9 Haziran Pzt", time: "17:30", mode: "Yüz yüze", topic: "Haftalık değerlendirme", status: "onaylı", coach: "Dilek Emen" },
  { id: "ap2", date: "13 Haziran Cum", time: "16:00", mode: "Online", topic: "Deneme analizi", status: "bekliyor", coach: "Dilek Emen" },
];

export const APPT_SLOTS: AppointmentSlot[] = [
  { day: "Pzt", times: ["16:00", "17:30", "19:00"] },
  { day: "Çar", times: ["16:30", "18:00"] },
  { day: "Cum", times: ["16:00", "17:00", "18:30"] },
];

export const APPT_MODES = ["Yüz yüze", "Online", "Telefon"] as const;

export const MESSAGES: ChatMessage[] = [
  { from: "coach", text: "Elif merhaba! Bu haftaki türev testini gördüm, eline sağlık 👏", time: "09:12" },
  { from: "me", text: "Teşekkürler hocam, birkaç soruda zorlandım", time: "09:15" },
  { from: "coach", text: "Hangi konuda? İstersen pazar randevusunda birlikte bakalım.", time: "09:16" },
  { from: "me", text: "Zincir kuralı kısmı. Olur, çok iyi olur 🙏", time: "09:18" },
  { from: "coach", text: "Harika. Bu arada Cmt günü TYT deneme #7 var, unutma!", time: "09:20" },
];

export const MOTIVATION: MotivationNote = {
  body: "Bugün sadece bir konuya tam odaklan — dağınık 5 saat yerine net 2 saat her zaman kazandırır. Sen yaparsın 💪",
  coach: "Dilek Emen",
  date: "Bugün 08:30",
};
