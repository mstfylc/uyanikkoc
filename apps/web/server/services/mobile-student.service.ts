/**
 * Mobil öğrenci domain verisi (Ödevler / Denemeler / Program).
 * Bellek modu: demo öğrenci için sabit içerik; ödev sonucu yazımı globalThis'te tutulur
 * (route'lar arası kalıcı). DB modunda mevcut assignment/exam servisleri map'lenecek (follow-up).
 */

export type OdevTypeKey = "soru" | "video" | "konu" | "test";
export type OdevStatus = "pending" | "done";

export interface OdevResult {
  d: number;
  y: number;
  b: number;
}
export interface Odev {
  id: string;
  week: string;
  subject: string;
  topic: string;
  types: OdevTypeKey[];
  count?: number;
  source: string;
  due: string;
  status: OdevStatus;
  note?: string;
  result?: OdevResult | null;
}
export interface Week {
  id: string;
  label: string;
  range: string;
}
export interface ExamPart {
  n: string;
  net: number;
  max: number;
}
export interface Exam {
  id: string;
  name: string;
  pub: string;
  type: string;
  date: string;
  net: number;
  rank: string;
  delta: string;
  parts: ExamPart[];
}
export interface TrendPoint {
  l: string;
  v: number;
}
export interface Upcoming {
  name: string;
  org: string;
  date: string;
  time: string;
}
export interface ScheduleBlock {
  t: string;
  e: string;
  subj: string;
  topic: string;
  type: string;
  done?: boolean;
}

const WEEKS: Week[] = [
  { id: "w0", label: "Bu hafta", range: "2 – 8 Haziran" },
  { id: "w1", label: "Geçen hafta", range: "26 May – 1 Haz" },
  { id: "w2", label: "2 hafta önce", range: "19 – 25 May" },
];

function seedOdev(): Odev[] {
  return [
    { id: "o1", week: "w0", subject: "Matematik", topic: "Türev — kural tekrarı (40 soru)", types: ["soru"], count: 40, source: "Uyanık YKS Soru Bankası", due: "2026-06-06", status: "pending" },
    { id: "o2", week: "w0", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", types: ["test"], count: 20, source: "345 Yayınları TYT", due: "2026-06-05", status: "pending" },
    { id: "o3", week: "w0", subject: "Fizik", topic: "Newton'un Yasaları — konu özeti + video", types: ["konu", "video"], source: "Hocalara Geldik", due: "2026-06-07", status: "pending", note: "Video sonrası 10 soru çöz" },
    { id: "o4", week: "w0", subject: "Türkçe", topic: "Paragraf — hız çalışması (30 soru)", types: ["soru"], count: 30, source: "Bilgi Sarmal Paragraf", due: "2026-06-08", status: "pending" },
    { id: "o5", week: "w0", subject: "Geometri", topic: "Üçgende açı — 25 soru", types: ["soru"], count: 25, source: "Apotemi Geometri", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
    { id: "o6", week: "w0", subject: "Biyoloji", topic: "Hücre bölünmesi — video izle", types: ["video"], source: "Tonguç Akademi", due: "2026-06-03", status: "done", result: null },
    { id: "o7", week: "w1", subject: "Matematik", topic: "Fonksiyonlar — karma test (35 soru)", types: ["soru"], count: 35, source: "Uyanık YKS Soru Bankası", due: "2026-05-30", status: "done", result: { d: 28, y: 5, b: 2 } },
    { id: "o8", week: "w1", subject: "Türkçe", topic: "Sözcük türleri konu tekrarı", types: ["konu"], source: "Limit Yayınları", due: "2026-05-29", status: "done", result: null },
  ];
}

const EXAMS: Exam[] = [
  { id: "e6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75", parts: [{ n: "Türkçe", net: 35.0, max: 40 }, { n: "Sosyal Bilimler", net: 15.25, max: 20 }, { n: "Matematik", net: 28.5, max: 40 }, { n: "Fen Bilimleri", net: 9.5, max: 20 }] },
  { id: "e5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5", parts: [{ n: "Türkçe", net: 33.75, max: 40 }, { n: "Sosyal Bilimler", net: 14.0, max: 20 }, { n: "Matematik", net: 27.75, max: 40 }, { n: "Fen Bilimleri", net: 11.0, max: 20 }] },
  { id: "e4", name: "TYT Genel Deneme #4", pub: "Şube Denemesi", type: "TYT", date: "17 May 2026", net: 80.75, rank: "~61.000", delta: "+1.25", parts: [{ n: "Türkçe", net: 31.5, max: 40 }, { n: "Sosyal Bilimler", net: 12.75, max: 20 }, { n: "Matematik", net: 25.25, max: 40 }, { n: "Fen Bilimleri", net: 12.0, max: 20 }] },
  { id: "e3", name: "TYT Genel Deneme #3", pub: "Uyanık Yayınları", type: "TYT", date: "10 May 2026", net: 79.5, rank: "~64.000", delta: "-2.5", parts: [{ n: "Türkçe", net: 30.25, max: 40 }, { n: "Sosyal Bilimler", net: 11.5, max: 20 }, { n: "Matematik", net: 24.5, max: 40 }, { n: "Fen Bilimleri", net: 13.25, max: 20 }] },
];

const EXAM_TREND: TrendPoint[] = [
  { l: "1.D", v: 68 },
  { l: "2.D", v: 74 },
  { l: "3.D", v: 79.5 },
  { l: "4.D", v: 80.75 },
  { l: "5.D", v: 86.25 },
  { l: "6.D", v: 88 },
];

const UPCOMING: Upcoming = { name: "TYT Genel Deneme #7", org: "Uyanık Yayınları", date: "8 Haziran Pazar", time: "10:00" };

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAYS_FULL: Record<string, string> = { Pzt: "Pazartesi", Sal: "Salı", Çar: "Çarşamba", Per: "Perşembe", Cum: "Cuma", Cmt: "Cumartesi", Paz: "Pazar" };
const TODAY = "Cmt";
const SCHEDULE: Record<string, ScheduleBlock[]> = {
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

// Ödev sonucu yazımı için kalıcı store (route'lar arası).
interface StudentStore {
  odev: Odev[];
}
const globalRef = globalThis as typeof globalThis & { __ukMobileStudent?: StudentStore };
const store: StudentStore = (globalRef.__ukMobileStudent ??= { odev: seedOdev() });

export function getOdev(): { weeks: Week[]; items: Odev[] } {
  return { weeks: WEEKS, items: store.odev };
}

export function saveOdevResult(id: string, result: OdevResult | null): Odev | null {
  const item = store.odev.find((o) => o.id === id);
  if (!item) return null;
  item.status = "done";
  item.result = result;
  return item;
}

export function getExams(): { exams: Exam[]; trend: TrendPoint[]; upcoming: Upcoming } {
  return { exams: EXAMS, trend: EXAM_TREND, upcoming: UPCOMING };
}

export function getSchedule(): { days: string[]; daysFull: Record<string, string>; today: string; schedule: Record<string, ScheduleBlock[]> } {
  return { days: DAYS, daysFull: DAYS_FULL, today: TODAY, schedule: SCHEDULE };
}
