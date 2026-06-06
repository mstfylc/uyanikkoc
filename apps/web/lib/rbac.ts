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

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
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
    if (role !== "admin" && role !== "branch") {
      return false;
    }
    if (
      role === "branch" &&
      YONETIM_ADMIN_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
    ) {
      return false;
    }
    if (
      role === "admin" &&
      YONETIM_BRANCH_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
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
    return `/login?next=${encodeURIComponent(pathname)}`;
  }

  const role = resolveSessionRole(session);
  if (!role || !canAccessPath(role, pathname)) {
    return role ? ROLE_HOME_PATH[role] : `/login?next=${encodeURIComponent(pathname)}`;
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
