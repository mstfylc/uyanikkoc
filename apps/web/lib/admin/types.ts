// Admin (Süper Admin + Kurum/Şube) alan tipleri.
// Prototip kaynağı: admin/admin-data.jsx (window.* store) → tipli TS.
// apps/web/lib/admin/types.ts

export type LicenseStatus =
  | "active"
  | "trial"
  | "expiring"
  | "overdue"
  | "suspended"
  | "canceled";

export type OrgType = "franchise" | "kurum";
export type BillingCycle = "monthly" | "annual";

export type ModuleKey =
  | "denemeAnaliz"
  | "raporlar"
  | "mesajlasma"
  | "randevu"
  | "veliPaneli"
  | "onlineDeneme"
  | "aiKoc"
  | "envanter";

export type ModuleFlags = Record<ModuleKey, boolean>;

export type ModuleDef = {
  key: ModuleKey;
  name: string;
  icon: string;
  desc: string;
  premium?: boolean;
};

export type Capacity = { used: number; total: number };

export type Branch = {
  id: string;
  name: string;
  city: string;
  students: number;
  coaches: number;
  collect: number;
  status: LicenseStatus;
};

export type OrgOwner = { name: string; email: string; phone: string };

// Kuruma atanmış yönetici kullanıcı (tek kuruma birden fazla yönetici olabilir).
export type OrgManagerRole = "owner" | "manager";
export type OrgManager = {
  id: string;
  name: string;
  email: string;
  role: OrgManagerRole;
  addedAt: number;
  status: "active" | "invited";
};

export type Org = {
  id: string;
  name: string;
  type: OrgType;
  city: string;
  planId: OrgPlanId;
  status: LicenseStatus;
  cycle: BillingCycle;
  startedAt: number;
  renewsAt: number;
  feeMonthly: number;
  seats: Capacity;
  coaches: Capacity;
  modules: ModuleFlags;
  owner: OrgOwner;
  managers: OrgManager[];
  tone: string;
  branches: Branch[];
  /** Süper admin tarafından tanımlanmış ücretsiz demo bitiş tarihi. */
  giftedDemoUntil?: number;
};

export type CoachInvoice = {
  id: string;
  date: number;
  amount: number;
  planId: CoachPlanId;
  status: "paid" | "failed" | "pending";
  method: string;
};

export type SoloCoach = {
  id: string;
  name: string;
  city: string;
  planId: CoachPlanId;
  status: LicenseStatus;
  cycle: BillingCycle;
  startedAt: number;
  renewsAt: number;
  feeMonthly: number;
  autoRenew: boolean;
  seats: Capacity;
  rating: number;
  email: string;
  phone: string;
  modules: ModuleFlags;
  invoices: CoachInvoice[];
  /** Süper admin tarafından tanımlanmış ücretsiz demo bitiş tarihi. */
  giftedDemoUntil?: number;
};

// Lisanslı abone (kurum veya bireysel koç) üzerine süper admin notu.
export type LicenseSubjectKind = "org" | "coach";
export type LicenseNote = {
  id: string;
  subjectKind: LicenseSubjectKind;
  subjectId: string;
  text: string;
  author: string;
  date: number;
};

// ---- Kampanya / promosyon kodu modülü ----
export type CampaignType = "percent" | "amount" | "freeDays";
export type CampaignAudience = "all" | "orgs" | "coaches";
export type CampaignStatus = "active" | "scheduled" | "ended";

export type Campaign = {
  id: string;
  name: string;
  code: string;
  type: CampaignType;
  value: number; // percent: %, amount: ₺, freeDays: gün
  audience: CampaignAudience;
  status: CampaignStatus;
  startsAt: number;
  endsAt: number;
  redemptions: number;
  maxRedemptions: number; // 0 = sınırsız
  note: string;
};

export type CampaignGrant = {
  id: string;
  campaignId: string;
  subjectKind: LicenseSubjectKind;
  subjectId: string;
  subjectName: string;
  grantedAt: number;
  redeemed: boolean;
};

export type OrgInvoice = {
  id: string;
  orgId: string;
  orgName: string;
  date: number;
  amount: number;
  status: "paid" | "pending";
  plan: string;
  method: string;
};

export type OrgPlanId = "baslangic" | "pro" | "franchise";
export type CoachPlanId = "c-baslangic" | "c-pro" | "c-sinirsiz";

export type OrgPlan = {
  id: OrgPlanId;
  name: string;
  color: string;
  monthly: number;
  seats: number;
  coaches: number;
  branches: number;
  tagline: string;
  modules: ModuleKey[];
  popular?: boolean;
};

export type CoachPlan = {
  id: CoachPlanId;
  name: string;
  color: string;
  monthly: number;
  annual: number;
  seats: number;
  tagline: string;
  features: string[];
  modules: ModuleKey[];
  popular?: boolean;
};

// Kurumun koçuna atadığı görev.
export type TaskPriority = "low" | "med" | "high";
export type TaskStatus = "open" | "done";

export type CoachTask = {
  id: string;
  orgId: string;
  coachId: string;
  title: string;
  detail: string;
  due: number;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
};

// Öğrenci / veli tarafından koça verilen geri bildirim (puan + yorum).
export type FeedbackAuthorRole = "student" | "parent";

export type CoachFeedback = {
  id: string;
  orgId: string;
  coachId: string;
  author: string;
  role: FeedbackAuthorRole;
  rating: number; // 1–5
  comment: string;
  date: number;
};

// ---- Süper admin ekip & erişim rolleri ----
// "full": tam yetki. "support": yalnızca Destek & Sistem'de yazma; diğer alanlar salt-görüntüleme.
export type AdminAccess = "full" | "support";

export type AdminTeamMember = {
  id: string;
  name: string;
  email: string;
  access: AdminAccess;
  lastActive: number;
  status: "active" | "invited";
};

export type TicketStatus = "open" | "answered" | "resolved";

export type TicketMessage = {
  id: string;
  author: string;
  role: "user" | "agent";
  text: string;
  date: number;
};

export type SupportTicket = {
  id: string;
  org: string;
  subj: string;
  priority: "Yüksek" | "Orta" | "Düşük";
  tone: "danger" | "warning" | "info";
  time: string;
  status: TicketStatus;
  messages: TicketMessage[];
};

export type SystemNote = {
  id: string;
  author: string;
  text: string;
  date: number;
  pinned: boolean;
};

export type AdminSnapshot = {
  orgs: Org[];
  coaches: SoloCoach[];
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
  /** Demo: oturum açan süper admin kullanıcısının erişim seviyesi. */
  viewerAccess: AdminAccess;
  activeOrgId: string;
  myCoachId: string;
  activeOrgCoachId: string;
};

export type PlatformMetrics = {
  orgs: number;
  franchises: number;
  activeCoaches: number;
  totalCoaches: number;
  students: number;
  branches: number;
  mrr: number;
  arr: number;
  orgMrr: number;
  coachMrr: number;
  atRisk: number;
};

// ---- Mutasyon sözleşmesi (client → /api/admin/mutate) ----
export type AdminMutation =
  | { kind: "renewOrg"; orgId: string }
  // detaylı yenileme: süre (ay) + paket seçimi
  | { kind: "renewOrgPlan"; orgId: string; months: number; planId: OrgPlanId }
  | { kind: "renewCoachPlan"; coachId: string; months: number; planId: CoachPlanId }
  | { kind: "suspendOrg"; orgId: string }
  | { kind: "activateOrg"; orgId: string }
  | { kind: "changeOrgPlan"; orgId: string; planId: OrgPlanId }
  | { kind: "addOrgSeats"; orgId: string; count: number }
  | { kind: "toggleOrgModule"; orgId: string; moduleKey: ModuleKey }
  | {
      kind: "updateOrgProfile";
      orgId: string;
      name: string;
      tone: string;
      email: string;
      phone: string;
    }
  | { kind: "suspendCoach"; coachId: string }
  | { kind: "activateCoach"; coachId: string }
  | { kind: "setActiveOrg"; orgId: string }
  | {
      kind: "assignTask";
      orgId: string;
      coachId: string;
      title: string;
      detail: string;
      due: number;
      priority: TaskPriority;
    }
  | { kind: "completeTask"; taskId: string }
  | { kind: "deleteTask"; taskId: string }
  | { kind: "removeOrgCoach"; coachId: string }
  | { kind: "restoreOrgCoach"; coachId: string }
  // kurum yöneticileri (çoklu)
  | { kind: "inviteOrgManager"; orgId: string; name: string; email: string; role: OrgManagerRole }
  | { kind: "removeOrgManager"; orgId: string; managerId: string }
  | { kind: "setOrgManagerRole"; orgId: string; managerId: string; role: OrgManagerRole }
  // süper admin ekip & erişim
  | { kind: "inviteAdminMember"; name: string; email: string; access: AdminAccess }
  | { kind: "removeAdminMember"; memberId: string }
  | { kind: "setAdminAccess"; memberId: string; access: AdminAccess }
  // destek & sistem (destek yetkilisi de yapabilir)
  | { kind: "replyTicket"; ticketId: string; text: string; author: string }
  | { kind: "setTicketStatus"; ticketId: string; status: TicketStatus }
  | { kind: "addSystemNote"; text: string; author: string }
  | { kind: "deleteSystemNote"; noteId: string }
  // lisanslı abone profili: not + ücretsiz demo
  | { kind: "addLicenseNote"; subjectKind: LicenseSubjectKind; subjectId: string; text: string; author: string }
  | { kind: "deleteLicenseNote"; noteId: string }
  | { kind: "grantDemo"; subjectKind: LicenseSubjectKind; subjectId: string; days: number; author: string }
  // kampanya / promosyon
  | {
      kind: "createCampaign";
      name: string;
      code: string;
      type: CampaignType;
      value: number;
      audience: CampaignAudience;
      startsAt: number;
      endsAt: number;
      maxRedemptions: number;
      note: string;
    }
  | { kind: "setCampaignStatus"; campaignId: string; status: CampaignStatus }
  | { kind: "deleteCampaign"; campaignId: string }
  | { kind: "grantCampaign"; campaignId: string; subjectKind: LicenseSubjectKind; subjectId: string };
