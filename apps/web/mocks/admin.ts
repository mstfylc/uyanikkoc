// In-memory admin store — DB yapılandırılmadığında (shouldUseDatabase()=false)
// kullanılır. Repo'daki mocks/billing.ts desenini izler.
// apps/web/mocks/admin.ts
// Prototip kaynağı: admin/admin-data.jsx (seedOrgs, seedCoaches, seedOrgInvoices, store + actions).

import { modulesFromPlan, orgPlanById, coachPlanById } from "@/lib/admin/pricing";
import { resolveActiveOrgId, resolveOrgCoachId, type AdminSnapshotContext } from "@/lib/admin/snapshot-context";
import { orgCoaches, orgStudents, seedCoachFeedback } from "@/lib/admin/derive";
import { KURUM_PERMS } from "@/lib/admin/types";
import { DEMO_BRANCH_ID, DEMO_ORG_ID, KAMPUS_KOC_BRANCH_ID, KAMPUS_KOC_ORG_ID } from "@/lib/auth/demo-users";
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
  DemoRequest,
  DemoRequestKind,
  DemoRequestStatus,
  Integration,
  IntegrationId,
  IntegrationPatch,
  KurumPermKey,
  LicenseNote,
  LicenseSubjectKind,
  ModuleKey,
  Org,
  OrgInvoice,
  OrgManager,
  OrgManagerRole,
  OrgCampaign,
  OrgPlanId,
  OrgBilling,
  OrgInvite,
  OrgNotificationPrefs,
  SoloCoach,
  Signup,
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
      name: "Uyan?k Demo Kurum",
      type: "kurum",
      city: "?stanbul",
      planId: "baslangic",
      status: "active",
      cycle: "monthly",
      startedAt: NOW - 90 * DAY,
      renewsAt: NOW + 275 * DAY,
      feeMonthly: 4900,
      seats: { used: 2, total: 50 },
      coaches: { used: 1, total: 5 },
      modules: modulesFromPlan(orgPlanById("baslangic").modules),
      owner: { name: "Demo Y?netici", email: "branch@uyanik.local", phone: "0532 000 00 01" },
      tone: "#6366f1",
      branches: [
        {
          id: DEMO_BRANCH_ID,
          name: "Demo Şube",
          city: "?stanbul",
          students: 2,
          coaches: 1,
          collect: 9800,
          status: "active",
        },
      ],
      billing: orgBilling("?stanbul"),
      notifications: orgNotifications(),
    },
    {
      id: KAMPUS_KOC_ORG_ID, name: "Kampüs Koç", type: "franchise", city: "İstanbul",
      planId: "franchise", status: "active", cycle: "annual",
      startedAt: NOW - 430 * DAY, renewsAt: NOW + 214 * DAY, feeMonthly: 24900,
      seats: { used: 312, total: 400 }, coaches: { used: 26, total: 32 },
      modules: modulesFromPlan(orgPlanById("franchise").modules),
      owner: { name: "İncisel Emen", email: "incisel@kampuskoc.com", phone: "0532 410 88 12" },
      tone: "#5b6cff",
      branches: [
        { id: KAMPUS_KOC_BRANCH_ID, name: "Kadıköy Şubesi", city: "İstanbul", students: 98, coaches: 8, collect: 186000, status: "active" },
        { id: "ay-besiktas", name: "Beşiktaş Şubesi", city: "İstanbul", students: 84, coaches: 7, collect: 159000, status: "active" },
        { id: "ay-atasehir", name: "Ataşehir Şubesi", city: "İstanbul", students: 76, coaches: 6, collect: 142000, status: "active" },
        { id: "ay-bakirkoy", name: "Bakırköy Şubesi", city: "İstanbul", students: 54, coaches: 5, collect: 101000, status: "active" },
      ],
      billing: orgBilling("İstanbul"),
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
const ACTIVE_ORG_ID = KAMPUS_KOC_ORG_ID;

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
function defaultManagerPerms(role: OrgManagerRole): KurumPermKey[] {
  return role === "owner" ? [...KURUM_PERMS] : ["dashboard", "branches", "coaches", "students", "assignments", "reports"];
}

function normalizeManagerPerms(org: Org): Org {
  return {
    ...org,
    managers: org.managers.map((manager) => ({
      ...manager,
      perms: manager.perms?.length ? manager.perms.filter((perm): perm is KurumPermKey => KURUM_PERMS.includes(perm as KurumPermKey)) : defaultManagerPerms(manager.role),
    })),
  };
}

function withManagers(orgs: Omit<Org, "managers">[]): Org[] {
  return orgs.map((o) => {
    const managers: OrgManager[] = [
      {
        id: o.id + "-mgr-owner",
        name: o.owner.name,
        email: o.owner.email,
        role: "owner",
        perms: defaultManagerPerms("owner"),
        addedAt: o.startedAt,
        status: "active",
      },
    ];
    if (o.id === ACTIVE_ORG_ID || o.id === DEMO_ORG_ID) {
      managers.push({
        id: o.id + "-mgr-2",
        name: o.id === DEMO_ORG_ID ? "Demo Y?netici" : "Derya Soylu",
        email: o.id === DEMO_ORG_ID ? "branch@uyanik.local" : "derya@kampuskoc.com",
        role: "manager",
        perms: defaultManagerPerms("manager"),
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
        perms: defaultManagerPerms("manager"),
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
      id: "DST-2041", org: "Kampüs Koç", subj: "Lisans yenileme faturası ulaşmadı", priority: "Yüksek", tone: "danger", time: "2 saat önce", status: "open",
      messages: [
        { id: "m1", author: "İncisel Emen", role: "user", text: "Bu ayın lisans faturası e-postama ulaşmadı, muhasebe için PDF rica ediyorum.", date: NOW - 2 * h },
      ],
    },
    {
      id: "DST-2038", org: "Kampüs Koç", subj: "Yeni şube ekleme talebi", priority: "Orta", tone: "warning", time: "5 saat önce", status: "open",
      messages: [
        { id: "m1", author: "Derya Soylu", role: "user", text: "Kadıköy dışında yeni bir şube açıyoruz, panele nasıl ekleriz?", date: NOW - 5 * h },
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
      id: "DST-2029", org: "Uyan?k Demo Kurum", subj: "Demo kurum hesap kontrolü", priority: "Orta", tone: "warning", time: "2 gün önce", status: "resolved",
      messages: [
        { id: "m1", author: "Demo Y?netici", role: "user", text: "Kurum yöneticisi hesabı ve demo kullanıcılarını kontrol eder misiniz?", date: NOW - 2 * day },
        { id: "m2", author: "Selim Baş", role: "agent", text: "Demo kurum hesapları kontrol edildi, aktif görünüyor. İyi çalışmalar!", date: NOW - 1.5 * day },
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

function seedDemoRequests(): DemoRequest[] {
  return [
    {
      id: "lead-1001",
      name: "Kampüs Koç",
      kind: "org",
      email: "incisel@kampuskoc.com",
      phone: "0532 410 88 12",
      city: "?stanbul",
      planId: "franchise",
      source: "Web sitesi",
      note: "Franchise kurum hesaplarının canlıya taşınması istendi.",
      requestedAt: NOW - 2 * 3_600_000,
      status: "new",
      scheduledAt: null,
      notes: [],
    },
    {
      id: "lead-1002",
      name: "Mehmet Aksoy",
      kind: "coach",
      email: "mehmet@kocluk.com",
      phone: "0542 220 14 90",
      city: "Izmir",
      planId: "c-pro",
      source: "Instagram",
      note: "Bireysel ko?, veli raporlar? ve ?dev takibiyle ilgileniyor.",
      requestedAt: NOW - 18 * 3_600_000,
      status: "contacted",
      scheduledAt: NOW + 2 * DAY,
      notes: [{ id: "lead-note-1", author: "Destek Ekibi", text: "Telefonla ulasildi, demo randevusu istiyor.", date: NOW - 12 * 3_600_000 }],
    },
    {
      id: "lead-1003",
      name: "Uyan?k Demo Kurum",
      kind: "org",
      email: "branch@uyanik.local",
      phone: "0532 000 00 01",
      city: "?stanbul",
      planId: "baslangic",
      source: "Google reklam",
      note: "Demo kurum hesabı için onboarding kontrolü istendi.",
      requestedAt: NOW - 3 * DAY,
      status: "scheduled",
      scheduledAt: NOW + 5 * DAY,
      notes: [],
    },
  ];
}

function seedSignups(): Signup[] {
  return [
    { id: "sgn-1001", name: "Kamp?s Ko?", kind: "org", city: "?stanbul", planId: "franchise", cycle: "annual", amount: 298800, method: "Havale / EFT", at: NOW - 8 * DAY, type: "renewal" },
    { id: "sgn-1002", name: "Uyan?k Demo Kurum", kind: "org", city: "?stanbul", planId: "baslangic", cycle: "monthly", amount: 4900, method: "Demo", at: NOW - 18 * DAY, type: "new" },
    { id: "sgn-1003", name: "Selin Y?lmaz", kind: "coach", city: "?stanbul", planId: "c-pro", cycle: "annual", amount: 9990, method: "Mastercard", at: NOW - 12 * DAY, type: "upgrade" },
  ];
}

function seedIntegrations(): Integration[] {
  return [
    { id: "meta", name: "Meta Reklam", desc: "Instagram ve Facebook Lead Ads formlar?ndan gelen ba?vurular.", icon: "bolt", tone: "#1877f2", connected: true, account: "Uyan?k Ko? Lead Ads", formName: "YKS Demo Talep Formu", leadCount: 42, lastSync: NOW - 45 * 60_000 },
    { id: "google", name: "Google Reklam", desc: "Google Ads lead form extension ba?vurular?.", icon: "search", tone: "#16a34a", connected: false, account: "", formName: "", leadCount: 0, lastSync: null },
    { id: "jotform", name: "Jotform", desc: "Kurum ba?vuru ve davet formlar?n? panele aktar.", icon: "clipboard", tone: "#f97316", connected: true, account: "jotform: ba?l?", formName: "Kurum Demo Ba?vuru", leadCount: 18, lastSync: NOW - 2 * 3_600_000 },
    { id: "webhook", name: "Web Formu", desc: "Kendi web sitendeki form i?in genel webhook.", icon: "link", tone: "#534ab7", connected: true, account: "webhook", formName: "Genel form", webhookUrl: "https://www.uyanikkoc.com/hooks/leads/demo", leadCount: 27, lastSync: NOW - 20 * 60_000 },
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
  removedStudentIds: string[];
  passiveStudentIds: string[];
  team: AdminTeamMember[];
  tickets: SupportTicket[];
  systemNotes: SystemNote[];
  licenseNotes: LicenseNote[];
  campaigns: Campaign[];
  orgCampaigns: OrgCampaign[];
  campaignGrants: CampaignGrant[];
  demoRequests: DemoRequest[];
  signups: Signup[];
  integrations: Integration[];
};

const globalForAdmin = globalThis as unknown as { __ukAdminStore?: Store };

const ALLOWED_ORG_IDS = new Set([DEMO_ORG_ID, ACTIVE_ORG_ID]);

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
    removedStudentIds: [],
    passiveStudentIds: [],
    team: seedTeam(),
    tickets: seedTickets(),
    systemNotes: seedSystemNotes(),
    licenseNotes: [],
    campaigns: seedCampaigns(),
    orgCampaigns: [],
    campaignGrants: [],
    demoRequests: seedDemoRequests(),
    signups: seedSignups(),
    integrations: seedIntegrations(),
  };
}

function store(): Store {
  if (!globalForAdmin.__ukAdminStore) {
    globalForAdmin.__ukAdminStore = freshStore();
  }
  return globalForAdmin.__ukAdminStore;
}

function normalizeLegacyText(value: string): string {
  return value
    .replaceAll("Uyanik Demo Kurum", "Uyanık Demo Kurum")
    .replaceAll("Uyanik Demo Org", "Uyanık Demo Kurum")
    .replaceAll("Uyanik Demo Branch", "Uyanık Demo Şube")
    .replaceAll("Uyanik Koc", "Uyanık Koç")
    .replaceAll("Kampus Koc", "Kampüs Koç")
    .replaceAll("Demo Sube", "Demo Şube")
    .replaceAll("Demo Yonetici", "Demo Yönetici")
    .replaceAll("Istanbul", "İstanbul")
    .replaceAll("Bireysel koc", "Bireysel koç")
    .replaceAll("veli raporlari", "veli raporları")
    .replaceAll("odev takibi", "ödev takibi")
    .replaceAll("formlarindan gelen basvurular", "formlarından gelen başvurular")
    .replaceAll("basvurulari", "başvuruları")
    .replaceAll("basvuru", "başvuru")
    .replaceAll("bagli", "bağlı");
}

function normalizeLegacySnapshotText(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (value instanceof Date) return;
  if (Array.isArray(value)) {
    value.forEach(normalizeLegacySnapshotText);
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    const target = value as Record<string, unknown>;
    if (typeof entry === "string") {
      target[key] = normalizeLegacyText(entry);
    } else {
      normalizeLegacySnapshotText(entry);
    }
  }
}

export function pruneMockStoreToAllowedOrgs(): void {
  const s = store();
  normalizeLegacySnapshotText(s);
  s.passiveStudentIds ??= [];
  s.orgCampaigns ??= [];
  s.orgs = s.orgs.map(normalizeManagerPerms);
  s.orgs = s.orgs.filter((org) => ALLOWED_ORG_IDS.has(org.id));

  const allowedOrgNames = new Set(s.orgs.map((org) => org.name));
  allowedOrgNames.add("Kamp?s Ko?");
  const allowedBranchIds = new Set(s.orgs.flatMap((org) => org.branches.map((branch) => branch.id)));

  s.studentSubscriptions = s.studentSubscriptions.filter(
    (sub) => ALLOWED_ORG_IDS.has(sub.orgId) && allowedBranchIds.has(sub.branchId),
  );
  s.orgInvites = s.orgInvites.filter((invite) => ALLOWED_ORG_IDS.has(invite.orgId));
  s.orgInvoices = s.orgInvoices.filter((invoice) => ALLOWED_ORG_IDS.has(invoice.orgId));
  s.tasks = s.tasks.filter((task) => ALLOWED_ORG_IDS.has(task.orgId));
  s.feedback = s.feedback.filter((item) => ALLOWED_ORG_IDS.has(item.orgId));
  s.removedStudentIds = s.removedStudentIds.filter((id) => [...ALLOWED_ORG_IDS].some((orgId) => id.startsWith(`${orgId}-s`)));
  s.passiveStudentIds = s.passiveStudentIds.filter((id) => [...ALLOWED_ORG_IDS].some((orgId) => id.startsWith(`${orgId}-s`)));
  s.licenseNotes = s.licenseNotes.filter(
    (note) => note.subjectKind !== "org" || ALLOWED_ORG_IDS.has(note.subjectId),
  );
  s.orgCampaigns = s.orgCampaigns.filter((campaign) => ALLOWED_ORG_IDS.has(campaign.orgId));
  s.campaignGrants = s.campaignGrants.filter(
    (grant) => grant.subjectKind !== "org" || ALLOWED_ORG_IDS.has(grant.subjectId),
  );
  s.tickets = s.tickets.filter((ticket) => !ticket.org || ticket.org.includes("(koç)") || allowedOrgNames.has(ticket.org));
  s.demoRequests = s.demoRequests.filter(
    (request) => request.kind !== "org" || allowedOrgNames.has(request.name) || request.email === "branch@uyanik.local",
  );
  s.signups = s.signups.filter((signup) => signup.kind !== "org" || allowedOrgNames.has(signup.name));
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
    removedStudentIds: s.removedStudentIds,
    passiveStudentIds: s.passiveStudentIds,
    team: s.team,
    tickets: s.tickets,
    systemNotes: s.systemNotes,
    licenseNotes: s.licenseNotes,
    campaigns: s.campaigns,
    orgCampaigns: s.orgCampaigns,
    campaignGrants: s.campaignGrants,
    demoRequests: s.demoRequests,
    signups: s.signups,
    integrations: s.integrations,
    viewerAccess: "full",
    activeOrgId,
    myCoachId: ctx.coachId ?? activeOrgCoachId,
    activeOrgCoachId,
  };
}

export function loadMockSnapshot(snapshot: AdminSnapshot): void {
  globalForAdmin.__ukAdminStore = {
    orgs: structuredClone(snapshot.orgs).map(normalizeManagerPerms),
    coaches: structuredClone(snapshot.coaches),
    studentSubscriptions: structuredClone(snapshot.studentSubscriptions),
    orgInvites: structuredClone(snapshot.orgInvites),
    orgInvoices: structuredClone(snapshot.orgInvoices),
    tasks: structuredClone(snapshot.tasks),
    feedback: structuredClone(snapshot.feedback),
    removedCoachIds: structuredClone(snapshot.removedCoachIds),
    removedStudentIds: structuredClone(snapshot.removedStudentIds ?? []),
    passiveStudentIds: structuredClone(snapshot.passiveStudentIds ?? []),
    team: structuredClone(snapshot.team),
    tickets: structuredClone(snapshot.tickets),
    systemNotes: structuredClone(snapshot.systemNotes),
    licenseNotes: structuredClone(snapshot.licenseNotes),
    campaigns: structuredClone(snapshot.campaigns),
    orgCampaigns: structuredClone(snapshot.orgCampaigns ?? []),
    campaignGrants: structuredClone(snapshot.campaignGrants),
    demoRequests: structuredClone(snapshot.demoRequests ?? seedDemoRequests()),
    signups: structuredClone(snapshot.signups ?? seedSignups()),
    integrations: structuredClone(snapshot.integrations ?? seedIntegrations()),
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
  patch: { name: string; tone: string; email: string; phone: string; ownerName?: string },
): void {
  const o = findOrg(id);
  if (!o) return;
  o.name = patch.name;
  o.tone = patch.tone;
  o.owner = {
    ...o.owner,
    ...(patch.ownerName ? { name: patch.ownerName } : {}),
    email: patch.email,
    phone: patch.phone,
  };
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

export function mockRemoveOrgStudent(orgId: string, studentId: string): void {
  const s = store();
  const o = findOrg(orgId);
  if (!o || s.removedStudentIds.includes(studentId)) return;
  const student = orgStudents(o).find((item) => item.id === studentId);
  s.removedStudentIds.push(studentId);
  s.passiveStudentIds = s.passiveStudentIds.filter((id) => id !== studentId);
  if (o.seats.used > 0) {
    o.seats = { ...o.seats, used: o.seats.used - 1 };
  }
  const branch = student ? o.branches.find((b) => b.name === student.branch) : o.branches[0];
  if (branch && branch.students > 0) {
    branch.students -= 1;
  }
}

export function mockRestoreOrgStudent(orgId: string, studentId: string): void {
  const s = store();
  const o = findOrg(orgId);
  if (!o || !s.removedStudentIds.includes(studentId)) return;
  s.removedStudentIds = s.removedStudentIds.filter((id) => id !== studentId);
  if (o.seats.used < o.seats.total) {
    o.seats = { ...o.seats, used: o.seats.used + 1 };
  }
  const branch = o.branches[0];
  if (branch) {
    branch.students += 1;
  }
}

export function mockSetOrgStudentPassive(orgId: string, studentId: string, passive: boolean): void {
  const s = store();
  const o = findOrg(orgId);
  if (!o || s.removedStudentIds.includes(studentId) || !studentId.startsWith(`${orgId}-s`)) return;
  if (passive) {
    if (!s.passiveStudentIds.includes(studentId)) s.passiveStudentIds.push(studentId);
  } else {
    s.passiveStudentIds = s.passiveStudentIds.filter((id) => id !== studentId);
  }
}

export function isStudentPassive(studentId: string): boolean {
  return store().passiveStudentIds.includes(studentId);
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
      perms: defaultManagerPerms(data.role),
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
  o.managers = o.managers.map((m) => (m.id === managerId ? { ...m, role, perms: defaultManagerPerms(role) } : m));
}

export function managerPerms(manager: OrgManager): KurumPermKey[] {
  return manager.perms?.length ? manager.perms : defaultManagerPerms(manager.role);
}

export function managerCan(manager: OrgManager, perm: KurumPermKey): boolean {
  return managerPerms(manager).includes(perm);
}

export function mockSetOrgManagerPerms(orgId: string, managerId: string, perms: KurumPermKey[]): void {
  const o = findOrg(orgId);
  if (!o) return;
  const normalized = [...new Set(perms)].filter((perm): perm is KurumPermKey => KURUM_PERMS.includes(perm as KurumPermKey));
  o.managers = o.managers.map((m) => (m.id === managerId ? { ...m, perms: normalized } : m));
}

export function mockToggleOrgManagerPerm(orgId: string, managerId: string, perm: KurumPermKey): void {
  const o = findOrg(orgId);
  if (!o || !KURUM_PERMS.includes(perm)) return;
  const manager = o.managers.find((m) => m.id === managerId);
  if (!manager) return;
  const current = new Set(managerPerms(manager));
  if (current.has(perm)) current.delete(perm);
  else current.add(perm);
  mockSetOrgManagerPerms(orgId, managerId, [...current]);
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

export function listOrgCampaigns(orgId: string): OrgCampaign[] {
  return store().orgCampaigns.filter((campaign) => campaign.orgId === orgId);
}

export function mockCreateOrgCampaign(data: {
  orgId: string;
  name: string;
  code: string;
  type: CampaignType;
  value: number;
  startsAt: number;
  endsAt: number;
  maxRedemptions: number;
  note: string;
}): void {
  if (!findOrg(data.orgId)) return;
  const now = Date.now();
  store().orgCampaigns.unshift({
    id: `ocmp-${Math.floor(1000 + Math.random() * 8999)}`,
    orgId: data.orgId,
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    type: data.type,
    value: data.value,
    status: data.startsAt > now ? "scheduled" : "active",
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    redemptions: 0,
    maxRedemptions: data.maxRedemptions,
    excludedBranchIds: [],
    note: data.note.trim(),
  });
}

export function mockUpdateOrgCampaign(
  orgId: string,
  campaignId: string,
  patch: Partial<Pick<OrgCampaign, "name" | "code" | "type" | "value" | "startsAt" | "endsAt" | "maxRedemptions" | "note">>,
): void {
  const campaign = store().orgCampaigns.find((item) => item.orgId === orgId && item.id === campaignId);
  if (!campaign) return;
  if (patch.name != null) campaign.name = patch.name.trim();
  if (patch.code != null) campaign.code = patch.code.trim().toUpperCase();
  if (patch.type != null) campaign.type = patch.type;
  if (patch.value != null) campaign.value = patch.value;
  if (patch.startsAt != null) campaign.startsAt = patch.startsAt;
  if (patch.endsAt != null) campaign.endsAt = patch.endsAt;
  if (patch.maxRedemptions != null) campaign.maxRedemptions = patch.maxRedemptions;
  if (patch.note != null) campaign.note = patch.note.trim();
}

export function mockSetOrgCampaignStatus(orgId: string, campaignId: string, status: CampaignStatus): void {
  const campaign = store().orgCampaigns.find((item) => item.orgId === orgId && item.id === campaignId);
  if (campaign) campaign.status = status;
}

export function mockDeleteOrgCampaign(orgId: string, campaignId: string): void {
  const s = store();
  s.orgCampaigns = s.orgCampaigns.filter((campaign) => campaign.orgId !== orgId || campaign.id !== campaignId);
}

export function mockToggleOrgCampaignBranch(orgId: string, campaignId: string, branchId: string): void {
  const org = findOrg(orgId);
  const campaign = store().orgCampaigns.find((item) => item.orgId === orgId && item.id === campaignId);
  if (!org?.branches.some((branch) => branch.id === branchId) || !campaign) return;
  const excluded = new Set(campaign.excludedBranchIds);
  if (excluded.has(branchId)) excluded.delete(branchId);
  else excluded.add(branchId);
  campaign.excludedBranchIds = [...excluded];
}

export function orgCampaignValidInBranch(orgId: string, campaignId: string, branchId: string): boolean {
  const campaign = store().orgCampaigns.find((item) => item.orgId === orgId && item.id === campaignId);
  if (!campaign || campaign.status !== "active") return false;
  const now = Date.now();
  if (campaign.startsAt > now || campaign.endsAt < now) return false;
  if (campaign.maxRedemptions > 0 && campaign.redemptions >= campaign.maxRedemptions) return false;
  return !campaign.excludedBranchIds.includes(branchId);
}

// ---- demo talepleri + ba?vuru kaynaklar? ----
export function mockAddDemoRequest(data: {
  name: string;
  requestKind: DemoRequestKind;
  email: string;
  phone: string;
  city: string;
  planId: DemoRequest["planId"];
  source: string;
  note: string;
}): void {
  store().demoRequests.unshift({
    id: "lead-" + Math.floor(1000 + Math.random() * 8999),
    name: data.name,
    kind: data.requestKind,
    email: data.email,
    phone: data.phone,
    city: data.city,
    planId: data.planId,
    source: data.source,
    note: data.note,
    requestedAt: Date.now(),
    status: "new",
    scheduledAt: null,
    notes: [],
  });
}

export function mockSetDemoStatus(requestId: string, status: DemoRequestStatus): void {
  const request = store().demoRequests.find((item) => item.id === requestId);
  if (request) request.status = status;
}

export function mockSetDemoSchedule(requestId: string, scheduledAt: number | null): void {
  const request = store().demoRequests.find((item) => item.id === requestId);
  if (!request) return;
  request.scheduledAt = scheduledAt;
  if (scheduledAt && request.status === "new") request.status = "contacted";
}

export function mockAddDemoNote(requestId: string, text: string, author: string): void {
  const request = store().demoRequests.find((item) => item.id === requestId);
  if (!request) return;
  request.notes.unshift({
    id: "lead-note-" + Math.floor(1000 + Math.random() * 8999),
    author,
    text,
    date: Date.now(),
  });
}

export function mockDeleteDemoNote(requestId: string, noteId: string): void {
  const request = store().demoRequests.find((item) => item.id === requestId);
  if (request) request.notes = request.notes.filter((note) => note.id !== noteId);
}

export function mockDeleteDemoRequest(requestId: string): void {
  const s = store();
  s.demoRequests = s.demoRequests.filter((item) => item.id !== requestId);
}

export function mockConnectIntegration(integrationId: IntegrationId, account: string, formName: string): void {
  const integration = store().integrations.find((item) => item.id === integrationId);
  if (!integration) return;
  integration.connected = true;
  integration.account = account;
  integration.formName = formName;
  integration.lastSync = Date.now();
}

export function mockSetIntegration(integrationId: IntegrationId, patch: IntegrationPatch): void {
  const integration = store().integrations.find((item) => item.id === integrationId);
  if (!integration) return;
  Object.assign(integration, patch);
}

export function mockDisconnectIntegration(integrationId: IntegrationId): void {
  const integration = store().integrations.find((item) => item.id === integrationId);
  if (!integration || integration.id === "webhook") return;
  integration.connected = false;
  integration.account = "";
  integration.formName = "";
  integration.lastSync = null;
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

export function mockSetBranchStatus(orgId: string, branchId: string, status: Org["branches"][0]["status"]): void {
  mockUpdateBranch(orgId, branchId, { status });
}

export function mockToggleBranchStatus(orgId: string, branchId: string): void {
  const o = findOrg(orgId);
  const branch = o?.branches.find((b) => b.id === branchId);
  if (!branch) return;
  branch.status = branch.status === "active" ? "suspended" : "active";
}

export function mockRemoveBranch(orgId: string, branchId: string): void {
  const o = findOrg(orgId);
  if (!o || o.branches.length <= 1) return;
  const branch = o.branches.find((b) => b.id === branchId);
  if (!branch) return;
  o.branches = o.branches.filter((b) => b.id !== branchId);
  o.seats = { used: Math.max(0, o.seats.used - branch.students), total: o.seats.total };
  o.coaches = { used: Math.max(0, o.coaches.used - branch.coaches), total: o.coaches.total };
  store().studentSubscriptions = store().studentSubscriptions.filter((sub) => sub.branchId !== branchId);
  store().orgInvites = store().orgInvites.filter((invite) => invite.branchId !== branchId);
  store().orgCampaigns.forEach((campaign) => {
    campaign.excludedBranchIds = campaign.excludedBranchIds.filter((id) => id !== branchId);
  });
  if (o.branches.length === 1 && o.type === "franchise") {
    o.type = "kurum";
  }
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
  if (o.coaches.used < o.coaches.total) {
    o.coaches = { used: o.coaches.used + 1, total: o.coaches.total };
    const branch = data.branchId
      ? o.branches.find((b) => b.id === data.branchId)
      : o.branches[0];
    if (branch) branch.coaches += 1;
  }
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
