import type { AppRole } from "@uyanik/tokens";

export type UkNavItem = {
  href: string;
  label: string;
  icon: string;
  tag?: string;
};

const STUDENT_NAV: UkNavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: "ki-element-11" },
  { href: "/student/schedule", label: "Çalışma Programı", icon: "ki-calendar" },
  { href: "/student/topics", label: "Konu Takibi", icon: "ki-book-open" },
  { href: "/student/exams", label: "Denemeler", icon: "ki-chart-simple" },
  { href: "/student/assignments", label: "Ödevlerim", icon: "ki-notepad-edit" },
  { href: "/student/mistakes", label: "Yanlış Defteri", icon: "ki-shield-cross", tag: "Yeni" },
  { href: "/student/messages", label: "Mesajlar", icon: "ki-messages" },
  { href: "/student/appointments", label: "Randevular", icon: "ki-calendar-tick" },
  { href: "/student/tests", label: "Testlerim", icon: "ki-star" },
  { href: "/student/ai-coach", label: "AI Koç", icon: "ki-technology-2", tag: "Yakında" },
  { href: "/student/motivation", label: "Motivasyon", icon: "ki-flame" },
  { href: "/student/billing", label: "Abonelik", icon: "ki-wallet" },
];

const COACH_NAV: UkNavItem[] = [
  { href: "/coach/dashboard", label: "Dashboard", icon: "ki-element-11" },
  { href: "/coach/students", label: "Öğrencilerim", icon: "ki-people" },
  { href: "/coach/topics", label: "Konu Takibi", icon: "ki-book-open" },
  { href: "/coach/topics/annual", label: "Yıllık Çizelge", icon: "ki-notebook", tag: "Yeni" },
  { href: "/coach/assignments", label: "Ödev & Görev", icon: "ki-notepad-edit" },
  { href: "/coach/exams", label: "Denemeler", icon: "ki-chart-simple" },
  { href: "/coach/messages", label: "Mesajlar", icon: "ki-messages" },
  { href: "/coach/notifications", label: "Bildirimler", icon: "ki-notification-on" },
  { href: "/coach/appointments", label: "Randevular", icon: "ki-calendar-tick" },
  { href: "/coach/tests", label: "Envanter & Testler", icon: "ki-star" },
  { href: "/coach/feedback", label: "Geri Bildirimlerim", icon: "ki-heart" },
  { href: "/coach/reports", label: "Raporlar", icon: "ki-chart-line-up" },
  { href: "/coach/revenue", label: "Gelir & Tahsilat", icon: "ki-dollar" },
  { href: "/coach/license", label: "Lisansim", icon: "ki-shield-tick" },
  { href: "/coach/invoices", label: "Faturalar", icon: "ki-receipt-square" },
];

const PARENT_NAV: UkNavItem[] = [
  { href: "/parent/dashboard", label: "Genel Bakış", icon: "ki-element-11" },
  { href: "/parent/exams", label: "Deneme Sonuçları", icon: "ki-chart-simple" },
  { href: "/parent/reports", label: "Gelişim Raporları", icon: "ki-notepad-edit" },
  { href: "/parent/messages", label: "Mesajlar", icon: "ki-messages" },
  { href: "/parent/appointments", label: "Randevular", icon: "ki-calendar-tick" },
  { href: "/parent/billing", label: "Abonelik", icon: "ki-wallet" },
  { href: "/parent/notifications", label: "Bildirimler", icon: "ki-notification-on" },
];

const YONETIM_BRANCH_NAV: UkNavItem[] = [
  { href: "/yonetim/dashboard", label: "Dashboard", icon: "ki-element-11" },
  { href: "/yonetim/coaches", label: "Koçlar", icon: "ki-people" },
  { href: "/yonetim/students", label: "Öğrenciler", icon: "ki-teacher" },
  { href: "/yonetim/branches", label: "Şubeler", icon: "ki-office-bag" },
  { href: "/yonetim/license", label: "Lisans & Kapasite", icon: "ki-shield-tick" },
  { href: "/yonetim/revenue", label: "Gelir & Tahsilat", icon: "ki-dollar" },
  { href: "/yonetim/reports", label: "Raporlar", icon: "ki-chart-line-up" },
  { href: "/yonetim/managers", label: "Yöneticiler", icon: "ki-crown-2" },
  { href: "/yonetim/settings", label: "Ayarlar", icon: "ki-setting-2" },
];

// Super Admin tüm yönetim ekranlarına erişir (platform + kurum), bu yüzden nav
// branch panelindeki kurum ekranlarını da içerir (hiyerarşik superset).
const YONETIM_ADMIN_NAV: UkNavItem[] = [
  { href: "/yonetim/dashboard", label: "Genel Bakış", icon: "ki-element-11" },
  { href: "/yonetim/orgs", label: "Kurumlar & Franchise", icon: "ki-office-bag" },
  { href: "/yonetim/branches", label: "Şubeler", icon: "ki-flag" },
  { href: "/yonetim/licenses", label: "Lisans Takibi", icon: "ki-shield-tick" },
  { href: "/yonetim/leads", label: "Demo & Üyelikler", icon: "ki-clipboard" },
  { href: "/yonetim/license", label: "Lisans & Kapasite", icon: "ki-chart-pie-simple" },
  { href: "/yonetim/coaches", label: "Koçlar", icon: "ki-people" },
  { href: "/yonetim/students", label: "Öğrenciler", icon: "ki-teacher" },
  { href: "/yonetim/managers", label: "Yöneticiler", icon: "ki-crown-2" },
  { href: "/yonetim/revenue", label: "Gelir & Faturalama", icon: "ki-dollar" },
  { href: "/yonetim/reports", label: "Raporlar", icon: "ki-chart-line-up" },
  { href: "/yonetim/campaigns", label: "Kampanyalar", icon: "ki-flash" },
  { href: "/yonetim/modules", label: "Modül Bayrakları", icon: "ki-technology-2" },
  { href: "/yonetim/support", label: "Destek & Sistem", icon: "ki-messages" },
  { href: "/yonetim/settings", label: "Ayarlar", icon: "ki-setting-2" },
];

export const UK_ROLE_CRUMB: Record<AppRole, string> = {
  student: "Öğrenci Paneli",
  coach: "Koç Paneli",
  parent: "Veli Paneli",
  branch: "Kurum Paneli",
  admin: "Super Admin",
};

function dashboardHref(role: AppRole): string {
  if (role === "admin" || role === "branch") {
    return "/yonetim/dashboard";
  }
  return `/${role}/dashboard`;
}

export { dashboardHref };

export function getUkNavItems(role: AppRole): UkNavItem[] {
  switch (role) {
    case "student":
      return STUDENT_NAV;
    case "coach":
      return COACH_NAV;
    case "parent":
      return PARENT_NAV;
    case "branch":
      return YONETIM_BRANCH_NAV;
    case "admin":
      return YONETIM_ADMIN_NAV;
    default:
      return [];
  }
}

export function getUkGeneralNavItems(role: AppRole): UkNavItem[] {
  if (role === "branch" || role === "admin") {
    return [];
  }
  return [
    { href: `/${role}/support`, label: "Destek", icon: "ki-message-text" },
    { href: `/${role}/settings`, label: "Ayarlar", icon: "ki-setting-2" },
  ];
}

export function getProfileHref(role: AppRole): string {
  if (role === "admin" || role === "branch") {
    return "/yonetim/profile";
  }
  return `/${role}/profile`;
}

export function findUkNavItem(role: AppRole, pathname: string): UkNavItem | undefined {
  const items = [...getUkNavItems(role), ...getUkGeneralNavItems(role)];
  const dash = dashboardHref(role);
  if (pathname === getProfileHref(role)) {
    return { href: pathname, label: "Profil", icon: "ki-profile-circle" };
  }
  return items.find(
    (item) => pathname === item.href || (item.href !== dash && pathname.startsWith(`${item.href}/`)),
  );
}
