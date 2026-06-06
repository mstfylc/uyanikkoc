// In-memory admin store — DB yapılandırılmadığında (shouldUseDatabase()=false)
// kullanılır. Repo'daki mocks/billing.ts desenini izler.
// apps/web/mocks/admin.ts
// Prototip kaynağı: admin/admin-data.jsx (seedOrgs, seedCoaches, seedOrgInvoices, store + actions).

import { modulesFromPlan, orgPlanById, coachPlanById } from "@/lib/admin/pricing";
import { resolveActiveOrgId, resolveOrgCoachId, type AdminSnapshotContext } from "@/lib/admin/snapshot-context";
import { orgCoaches, seedCoachFeedback } from "@/lib/admin/derive";
import { DEMO_BRANCH_ID, DEMO_ORG_ID } from "@/lib/auth/demo-users";
import type {
  AdminAccess,
  AdminSnapshot,
  AdminTeamMember,
  Campaign,
  CampaignAudience,
  CampaignGrant,
  CampaignStatus,
  CampaignType,
  CoachFeedback,
  CoachTask,
  LicenseNote,
  LicenseSubjectKind,
  ModuleKey,
  Org,
  OrgInvoice,
  OrgManager,
  OrgManagerRole,
  OrgPlanId,
  OrgBilling,
  OrgInvite,
  OrgNotificationPrefs,
  SoloCoach,
  StudentSubscription,
  SupportTicket,
  SystemNote,
  TaskPriority,
  TicketStatus,
} from "@/lib/admin/types";

const DAY = 86_400_000;
const NOW = Date.now();

function orgBilling(city: string): OrgBilling {
  return {
    taxId: "123 456 7890",
    taxOffice: "Vergi Dairesi",
    billingAddress: city,
    paymentMethod: "Havale / EFT",
  };
}

function orgNotifications(): OrgNotificationPrefs {
  return {
    licenseReminders: true,
    paymentAlerts: true,
    weeklyReport: false,
    productUpdates: true,
  };
}

function seedOrgs(): Omit<Org, "managers">[] {
  return [
    {
      id: DEMO_ORG_ID,
      name: "Uyanik Demo Kurum",
      type: "kurum",
      city: "Istanbul",
      planId: "baslangic",
      status: "active",
      cycle: "monthly",
      startedAt: NOW - 90 * DAY,
      renewsAt: NOW + 275 * DAY,
      feeMonthly: 4900,
      seats: { used: 2, total: 50 },
      coaches: { used: 1, total: 5 },
      modules: modulesFromPlan(orgPlanById("baslangic").modules),
      owner: { name: "Demo Yonetici", email: "branch@uyanik.local", phone: "0532 000 00 01" },
      tone: "#6366f1",
      branches: [
        {
          id: DEMO_BRANCH_ID,
          name: "Demo Sube",
          city: "Istanbul",
          students: 2,
          coaches: 1,
          collect: 9800,
          status: "active",
        },
      ],
      billing: orgBilling("Istanbul"),
      notifications: orgNotifications(),
    },
    {
      id: "akademi-yildiz", name: "Kampüs Koç", type: "franchise", city: "İstanbul",
      planId: "franchise", status: "active", cycle: "annual",
      startedAt: NOW - 430 * DAY, renewsAt: NOW + 214 * DAY, feeMonthly: 24900,
      seats: { used: 312, total: 400 }, coaches: { used: 26, total: 32 },
      modules: modulesFromPlan(orgPlanById("franchise").modules),
      owner: { name: "İncisel Emen", email: "incisel@kampuskoc.com", phone: "0532 410 88 12" },
      tone: "#5b6cff",
      branches: [
        { id: "ay-kadikoy", name: "Kadıköy Şubesi", city: "İstanbul", students: 98, coaches: 8, collect: 186000, status: "active" },
        { id: "ay-besiktas", name: "Beşiktaş Şubesi", city: "İstanbul", students: 84, coaches: 7, collect: 159000, status: "active" },
        { id: "ay-atasehir", name: "Ataşehir Şubesi", city: "İstanbul", students: 76, coaches: 6, collect: 142000, status: "active" },
        { id: "ay-bakirkoy", name: "Bakırköy Şubesi", city: "İstanbul", students: 54, coaches: 5, collect: 101000, status: "active" },
      ],
      billing: orgBilling("İstanbul"),
      notifications: orgNotifications(),
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
      billing: orgBilling("İzmir"),
      notifications: orgNotifications(),
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
      billing: orgBilling("Antalya"),
      notifications: orgNotifications(),
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
      billing: orgBilling("Ankara"),
      notifications: orgNotifications(),
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
      billing: orgBilling("Bursa"),
      notifications: orgNotifications(),
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
      billing: orgBilling("Eskişehir"),
      notifications: orgNotifications(),
    },
  ];
}

function seedCoaches(): SoloCoach[] {
  const inv = (
    id: string,
    days: number,
    amount: number,
    plan: SoloCoach["planId"],
    status: "paid" | "failed" | "pending",
  ) => ({ id, date: NOW - days * DAY, amount, planId: plan, status, method: "Visa •4242" });
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

function seedOrgInvoices(orgs: Org[]): OrgInvoice[] {
  const out: OrgInvoice[] = [];
  orgs.forEach((o) => {
    const p = orgPlanById(o.planId);
    for (let i = 0; i < 3; i++) {
      out.push({
        id: "UK-F-" + o.id.slice(0, 3).toUpperCase() + "-" + (1200 + out.length),
        orgId: o.id,
        orgName: o.name,
        date: NOW - (i * 30 + 6) * DAY,
        amount: o.feeMonthly,
        status: o.status === "overdue" && i === 0 ? "pending" : "paid",
        plan: p.name,
        method: "Havale / EFT",
      });
    }
  });
  return out.sort((a, b) => b.date - a.date);
}

// Aktif kurum (kurum yöneticisi oturumu) + onun ilk koçu (kuruma bağlı koç oturumu).
const ACTIVE_ORG_ID = "akademi-yildiz";

function seedTasks(orgs: Org[]): CoachTask[] {
  const now = Date.now();
  const day = 86_400_000;
  const out: CoachTask[] = [];

  for (const orgId of [DEMO_ORG_ID, ACTIVE_ORG_ID]) {
    const org = orgs.find((o) => o.id === orgId);
    if (!org) continue;
    const coaches = orgCoaches(org);
    if (coaches.length === 0) continue;

    out.push(
      {
        id: `tsk-${orgId}-1`,
        orgId: org.id,
        coachId: coaches[0].id,
        title: "Risk altındaki öğrencilerle birebir görüşme",
        detail: "Son denemede neti düşen öğrenciyle bu hafta birebir yapılacak.",
        due: now + 4 * day,
        priority: "high",
        status: "open",
        createdAt: now - 2 * day,
      },
      {
        id: `tsk-${orgId}-2`,
        orgId: org.id,
        coachId: coaches[0].id,
        title: "Haftalık veli bilgilendirme mesajı",
        detail: "Velilere haftalık gelişim özetini gönder.",
        due: now + 1 * day,
        priority: "med",
        status: "open",
        createdAt: now - 1 * day,
      },
    );

    if (coaches[1]) {
      out.push({
        id: `tsk-${orgId}-3`,
        orgId: org.id,
        coachId: coaches[1].id,
        title: "Deneme analizi raporlarını sisteme gir",
        detail: "Son deneme optik sonuçları panele işlenecek.",
        due: now - 1 * day,
        priority: "high",
        status: "open",
        createdAt: now - 5 * day,
      });
    }
  }

  return out;
}

function seedFeedback(orgs: Org[]): CoachFeedback[] {
  const out: CoachFeedback[] = [];
  orgs.forEach((org) => {
    orgCoaches(org).forEach((c) => {
      out.push(...seedCoachFeedback(org.id, c.id));
    });
  });
  return out;
}

// Owner → yönetici listesi (her kuruma owner + aktif kuruma ek bir yönetici).
function withManagers(orgs: Omit<Org, "managers">[]): Org[] {
  return orgs.map((o) => {
    const managers: OrgManager[] = [
      {
        id: o.id + "-mgr-owner",
        name: o.owner.name,
        email: o.owner.email,
        role: "owner",
        addedAt: o.startedAt,
        status: "active",
      },
    ];
    if (o.id === ACTIVE_ORG_ID || o.id === DEMO_ORG_ID) {
      managers.push({
        id: o.id + "-mgr-2",
        name: o.id === DEMO_ORG_ID ? "Demo Yonetici" : "Derya Soylu",
        email: o.id === DEMO_ORG_ID ? "branch@uyanik.local" : "derya@kampuskoc.com",
        role: "manager",
        addedAt: NOW - 120 * DAY,
        status: "active",
      });
    }
    if (o.id === ACTIVE_ORG_ID) {
      managers.push({
        id: o.id + "-mgr-3",
        name: "Kerem Aksoy",
        email: "kerem@kampuskoc.com",
        role: "manager",
        addedAt: NOW - 12 * DAY,
        status: "invited",
      });
    }
    return {
      ...o,
      billing: orgBilling(o.city),
      notifications: orgNotifications(),
      managers,
    } as Org;
  });
}

function seedTeam(): AdminTeamMember[] {
  return [
    { id: "tm-1", name: "Platform Ekibi", email: "admin@uyanikkoc.com", access: "full", lastActive: NOW - 1 * 3_600_000, status: "active" },
    { id: "tm-2", name: "Selim Baş", email: "selim@uyanikkoc.com", access: "full", lastActive: NOW - 6 * 3_600_000, status: "active" },
    { id: "tm-3", name: "Nur Aydın", email: "nur@uyanikkoc.com", access: "support", lastActive: NOW - 30 * 60_000, status: "active" },
    { id: "tm-4", name: "Onat Kılıç", email: "onat@uyanikkoc.com", access: "support", lastActive: NOW - 2 * DAY, status: "invited" },
  ];
}

function seedTickets(): SupportTicket[] {
  const h = 3_600_000;
  const day = 86_400_000;
  return [
    {
      id: "DST-2041", org: "Hedef Akademi", subj: "Lisans yenileme faturası ulaşmadı", priority: "Yüksek", tone: "danger", time: "2 saat önce", status: "open",
      messages: [
        { id: "m1", author: "Okan Demirtaş", role: "user", text: "Bu ayın lisans faturası e-postama ulaşmadı, muhasebe için PDF rica ediyorum.", date: NOW - 2 * h },
      ],
    },
    {
      id: "DST-2038", org: "Doğa Rehberlik", subj: "Yeni şube ekleme talebi", priority: "Orta", tone: "warning", time: "5 saat önce", status: "open",
      messages: [
        { id: "m1", author: "Elif Şahin", role: "user", text: "Çankaya dışında ikinci bir şube açıyoruz, panele nasıl ekleriz?", date: NOW - 5 * h },
      ],
    },
    {
      id: "DST-2034", org: "Selin Yılmaz (koç)", subj: "Öğrenci koltuğu artırımı", priority: "Düşük", tone: "info", time: "1 gün önce", status: "answered",
      messages: [
        { id: "m1", author: "Selin Yılmaz", role: "user", text: "40 koltuğum doldu, 10 koltuk daha eklemek istiyorum.", date: NOW - 1 * day },
        { id: "m2", author: "Nur Aydın", role: "agent", text: "Merhaba Selin Hanım, Pro paketinizde +10 koltuk paketi tanımladık, birkaç dakika içinde aktif olur.", date: NOW - 20 * h },
      ],
    },
    {
      id: "DST-2029", org: "Zirve Eğitim", subj: "AI Koç modülü etkinleştirme", priority: "Orta", tone: "warning", time: "2 gün önce", status: "resolved",
      messages: [
        { id: "m1", author: "Gülşen Tunç", role: "user", text: "AI Koç modülünü denemek istiyoruz.", date: NOW - 2 * day },
        { id: "m2", author: "Selim Baş", role: "agent", text: "Franchise paketine geçişinizle birlikte AI Koç aktif edildi. İyi çalışmalar!", date: NOW - 1.5 * day },
      ],
    },
  ];
}

function seedSystemNotes(): SystemNote[] {
  return [
    { id: "note-1", author: "Nur Aydın", text: "Online deneme motoru 02:00-03:00 arası bakımda olacak; kullanıcılar bilgilendirildi.", date: NOW - 3 * 3_600_000, pinned: true },
    { id: "note-2", author: "Selim Baş", text: "iyzico ödeme servisinde gecikme raporlandı, izleniyor.", date: NOW - 1 * DAY, pinned: false },
  ];
}

function seedCampaigns(): Campaign[] {
  return [
    {
      id: "cmp-1001", name: "Yeni Dönem İndirimi", code: "YENIDONEM25", type: "percent", value: 25,
      audience: "all", status: "active", startsAt: NOW - 10 * DAY, endsAt: NOW + 20 * DAY,
      redemptions: 14, maxRedemptions: 100, note: "Tüm yeni aboneliklerde ilk 3 ay %25.",
    },
    {
      id: "cmp-1002", name: "Franchise Hoş Geldin", code: "FRANCHISE2026", type: "amount", value: 5000,
      audience: "orgs", status: "active", startsAt: NOW - 30 * DAY, endsAt: NOW + 60 * DAY,
      redemptions: 3, maxRedemptions: 0, note: "Franchise planına geçen kurumlara ₺5.000 indirim.",
    },
    {
      id: "cmp-1003", name: "Koç Tanıtım Ayı", code: "KOCAY", type: "freeDays", value: 30,
      audience: "coaches", status: "scheduled", startsAt: NOW + 7 * DAY, endsAt: NOW + 37 * DAY,
      redemptions: 0, maxRedemptions: 50, note: "Bireysel koçlara 30 gün ücretsiz Pro denemesi.",
    },
  ];
}

const SUBSCRIPTION_TEMPLATES: Omit<StudentSubscription, "id" | "orgId" | "branchId">[] = [
  { studentName: "Elif Yıldız", parentName: "Ayşe Yıldız", planId: "plus", cycle: "annual", status: "paid", nextDueDays: 279, amount: 22990 },
  { studentName: "Mert Demir", parentName: "Hakan Demir", planId: "standart", cycle: "monthly", status: "paid", nextDueDays: 12, amount: 1499 },
  { studentName: "Zeynep Kaya", parentName: "Sevgi Kaya", planId: "plus", cycle: "monthly", status: "pending", nextDueDays: 2, amount: 2299 },
  { studentName: "Can Aydın", parentName: "Murat Aydın", planId: "vip", cycle: "annual", status: "paid", nextDueDays: 154, amount: 34990 },
  { studentName: "Ece Şahin", parentName: "Deniz Şahin", planId: "standart", cycle: "monthly", status: "failed", nextDueDays: -3, amount: 1499 },
  { studentName: "Burak Çelik", parentName: "Aslı Çelik", planId: "plus", cycle: "monthly", status: "paid", nextDueDays: 19, amount: 2299 },
  { studentName: "Selin Arslan", parentName: "Tülay Arslan", planId: "standart", cycle: "annual", status: "paid", nextDueDays: 88, amount: 14990 },
  { studentName: "Kaan Yılmaz", parentName: "Erol Yılmaz", planId: "vip", cycle: "monthly", status: "pending", nextDueDays: 1, amount: 3499 },
];

function seedStudentSubscriptions(orgs: Org[]): StudentSubscription[] {
  const out: StudentSubscription[] = [];
  for (const orgId of [DEMO_ORG_ID, ACTIVE_ORG_ID]) {
    const org = orgs.find((o) => o.id === orgId);
    const branchId = org?.branches[0]?.id;
    if (!org || !branchId) continue;
    SUBSCRIPTION_TEMPLATES.forEach((t, i) => {
      out.push({ id: `sub-${orgId}-${i}`, orgId, branchId, ...t });
    });
  }
  return out;
}

// --- modül seviyesinde global store (process ömrü boyunca kalıcı) ---
type Store = {
  orgs: Org[];
  coaches: SoloCoach[];
  studentSubscriptions: StudentSubscription[];
  orgInvites: OrgInvite[];
  orgInvoices: OrgInvoice[];
  tasks: CoachTask[];
  feedback: CoachFeedback[];
  removedCoachIds: string[];
  team: AdminTeamMember[];
  tickets: SupportTicket[];
  systemNotes: SystemNote[];
  licenseNotes: LicenseNote[];
  campaigns: Campaign[];
  campaignGrants: CampaignGrant[];
};

const globalForAdmin = globalThis as unknown as { __ukAdminStore?: Store };

function freshStore(): Store {
  const orgs = withManagers(seedOrgs());
  return {
    orgs,
    coaches: seedCoaches(),
    studentSubscriptions: seedStudentSubscriptions(orgs),
    orgInvites: [],
    orgInvoices: seedOrgInvoices(orgs),
    tasks: seedTasks(orgs),
    feedback: seedFeedback(orgs),
    removedCoachIds: [],
    team: seedTeam(),
    tickets: seedTickets(),
    systemNotes: seedSystemNotes(),
    licenseNotes: [],
    campaigns: seedCampaigns(),
    campaignGrants: [],
  };
}

function store(): Store {
  if (!globalForAdmin.__ukAdminStore) {
    globalForAdmin.__ukAdminStore = freshStore();
  }
  return globalForAdmin.__ukAdminStore;
}

export function getMockSnapshot(ctx: AdminSnapshotContext = {}): AdminSnapshot {
  const s = store();
  const activeOrgId = resolveActiveOrgId(s.orgs, ctx);
  const activeOrg = s.orgs.find((o) => o.id === activeOrgId) ?? s.orgs[0];
  const activeOrgCoachId = resolveOrgCoachId(activeOrg, ctx.coachId, s.coaches);
  return {
    orgs: s.orgs,
    coaches: s.coaches,
    studentSubscriptions: s.studentSubscriptions,
    orgInvites: s.orgInvites,
    orgInvoices: s.orgInvoices,
    tasks: s.tasks,
    feedback: s.feedback,
    removedCoachIds: s.removedCoachIds,
    team: s.team,
    tickets: s.tickets,
    systemNotes: s.systemNotes,
    licenseNotes: s.licenseNotes,
    campaigns: s.campaigns,
    campaignGrants: s.campaignGrants,
    viewerAccess: "full",
    activeOrgId,
    myCoachId: ctx.coachId ?? activeOrgCoachId,
    activeOrgCoachId,
  };
}

export function resetMockStore(): void {
  globalForAdmin.__ukAdminStore = freshStore();
}

// ---- mutasyonlar (memory) ----
function findOrg(id: string): Org | undefined {
  return store().orgs.find((o) => o.id === id);
}
function findCoach(id: string): SoloCoach | undefined {
  return store().coaches.find((c) => c.id === id);
}

export function mockRenewOrg(id: string): void {
  const o = findOrg(id);
  if (!o) return;
  const days = o.cycle === "annual" ? 365 : 30;
  o.renewsAt = Date.now() + days * DAY;
  o.status = "active";
}

export function mockSuspendOrg(id: string): void {
  const o = findOrg(id);
  if (o) o.status = "suspended";
}

export function mockActivateOrg(id: string): void {
  const o = findOrg(id);
  if (o) o.status = "active";
}

export function mockChangeOrgPlan(id: string, planId: OrgPlanId): void {
  const o = findOrg(id);
  if (!o) return;
  const p = orgPlanById(planId);
  o.planId = planId;
  o.feeMonthly = p.monthly;
  o.seats = { used: o.seats.used, total: Math.max(p.seats, o.seats.total) };
  o.coaches = { used: o.coaches.used, total: Math.max(p.coaches, o.coaches.total) };
  o.modules = modulesFromPlan(p.modules);
}

export function mockAddOrgSeats(id: string, count: number): void {
  const o = findOrg(id);
  if (o) o.seats = { used: o.seats.used, total: o.seats.total + count };
}

export function mockToggleOrgModule(id: string, key: ModuleKey): void {
  const o = findOrg(id);
  if (o) o.modules = { ...o.modules, [key]: !o.modules[key] };
}

export function mockUpdateOrgProfile(
  id: string,
  patch: { name: string; tone: string; email: string; phone: string },
): void {
  const o = findOrg(id);
  if (!o) return;
  o.name = patch.name;
  o.tone = patch.tone;
  o.owner = { ...o.owner, email: patch.email, phone: patch.phone };
}

export function mockSuspendCoach(id: string): void {
  const c = findCoach(id);
  if (c) c.status = "suspended";
}

export function mockActivateCoach(id: string): void {
  const c = findCoach(id);
  if (c) c.status = "active";
}

// ---- kurum koçu: görev + çıkarma ----
export function mockAssignTask(
  orgId: string,
  coachId: string,
  data: { title: string; detail: string; due: number; priority: TaskPriority },
): CoachTask {
  const task: CoachTask = {
    id: "tsk-" + Math.floor(2000 + Math.random() * 7999),
    orgId,
    coachId,
    title: data.title,
    detail: data.detail,
    due: data.due,
    priority: data.priority,
    status: "open",
    createdAt: Date.now(),
  };
  store().tasks.unshift(task);
  return task;
}

export function findTask(taskId: string): CoachTask | undefined {
  return store().tasks.find((x) => x.id === taskId);
}

export function findSubscription(id: string): StudentSubscription | undefined {
  return store().studentSubscriptions.find((s) => s.id === id);
}

export function mockCompleteTask(taskId: string): void {
  const t = store().tasks.find((x) => x.id === taskId);
  if (t) t.status = t.status === "done" ? "open" : "done";
}

export function mockDeleteTask(taskId: string): void {
  const s = store();
  s.tasks = s.tasks.filter((x) => x.id !== taskId);
}

export function mockRemoveOrgCoach(coachId: string): void {
  const s = store();
  if (!s.removedCoachIds.includes(coachId)) s.removedCoachIds.push(coachId);
}

export function mockRestoreOrgCoach(coachId: string): void {
  const s = store();
  s.removedCoachIds = s.removedCoachIds.filter((id) => id !== coachId);
}

// ---- detaylı lisans yenileme ----
function extendFrom(base: number, months: number): number {
  const from = Math.max(Date.now(), base);
  return from + Math.round(months * 30.4 * DAY);
}

export function mockRenewOrgPlan(orgId: string, months: number, planId: OrgPlanId): void {
  const o = findOrg(orgId);
  if (!o) return;
  if (planId !== o.planId) mockChangeOrgPlan(orgId, planId);
  o.renewsAt = extendFrom(o.renewsAt, months);
  o.cycle = months >= 12 ? "annual" : "monthly";
  o.status = "active";
}

export function mockRenewCoachPlan(coachId: string, months: number, planId: SoloCoach["planId"]): void {
  const c = findCoach(coachId);
  if (!c) return;
  const p = coachPlanById(planId);
  c.planId = planId;
  c.feeMonthly = months >= 12 ? Math.round(p.annual / 12) : p.monthly;
  c.seats = { used: c.seats.used, total: p.seats };
  c.modules = modulesFromPlan(p.modules);
  c.renewsAt = extendFrom(c.renewsAt, months);
  c.cycle = months >= 12 ? "annual" : "monthly";
  c.status = "active";
}

// ---- kurum yöneticileri (çoklu) ----
export function mockInviteOrgManager(
  orgId: string,
  data: { name: string; email: string; role: OrgManagerRole },
): void {
  const o = findOrg(orgId);
  if (!o) return;
  o.managers = [
    ...o.managers,
    {
      id: orgId + "-mgr-" + Math.floor(100 + Math.random() * 899),
      name: data.name,
      email: data.email,
      role: data.role,
      addedAt: Date.now(),
      status: "invited",
    },
  ];
}

export function mockRemoveOrgManager(orgId: string, managerId: string): void {
  const o = findOrg(orgId);
  if (!o) return;
  o.managers = o.managers.filter((m) => m.id !== managerId);
}

export function mockSetOrgManagerRole(orgId: string, managerId: string, role: OrgManagerRole): void {
  const o = findOrg(orgId);
  if (!o) return;
  o.managers = o.managers.map((m) => (m.id === managerId ? { ...m, role } : m));
}

// ---- süper admin ekip & erişim ----
export function mockInviteAdminMember(data: { name: string; email: string; access: AdminAccess }): void {
  const s = store();
  s.team = [
    ...s.team,
    {
      id: "tm-" + Math.floor(100 + Math.random() * 899),
      name: data.name,
      email: data.email,
      access: data.access,
      lastActive: Date.now(),
      status: "invited",
    },
  ];
}

export function mockRemoveAdminMember(memberId: string): void {
  const s = store();
  s.team = s.team.filter((m) => m.id !== memberId);
}

export function mockSetAdminAccess(memberId: string, access: AdminAccess): void {
  const s = store();
  s.team = s.team.map((m) => (m.id === memberId ? { ...m, access } : m));
}

// ---- destek & sistem ----
export function mockReplyTicket(ticketId: string, text: string, author: string): void {
  const t = store().tickets.find((x) => x.id === ticketId);
  if (!t) return;
  t.messages.push({
    id: "tm-" + Math.floor(100 + Math.random() * 899),
    author,
    role: "agent",
    text,
    date: Date.now(),
  });
  if (t.status !== "resolved") t.status = "answered";
}

export function mockSetTicketStatus(ticketId: string, status: TicketStatus): void {
  const t = store().tickets.find((x) => x.id === ticketId);
  if (t) t.status = status;
}

export function mockAddSystemNote(text: string, author: string): void {
  store().systemNotes.unshift({
    id: "note-" + Math.floor(100 + Math.random() * 899),
    author,
    text,
    date: Date.now(),
    pinned: false,
  });
}

export function mockDeleteSystemNote(noteId: string): void {
  const s = store();
  s.systemNotes = s.systemNotes.filter((n) => n.id !== noteId);
}

// ---- lisanslı abone notu + ücretsiz demo ----
export function mockAddLicenseNote(
  subjectKind: LicenseSubjectKind,
  subjectId: string,
  text: string,
  author: string,
): void {
  store().licenseNotes.unshift({
    id: "ln-" + Math.floor(1000 + Math.random() * 8999),
    subjectKind,
    subjectId,
    text,
    author,
    date: Date.now(),
  });
}

export function mockDeleteLicenseNote(noteId: string): void {
  const s = store();
  s.licenseNotes = s.licenseNotes.filter((n) => n.id !== noteId);
}

export function mockGrantDemo(
  subjectKind: LicenseSubjectKind,
  subjectId: string,
  days: number,
  author: string,
): void {
  if (subjectKind === "org") {
    const o = findOrg(subjectId);
    if (!o) return;
    o.renewsAt = Math.max(Date.now(), o.renewsAt) + days * DAY;
    o.giftedDemoUntil = o.renewsAt;
    if (o.status === "overdue" || o.status === "expiring") o.status = "trial";
  } else {
    const c = findCoach(subjectId);
    if (!c) return;
    c.renewsAt = Math.max(Date.now(), c.renewsAt) + days * DAY;
    c.giftedDemoUntil = c.renewsAt;
    if (c.status === "suspended" || c.status === "canceled") c.status = "trial";
  }
  mockAddLicenseNote(subjectKind, subjectId, `${days} gün ücretsiz demo tanımlandı.`, author);
}

// ---- kampanya / promosyon ----
export function mockCreateCampaign(data: {
  name: string;
  code: string;
  type: CampaignType;
  value: number;
  audience: CampaignAudience;
  startsAt: number;
  endsAt: number;
  maxRedemptions: number;
  note: string;
}): void {
  const now = Date.now();
  store().campaigns.unshift({
    id: "cmp-" + Math.floor(1000 + Math.random() * 8999),
    name: data.name,
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value,
    audience: data.audience,
    status: data.startsAt > now ? "scheduled" : "active",
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    redemptions: 0,
    maxRedemptions: data.maxRedemptions,
    note: data.note,
  });
}

export function mockSetCampaignStatus(campaignId: string, status: CampaignStatus): void {
  const c = store().campaigns.find((x) => x.id === campaignId);
  if (c) c.status = status;
}

export function mockDeleteCampaign(campaignId: string): void {
  const s = store();
  s.campaigns = s.campaigns.filter((c) => c.id !== campaignId);
  s.campaignGrants = s.campaignGrants.filter((g) => g.campaignId !== campaignId);
}

export function mockGrantCampaign(
  campaignId: string,
  subjectKind: LicenseSubjectKind,
  subjectId: string,
): void {
  const s = store();
  const campaign = s.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return;
  const subjectName =
    subjectKind === "org"
      ? findOrg(subjectId)?.name ?? subjectId
      : findCoach(subjectId)?.name ?? subjectId;
  s.campaignGrants.unshift({
    id: "grant-" + Math.floor(1000 + Math.random() * 8999),
    campaignId,
    subjectKind,
    subjectId,
    subjectName,
    grantedAt: Date.now(),
    redeemed: false,
  });
  campaign.redemptions += 1;
}

// ---- şube yönetimi (zip-16 v2) ----
export function mockAddBranch(orgId: string, name: string, city: string): void {
  const o = findOrg(orgId);
  if (!o) return;
  const max = orgPlanById(o.planId).branches;
  if (o.branches.length >= max) return;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  o.branches = [
    ...o.branches,
    {
      id: `${orgId}-${slug || "sube"}-${Math.floor(100 + Math.random() * 899)}`,
      name: name.trim(),
      city: city.trim(),
      students: 0,
      coaches: 0,
      collect: 0,
      status: "active",
    },
  ];
  if (o.type === "kurum" && o.branches.length > 1) {
    o.type = "franchise";
  }
}

export function mockUpdateBranch(
  orgId: string,
  branchId: string,
  patch: { name?: string; city?: string; status?: Org["branches"][0]["status"] },
): void {
  const o = findOrg(orgId);
  if (!o) return;
  o.branches = o.branches.map((b) =>
    b.id === branchId
      ? {
          ...b,
          ...(patch.name != null ? { name: patch.name.trim() } : {}),
          ...(patch.city != null ? { city: patch.city.trim() } : {}),
          ...(patch.status != null ? { status: patch.status } : {}),
        }
      : b,
  );
}

export function mockSendPaymentReminder(subscriptionId: string): void {
  const sub = findSubscription(subscriptionId);
  if (sub) sub.remindedAt = Date.now();
}

// ---- bireysel koç lisans (zip-16 v2) ----
export function mockBuyCoachPlan(
  coachId: string,
  planId: SoloCoach["planId"],
  cycle: SoloCoach["cycle"],
): void {
  const c = findCoach(coachId);
  if (!c) return;
  const p = coachPlanById(planId);
  const amount = cycle === "annual" ? p.annual : p.monthly;
  c.planId = planId;
  c.cycle = cycle;
  c.feeMonthly = cycle === "annual" ? Math.round(p.annual / 12) : p.monthly;
  c.seats = { used: c.seats.used, total: p.seats };
  c.modules = modulesFromPlan(p.modules);
  const days = cycle === "annual" ? 365 : 30;
  c.renewsAt = Math.max(Date.now(), c.renewsAt) + days * DAY;
  c.status = "active";
  c.autoRenew = true;
  c.invoices.unshift({
    id: "UK-K-" + Math.floor(1000 + Math.random() * 8999),
    date: Date.now(),
    amount,
    planId,
    status: "paid",
    method: "Visa •4242",
  });
}

export function mockSetCoachAutoRenew(coachId: string, enabled: boolean): void {
  const c = findCoach(coachId);
  if (c) c.autoRenew = enabled;
}

export function mockCancelCoach(coachId: string): void {
  const c = findCoach(coachId);
  if (!c) return;
  c.status = "canceled";
  c.autoRenew = false;
}

export function mockUpdateOrgBilling(
  orgId: string,
  patch: { taxId: string; taxOffice: string; billingAddress: string; paymentMethod: string },
): void {
  const o = findOrg(orgId);
  if (!o) return;
  o.billing = { ...patch };
}

export function mockUpdateOrgNotifications(orgId: string, prefs: OrgNotificationPrefs): void {
  const o = findOrg(orgId);
  if (o) o.notifications = { ...prefs };
}

export function mockRequestDataExport(orgId: string, note?: string): void {
  const o = findOrg(orgId);
  if (!o) return;
  const s = store();
  s.tickets.unshift({
    id: "DST-" + Math.floor(2000 + Math.random() * 899),
    org: o.name,
    subj: "Veri dışa aktarma talebi",
    priority: "Orta",
    tone: "info",
    time: "Az önce",
    status: "open",
    messages: [
      {
        id: "m-" + Math.floor(100 + Math.random() * 899),
        author: o.owner.name,
        role: "user",
        text: note?.trim() || `${o.name} kurumu tüm verinin dışa aktarılmasını talep ediyor.`,
        date: Date.now(),
      },
    ],
  });
}

export function mockCancelOrgSubscription(orgId: string): void {
  const o = findOrg(orgId);
  if (!o) return;
  o.status = "canceled";
}

export function mockCreateOrg(data: {
  name: string;
  city: string;
  type: Org["type"];
  planId: OrgPlanId;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}): void {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const id = `${slug || "kurum"}-${Math.floor(100 + Math.random() * 899)}`;
  const plan = orgPlanById(data.planId);
  const base = {
    id,
    name: data.name.trim(),
    type: data.type,
    city: data.city.trim(),
    planId: data.planId,
    status: "trial" as const,
    cycle: "monthly" as const,
    startedAt: NOW,
    renewsAt: NOW + 14 * DAY,
    feeMonthly: plan.monthly,
    seats: { used: 0, total: plan.seats },
    coaches: { used: 0, total: plan.coaches },
    modules: modulesFromPlan(plan.modules),
    owner: { name: data.ownerName.trim(), email: data.ownerEmail.trim(), phone: data.ownerPhone.trim() },
    tone: "#5b6cff",
    branches: [
      {
        id: `${id}-merkez`,
        name: "Merkez",
        city: data.city.trim(),
        students: 0,
        coaches: 0,
        collect: 0,
        status: "active" as const,
      },
    ],
    billing: orgBilling(data.city),
    notifications: orgNotifications(),
  };
  const org = withManagers([base])[0];
  store().orgs.unshift(org);
  store().orgInvoices.unshift({
    id: "UK-F-NEW-" + Math.floor(1000 + Math.random() * 8999),
    orgId: id,
    orgName: org.name,
    date: NOW,
    amount: plan.monthly,
    status: "pending",
    plan: plan.name,
    method: "Havale / EFT",
  });
}

export function mockInviteOrgCoach(
  orgId: string,
  data: { name: string; email: string; branchId?: string },
): void {
  const o = findOrg(orgId);
  if (!o) return;
  store().orgInvites.unshift({
    id: "inv-" + Math.floor(1000 + Math.random() * 8999),
    orgId,
    kind: "coach",
    name: data.name.trim(),
    email: data.email.trim(),
    branchId: data.branchId,
    createdAt: Date.now(),
    status: "pending",
  });
}

export function mockInviteStudent(
  orgId: string,
  data: { name: string; parentEmail: string; branchId?: string },
): void {
  const o = findOrg(orgId);
  if (!o) return;
  if (o.seats.used < o.seats.total) {
    o.seats = { used: o.seats.used + 1, total: o.seats.total };
    const branch = data.branchId
      ? o.branches.find((b) => b.id === data.branchId)
      : o.branches[0];
    if (branch) branch.students += 1;
  }
  store().orgInvites.unshift({
    id: "inv-" + Math.floor(1000 + Math.random() * 8999),
    orgId,
    kind: "student",
    name: data.name.trim(),
    email: data.parentEmail.trim(),
    branchId: data.branchId,
    createdAt: Date.now(),
    status: "pending",
  });
}
