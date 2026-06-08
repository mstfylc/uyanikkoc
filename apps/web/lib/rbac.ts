import type { DbRole } from "@uyanik/tokens";
import { CRM_ISOLATION_SCOPE } from "@uyanik/contracts";
import type { AppRole } from "@uyanik/tokens";

export type LegacySessionRoleSnapshot = {
  userId: string;
  role: AppRole;
  dbRole?: DbRole;
};

export type SessionRoleSnapshot = {
  user: {
    id: string;
    role: AppRole;
    organizationId?: string | null;
    branchId?: string | null;
    studentId?: string | null;
    coachId?: string | null;
    parentId?: string | null;
  };
};

export type AnySessionRoleSnapshot = SessionRoleSnapshot | LegacySessionRoleSnapshot;

function resolveSessionRole(session: AnySessionRoleSnapshot | null): AppRole | null {
  if (!session) {
    return null;
  }

  if ("user" in session) {
    return session.user.role;
  }

  return session.role;
}

function hasSessionUser(session: AnySessionRoleSnapshot | null): boolean {
  if (!session) {
    return false;
  }

  if ("user" in session) {
    return Boolean(session.user?.role);
  }

  return Boolean(session.role);
}

export type StudentViewContext = {
  id: string;
  organizationId: string;
  branchId: string;
  coachId?: string | null;
  parentId?: string | null;
};

export const ROLE_HOME_PATH: Record<AppRole, string> = {
  student: "/student/dashboard",
  coach: "/coach/dashboard",
  parent: "/parent/dashboard",
  branch: "/yonetim/dashboard",
  admin: "/yonetim/dashboard",
};

const PUBLIC_PATHS = [
  "/login",
  "/post-login",
  "/register",
  "/api/auth",
  "/api/health",
  "/_next",
  "/assets",
  "/manifest.json",
  "/sw.js",
  "/offline",
  "/favicon.ico",
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (path === "/favicon.ico" || path === "/manifest.json" || path === "/sw.js") {
      return pathname === path;
    }

    if (path === "/login" || path === "/register" || path === "/offline") {
      return pathname === path || pathname.startsWith(`${path}/`);
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

const YONETIM_ADMIN_ONLY_PREFIXES = [
  "/yonetim/orgs",
  "/yonetim/licenses",
  "/yonetim/campaigns",
  "/yonetim/modules",
  "/yonetim/support",
] as const;

const YONETIM_BRANCH_ONLY_PREFIXES = [
  "/yonetim/branches",
  "/yonetim/license",
  "/yonetim/managers",
  "/yonetim/students",
  "/yonetim/reports",
  "/yonetim/settings",
] as const;

const YONETIM_COACH_ONLY_PREFIXES = [
  "/yonetim/dashboard",
  "/yonetim/license",
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** /yonetim hedefi icin login formunda onerilecek demo rolu. */
export function yonetimLoginRoleHint(
  pathname: string,
  roleParam?: string | null,
): "admin" | "branch" | "coach" | null {
  if (roleParam === "admin" || roleParam === "branch" || roleParam === "coach") {
    return roleParam;
  }
  if (!pathname.startsWith("/yonetim")) {
    return null;
  }
  if (YONETIM_ADMIN_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return "admin";
  }
  if (YONETIM_BRANCH_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return "branch";
  }
  return "admin";
}

export function loginHrefForPath(pathname: string, roleHint?: "admin" | "branch" | "coach" | null): string {
  const role = roleHint ?? yonetimLoginRoleHint(pathname);
  const base = `/login?next=${encodeURIComponent(pathname)}`;
  return role ? `${base}&role=${role}` : base;
}

function yonetimMismatchRedirect(role: AppRole, pathname: string): string | null {
  if (!pathname.startsWith("/yonetim")) {
    return null;
  }
  // Super Admin hiçbir yönetim ekranından geri yönlendirilmez; yalnızca kurum
  // yöneticisi platform ekranlarına girmeye çalışınca uyarılır.
  if (
    role === "branch" &&
    YONETIM_ADMIN_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
  ) {
    return "/yonetim/dashboard?need=superadmin";
  }
  if (
    role === "coach" &&
    !YONETIM_COACH_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
  ) {
    return "/yonetim/dashboard?need=coach";
  }
  return null;
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname.startsWith("/student")) {
    return role === "student";
  }

  if (pathname.startsWith("/coach")) {
    return role === "coach";
  }

  if (pathname.startsWith("/parent")) {
    return role === "parent";
  }

  if (pathname.startsWith("/yonetim")) {
    if (role !== "admin" && role !== "branch" && role !== "coach") {
      return false;
    }
    if (role === "coach") {
      return YONETIM_COACH_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
    }
    // Super Admin (admin) tüm yönetim ekranlarına erişir (hiyerarşik superset).
    // Kurum yöneticisi (branch) yalnızca platform/franchise ekranlarından kısıtlanır.
    if (
      role === "branch" &&
      YONETIM_ADMIN_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
    ) {
      return false;
    }
    return true;
  }

  if (pathname.startsWith("/branch")) {
    return role === "branch";
  }

  if (pathname.startsWith("/admin")) {
    return role === "admin";
  }

  return true;
}

export function getUnauthorizedRedirect(
  pathname: string,
  session: AnySessionRoleSnapshot | null,
): string | null {
  if (isPublicPath(pathname)) {
    return null;
  }

  if (!hasSessionUser(session)) {
    return loginHrefForPath(pathname);
  }

  const role = resolveSessionRole(session);
  if (!role || !canAccessPath(role, pathname)) {
    const mismatch = role ? yonetimMismatchRedirect(role, pathname) : null;
    if (mismatch) {
      return mismatch;
    }
    return role ? ROLE_HOME_PATH[role] : loginHrefForPath(pathname);
  }

  return null;
}

export function canViewStudent(
  session: SessionRoleSnapshot,
  student: StudentViewContext,
): boolean {
  const { user } = session;
  const sameOrganization = user.organizationId === student.organizationId;
  const sameBranch = user.branchId === student.branchId;

  switch (user.role) {
    case "admin":
      return sameOrganization;
    case "branch":
      return sameOrganization && sameBranch && CRM_ISOLATION_SCOPE === "branch";
    case "coach":
      return sameBranch && user.coachId != null && user.coachId === student.coachId;
    case "parent":
      return user.parentId != null && user.parentId === student.parentId;
    case "student":
      return user.studentId === student.id;
    default:
      return false;
  }
}
