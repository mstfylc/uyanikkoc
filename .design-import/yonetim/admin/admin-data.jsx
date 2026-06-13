/* ============================================================
   Yönetim Paneli — veri + store katmanı (web)
   Kurumlar/Franchise'lar, şubeler, koçlar, öğrenci koltukları,
   lisans takibi, modül erişimi, bireysel koç lisansları, platform
   metrikleri. localStorage'da kalıcı; aksiyonlar gerçek state değiştirir.
   ============================================================ */

const TRY = (n) => "₺" + Number(n).toLocaleString("tr-TR");
const NOW = Date.now();
const DAY = 86400000;

function fmtDate(ts) { return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); }
function fmtShort(ts) { return new Date(ts).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }); }
function daysLeft(ts) { return Math.ceil((ts - Date.now()) / DAY); }

/* ---- Modül kataloğu (özellik bayrakları) ---- */
const MODULES = [
  { key: "denemeAnaliz", name: "Deneme Analizi", icon: "chart", desc: "Net takibi, branş analizi, gelişim grafikleri" },
  { key: "raporlar", name: "Raporlar", icon: "trend", desc: "Veli ve kurum gelişim raporları" },
  { key: "mesajlasma", name: "Mesajlaşma", icon: "message", desc: "Koç · öğrenci · veli mesajlaşma" },
  { key: "randevu", name: "Randevu Sistemi", icon: "calendar", desc: "Birebir görüşme planlama" },
  { key: "veliPaneli", name: "Veli Paneli", icon: "heart", desc: "Veliler için gelişim takibi" },
  { key: "onlineDeneme", name: "Online Deneme", icon: "clipboard", desc: "Online sınav ve optik okuma" },
  { key: "aiKoc", name: "AI Koç", icon: "ai", desc: "Yapay zekâ destekli çalışma önerileri", premium: true },
  { key: "envanter", name: "Envanter & Testler", icon: "star", desc: "Kişilik ve yönelim envanterleri", premium: true },
];
function moduleName(k) { const m = MODULES.find((x) => x.key === k); return m ? m.name : k; }

/* ---- Kurum lisans planları (B2B) — tohum; süper admin store üzerinden düzenler ---- */
const ORG_PLANS_SEED = [
  {
    id: "baslangic", name: "Kurum Başlangıç", color: "var(--info)", monthly: 4900,
    seats: 50, coaches: 5, branches: 1, tagline: "Tek şubeli kurumlar için",
    modules: ["denemeAnaliz", "raporlar", "mesajlasma", "randevu"],
  },
  {
    id: "pro", name: "Kurum Pro", color: "var(--primary)", monthly: 11900, popular: true,
    seats: 150, coaches: 12, branches: 1, tagline: "Büyüyen kurumlar için",
    modules: ["denemeAnaliz", "raporlar", "mesajlasma", "randevu", "veliPaneli", "onlineDeneme"],
  },
  {
    id: "franchise", name: "Franchise", color: "var(--warning)", monthly: 24900,
    seats: 400, coaches: 40, branches: 8, tagline: "Çok şubeli franchise ağları",
    modules: ["denemeAnaliz", "raporlar", "mesajlasma", "randevu", "veliPaneli", "onlineDeneme", "aiKoc", "envanter"],
  },
];
function orgPlans() { return (typeof _admin !== "undefined" && _admin && _admin.orgPlans) ? _admin.orgPlans : ORG_PLANS_SEED; }
function orgPlanById(id) { const L = orgPlans(); return L.find((p) => p.id === id) || L[0]; }

/* ---- Bireysel koç lisans planları (B2C koç) ---- */
const COACH_PLANS_SEED = [
  {
    id: "c-baslangic", name: "Başlangıç", color: "var(--info)", monthly: 499, annual: 4990, seats: 15,
    tagline: "Koçluğa yeni başlayanlar",
    features: ["15 öğrenciye kadar", "Deneme analizi", "Ödev & konu takibi", "Koç–öğrenci mesajlaşma"],
    modules: ["denemeAnaliz", "mesajlasma"],
  },
  {
    id: "c-pro", name: "Pro", color: "var(--primary)", monthly: 999, annual: 9990, seats: 40, popular: true,
    tagline: "Aktif çalışan koçlar için",
    features: ["40 öğrenciye kadar", "Başlangıç'taki her şey", "Veli paneli & raporlar", "Randevu sistemi", "Online deneme"],
    modules: ["denemeAnaliz", "mesajlasma", "raporlar", "veliPaneli", "randevu", "onlineDeneme"],
  },
  {
    id: "c-sinirsiz", name: "Sınırsız", color: "var(--warning)", monthly: 1799, annual: 17990, seats: 999,
    tagline: "Profesyonel koçlar & küçük kadrolar",
    features: ["Sınırsız öğrenci", "Pro'daki her şey", "AI Koç önerileri", "Envanter & testler", "Öncelikli destek"],
    modules: ["denemeAnaliz", "mesajlasma", "raporlar", "veliPaneli", "randevu", "onlineDeneme", "aiKoc", "envanter"],
  },
];
function coachPlans() { return (typeof _admin !== "undefined" && _admin && _admin.coachPlans) ? _admin.coachPlans : COACH_PLANS_SEED; }
function coachPlanById(id) { const L = coachPlans(); return L.find((p) => p.id === id) || L[0]; }

/* status meta */
const STATUS = {
  active: { label: "Aktif", tone: "success" },
  trial: { label: "Deneme", tone: "info" },
  expiring: { label: "Süresi doluyor", tone: "warning" },
  overdue: { label: "Ödeme gecikti", tone: "danger" },
  suspended: { label: "Donduruldu", tone: "muted" },
  canceled: { label: "İptal edildi", tone: "danger" },
};
function statusMeta(s) { return STATUS[s] || STATUS.active; }

/* modülleri plana göre kur */
function modulesFromPlan(planModules) {
  const o = {};
  MODULES.forEach((m) => { o[m.key] = planModules.includes(m.key); });
  return o;
}

/* ---- Seed: kurumlar / franchise'lar ---- */
function seedOrgs() {
  return [
    {
      id: "akademi-yildiz", name: "Kampüs Koç", type: "franchise", city: "İstanbul",
      planId: "franchise", status: "active", cycle: "annual",
      startedAt: NOW - 430 * DAY, renewsAt: NOW + 214 * DAY, feeMonthly: 24900,
      seats: { used: 312, total: 400 }, coaches: { used: 26, total: 32 },
      modules: modulesFromPlan(orgPlanById("franchise").modules),
      owner: { name: "İncisel Emen", email: "incisel@kampuskoc.com", phone: "0532 410 88 12" },
      managers: [
        { id: "akademi-yildiz-mgr-owner", name: "İncisel Emen", email: "incisel@kampuskoc.com", role: "owner", addedAt: NOW - 430 * DAY, status: "active" },
        { id: "akademi-yildiz-mgr-2", name: "Derya Soylu", email: "derya@kampuskoc.com", role: "manager", addedAt: NOW - 120 * DAY, status: "active" },
        { id: "akademi-yildiz-mgr-3", name: "Kerem Aksoy", email: "kerem@kampuskoc.com", role: "manager", addedAt: NOW - 12 * DAY, status: "invited" },
      ],
      tone: "#5b6cff",
      branches: [
        { id: "ay-kadikoy", name: "Kadıköy Şubesi", city: "İstanbul", students: 98, coaches: 8, collect: 186000, status: "active" },
        { id: "ay-besiktas", name: "Beşiktaş Şubesi", city: "İstanbul", students: 84, coaches: 7, collect: 159000, status: "active" },
        { id: "ay-atasehir", name: "Ataşehir Şubesi", city: "İstanbul", students: 76, coaches: 6, collect: 142000, status: "active" },
        { id: "ay-bakirkoy", name: "Bakırköy Şubesi", city: "İstanbul", students: 54, coaches: 5, collect: 101000, status: "active" },
      ],
    },
    {
      id: "zirve-egitim", name: "Zirve Eğitim Kurumları", type: "franchise", city: "İzmir",
      planId: "franchise", status: "active", cycle: "annual",
      startedAt: NOW - 280 * DAY, renewsAt: NOW + 85 * DAY, feeMonthly: 19900,
      seats: { used: 188, total: 250 }, coaches: { used: 17, total: 24 },
      modules: modulesFromPlan(["denemeAnaliz", "raporlar", "mesajlasma", "randevu", "veliPaneli", "onlineDeneme"]),
      owner: { name: "Gülşen Tunç", email: "gulsen@zirveegitim.com", phone: "0542 220 14 90" },
      tone: "#10b981",
      branches: [
        { id: "ze-bornova", name: "Bornova Şubesi", city: "İzmir", students: 72, coaches: 7, collect: 138000, status: "active" },
        { id: "ze-karsiyaka", name: "Karşıyaka Şubesi", city: "İzmir", students: 64, coaches: 6, collect: 121000, status: "active" },
        { id: "ze-buca", name: "Buca Şubesi", city: "İzmir", students: 52, coaches: 4, collect: 98000, status: "active" },
      ],
    },
    {
      id: "hedef-akademi", name: "Hedef Akademi", type: "franchise", city: "Antalya",
      planId: "franchise", status: "expiring", cycle: "annual",
      startedAt: NOW - 354 * DAY, renewsAt: NOW + 11 * DAY, feeMonthly: 22900,
      seats: { used: 244, total: 300 }, coaches: { used: 22, total: 30 },
      modules: modulesFromPlan(orgPlanById("franchise").modules),
      owner: { name: "Okan Demirtaş", email: "okan@hedefakademi.com", phone: "0533 612 70 45" },
      tone: "#f59e0b",
      branches: [
        { id: "ha-muratpasa", name: "Muratpaşa Şubesi", city: "Antalya", students: 56, coaches: 5, collect: 105000, status: "active" },
        { id: "ha-konyaalti", name: "Konyaaltı Şubesi", city: "Antalya", students: 48, coaches: 4, collect: 92000, status: "active" },
        { id: "ha-kepez", name: "Kepez Şubesi", city: "Antalya", students: 44, coaches: 4, collect: 84000, status: "active" },
        { id: "ha-alanya", name: "Alanya Şubesi", city: "Antalya", students: 38, coaches: 3, collect: 72000, status: "active" },
        { id: "ha-manavgat", name: "Manavgat Şubesi", city: "Antalya", students: 32, coaches: 3, collect: 61000, status: "active" },
        { id: "ha-adana", name: "Adana Seyhan Şubesi", city: "Adana", students: 26, coaches: 3, collect: 49000, status: "active" },
      ],
    },
    {
      id: "doga-rehberlik", name: "Doğa Rehberlik Merkezi", type: "kurum", city: "Ankara",
      planId: "pro", status: "active", cycle: "annual",
      startedAt: NOW - 190 * DAY, renewsAt: NOW + 175 * DAY, feeMonthly: 11900,
      seats: { used: 118, total: 150 }, coaches: { used: 11, total: 12 },
      modules: modulesFromPlan(orgPlanById("pro").modules),
      owner: { name: "Elif Şahin", email: "elif@dogarehberlik.com", phone: "0535 904 21 33" },
      tone: "#0ea5e9",
      branches: [
        { id: "dr-merkez", name: "Çankaya Merkez", city: "Ankara", students: 118, coaches: 11, collect: 224000, status: "active" },
      ],
    },
    {
      id: "pusula-kocluk", name: "Pusula Koçluk", type: "kurum", city: "Bursa",
      planId: "baslangic", status: "trial", cycle: "monthly",
      startedAt: NOW - 8 * DAY, renewsAt: NOW + 6 * DAY, feeMonthly: 4900,
      seats: { used: 28, total: 50 }, coaches: { used: 4, total: 5 },
      modules: modulesFromPlan(orgPlanById("baslangic").modules),
      owner: { name: "Caner Yıldırım", email: "caner@pusulakocluk.com", phone: "0543 318 65 20" },
      tone: "#8b5cf6",
      branches: [
        { id: "pk-merkez", name: "Nilüfer Merkez", city: "Bursa", students: 28, coaches: 4, collect: 52000, status: "active" },
      ],
    },
    {
      id: "mavi-deniz", name: "Mavi Deniz Eğitim", type: "kurum", city: "Eskişehir",
      planId: "pro", status: "overdue", cycle: "monthly",
      startedAt: NOW - 410 * DAY, renewsAt: NOW - 4 * DAY, feeMonthly: 11900,
      seats: { used: 96, total: 150 }, coaches: { used: 9, total: 12 },
      modules: modulesFromPlan(orgPlanById("pro").modules),
      owner: { name: "Sibel Kara", email: "sibel@mavideniz.com", phone: "0536 277 50 18" },
      tone: "#ef4444",
      branches: [
        { id: "md-merkez", name: "Tepebaşı Merkez", city: "Eskişehir", students: 96, coaches: 9, collect: 181000, status: "active" },
      ],
    },
  ];
}

/* ---- Seed: bireysel koç lisansları ---- */
function seedCoaches() {
  const inv = (id, days, amount, plan, status) => ({
    id, date: NOW - days * DAY, amount, planId: plan, status, method: "Visa •4242",
  });
  return [
    {
      id: "selin-yilmaz", name: "Selin Yılmaz", city: "İstanbul", planId: "c-pro", status: "active", cycle: "monthly",
      startedAt: NOW - 64 * DAY, renewsAt: NOW + 6 * DAY, feeMonthly: 999, autoRenew: true,
      seats: { used: 34, total: 40 }, rating: 4.9, email: "selin@uyanikkoc.com", phone: "0532 118 44 02",
      modules: modulesFromPlan(coachPlanById("c-pro").modules),
      invoices: [inv("UK-K-4821", 4, 999, "c-pro", "paid"), inv("UK-K-4502", 34, 999, "c-pro", "paid"), inv("UK-K-4188", 64, 999, "c-pro", "paid")],
    },
    {
      id: "burak-demir", name: "Burak Demir", city: "İzmir", planId: "c-sinirsiz", status: "active", cycle: "annual",
      startedAt: NOW - 120 * DAY, renewsAt: NOW + 245 * DAY, feeMonthly: 1499, autoRenew: true,
      seats: { used: 61, total: 999 }, rating: 4.8, email: "burak@uyanikkoc.com", phone: "0542 760 31 17",
      modules: modulesFromPlan(coachPlanById("c-sinirsiz").modules),
      invoices: [inv("UK-K-4390", 120, 17990, "c-sinirsiz", "paid")],
    },
    {
      id: "ayca-korkmaz", name: "Ayça Korkmaz", city: "Ankara", planId: "c-baslangic", status: "active", cycle: "monthly",
      startedAt: NOW - 41 * DAY, renewsAt: NOW + 19 * DAY, feeMonthly: 499, autoRenew: true,
      seats: { used: 12, total: 15 }, rating: 4.7, email: "ayca@uyanikkoc.com", phone: "0535 442 90 56",
      modules: modulesFromPlan(coachPlanById("c-baslangic").modules),
      invoices: [inv("UK-K-4710", 11, 499, "c-baslangic", "paid"), inv("UK-K-4455", 41, 499, "c-baslangic", "paid")],
    },
    {
      id: "emre-sahin", name: "Emre Şahin", city: "Bursa", planId: "c-pro", status: "trial", cycle: "monthly",
      startedAt: NOW - 5 * DAY, renewsAt: NOW + 9 * DAY, feeMonthly: 999, autoRenew: false,
      seats: { used: 8, total: 40 }, rating: 0, email: "emre@uyanikkoc.com", phone: "0543 205 78 41",
      modules: modulesFromPlan(coachPlanById("c-pro").modules),
      invoices: [],
    },
    {
      id: "deniz-aydin", name: "Deniz Aydın", city: "Antalya", planId: "c-baslangic", status: "active", cycle: "monthly",
      startedAt: NOW - 88 * DAY, renewsAt: NOW + 12 * DAY, feeMonthly: 499, autoRenew: true,
      seats: { used: 14, total: 15 }, rating: 4.6, email: "deniz@uyanikkoc.com", phone: "0536 619 23 70",
      modules: modulesFromPlan(coachPlanById("c-baslangic").modules),
      invoices: [inv("UK-K-4688", 18, 499, "c-baslangic", "paid"), inv("UK-K-4401", 48, 499, "c-baslangic", "paid")],
    },
    {
      id: "murat-celik", name: "Murat Çelik", city: "Konya", planId: "c-pro", status: "suspended", cycle: "monthly",
      startedAt: NOW - 150 * DAY, renewsAt: NOW - 9 * DAY, feeMonthly: 999, autoRenew: false,
      seats: { used: 22, total: 40 }, rating: 4.3, email: "murat@uyanikkoc.com", phone: "0533 870 12 64",
      modules: modulesFromPlan(coachPlanById("c-pro").modules),
      invoices: [inv("UK-K-4120", 39, 999, "c-pro", "failed"), inv("UK-K-3980", 69, 999, "c-pro", "paid")],
    },
    {
      id: "zeynep-ak", name: "Zeynep Ak", city: "Eskişehir", planId: "c-sinirsiz", status: "active", cycle: "annual",
      startedAt: NOW - 205 * DAY, renewsAt: NOW + 160 * DAY, feeMonthly: 1499, autoRenew: true,
      seats: { used: 47, total: 999 }, rating: 5.0, email: "zeynep@uyanikkoc.com", phone: "0532 533 41 09",
      modules: modulesFromPlan(coachPlanById("c-sinirsiz").modules),
      invoices: [inv("UK-K-4055", 205, 17990, "c-sinirsiz", "paid")],
    },
    {
      id: "kerem-yildiz", name: "Kerem Yıldız", city: "Trabzon", planId: "c-baslangic", status: "canceled", cycle: "monthly",
      startedAt: NOW - 220 * DAY, renewsAt: NOW - 35 * DAY, feeMonthly: 499, autoRenew: false,
      seats: { used: 0, total: 15 }, rating: 4.1, email: "kerem@uyanikkoc.com", phone: "0541 388 27 95",
      modules: modulesFromPlan(coachPlanById("c-baslangic").modules),
      invoices: [inv("UK-K-3611", 65, 499, "c-baslangic", "paid")],
    },
  ];
}

/* kurum faturaları üret */
function seedOrgInvoices(orgs) {
  const out = [];
  orgs.forEach((o) => {
    const p = orgPlanById(o.planId);
    for (let i = 0; i < 3; i++) {
      out.push({
        id: "UK-F-" + o.id.slice(0, 3).toUpperCase() + "-" + (1200 + out.length),
        orgId: o.id, orgName: o.name, date: NOW - (i * 30 + 6) * DAY,
        amount: o.feeMonthly, status: (o.status === "overdue" && i === 0) ? "pending" : "paid",
        plan: p.name, method: "Havale / EFT",
      });
    }
  });
  return out.sort((a, b) => b.date - a.date);
}

/* ---- Seed: demo talepleri (gelen ilgi/lead) ---- */
function seedDemoRequests() {
  const H = 3600000;
  return [
    { id: "dem-5012", name: "Yıldız Koleji", kind: "org", email: "bilgi@yildizkoleji.com", phone: "0312 455 21 09", city: "Ankara", planId: "pro", source: "Web sitesi", note: "120 öğrenci, 9 koç. Veli paneli ve online deneme önemli.", requestedAt: NOW - 2 * H, status: "new", scheduledAt: null, notes: [] },
    { id: "dem-5011", name: "Mehmet Aksoy", kind: "coach", email: "mehmet.aksoy@gmail.com", phone: "0532 770 14 88", city: "İstanbul", planId: "c-pro", source: "Instagram", note: "Bireysel koç, 25 öğrencisi var. AI Koç modülünü merak ediyor.", requestedAt: NOW - 7 * H, status: "new", scheduledAt: null, notes: [] },
    { id: "dem-5009", name: "Başarı Etüt Merkezi", kind: "org", email: "info@basarietut.com", phone: "0224 330 55 12", city: "Bursa", planId: "baslangic", source: "Google reklam", note: "Tek şube, 40 öğrenci. Fiyat ve kurulum süreci soruldu.", requestedAt: NOW - 27 * H, status: "contacted", scheduledAt: null, notes: [
      { id: "dn-9001", author: "Nur Aydın", text: "Arayıp bilgi verdim, fiyat teklifi e-posta ile gönderildi. Perşembe tekrar aranacak.", date: NOW - 24 * H },
    ] },
    { id: "dem-5006", name: "Elif Şahin", kind: "coach", email: "elifsahin.koc@gmail.com", phone: "0535 612 90 33", city: "İzmir", planId: "c-baslangic", source: "Referans", note: "Bir önceki kullanıcının referansıyla geldi.", requestedAt: NOW - 2 * DAY, status: "scheduled", scheduledAt: NOW + 1 * DAY + 5 * H, notes: [
      { id: "dn-9002", author: "Nur Aydın", text: "Demo görüşmesi ayarlandı. Ekran paylaşımlı tanıtım yapılacak.", date: NOW - 1 * DAY },
    ] },
    { id: "dem-5001", name: "Ufuk Akademi", kind: "org", email: "iletisim@ufukakademi.com", phone: "0242 248 77 41", city: "Antalya", planId: "franchise", source: "Web sitesi", note: "3 şube. Demoyu beğendi, sözleşme aşamasında.", requestedAt: NOW - 5 * DAY, status: "converted", scheduledAt: NOW - 1 * DAY, notes: [
      { id: "dn-9003", author: "Selim Baş", text: "Demo tamamlandı, franchise paketinde anlaşıldı. Sözleşme gönderildi.", date: NOW - 12 * H },
    ] },
    { id: "dem-4998", name: "Canan Yıldız", kind: "coach", email: "canan.y@outlook.com", phone: "0541 209 36 70", city: "Konya", planId: "c-pro", source: "Instagram", note: "Üç kez arandı, geri dönüş alınamadı.", requestedAt: NOW - 9 * DAY, status: "lost", scheduledAt: null, notes: [
      { id: "dn-9004", author: "Onat Kılıç", text: "3 arama + 1 WhatsApp denendi, ulaşılamadı. Talep kapatıldı.", date: NOW - 5 * DAY },
    ] },
  ];
}

/* ---- Seed: yeni üyelik & satın almalar (gelir akışı) ---- */
function seedSignups() {
  const H = 3600000;
  return [
    { id: "su-7044", name: "Selin Yılmaz", kind: "coach", city: "İstanbul", planId: "c-pro", cycle: "monthly", amount: 999, method: "Kredi kartı · Visa •4242", at: NOW - 4 * H, type: "renewal" },
    { id: "su-7043", name: "Deniz Aydın", kind: "coach", city: "Antalya", planId: "c-baslangic", cycle: "monthly", amount: 499, method: "Kredi kartı · Master •8821", at: NOW - 9 * H, type: "new" },
    { id: "su-7041", name: "Pusula Koçluk", kind: "org", city: "Bursa", planId: "baslangic", cycle: "monthly", amount: 4900, method: "Havale / EFT", at: NOW - 2 * DAY, type: "new" },
    { id: "su-7039", name: "Emre Şahin", kind: "coach", city: "Bursa", planId: "c-pro", cycle: "monthly", amount: 0, method: "Ücretsiz deneme", at: NOW - 5 * DAY, type: "trial" },
    { id: "su-7036", name: "Doğa Rehberlik Merkezi", kind: "org", city: "Ankara", planId: "pro", cycle: "annual", amount: 142800, method: "Havale / EFT", at: NOW - 7 * DAY, type: "upgrade" },
    { id: "su-7032", name: "Ayça Korkmaz", kind: "coach", city: "Ankara", planId: "c-baslangic", cycle: "monthly", amount: 499, method: "Kredi kartı · Visa •5190", at: NOW - 11 * DAY, type: "new" },
    { id: "su-7028", name: "Zeynep Ak", kind: "coach", city: "Eskişehir", planId: "c-sinirsiz", cycle: "annual", amount: 17990, method: "Kredi kartı · Visa •3307", at: NOW - 16 * DAY, type: "renewal" },
    { id: "su-7021", name: "Burak Demir", kind: "coach", city: "İzmir", planId: "c-sinirsiz", cycle: "annual", amount: 17990, method: "Kredi kartı · Master •6642", at: NOW - 24 * DAY, type: "new" },
  ];
}

/* ---- Seed: başvuru kaynakları / entegrasyonlar ---- */
function seedIntegrations() {
  const H = 3600000;
  return [
    { id: "meta", name: "Meta Reklam", desc: "Facebook & Instagram Lead Ads formlarından gelen başvurular otomatik düşer.", icon: "users", tone: "#1877F2", connected: true, account: "Uyanık Koç Reklam Hesabı", formName: "LGS Kayıt Formu", leadCount: 14, lastSync: NOW - 2 * H },
    { id: "google", name: "Google Reklam", desc: "Google Ads lead form eklentisinden gelen başvurular.", icon: "search", tone: "#EA4335", connected: false, account: "", formName: "", leadCount: 0, lastSync: null },
    { id: "jotform", name: "Jotform", desc: "Jotform formlarından otomatik başvuru aktarımı.", icon: "clipboard", tone: "#FF6100", connected: true, account: "jotform: uyanikkoc", formName: "Ücretsiz Demo Talep Formu", leadCount: 9, lastSync: NOW - 5 * H },
    { id: "webhook", name: "Web Formu (Webhook)", desc: "Kendi web sitenizdeki formu webhook adresiyle bağlayın.", icon: "bolt", tone: "var(--primary)", connected: true, account: "", formName: "", webhookUrl: "https://api.uyanikkoc.com/hooks/leads/uk_8f3a2c91", leadCount: 6, lastSync: NOW - 26 * H },
  ];
}

/* ============================================================
   STORE
   ============================================================ */
const ADMIN_KEY = "uk_admin_v6";

/* deterministik org-koç id'leri (orgCoaches kurum.jsx'te tanımlı; burada id üretimi aynı deseni izler) */
function _activeCoachIds(org, n) {
  const ids = [];
  let ci = 0;
  (org.branches || []).forEach((b) => { for (let i = 0; i < b.coaches; i++) { ids.push(org.id + "-c" + ci); ci++; } });
  return ids.slice(0, n);
}

/* öğrenci/veli → koç geri bildirimi (deterministik, salt-okunur) */
const _FB_STU = ["Elif Yılmaz", "Yusuf Demir", "Zeynep Kaya", "Mert Şahin", "Defne Çelik", "Arda Aydın", "Ada Arslan", "Nehir Kara"];
const _FB_PAR = ["Serkan Yılmaz (veli)", "Ayşe Demir (veli)", "Hakan Kaya (veli)", "Fatma Şahin (veli)", "Gül Aydın (veli)"];
const _FB_POS = [
  "Çocuğumun motivasyonu belirgin şekilde arttı, programı düzenli takip ediyor.",
  "Her hafta geri dönüş veriyor, deneme analizlerini sabırla anlatıyor.",
  "Zayıf konularımı tek tek çalıştırdı, netlerim yükseldi.",
  "Sorularıma hızlı cevap veriyor, kendimi yalnız hissetmiyorum.",
  "Hedef belirlememe yardımcı oldu, artık nasıl çalışacağımı biliyorum.",
];
const _FB_MIX = ["Genel memnunuz ama randevu saatlerinde bazen aksama oluyor.", "İçerik iyi fakat ödev geri bildirimleri biraz gecikebiliyor.", "Daha sık birebir görüşme olsa çok iyi olur."];
function _hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function coachFeedback(coachId) {
  const seed = _hash(coachId); const count = 2 + (seed % 3); const out = [];
  for (let i = 0; i < count; i++) {
    const k = _hash(coachId + ":" + i); const isPar = k % 3 === 0;
    const rating = 5 - (k % 5 === 0 ? 2 : k % 4 === 0 ? 1 : 0);
    const comment = rating >= 5 ? _FB_POS[k % _FB_POS.length] : rating === 4 ? _FB_POS[(k + 2) % _FB_POS.length] : _FB_MIX[k % _FB_MIX.length];
    out.push({ id: coachId + "-fb" + i, coachId, author: isPar ? _FB_PAR[k % _FB_PAR.length] : _FB_STU[k % _FB_STU.length], role: isPar ? "parent" : "student", rating, comment, date: NOW - ((k % 40) + i * 6) * DAY });
  }
  return out.sort((a, b) => b.date - a.date);
}
function coachFbAvg(items) { return items.length ? Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10 : 0; }

function adminSeed() {
  const orgs = seedOrgs();
  orgs.forEach((o) => {
    if (!o.managers) o.managers = [{ id: o.id + "-mgr-owner", name: o.owner.name, email: o.owner.email, role: "owner", addedAt: o.startedAt, status: "active" }];
  });
  const ac = _activeCoachIds(orgs.find((o) => o.id === "akademi-yildiz") || orgs[0], 3);
  return {
    orgs,
    coaches: seedCoaches(),
    orgInvoices: seedOrgInvoices(orgs),
    demoRequests: seedDemoRequests(),
    signups: seedSignups(),
    integrations: seedIntegrations(),
    myCoachId: "selin-yilmaz",
    activeOrgId: "akademi-yildiz",
    removedCoachIds: [],
    orgPlans: JSON.parse(JSON.stringify(ORG_PLANS_SEED)),
    coachPlans: JSON.parse(JSON.stringify(COACH_PLANS_SEED)),
    passiveStudentIds: [],
    removedStudentIds: [],
    feedbackHiddenCoachIds: [],
    studentPackages: {},
    messageLog: [],
    viewerAccess: "full",
    tasks: [
      { id: "tsk-1001", orgId: "akademi-yildiz", coachId: ac[0], title: "Risk altındaki öğrencilerle birebir görüşme", detail: "Son denemede neti düşen 3 öğrenciyle bu hafta birebir yapılacak.", due: NOW + 4 * DAY, priority: "high", status: "open", createdAt: NOW - 2 * DAY },
      { id: "tsk-1002", orgId: "akademi-yildiz", coachId: ac[0], title: "Haftalık veli bilgilendirme mesajı", detail: "Tüm velilere haftalık gelişim özetini gönder.", due: NOW + DAY, priority: "med", status: "open", createdAt: NOW - DAY },
      { id: "tsk-1003", orgId: "akademi-yildiz", coachId: ac[1], title: "Deneme analizi raporlarını sisteme gir", detail: "Son TYT denemesi optik sonuçları panele işlenecek.", due: NOW - DAY, priority: "high", status: "open", createdAt: NOW - 5 * DAY },
      { id: "tsk-1004", orgId: "akademi-yildiz", coachId: ac[2], title: "Aylık çalışma programı güncellemesi", detail: "Öğrencilerin yeni hedeflerine göre program revize edilecek.", due: NOW + 6 * DAY, priority: "low", status: "done", createdAt: NOW - 8 * DAY },
    ],
    team: [
      { id: "tm-1", name: "Platform Ekibi", email: "admin@uyanikkoc.com", access: "full", lastActive: NOW - 3600000, status: "active" },
      { id: "tm-2", name: "Selim Baş", email: "selim@uyanikkoc.com", access: "full", lastActive: NOW - 6 * 3600000, status: "active" },
      { id: "tm-3", name: "Nur Aydın", email: "nur@uyanikkoc.com", access: "support", lastActive: NOW - 1800000, status: "active" },
      { id: "tm-4", name: "Onat Kılıç", email: "onat@uyanikkoc.com", access: "support", lastActive: NOW - 2 * DAY, status: "invited" },
    ],
    tickets: [
      { id: "DST-2041", org: "Hedef Akademi", subj: "Lisans yenileme faturası ulaşmadı", priority: "Yüksek", tone: "danger", time: "2 saat önce", status: "open", messages: [{ id: "m1", author: "Okan Demirtaş", role: "user", text: "Bu ayın lisans faturası e-postama ulaşmadı, muhasebe için PDF rica ediyorum.", date: NOW - 2 * 3600000 }] },
      { id: "DST-2038", org: "Doğa Rehberlik", subj: "Yeni şube ekleme talebi", priority: "Orta", tone: "warning", time: "5 saat önce", status: "open", messages: [{ id: "m1", author: "Elif Şahin", role: "user", text: "Çankaya dışında ikinci bir şube açıyoruz, panele nasıl ekleriz?", date: NOW - 5 * 3600000 }] },
      { id: "DST-2034", org: "Selin Yılmaz (koç)", subj: "Öğrenci koltuğu artırımı", priority: "Düşük", tone: "info", time: "1 gün önce", status: "answered", messages: [{ id: "m1", author: "Selin Yılmaz", role: "user", text: "40 koltuğum doldu, 10 koltuk daha eklemek istiyorum.", date: NOW - DAY }, { id: "m2", author: "Nur Aydın", role: "agent", text: "Merhaba Selin Hanım, +10 koltuk paketi tanımladık, birkaç dakika içinde aktif olur.", date: NOW - 20 * 3600000 }] },
      { id: "DST-2029", org: "Zirve Eğitim", subj: "AI Koç modülü etkinleştirme", priority: "Orta", tone: "warning", time: "2 gün önce", status: "resolved", messages: [{ id: "m1", author: "Gülşen Tunç", role: "user", text: "AI Koç modülünü denemek istiyoruz.", date: NOW - 2 * DAY }, { id: "m2", author: "Selim Baş", role: "agent", text: "Franchise paketine geçişinizle AI Koç aktif edildi.", date: NOW - 1.5 * DAY }] },
    ],
    systemNotes: [
      { id: "note-1", author: "Nur Aydın", text: "Online deneme motoru 02:00-03:00 arası bakımda olacak; kullanıcılar bilgilendirildi.", date: NOW - 3 * 3600000, pinned: true },
      { id: "note-2", author: "Selim Baş", text: "iyzico ödeme servisinde gecikme raporlandı, izleniyor.", date: NOW - DAY, pinned: false },
    ],
    licenseNotes: [],
    campaigns: [
      { id: "cmp-1001", name: "Yeni Dönem İndirimi", code: "YENIDONEM25", type: "percent", value: 25, audience: "all", status: "active", startsAt: NOW - 10 * DAY, endsAt: NOW + 20 * DAY, redemptions: 14, maxRedemptions: 100, note: "Tüm yeni aboneliklerde ilk 3 ay %25." },
      { id: "cmp-1002", name: "Franchise Hoş Geldin", code: "FRANCHISE2026", type: "amount", value: 5000, audience: "orgs", status: "active", startsAt: NOW - 30 * DAY, endsAt: NOW + 60 * DAY, redemptions: 3, maxRedemptions: 0, note: "Franchise planına geçen kurumlara ₺5.000 indirim." },
      { id: "cmp-1003", name: "Koç Tanıtım Ayı", code: "KOCAY", type: "freeDays", value: 30, audience: "coaches", status: "scheduled", startsAt: NOW + 7 * DAY, endsAt: NOW + 37 * DAY, redemptions: 0, maxRedemptions: 50, note: "Bireysel koçlara 30 gün ücretsiz Pro denemesi." },
    ],
    campaignGrants: [],
  };
}

let _admin = (() => { try { const s = localStorage.getItem(ADMIN_KEY); if (s) return JSON.parse(s); } catch (e) {} return adminSeed(); })();
const _aListeners = new Set();
function persistAdmin() { try { localStorage.setItem(ADMIN_KEY, JSON.stringify(_admin)); } catch (e) {} _aListeners.forEach((l) => l()); }
function resetAdmin() { _admin = adminSeed(); persistAdmin(); }

function useAdmin() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _aListeners.add(l); return () => _aListeners.delete(l); }, []);
  return _admin;
}

/* selectors */
function getOrg(id) { return _admin.orgs.find((o) => o.id === id); }
function getCoach(id) { return _admin.coaches.find((c) => c.id === id); }
function getMyCoach() { return getCoach(_admin.myCoachId); }
function getActiveOrg() { return getOrg(_admin.activeOrgId); }

/* platform metrikleri (süper admin) */
function platformMetrics() {
  const orgs = _admin.orgs, coaches = _admin.coaches;
  const orgStudents = orgs.reduce((a, o) => a + o.seats.used, 0);
  const coachStudents = coaches.filter((c) => c.status !== "canceled").reduce((a, c) => a + c.seats.used, 0);
  const orgMrr = orgs.filter((o) => o.status === "active" || o.status === "expiring").reduce((a, o) => a + o.feeMonthly, 0);
  const coachMrr = coaches.filter((c) => c.status === "active").reduce((a, c) => a + c.feeMonthly, 0);
  const mrr = orgMrr + coachMrr;
  return {
    orgs: orgs.length,
    franchises: orgs.filter((o) => o.type === "franchise").length,
    activeCoaches: coaches.filter((c) => c.status === "active").length,
    totalCoaches: coaches.length,
    students: orgStudents + coachStudents,
    branches: orgs.reduce((a, o) => a + o.branches.length, 0),
    mrr, arr: mrr * 12, orgMrr, coachMrr,
    atRisk: orgs.filter((o) => o.status === "overdue" || o.status === "expiring").length
      + coaches.filter((c) => c.status === "overdue" || c.status === "suspended").length,
  };
}

/* ---- aksiyonlar: kurum lisansı ---- */
function setState(mut) { _admin = mut({ ..._admin }); persistAdmin(); }
function updateOrg(id, patch) {
  setState((s) => ({ ...s, orgs: s.orgs.map((o) => o.id === id ? { ...o, ...patch } : o) }));
}
function toggleOrgModule(id, key) {
  const o = getOrg(id); if (!o) return;
  updateOrg(id, { modules: { ...o.modules, [key]: !o.modules[key] } });
}
function renewOrg(id) {
  const o = getOrg(id); if (!o) return;
  const days = o.cycle === "annual" ? 365 : 30;
  updateOrg(id, { renewsAt: Date.now() + days * DAY, status: "active" });
}
function suspendOrg(id) { updateOrg(id, { status: "suspended" }); }
function activateOrg(id) { updateOrg(id, { status: "active" }); }
/* kurumu kalıcı sil — faturaları, görevleri ve aktif seçimi de temizler */
function deleteOrg(id) {
  setState((s) => {
    const orgs = s.orgs.filter((o) => o.id !== id);
    const activeOrgId = s.activeOrgId === id ? (orgs[0] ? orgs[0].id : null) : s.activeOrgId;
    return {
      ...s, orgs, activeOrgId,
      orgInvoices: (s.orgInvoices || []).filter((i) => i.orgId !== id),
      tasks: (s.tasks || []).filter((t) => t.orgId !== id),
      campaignGrants: (s.campaignGrants || []).filter((g) => !(g.subjectKind === "org" && g.subjectId === id)),
      licenseNotes: (s.licenseNotes || []).filter((n) => !(n.subjectKind === "org" && n.subjectId === id)),
    };
  });
}
function changeOrgPlan(id, planId) {
  const p = orgPlanById(planId); const o = getOrg(id); if (!o) return;
  updateOrg(id, {
    planId, feeMonthly: p.monthly,
    seats: { used: o.seats.used, total: Math.max(p.seats, o.seats.total) },
    coaches: { used: o.coaches.used, total: Math.max(p.coaches, o.coaches.total) },
  });
}
function addOrgSeats(id, n) {
  const o = getOrg(id); if (!o) return;
  updateOrg(id, { seats: { used: o.seats.used, total: o.seats.total + n } });
}
const ORG_TONES = ["#5b6cff", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444", "#0ea5e9"];
function slugifyOrg(s) {
  const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  return (s || "kurum").toLowerCase().replace(/[çğışöüİ]/g, (m) => map[m] || m)
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32) || "kurum";
}
function addOrg(data) {
  const plan = orgPlanById(data.planId || "pro");
  const type = data.type === "franchise" ? "franchise" : "kurum";
  const id = slugifyOrg(data.name) + "-" + Math.floor(100 + Math.random() * 899);
  const tone = ORG_TONES[Math.floor(Math.random() * ORG_TONES.length)];
  const status = data.status || "trial";
  const days = data.status === "active" ? 30 : 14;
  const org = {
    id, name: (data.name || "Yeni Kurum").trim(), type, city: data.city || "—",
    planId: plan.id, status, cycle: "monthly",
    startedAt: Date.now(), renewsAt: Date.now() + days * DAY, feeMonthly: plan.monthly,
    seats: { used: 0, total: plan.seats }, coaches: { used: 0, total: plan.coaches },
    modules: modulesFromPlan(plan.modules),
    owner: { name: (data.owner || "").trim(), email: (data.email || "").trim(), phone: data.phone || "" },
    managers: [],
    tone,
    branches: type === "franchise" ? [{ id: id + "-b-merkez", name: "Merkez Şube", city: data.city || "—", students: 0, coaches: 0, collect: 0, status: "active" }] : [],
  };
  setState((s) => ({ ...s, orgs: [org, ...s.orgs] }));
  return org;
}

/* ---- şube aksiyonları ---- */
function updateBranch(orgId, branchId, patch) {
  const o = getOrg(orgId); if (!o) return;
  updateOrg(orgId, { branches: o.branches.map((b) => b.id === branchId ? { ...b, ...patch } : b) });
}
function addBranch(orgId, data) {
  const o = getOrg(orgId); if (!o) return;
  const b = { id: orgId + "-b" + Math.floor(100 + Math.random() * 899), name: data.name, city: data.city || o.city, students: 0, coaches: 0, collect: 0, status: "active" };
  updateOrg(orgId, { branches: [...o.branches, b] });
  return b;
}

/* ---- aksiyonlar: bireysel koç lisansı ---- */
function updateCoach(id, patch) {
  setState((s) => ({ ...s, coaches: s.coaches.map((c) => c.id === id ? { ...c, ...patch } : c) }));
}
function toggleCoachModule(id, key) {
  const c = getCoach(id); if (!c) return;
  updateCoach(id, { modules: { ...c.modules, [key]: !c.modules[key] } });
}
function suspendCoach(id) { updateCoach(id, { status: "suspended" }); }
function activateCoach(id) { updateCoach(id, { status: "active" }); }
function setCoachAutoRenew(id, on) { updateCoach(id, { autoRenew: on }); }

/* bireysel koç: plan satın al / yükselt */
function buyCoachPlan(id, planId, cycle) {
  const p = coachPlanById(planId); const c = getCoach(id); if (!c) return;
  const days = cycle === "annual" ? 365 : 30;
  const amount = cycle === "annual" ? p.annual : p.monthly;
  const invId = "UK-K-" + String(Math.floor(4900 + Math.random() * 99));
  const inv = { id: invId, date: Date.now(), amount, planId, status: "paid", method: "Visa •4242" };
  updateCoach(id, {
    planId, cycle, status: "active", autoRenew: true,
    feeMonthly: cycle === "annual" ? Math.round(p.annual / 12) : p.monthly,
    startedAt: Date.now(), renewsAt: Date.now() + days * DAY,
    seats: { used: c.seats.used, total: p.seats },
    modules: modulesFromPlan(p.modules),
    invoices: [inv, ...(c.invoices || [])],
  });
  return inv;
}
function cancelCoach(id) { updateCoach(id, { status: "canceled", autoRenew: false }); }
/* bireysel koç lisansını kalıcı sil */
function deleteCoach(id) {
  setState((s) => {
    const coaches = s.coaches.filter((c) => c.id !== id);
    const myCoachId = s.myCoachId === id ? (coaches[0] ? coaches[0].id : null) : s.myCoachId;
    return {
      ...s, coaches, myCoachId,
      campaignGrants: (s.campaignGrants || []).filter((g) => !(g.subjectKind === "coach" && g.subjectId === id)),
      licenseNotes: (s.licenseNotes || []).filter((n) => !(n.subjectKind === "coach" && n.subjectId === id)),
    };
  });
}

/* ---- detaylı yenileme ---- */
function _extendFrom(base, months) { return Math.max(Date.now(), base) + Math.round(months * 30.4 * DAY); }
function renewOrgDetailed(id, months, planId) {
  const o = getOrg(id); if (!o) return;
  if (planId && planId !== o.planId) changeOrgPlan(id, planId);
  const oo = getOrg(id);
  updateOrg(id, { renewsAt: _extendFrom(oo.renewsAt, months), cycle: months >= 12 ? "annual" : "monthly", status: "active" });
}

/* ---- görevler (kurum → koç) ---- */
function assignTask(orgId, coachId, data) {
  const t = { id: "tsk-" + Math.floor(2000 + Math.random() * 7999), orgId, coachId, title: data.title, detail: data.detail || "", due: data.due, priority: data.priority, status: "open", createdAt: Date.now() };
  setState((s) => ({ ...s, tasks: [t, ...(s.tasks || [])] })); return t;
}
function completeTask(taskId) { setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: t.status === "done" ? "open" : "done" } : t) })); }
function deleteTask(taskId) { setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== taskId) })); }
function coachTasks(coachId) { return (_admin.tasks || []).filter((t) => t.coachId === coachId).sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || a.due - b.due); }

/* ---- koçu sistemden çıkar / geri al ---- */
function removeOrgCoach(coachId) { setState((s) => ({ ...s, removedCoachIds: s.removedCoachIds.includes(coachId) ? s.removedCoachIds : [...s.removedCoachIds, coachId] })); }
function restoreOrgCoach(coachId) { setState((s) => ({ ...s, removedCoachIds: s.removedCoachIds.filter((id) => id !== coachId) })); }
function isCoachRemoved(coachId) { return (_admin.removedCoachIds || []).includes(coachId); }

/* ---- kurum yöneticileri (çoklu) ---- */
function inviteOrgManager(orgId, data) {
  const o = getOrg(orgId); if (!o) return;
  updateOrg(orgId, { managers: [...o.managers, { id: orgId + "-mgr-" + Math.floor(100 + Math.random() * 899), name: data.name, email: data.email, role: data.role, addedAt: Date.now(), status: "invited" }] });
}
function removeOrgManager(orgId, managerId) { const o = getOrg(orgId); if (o) updateOrg(orgId, { managers: o.managers.filter((m) => m.id !== managerId) }); }
function setOrgManagerRole(orgId, managerId, role) { const o = getOrg(orgId); if (o) updateOrg(orgId, { managers: o.managers.map((m) => m.id === managerId ? { ...m, role } : m) }); }

/* ---- süper admin ekip & erişim ---- */
function inviteAdminMember(data) { setState((s) => ({ ...s, team: [...s.team, { id: "tm-" + Math.floor(100 + Math.random() * 899), name: data.name, email: data.email, access: data.access, lastActive: Date.now(), status: "invited" }] })); }
function removeAdminMember(id) { setState((s) => ({ ...s, team: s.team.filter((m) => m.id !== id) })); }
function setAdminAccess(id, access) { setState((s) => ({ ...s, team: s.team.map((m) => m.id === id ? { ...m, access } : m) })); }
function setViewerAccess(access) { setState((s) => ({ ...s, viewerAccess: access })); }

/* ---- destek ticket ---- */
function replyTicket(ticketId, text, author) {
  setState((s) => ({ ...s, tickets: s.tickets.map((t) => t.id === ticketId ? { ...t, status: t.status === "resolved" ? "resolved" : "answered", messages: [...t.messages, { id: "tm" + Date.now(), author, role: "agent", text, date: Date.now() }] } : t) }));
}
function setTicketStatus(ticketId, status) { setState((s) => ({ ...s, tickets: s.tickets.map((t) => t.id === ticketId ? { ...t, status } : t) })); }

/* ---- sistem notları ---- */
function addSystemNote(text, author) { setState((s) => ({ ...s, systemNotes: [{ id: "note-" + Math.floor(100 + Math.random() * 899), author, text, date: Date.now(), pinned: false }, ...s.systemNotes] })); }
function deleteSystemNote(id) { setState((s) => ({ ...s, systemNotes: s.systemNotes.filter((n) => n.id !== id) })); }

/* ---- lisanslı abone notu + ücretsiz demo ---- */
function addLicenseNote(subjectKind, subjectId, text, author) { setState((s) => ({ ...s, licenseNotes: [{ id: "ln-" + Math.floor(1000 + Math.random() * 8999), subjectKind, subjectId, text, author, date: Date.now() }, ...s.licenseNotes] })); }
function deleteLicenseNote(id) { setState((s) => ({ ...s, licenseNotes: s.licenseNotes.filter((n) => n.id !== id) })); }
function licenseNotesFor(subjectKind, subjectId) { return (_admin.licenseNotes || []).filter((n) => n.subjectKind === subjectKind && n.subjectId === subjectId).sort((a, b) => b.date - a.date); }
function grantDemo(subjectKind, subjectId, days, author) {
  if (subjectKind === "org") {
    const o = getOrg(subjectId); if (!o) return;
    const r = Math.max(Date.now(), o.renewsAt) + days * DAY;
    updateOrg(subjectId, { renewsAt: r, giftedDemoUntil: r, status: (o.status === "overdue" || o.status === "expiring") ? "trial" : o.status });
  } else {
    const c = getCoach(subjectId); if (!c) return;
    const r = Math.max(Date.now(), c.renewsAt) + days * DAY;
    updateCoach(subjectId, { renewsAt: r, giftedDemoUntil: r, status: (c.status === "suspended" || c.status === "canceled") ? "trial" : c.status });
  }
  addLicenseNote(subjectKind, subjectId, days + " gün ücretsiz demo tanımlandı.", author);
}

/* ---- kampanya / promosyon ---- */
function createCampaign(data) {
  const now = Date.now();
  setState((s) => ({ ...s, campaigns: [{ id: "cmp-" + Math.floor(1000 + Math.random() * 8999), name: data.name, code: (data.code || "").toUpperCase(), type: data.type, value: data.value, audience: data.audience, status: data.startsAt > now ? "scheduled" : "active", startsAt: data.startsAt, endsAt: data.endsAt, redemptions: 0, maxRedemptions: data.maxRedemptions, note: data.note || "" }, ...s.campaigns] }));
}
function setCampaignStatus(id, status) { setState((s) => ({ ...s, campaigns: s.campaigns.map((c) => c.id === id ? { ...c, status } : c) })); }
function deleteCampaign(id) { setState((s) => ({ ...s, campaigns: s.campaigns.filter((c) => c.id !== id), campaignGrants: s.campaignGrants.filter((g) => g.campaignId !== id) })); }
function grantCampaign(campaignId, subjectKind, subjectId) {
  const name = subjectKind === "org" ? (getOrg(subjectId) || {}).name : (getCoach(subjectId) || {}).name;
  setState((s) => ({ ...s, campaigns: s.campaigns.map((c) => c.id === campaignId ? { ...c, redemptions: c.redemptions + 1 } : c), campaignGrants: [{ id: "grant-" + Math.floor(1000 + Math.random() * 8999), campaignId, subjectKind, subjectId, subjectName: name || subjectId, grantedAt: Date.now(), redeemed: false }, ...s.campaignGrants] }));
}

/* ---- demo talepleri (lead) ---- */
function addDemoRequest(data) {
  setState((s) => ({ ...s, demoRequests: [{ id: "dem-" + Math.floor(5000 + Math.random() * 4999), name: data.name, kind: data.kind, email: data.email || "", phone: data.phone || "", city: data.city || "", planId: data.planId, source: data.source || "Manuel", note: data.note || "", requestedAt: Date.now(), status: "new", scheduledAt: null, notes: [] }, ...(s.demoRequests || [])] }));
}
function setDemoStatus(id, status) { setState((s) => ({ ...s, demoRequests: (s.demoRequests || []).map((d) => d.id === id ? { ...d, status } : d) })); }
function setDemoSchedule(id, ts) { setState((s) => ({ ...s, demoRequests: (s.demoRequests || []).map((d) => d.id === id ? { ...d, scheduledAt: ts } : d) })); }
function addDemoNote(id, text, author) { setState((s) => ({ ...s, demoRequests: (s.demoRequests || []).map((d) => d.id === id ? { ...d, notes: [{ id: "dn-" + Date.now() + Math.floor(Math.random() * 99), text, author, date: Date.now() }, ...(d.notes || [])] } : d) })); }
function deleteDemoNote(id, noteId) { setState((s) => ({ ...s, demoRequests: (s.demoRequests || []).map((d) => d.id === id ? { ...d, notes: (d.notes || []).filter((n) => n.id !== noteId) } : d) })); }
function deleteDemoRequest(id) { setState((s) => ({ ...s, demoRequests: (s.demoRequests || []).filter((d) => d.id !== id) })); }

/* ---- başvuru kaynağı entegrasyonları ---- */
function setIntegration(id, patch) { setState((s) => ({ ...s, integrations: (s.integrations || []).map((it) => it.id === id ? { ...it, ...patch } : it) })); }
function connectIntegration(id, cfg) { setIntegration(id, { connected: true, lastSync: Date.now(), ...cfg }); }
function disconnectIntegration(id) { setIntegration(id, { connected: false }); }

/* ---- lisans planları (süper admin tanımlar/düzenler/siler) ---- */
function _slugPlan(prefix, name) { return prefix + (slugifyOrg(name) || "plan").slice(0, 18) + "-" + Math.floor(100 + Math.random() * 899); }
function orgPlanInUse(id) { return _admin.orgs.some((o) => o.planId === id) || (_admin.demoRequests || []).some((d) => d.kind === "org" && d.planId === id); }
function coachPlanInUse(id) { return _admin.coaches.some((c) => c.planId === id) || (_admin.demoRequests || []).some((d) => d.kind === "coach" && d.planId === id); }
function addOrgPlan(data) {
  const id = data.id || _slugPlan("org-", data.name || "plan");
  const plan = { id, name: (data.name || "Yeni Plan").trim(), color: data.color || "var(--primary)", monthly: Math.max(0, Math.round(+data.monthly || 0)), seats: Math.max(1, Math.round(+data.seats || 50)), coaches: Math.max(1, Math.round(+data.coaches || 5)), branches: Math.max(1, Math.round(+data.branches || 1)), tagline: data.tagline || "", popular: !!data.popular, modules: data.modules || [] };
  setState((s) => ({ ...s, orgPlans: [...s.orgPlans, plan] })); return plan;
}
function updateOrgPlan(id, patch) { setState((s) => ({ ...s, orgPlans: s.orgPlans.map((p) => p.id === id ? { ...p, ...patch } : p) })); }
function deleteOrgPlan(id) { if (orgPlanInUse(id)) return false; setState((s) => ({ ...s, orgPlans: s.orgPlans.filter((p) => p.id !== id) })); return true; }
function addCoachPlan(data) {
  const id = data.id || _slugPlan("c-", data.name || "plan");
  const monthly = Math.max(0, Math.round(+data.monthly || 0));
  const plan = { id, name: (data.name || "Yeni Plan").trim(), color: data.color || "var(--primary)", monthly, annual: Math.max(0, Math.round(+data.annual || monthly * 10)), seats: Math.max(1, Math.round(+data.seats || 15)), tagline: data.tagline || "", popular: !!data.popular, features: data.features || [], modules: data.modules || [] };
  setState((s) => ({ ...s, coachPlans: [...s.coachPlans, plan] })); return plan;
}
function updateCoachPlan(id, patch) { setState((s) => ({ ...s, coachPlans: s.coachPlans.map((p) => p.id === id ? { ...p, ...patch } : p) })); }
function deleteCoachPlan(id) { if (coachPlanInUse(id)) return false; setState((s) => ({ ...s, coachPlans: s.coachPlans.filter((p) => p.id !== id) })); return true; }

/* ---- şube sil ---- */
function deleteBranch(orgId, branchId) { const o = getOrg(orgId); if (!o) return; updateOrg(orgId, { branches: o.branches.filter((b) => b.id !== branchId) }); }

/* ---- öğrenci pasif / sil / geri al ---- */
function isStudentRemoved(id) { return (_admin.removedStudentIds || []).includes(id); }
function isStudentPassive(id) { return (_admin.passiveStudentIds || []).includes(id); }
function setStudentPassive(id, on) { setState((s) => ({ ...s, passiveStudentIds: on ? (s.passiveStudentIds.includes(id) ? s.passiveStudentIds : [...s.passiveStudentIds, id]) : s.passiveStudentIds.filter((x) => x !== id) })); }
function removeStudent(id) { setState((s) => ({ ...s, removedStudentIds: s.removedStudentIds.includes(id) ? s.removedStudentIds : [...s.removedStudentIds, id], passiveStudentIds: s.passiveStudentIds.filter((x) => x !== id) })); }
function restoreStudent(id) { setState((s) => ({ ...s, removedStudentIds: s.removedStudentIds.filter((x) => x !== id) })); }

/* ---- kuruma bağlı koç geri bildirim görünürlüğü (kurum yöneticisi kontrol eder) ---- */
function isCoachFeedbackHidden(id) { return (_admin.feedbackHiddenCoachIds || []).includes(id); }
function setCoachFeedbackHidden(id, on) { setState((s) => ({ ...s, feedbackHiddenCoachIds: on ? ((s.feedbackHiddenCoachIds || []).includes(id) ? s.feedbackHiddenCoachIds : [...(s.feedbackHiddenCoachIds || []), id]) : (s.feedbackHiddenCoachIds || []).filter((x) => x !== id) })); }

/* ---- öğrenci paketleri (kurum / bireysel koç → öğrencisine sattığı paketler) ---- */
function _pkgKey(kind, id) { return kind + ":" + id; }
function defaultStudentPackages(kind, id) {
  const base = kind === "org"
    ? [
        { name: "Aylık Koçluk", price: 1500, cycle: "monthly", color: "var(--primary)", features: ["Haftalık birebir görüşme", "Deneme analizi", "Ödev & konu takibi", "Veli bilgilendirme"] },
        { name: "Dönemlik Paket", price: 7500, cycle: "term", color: "var(--success)", popular: true, features: ["Aylık paketteki her şey", "Sınırsız deneme", "Aylık veli raporu", "Öncelikli destek"] },
        { name: "Yoğun Hazırlık", price: 2800, cycle: "monthly", color: "var(--warning)", features: ["Haftada 2 birebir görüşme", "Bireysel çalışma programı", "AI çalışma önerileri", "7/24 mesaj desteği"] },
      ]
    : [
        { name: "Standart Koçluk", price: 1200, cycle: "monthly", color: "var(--primary)", features: ["Haftalık birebir görüşme", "Ödev & konu takibi", "Deneme analizi"] },
        { name: "Premium Koçluk", price: 2000, cycle: "monthly", color: "var(--warning)", popular: true, features: ["Standart'taki her şey", "Haftada 2 görüşme", "Bireysel program", "Sınırsız mesaj desteği"] },
      ];
  return base.map((p, i) => ({ id: kind + "-" + id + "-p" + (i + 1), ...p }));
}
function listStudentPackages(kind, id) { const m = _admin.studentPackages || {}; const k = _pkgKey(kind, id); return m[k] || defaultStudentPackages(kind, id); }
function _ensurePkgs(s, kind, id) { const k = _pkgKey(kind, id); const m = { ...(s.studentPackages || {}) }; if (!m[k]) m[k] = defaultStudentPackages(kind, id); return m; }
function addStudentPackage(kind, id, data) {
  setState((s) => { const m = _ensurePkgs(s, kind, id); const k = _pkgKey(kind, id);
    const pkg = { id: "sp-" + Math.floor(1000 + Math.random() * 8999), name: (data.name || "Yeni Paket").trim(), price: Math.max(0, Math.round(+data.price || 0)), cycle: data.cycle || "monthly", color: data.color || "var(--primary)", popular: !!data.popular, features: (data.features || []).map((f) => (f || "").trim()).filter(Boolean) };
    return { ...s, studentPackages: { ...m, [k]: [...m[k], pkg] } }; });
}
function updateStudentPackage(kind, id, pkgId, patch) { setState((s) => { const m = _ensurePkgs(s, kind, id); const k = _pkgKey(kind, id); return { ...s, studentPackages: { ...m, [k]: m[k].map((p) => p.id === pkgId ? { ...p, ...patch, features: patch.features ? patch.features.map((f) => (f || "").trim()).filter(Boolean) : p.features } : p) } }; }); }
function deleteStudentPackage(kind, id, pkgId) { setState((s) => { const m = _ensurePkgs(s, kind, id); const k = _pkgKey(kind, id); return { ...s, studentPackages: { ...m, [k]: m[k].filter((p) => p.id !== pkgId) } }; }); }
const PKG_CYCLES = { monthly: "Aylık", term: "Dönemlik", annual: "Yıllık", once: "Tek seferlik" };

/* ---- mesaj gönder (kayıtla) ---- */
function sendMessage(data) {
  const m = { id: "msg-" + Date.now() + Math.floor(Math.random() * 99), to: data.to || "", toName: data.toName || "", channel: data.channel || "email", subject: data.subject || "", body: data.body || "", date: Date.now(), by: data.by || "Platform Ekibi" };
  setState((s) => ({ ...s, messageLog: [m, ...(s.messageLog || [])] })); return m;
}

Object.assign(window, {
  TRY, NOW, DAY, fmtDate, fmtShort, daysLeft,
  MODULES, moduleName, ORG_PLANS_SEED, orgPlans, orgPlanById, COACH_PLANS_SEED, coachPlans, coachPlanById,
  addOrgPlan, updateOrgPlan, deleteOrgPlan, orgPlanInUse, addCoachPlan, updateCoachPlan, deleteCoachPlan, coachPlanInUse,
  deleteBranch, isStudentRemoved, isStudentPassive, setStudentPassive, removeStudent, restoreStudent, sendMessage,
  listStudentPackages, defaultStudentPackages, addStudentPackage, updateStudentPackage, deleteStudentPackage, PKG_CYCLES,
  STATUS, statusMeta,
  useAdmin, resetAdmin, getOrg, getCoach, getMyCoach, getActiveOrg, platformMetrics,
  updateOrg, toggleOrgModule, renewOrg, suspendOrg, activateOrg, deleteOrg, changeOrgPlan, addOrgSeats, addOrg, updateBranch, addBranch,
  updateCoach, toggleCoachModule, suspendCoach, activateCoach, setCoachAutoRenew, buyCoachPlan, cancelCoach, deleteCoach,
  isCoachFeedbackHidden, setCoachFeedbackHidden,
  coachFeedback, coachFbAvg, coachTasks, renewOrgDetailed,
  assignTask, completeTask, deleteTask, removeOrgCoach, restoreOrgCoach, isCoachRemoved,
  inviteOrgManager, removeOrgManager, setOrgManagerRole,
  inviteAdminMember, removeAdminMember, setAdminAccess, setViewerAccess,
  replyTicket, setTicketStatus, addSystemNote, deleteSystemNote,
  addLicenseNote, deleteLicenseNote, licenseNotesFor, grantDemo,
  createCampaign, setCampaignStatus, deleteCampaign, grantCampaign,
  addDemoRequest, setDemoStatus, setDemoSchedule, addDemoNote, deleteDemoNote, deleteDemoRequest,
  setIntegration, connectIntegration, disconnectIntegration,
});
