/* Extended data for student sub-pages */

const TOPICS = {
  "Matematik": [
    { n: "Temel Kavramlar", s: "done" }, { n: "Sayı Basamakları", s: "done" },
    { n: "Bölme & Bölünebilme", s: "done" }, { n: "EBOB – EKOK", s: "done" },
    { n: "Rasyonel Sayılar", s: "done" }, { n: "Üslü Sayılar", s: "done" },
    { n: "Köklü Sayılar", s: "progress", p: 70 }, { n: "Basit Eşitsizlikler", s: "progress", p: 55 },
    { n: "Mutlak Değer", s: "progress", p: 40 }, { n: "Çarpanlara Ayırma", s: "todo" },
    { n: "Oran – Orantı", s: "todo" }, { n: "Problemler", s: "todo" },
    { n: "Kümeler", s: "done" }, { n: "Fonksiyonlar", s: "progress", p: 50 },
    { n: "Polinomlar", s: "todo" }, { n: "Türev", s: "progress", p: 35 }, { n: "İntegral", s: "todo" },
  ],
  "Fizik": [
    { n: "Fizik Bilimine Giriş", s: "done" }, { n: "Madde ve Özellikleri", s: "done" },
    { n: "Hareket (Kinematik)", s: "progress", p: 65 }, { n: "Newton'un Yasaları", s: "progress", p: 30 },
    { n: "İş, Güç ve Enerji", s: "todo" }, { n: "Optik", s: "done" },
    { n: "Elektrostatik", s: "todo" }, { n: "Dalgalar", s: "progress", p: 45 },
  ],
  "Kimya": [
    { n: "Kimya Bilimi", s: "done" }, { n: "Atom ve Periyodik Sistem", s: "done" },
    { n: "Türler Arası Etkileşim", s: "progress", p: 50 }, { n: "Maddenin Halleri", s: "progress", p: 35 },
    { n: "Mol Kavramı", s: "progress", p: 60 }, { n: "Karışımlar", s: "done" },
    { n: "Kimyasal Tepkimeler", s: "todo" }, { n: "Asitler ve Bazlar", s: "todo" },
  ],
  "Biyoloji": [
    { n: "Canlıların Ortak Özellikleri", s: "done" }, { n: "Hücre", s: "progress", p: 70 },
    { n: "Hücre Bölünmesi", s: "progress", p: 40 }, { n: "Ekosistem", s: "done" },
    { n: "Kalıtım", s: "todo" }, { n: "Sistemler", s: "todo" },
  ],
  "Türkçe": [
    { n: "Sözcükte Anlam", s: "done" }, { n: "Cümlede Anlam", s: "done" },
    { n: "Paragraf", s: "progress", p: 75 }, { n: "Ses Bilgisi", s: "done" },
    { n: "Yazım Kuralları", s: "progress", p: 60 }, { n: "Noktalama", s: "done" },
    { n: "Sözcük Türleri", s: "progress", p: 50 }, { n: "Anlatım Bozuklukları", s: "todo" },
  ],
  "Geometri": [
    { n: "Temel Kavramlar", s: "done" }, { n: "Açılar", s: "done" },
    { n: "Üçgenler", s: "progress", p: 55 }, { n: "Çokgenler", s: "todo" },
    { n: "Çember", s: "todo" }, { n: "Analitik Geometri", s: "todo" }, { n: "Katı Cisimler", s: "todo" },
  ],
};

const TOPIC_STATUS = {
  done:     { label: "Tamamlandı", tone: "success" },
  progress: { label: "Devam ediyor", tone: "warning" },
  todo:     { label: "Başlanmadı", tone: "muted" },
};

const EXAM_HISTORY = [
  { id: "e6", name: "TYT Genel Deneme #6", pub: "Uyanık Yayınları", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75",
    parts: [{ n: "Türkçe", c: 36, w: 4, b: 0, net: 35.0, max: 40 }, { n: "Sosyal Bilimler", c: 16, w: 3, b: 1, net: 15.25, max: 20 }, { n: "Matematik", c: 30, w: 6, b: 4, net: 28.5, max: 40 }, { n: "Fen Bilimleri", c: 10, w: 2, b: 8, net: 9.5, max: 20 }] },
  { id: "e5", name: "TYT Genel Deneme #5", pub: "Uyanık Yayınları", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5",
    parts: [{ n: "Türkçe", c: 35, w: 5, b: 0, net: 33.75, max: 40 }, { n: "Sosyal Bilimler", c: 15, w: 4, b: 1, net: 14.0, max: 20 }, { n: "Matematik", c: 29, w: 5, b: 6, net: 27.75, max: 40 }, { n: "Fen Bilimleri", c: 12, w: 4, b: 4, net: 11.0, max: 20 }] },
  { id: "e4", name: "TYT Genel Deneme #4", pub: "Şube Denemesi", type: "TYT", date: "17 May 2026", net: 80.75, rank: "~61.000", delta: "+1.25",
    parts: [{ n: "Türkçe", c: 33, w: 6, b: 1, net: 31.5, max: 40 }, { n: "Sosyal Bilimler", c: 14, w: 5, b: 1, net: 12.75, max: 20 }, { n: "Matematik", c: 27, w: 7, b: 6, net: 25.25, max: 40 }, { n: "Fen Bilimleri", c: 13, w: 4, b: 3, net: 12.0, max: 20 }] },
  { id: "e3", name: "TYT Genel Deneme #3", pub: "Uyanık Yayınları", type: "TYT", date: "10 May 2026", net: 79.5, rank: "~64.000", delta: "-2.5",
    parts: [{ n: "Türkçe", c: 32, w: 7, b: 1, net: 30.25, max: 40 }, { n: "Sosyal Bilimler", c: 13, w: 6, b: 1, net: 11.5, max: 20 }, { n: "Matematik", c: 26, w: 6, b: 8, net: 24.5, max: 40 }, { n: "Fen Bilimleri", c: 14, w: 5, b: 1, net: 13.25, max: 20 }] },
];

const ACHIEVEMENTS = [
  { name: "12 Gün Seri", desc: "Üst üste 12 gün çalıştın", icon: "flame", color: "#f97316", earned: true },
  { name: "Net Patlaması", desc: "Bir denemede +5 net artış", icon: "rocket", color: "#5b6cff", earned: true },
  { name: "Deneme Avcısı", desc: "6 deneme tamamladın", icon: "target", color: "#0ea5e9", earned: true },
  { name: "Soru Canavarı", desc: "1.000 soru çözdün", icon: "bolt", color: "#f59e0b", earned: true },
  { name: "Matematik Atağı", desc: "Matematikte %70 tamamlama", icon: "trophy", color: "#8b5cf6", earned: true },
  { name: "5 Yıldız", desc: "Koçundan 5 yıldız aldın", icon: "star", color: "#eab308", earned: true },
  { name: "Konu Fatihi", desc: "Bir dersi tamamen bitirdin", icon: "medal", color: "#ec4899", earned: true },
  { name: "Erken Kuş", desc: "7 gün 08:00 öncesi çalışma", icon: "sun", color: "#14b8a6", earned: false },
  { name: "Maratoncu", desc: "4 saat kesintisiz çalışma", icon: "clock", color: "#06b6d4", earned: false },
  { name: "Tam Hafta", desc: "Bir haftada 7/7 gün çalışma", icon: "checkCircle", color: "#10b981", earned: false },
  { name: "Geri Dönüş", desc: "Düşüşten sonra net artışı", icon: "trend", color: "#f43f5e", earned: false },
  { name: "Zirve", desc: "Denemede ilk %1'e girdin", icon: "crown", color: "#a855f7", earned: false },
];

const SCHEDULE = {
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
    { t: "10:45", e: "12:00", subj: "Fizik", topic: "Newton yasaları özeti", type: "Konu" },
    { t: "13:30", e: "15:30", subj: "Kimya", topic: "TYT deneme bölümü", type: "Deneme" },
    { t: "16:00", e: "17:00", subj: "Türkçe", topic: "Paragraf — 30 soru", type: "Soru" },
    { t: "20:00", e: "21:00", subj: "Genel", topic: "Günün tekrarı", type: "Tekrar" },
  ],
  "Paz": [
    { t: "10:00", e: "13:00", subj: "Deneme", topic: "TYT Genel Deneme #7", type: "Deneme" },
    { t: "15:00", e: "16:30", subj: "Genel", topic: "Deneme analizi", type: "Analiz" },
  ],
};

const DAYS_FULL = { "Pzt": "Pazartesi", "Sal": "Salı", "Çar": "Çarşamba", "Per": "Perşembe", "Cum": "Cuma", "Cmt": "Cumartesi", "Paz": "Pazar" };
const TODAY_KEY = "Cmt";

function studentSinav() {
  try { const a = (typeof loadAuth === "function") && loadAuth(); return a && /LGS/i.test(a.sub || "") ? "LGS" : "YKS"; } catch (e) { return "YKS"; }
}

Object.assign(window, { TOPICS, TOPIC_STATUS, EXAM_HISTORY, ACHIEVEMENTS, SCHEDULE, DAYS_FULL, TODAY_KEY, studentSinav });
