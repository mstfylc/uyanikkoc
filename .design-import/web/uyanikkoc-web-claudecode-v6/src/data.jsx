/* Mock data — Uyanık Koç (YKS/LGS koçluk) */

const SUBJECT_COLORS = {
  "Matematik": "#534AB7",
  "Fizik": "#2F6BD6",
  "Kimya": "#0F6E56",
  "Biyoloji": "#3A9D6A",
  "Türkçe": "#B26A12",
  "Tarih": "#A3582D",
  "Geometri": "#7A4AD6",
  "Edebiyat": "#9A3D7A",
  "Fen Bilimleri": "#0F6E56",
  "T.C. İnkılap Tarihi": "#A3582D",
  "Din Kültürü": "#B26A12",
  "İngilizce": "#2F6BD6",
};

const PRIORITY = {
  high:   { label: "Yüksek", tone: "danger" },
  medium: { label: "Orta",   tone: "warning" },
  low:    { label: "Düşük",  tone: "info" },
};

const TYPE = {
  homework:  { label: "Ödev",            icon: "clipboard" },
  exam_prep: { label: "Sınav Hazırlığı", icon: "target" },
  reading:   { label: "Okuma",           icon: "book" },
  practice:  { label: "Alıştırma",       icon: "notebook" },
  test:      { label: "Deneme",          icon: "chart" },
};

/* ---- Student persona ---- */
const STUDENT = {
  name: "Elif Yıldız",
  grade: "11. Sınıf · Sayısal",
  goal: "YKS 2026",
  coach: "Dilek Emen",
  streak: 12,
  weekHours: 23.5,
  weekHoursDelta: "+3.2s",
};

const STUDENT_ASSIGNMENTS = [
  { id: "a1", title: "Türev — 40 soruluk karma test", subject: "Matematik", type: "practice", priority: "high", due: "Bugün 20:00", done: false, progress: 35 },
  { id: "a2", title: "Newton'un Hareket Yasaları — konu özeti", subject: "Fizik", type: "reading", priority: "medium", due: "Yarın", done: false, progress: 0 },
  { id: "a3", title: "Paragraf — hız çalışması (30 soru)", subject: "Türkçe", type: "practice", priority: "medium", due: "2 gün", done: false, progress: 0 },
  { id: "a4", title: "Mol Kavramı — TYT deneme bölümü", subject: "Kimya", type: "exam_prep", priority: "high", due: "Dün", done: false, progress: 60, overdue: true },
  { id: "a5", title: "Üçgende açı — 25 soru", subject: "Geometri", type: "homework", priority: "low", due: "Tamamlandı", done: true, progress: 100 },
  { id: "a6", title: "Hücre bölünmesi — video + not", subject: "Biyoloji", type: "reading", priority: "low", due: "Tamamlandı", done: true, progress: 100 },
];

const STUDENT_SUBJECTS = [
  { name: "Matematik", pct: 72, net: "28.5", trend: "up" },
  { name: "Fizik", pct: 58, net: "16.2", trend: "up" },
  { name: "Kimya", pct: 41, net: "11.8", trend: "down" },
  { name: "Biyoloji", pct: 66, net: "14.0", trend: "flat" },
  { name: "Türkçe", pct: 81, net: "34.0", trend: "up" },
];

const STUDENT_EXAMS = [
  { l: "1.D", v: 68 }, { l: "2.D", v: 74 }, { l: "3.D", v: 71 },
  { l: "4.D", v: 79 }, { l: "5.D", v: 85 }, { l: "6.D", v: 88 },
];
const STUDENT_NET_TREND = [262, 271, 268, 284, 297, 312];

const STUDENT_WEEK = [
  { l: "Pzt", v: 3.5 }, { l: "Sal", v: 4.0 }, { l: "Çar", v: 2.5 },
  { l: "Per", v: 5.0 }, { l: "Cum", v: 3.0 }, { l: "Cmt", v: 5.5 }, { l: "Paz", v: 0 },
];

const STUDENT_EXAMS_UP = [
  { name: "TYT Genel Deneme #7", org: "Uyanık Yayınları", date: "8 Haz Pzt", time: "10:00", tone: "primary" },
  { name: "AYT Matematik Branş", org: "Şube · Kadıköy", date: "11 Haz Per", time: "14:00", tone: "info" },
];

/* ---- Coach persona ---- */
const COACH = {
  name: "Dilek Emen",
  role: "YKS & LGS Koçu",
  students: 18,
  avgCompletion: 74,
  atRisk: 3,
  pendingReview: 7,
};

const COACH_STUDENTS = [
  { id: "s1", name: "Elif Yıldız", grade: "11 · Sayısal", sinav: "YKS", completion: 88, net: 312, risk: "excellent", last: "5 dk önce", trend: [262,271,268,284,297,312] },
  { id: "s2", name: "Burak Demir", grade: "12 · Sayısal", sinav: "YKS", completion: 76, net: 341, risk: "normal", last: "1 saat önce", trend: [320,318,330,325,338,341] },
  { id: "s3", name: "Zeynep Kaya", grade: "11 · EA", sinav: "YKS", completion: 54, net: 268, risk: "attention", last: "Dün", trend: [280,276,272,270,269,268] },
  { id: "s4", name: "Can Öztürk", grade: "12 · Sayısal", sinav: "YKS", completion: 31, net: 224, risk: "critical", last: "4 gün önce", trend: [260,250,242,236,230,224] },
  { id: "s5", name: "Defne Arslan", grade: "10 · Sayısal", sinav: "YKS", completion: 82, net: 198, risk: "excellent", last: "20 dk önce", trend: [170,176,182,188,193,198] },
  { id: "s6", name: "Kerem Şahin", grade: "11 · Sayısal", sinav: "YKS", completion: 67, net: 289, risk: "normal", last: "3 saat önce", trend: [275,279,283,285,287,289] },
  { id: "s7", name: "Ada Yılmaz", grade: "12 · EA", sinav: "YKS", completion: 49, net: 256, risk: "attention", last: "2 gün önce", trend: [268,264,261,259,257,256] },
  { id: "s8", name: "Mert Aksoy", grade: "8. Sınıf", sinav: "LGS", completion: 79, net: 82, risk: "excellent", last: "10 dk önce", trend: [62,66,71,74,78,82] },
  { id: "s9", name: "Eylül Şahin", grade: "8. Sınıf", sinav: "LGS", completion: 61, net: 68, risk: "normal", last: "2 saat önce", trend: [58,60,63,64,66,68] },
  { id: "s10", name: "Yusuf Korkmaz", grade: "8. Sınıf", sinav: "LGS", completion: 44, net: 51, risk: "attention", last: "Dün", trend: [56,54,53,52,52,51] },
];

const RISK = {
  excellent: { label: "Mükemmel", tone: "success" },
  normal:    { label: "Normal",   tone: "primary" },
  attention: { label: "Takip",    tone: "warning" },
  critical:  { label: "Kritik",   tone: "danger" },
};

const COACH_WEEK_COMPLETION = [
  { l: "Pzt", v: 71 }, { l: "Sal", v: 68 }, { l: "Çar", v: 80 },
  { l: "Per", v: 74 }, { l: "Cum", v: 88 }, { l: "Cmt", v: 64 }, { l: "Paz", v: 59 },
];

const COACH_TASKS = [
  { id: "t1", title: "Can Öztürk ile birebir görüşme planla", tag: "Kritik", tone: "danger", icon: "alert" },
  { id: "t2", title: "Zeynep'in kimya net düşüşünü incele", tag: "Takip", tone: "warning", icon: "trend" },
  { id: "t3", title: "Haftalık veli raporlarını onayla (7)", tag: "Rapor", tone: "primary", icon: "clipboard" },
];

const COACH_ACTIVITY = [
  { who: "Elif Yıldız", what: "Türev karma testini tamamladı", when: "5 dk", tone: "success", icon: "checkCircle" },
  { who: "Burak Demir", what: "AYT Matematik denemesi yükledi — 34 net", when: "1 sa", tone: "info", icon: "chart" },
  { who: "Defne Arslan", what: "Çalışma programını güncelledi", when: "2 sa", tone: "primary", icon: "calendar" },
  { who: "Can Öztürk", what: "3 ödev gecikmede", when: "4 sa", tone: "danger", icon: "alert" },
];

Object.assign(window, {
  SUBJECT_COLORS, PRIORITY, TYPE, RISK,
  STUDENT, STUDENT_ASSIGNMENTS, STUDENT_SUBJECTS, STUDENT_EXAMS, STUDENT_NET_TREND, STUDENT_WEEK, STUDENT_EXAMS_UP,
  COACH, COACH_STUDENTS, COACH_WEEK_COMPLETION, COACH_TASKS, COACH_ACTIVITY,
});
