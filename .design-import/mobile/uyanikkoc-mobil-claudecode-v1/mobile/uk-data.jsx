/* Uyanık Koç mobil — ikon seti + veri (tasarım sistemiyle aynı kaynaklardan). */

const M_ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1.5"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 13l2 2 4-4"/>',
  chart: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12.5" y="7" width="3" height="10" rx="1"/><rect x="18" y="13" width="3" height="4" rx="1"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  notebook: '<path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><rect x="6" y="3" width="16" height="18" rx="2"/><path d="M16 3v18"/>',
  ai: '<path d="m12 3-1.6 4.8a2 2 0 0 1-1.3 1.3L4.3 10.7l4.8 1.6a2 2 0 0 1 1.3 1.3L12 18.4l1.6-4.8a2 2 0 0 1 1.3-1.3l4.8-1.6-4.8-1.6a2 2 0 0 1-1.3-1.3z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  arrowUp: '<line x1="7" x2="17" y1="17" y2="7"/><polyline points="9 7 17 7 17 15"/>',
  arrowDown: '<line x1="7" x2="17" y1="7" y2="17"/><polyline points="17 9 17 17 9 17"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.9 17 22l-5-3-5 3 1.52-9.1"/>',
  star: '<polygon points="12 2.5 14.85 8.26 21.2 9.18 16.6 13.66 17.69 19.99 12 17 6.31 19.99 7.4 13.66 2.8 9.18 9.15 8.26"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2.5"/><path d="m2.5 6 9.5 6 9.5-6"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><polyline points="9 12 11 14 15 10"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7"/><path d="M12 17h.01"/>',
  play: '<polygon points="6 4 20 12 6 20"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2.5"/><line x1="2" x2="22" y1="10" y2="10"/><line x1="6" x2="9" y1="15" y2="15"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
};

function MIcon({ name, size = 22, stroke = 2, fill = false, style, className }) {
  const d = M_ICONS[name] || "";
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} dangerouslySetInnerHTML={{ __html: d }} />
  );
}

/* ---- Ders renkleri (data.jsx ile aynı) ---- */
const M_SUBJECT_COLORS = {
  "Matematik": "#534AB7", "Fizik": "#2F6BD6", "Kimya": "#0F6E56",
  "Biyoloji": "#3A9D6A", "Türkçe": "#B26A12", "Geometri": "#7A4AD6",
};

const M_ODEV_TYPES = {
  soru:  { label: "Soru Çözümü", icon: "notebook", needsResult: true },
  video: { label: "Video İzleme", icon: "ai", needsResult: false },
  konu:  { label: "Konu Çalışması", icon: "book", needsResult: false },
  test:  { label: "Deneme/Test", icon: "chart", needsResult: true },
};

const M_STUDENT = { name: "Elif Yıldız", first: "Elif", grade: "11. Sınıf · Sayısal", goal: "YKS 2026", coach: "Dilek Emen", streak: 12, weekHours: 23.5, net: 312 };

const M_WEEKS = [
  { id: "w0", label: "Bu hafta", range: "2 – 8 Haziran" },
  { id: "w1", label: "Geçen hafta", range: "26 May – 1 Haz" },
  { id: "w2", label: "2 hafta önce", range: "19 – 25 May" },
];

/* Öğrencinin ödevleri (haftaya göre). due = bitiş tarihi. Bugün 6 Haz kabul. */
const M_ODEVLER = [
  { id: "o1", week: "w0", subject: "Matematik", topic: "Türev — kural tekrarı (40 soru)", types: ["soru"], count: 40, source: "Uyanık YKS Soru Bankası", due: "2026-06-06", status: "pending" },
  { id: "o2", week: "w0", subject: "Kimya", topic: "Mol Kavramı — TYT deneme bölümü", types: ["test"], count: 20, source: "345 Yayınları TYT", due: "2026-06-05", status: "pending" },
  { id: "o3", week: "w0", subject: "Fizik", topic: "Newton'un Yasaları — konu özeti + video", types: ["konu","video"], source: "Hocalara Geldik", due: "2026-06-07", status: "pending", note: "Video sonrası 10 soru çöz" },
  { id: "o4", week: "w0", subject: "Türkçe", topic: "Paragraf — hız çalışması (30 soru)", types: ["soru"], count: 30, source: "Bilgi Sarmal Paragraf", due: "2026-06-08", status: "pending" },
  { id: "o5", week: "w0", subject: "Geometri", topic: "Üçgende açı — 25 soru", types: ["soru"], count: 25, source: "Apotemi Geometri", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
  { id: "o6", week: "w0", subject: "Biyoloji", topic: "Hücre bölünmesi — video izle", types: ["video"], source: "Tonguç Akademi", due: "2026-06-03", status: "done", result: null },
  { id: "o7", week: "w1", subject: "Matematik", topic: "Fonksiyonlar — karma test (35 soru)", types: ["soru"], count: 35, source: "Uyanık YKS Soru Bankası", due: "2026-05-30", status: "done", result: { d: 28, y: 5, b: 2 } },
  { id: "o8", week: "w1", subject: "Türkçe", topic: "Sözcük türleri konu tekrarı", types: ["konu"], source: "Limit Yayınları", due: "2026-05-29", status: "done", result: null },
];

/* Deneme geçmişi (student-data.jsx EXAM_HISTORY temelli) */
const M_EXAMS = [
  { id: "e6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75",
    parts: [{ n: "Türkçe", net: 35.0, max: 40 }, { n: "Sosyal Bilimler", net: 15.25, max: 20 }, { n: "Matematik", net: 28.5, max: 40 }, { n: "Fen Bilimleri", net: 9.5, max: 20 }] },
  { id: "e5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5",
    parts: [{ n: "Türkçe", net: 33.75, max: 40 }, { n: "Sosyal Bilimler", net: 14.0, max: 20 }, { n: "Matematik", net: 27.75, max: 40 }, { n: "Fen Bilimleri", net: 11.0, max: 20 }] },
  { id: "e4", name: "TYT Genel Deneme #4", pub: "Şube Denemesi", type: "TYT", date: "17 May 2026", net: 80.75, rank: "~61.000", delta: "+1.25",
    parts: [{ n: "Türkçe", net: 31.5, max: 40 }, { n: "Sosyal Bilimler", net: 12.75, max: 20 }, { n: "Matematik", net: 25.25, max: 40 }, { n: "Fen Bilimleri", net: 12.0, max: 20 }] },
  { id: "e3", name: "TYT Genel Deneme #3", pub: "Uyanık Yayınları", type: "TYT", date: "10 May 2026", net: 79.5, rank: "~64.000", delta: "-2.5",
    parts: [{ n: "Türkçe", net: 30.25, max: 40 }, { n: "Sosyal Bilimler", net: 11.5, max: 20 }, { n: "Matematik", net: 24.5, max: 40 }, { n: "Fen Bilimleri", net: 13.25, max: 20 }] },
];
const M_EXAM_TREND = [{ l: "1.D", v: 68 }, { l: "2.D", v: 74 }, { l: "3.D", v: 79.5 }, { l: "4.D", v: 80.75 }, { l: "5.D", v: 86.25 }, { l: "6.D", v: 88 }];

const M_UPCOMING = { name: "TYT Genel Deneme #7", org: "Uyanık Yayınları", date: "8 Haziran Pazar", time: "10:00" };

/* Ders bazlı ilerleme (Ana sayfa/Denemeler için) */
const M_SUBJECTS = [
  { name: "Türkçe", pct: 81, net: "35.0", trend: "up" },
  { name: "Matematik", pct: 72, net: "28.5", trend: "up" },
  { name: "Biyoloji", pct: 66, net: "14.0", trend: "flat" },
  { name: "Fizik", pct: 58, net: "16.2", trend: "up" },
  { name: "Kimya", pct: 41, net: "11.8", trend: "down" },
];

/* Haftalık program (student-data.jsx SCHEDULE temelli, kısaltılmış) */
const M_SCHEDULE = {
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
    { t: "20:30", e: "21:30", subj: "Matematik", topic: "Köklü sayılar", type: "Soru" },
  ],
  "Cum": [
    { t: "16:00", e: "17:00", subj: "Kimya", topic: "Karışımlar tekrar", type: "Konu" },
    { t: "18:00", e: "19:00", subj: "Geometri", topic: "Çember giriş", type: "Konu" },
  ],
  "Cmt": [
    { t: "09:00", e: "10:30", subj: "Matematik", topic: "Türev — 40 soruluk test", type: "Test", done: true },
    { t: "13:30", e: "15:30", subj: "Kimya", topic: "TYT deneme bölümü", type: "Deneme" },
    { t: "16:00", e: "17:00", subj: "Türkçe", topic: "Paragraf — 30 soru", type: "Soru" },
  ],
  "Paz": [
    { t: "10:00", e: "13:00", subj: "Matematik", topic: "TYT Genel Deneme #7", type: "Deneme" },
    { t: "15:00", e: "16:30", subj: "Biyoloji", topic: "Deneme analizi", type: "Analiz" },
  ],
};
const M_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const M_DAYS_FULL = { "Pzt": "Pazartesi", "Sal": "Salı", "Çar": "Çarşamba", "Per": "Perşembe", "Cum": "Cuma", "Cmt": "Cumartesi", "Paz": "Pazar" };
const M_TODAY = "Cmt";

const M_ACHIEVEMENTS = [
  { name: "12 Gün Seri", icon: "flame", earned: true },
  { name: "Deneme Avcısı", icon: "target", earned: true },
  { name: "Matematik Atağı", icon: "award", earned: true },
  { name: "Net Patlaması", icon: "bolt", earned: true },
  { name: "Erken Kuş", icon: "star", earned: false },
  { name: "Tam Hafta", icon: "checkCircle", earned: false },
];

/* net hesap yardımcı */
function mNet(d, y) { return Math.max(0, d - y / 4).toFixed(2).replace(/\.00$/, "").replace(/0$/, "").replace(/\.$/, ""); }

/* Toast — herhangi bir onClick'ten çağrılır (ölü buton geri bildirimi). */
function ukToast(msg) {
  var root = document.querySelector(".uk-screen") || document.querySelector(".uk-m");
  if (!root) return;
  var prev = root.querySelector(".uk-toast"); if (prev) prev.remove();
  var t = document.createElement("div");
  t.className = "uk-toast";
  t.textContent = msg;
  root.appendChild(t);
  setTimeout(function () { t.style.opacity = "0"; }, 1700);
  setTimeout(function () { if (t.parentNode) t.remove(); }, 2100);
}
window.ukToast = ukToast;

/* Bildirimler (zil) */
const M_NOTIFS = [
  { icon: "clipboard", tone: "primary", title: "Yeni ödev atandı", desc: "Matematik — Türev kural tekrarı (40 soru)", time: "5 dk önce", unread: true },
  { icon: "chart", tone: "success", title: "Deneme sonucun hazır", desc: "TYT Genel Deneme #6 · net 88.0", time: "2 saat önce", unread: true },
  { icon: "message", tone: "warning", title: "Koçundan mesaj", desc: "Dilek Emen: Cmt günü TYT deneme #7 var, unutma!", time: "Dün", unread: true },
  { icon: "calendar", tone: "info", title: "Randevu hatırlatması", desc: "9 Haz Pazartesi 17:30 · Yüz yüze görüşme", time: "Dün", unread: false },
  { icon: "flame", tone: "warning", title: "12 günlük seri! 🔥", desc: "Harika gidiyorsun, seriyi bozma.", time: "2 gün önce", unread: false },
];

/* ---- Konu Takibi (ders → konular, durum) ---- */
const M_TOPICS = {
  "Matematik": [
    { n: "Temel Kavramlar", s: "done" }, { n: "Bölünebilme", s: "done" },
    { n: "Rasyonel Sayılar", s: "done" }, { n: "Üslü Sayılar", s: "done" },
    { n: "Köklü Sayılar", s: "progress", p: 70 }, { n: "Mutlak Değer", s: "progress", p: 40 },
    { n: "Çarpanlara Ayırma", s: "todo" }, { n: "Oran – Orantı", s: "todo" },
    { n: "Fonksiyonlar", s: "progress", p: 50 }, { n: "Türev", s: "progress", p: 35 }, { n: "İntegral", s: "todo" },
  ],
  "Fizik": [
    { n: "Fiziğe Giriş", s: "done" }, { n: "Madde ve Özellikleri", s: "done" },
    { n: "Hareket (Kinematik)", s: "progress", p: 65 }, { n: "Newton Yasaları", s: "progress", p: 30 },
    { n: "İş, Güç, Enerji", s: "todo" }, { n: "Elektrostatik", s: "todo" }, { n: "Dalgalar", s: "progress", p: 45 },
  ],
  "Kimya": [
    { n: "Kimya Bilimi", s: "done" }, { n: "Atom ve Periyodik Sistem", s: "done" },
    { n: "Mol Kavramı", s: "progress", p: 60 }, { n: "Maddenin Halleri", s: "progress", p: 35 },
    { n: "Kimyasal Tepkimeler", s: "todo" }, { n: "Asitler ve Bazlar", s: "todo" },
  ],
  "Biyoloji": [
    { n: "Canlıların Özellikleri", s: "done" }, { n: "Hücre", s: "progress", p: 70 },
    { n: "Hücre Bölünmesi", s: "progress", p: 40 }, { n: "Kalıtım", s: "todo" }, { n: "Sistemler", s: "todo" },
  ],
  "Türkçe": [
    { n: "Sözcükte Anlam", s: "done" }, { n: "Cümlede Anlam", s: "done" },
    { n: "Paragraf", s: "progress", p: 75 }, { n: "Yazım Kuralları", s: "progress", p: 60 },
    { n: "Sözcük Türleri", s: "progress", p: 50 }, { n: "Anlatım Bozuklukları", s: "todo" },
  ],
  "Geometri": [
    { n: "Açılar", s: "done" }, { n: "Üçgenler", s: "progress", p: 55 },
    { n: "Çokgenler", s: "todo" }, { n: "Çember", s: "todo" }, { n: "Analitik Geometri", s: "todo" },
  ],
};
const M_TOPIC_STATUS = {
  done: { label: "Tamamlandı", tone: "success" },
  progress: { label: "Devam ediyor", tone: "warning" },
  todo: { label: "Başlanmadı", tone: "muted" },
};

/* ---- Kaynaklarım + katalog ---- */
const M_SOURCES = [
  { name: "Uyanık YKS Soru Bankası", subj: "Genel", tur: "soru", status: "aktif", progress: 55, soru: 320, acc: 74 },
  { name: "345 Yayınları TYT Deneme", subj: "Genel", tur: "deneme", status: "aktif", progress: 40, soru: 240, acc: 68 },
  { name: "Apotemi Geometri", subj: "Geometri", tur: "soru", status: "beklemede", progress: 0, soru: 0, acc: null },
  { name: "Bilgi Sarmal Paragraf", subj: "Türkçe", tur: "soru", status: "bitti", progress: 100, soru: 410, acc: 81 },
  { name: "Hocalara Geldik Fizik", subj: "Fizik", tur: "konu", status: "aktif", progress: 30, soru: 0, acc: null },
];
const M_KAYNAK_DURUM = {
  beklemede: { label: "Beklemede", tone: "muted", icon: "clock", hint: "Eklendi, henüz başlanmadı" },
  aktif:     { label: "Aktif", tone: "info", icon: "book", hint: "Şu an çalışılıyor" },
  bitti:     { label: "Tamamlandı", tone: "success", icon: "check", hint: "Kitap bitirildi" },
};
const M_DURUM_SIRA = ["aktif", "beklemede", "bitti"];
const M_CATALOG = [
  { name: "Limit Yayınları Matematik SB", subj: "Matematik", tur: "soru" },
  { name: "Tonguç Biyoloji Konu", subj: "Biyoloji", tur: "konu" },
  { name: "Karekök Kimya SB", subj: "Kimya", tur: "soru" },
  { name: "3D Yayınları TYT Türkçe", subj: "Türkçe", tur: "soru" },
  { name: "Endemik AYT Deneme", subj: "Genel", tur: "deneme" },
];
const M_KAYNAK_TUR = { soru: { label: "Soru Bankası", icon: "notebook" }, konu: { label: "Konu Anlatımı", icon: "book" }, deneme: { label: "Deneme", icon: "chart" } };

/* ---- Randevular ---- */
const M_APPTS = [
  { id: "ap1", date: "9 Haziran Pzt", time: "17:30", mode: "Yüz yüze", topic: "Haftalık değerlendirme", status: "onaylı", coach: "Dilek Emen" },
  { id: "ap2", date: "13 Haziran Cum", time: "16:00", mode: "Online", topic: "Deneme analizi", status: "bekliyor", coach: "Dilek Emen" },
];
const M_APPT_SLOTS = [
  { day: "Pzt", times: ["16:00", "17:30", "19:00"] },
  { day: "Çar", times: ["16:30", "18:00"] },
  { day: "Cum", times: ["16:00", "17:00", "18:30"] },
];
const M_APPT_MODES = ["Yüz yüze", "Online", "Telefon"];

/* ---- Mesajlaşma (koç ile) ---- */
const M_MESSAGES = [
  { from: "coach", text: "Elif merhaba! Bu haftaki türev testini gördüm, eline sağlık 👏", time: "09:12" },
  { from: "me", text: "Teşekkürler hocam, birkaç soruda zorlandım", time: "09:15" },
  { from: "coach", text: "Hangi konuda? İstersen pazar randevusunda birlikte bakalım.", time: "09:16" },
  { from: "me", text: "Zincir kuralı kısmı. Olur, çok iyi olur 🙏", time: "09:18" },
  { from: "coach", text: "Harika. Bu arada Cmt günü TYT deneme #7 var, unutma!", time: "09:20" },
];
const M_MOTIVATION = { body: "Bugün sadece bir konuya tam odaklan — dağınık 5 saat yerine net 2 saat her zaman kazandırır. Sen yaparsın 💪", coach: "Dilek Emen", date: "Bugün 08:30" };

Object.assign(window, {
  MIcon, M_ICONS, M_SUBJECT_COLORS, M_ODEV_TYPES, M_STUDENT, M_WEEKS, M_ODEVLER,
  M_EXAMS, M_EXAM_TREND, M_UPCOMING, M_SUBJECTS, M_SCHEDULE, M_DAYS, M_DAYS_FULL,
  M_TODAY, M_ACHIEVEMENTS, mNet,
  M_TOPICS, M_TOPIC_STATUS, M_SOURCES, M_CATALOG, M_KAYNAK_TUR, M_KAYNAK_DURUM, M_DURUM_SIRA,
  M_APPTS, M_APPT_SLOTS, M_APPT_MODES, M_MESSAGES, M_MOTIVATION, M_NOTIFS, ukToast,
});
