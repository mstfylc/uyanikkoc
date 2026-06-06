import type { AppRole } from "@uyanik/tokens";

export type UkNavItem = {
  href: string;
  label: string;
  icon: string;
  tag?: string;
};

const STUDENT_NAV: UkNavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: "ki-element-11" },
  { href: "/student/schedule", label: "Calisma Programi", icon: "ki-calendar" },
  { href: "/student/topics", label: "Konu Takibi", icon: "ki-book-open" },
  { href: "/student/exams", label: "Denemeler", icon: "ki-chart-simple" },
  { href: "/student/assignments", label: "Odevlerim", icon: "ki-notepad-edit" },
  { href: "/student/messages", label: "Mesajlar", icon: "ki-messages" },
  { href: "/student/appointments", label: "Randevular", icon: "ki-calendar-tick" },
  { href: "/student/tests", label: "Testlerim", icon: "ki-star" },
  { href: "/student/ai-coach", label: "AI Koc", icon: "ki-technology-2", tag: "Yakinda" },
  { href: "/student/motivation", label: "Motivasyon", icon: "ki-flame" },
  { href: "/student/billing", label: "Abonelik", icon: "ki-wallet" },
];

const COACH_NAV: UkNavItem[] = [
  { href: "/coach/dashboard", label: "Dashboard", icon: "ki-element-11" },
  { href: "/coach/students", label: "Ogrencilerim", icon: "ki-people" },
  { href: "/coach/topics", label: "Konu Takibi", icon: "ki-book-open" },
  { href: "/coach/assignments", label: "Odev & Gorev", icon: "ki-notepad-edit" },
  { href: "/coach/exams", label: "Denemeler", icon: "ki-chart-simple" },
  { href: "/coach/messages", label: "Mesajlar", icon: "ki-messages" },
  { href: "/coach/appointments", label: "Randevular", icon: "ki-calendar-tick" },
  { href: "/coach/tests", label: "Envanter & Testler", icon: "ki-star" },
  { href: "/coach/reports", label: "Raporlar", icon: "ki-chart-line-up" },
  { href: "/coach/revenue", label: "Gelir & Tahsilat", icon: "ki-dollar" },
];

const PARENT_NAV: UkNavItem[] = [
  { href: "/parent/dashboard", label: "Genel Bakis", icon: "ki-element-11" },
  { href: "/parent/exams", label: "Deneme Sonuclari", icon: "ki-chart-simple" },
  { href: "/parent/reports", label: "Gelisim Raporlari", icon: "ki-notepad-edit" },
  { href: "/parent/messages", label: "Mesajlar", icon: "ki-messages" },
  { href: "/parent/appointments", label: "Randevular", icon: "ki-calendar-tick" },
  { href: "/parent/billing", label: "Abonelik", icon: "ki-wallet" },
  { href: "/parent/notifications", label: "Bildirimler", icon: "ki-notification-on" },
];

const BRANCH_NAV: UkNavItem[] = [
  { href: "/branch/dashboard", label: "Dashboard", icon: "ki-element-11" },
];

const ADMIN_NAV: UkNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "ki-element-11" },
];

export const UK_ROLE_CRUMB: Record<AppRole, string> = {
  student: "Ogrenci Paneli",
  coach: "Koc Paneli",
  parent: "Veli Paneli",
  branch: "Sube Paneli",
  admin: "Admin Paneli",
};

export function getUkNavItems(role: AppRole): UkNavItem[] {
  switch (role) {
    case "student":
      return STUDENT_NAV;
    case "coach":
      return COACH_NAV;
    case "parent":
      return PARENT_NAV;
    case "branch":
      return BRANCH_NAV;
    case "admin":
      return ADMIN_NAV;
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
  return `/${role}/profile`;
}

export function findUkNavItem(role: AppRole, pathname: string): UkNavItem | undefined {
  const items = [...getUkNavItems(role), ...getUkGeneralNavItems(role)];
  if (pathname === getProfileHref(role)) {
    return { href: pathname, label: "Profil", icon: "ki-profile-circle" };
  }
  return items.find(
    (item) => pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(`${item.href}/`)),
  );
}
