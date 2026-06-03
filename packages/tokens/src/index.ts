export type AppRole = "student" | "coach" | "parent" | "branch" | "admin";

export type DbRole =
  | "STUDENT"
  | "COACH"
  | "PARENT"
  | "BRANCH_MANAGER"
  | "ORG_ADMIN";

export const colors = {
  background: "#0B1020",
  surface: "#141B2D",
  border: "#24304A",
  text: "#F5F7FB",
  muted: "#9AA7C0",
  primary: "#4F8CFF",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  student: "#4F8CFF",
  coach: "#22C55E",
  parent: "#A855F7",
  branch: "#F59E0B",
  admin: "#EF4444",
} as const;

export const roleTheme: Record<
  AppRole,
  { accent: string; label: string }
> = {
  student: { accent: colors.student, label: "Ogrenci" },
  coach: { accent: colors.coach, label: "Koc" },
  parent: { accent: colors.parent, label: "Veli" },
  branch: { accent: colors.branch, label: "Sube" },
  admin: { accent: colors.admin, label: "Admin" },
};

export const appRoleToDbRole: Record<AppRole, DbRole> = {
  student: "STUDENT",
  coach: "COACH",
  parent: "PARENT",
  branch: "BRANCH_MANAGER",
  admin: "ORG_ADMIN",
};

export const dbRoleToAppRole: Record<DbRole, AppRole> = {
  STUDENT: "student",
  COACH: "coach",
  PARENT: "parent",
  BRANCH_MANAGER: "branch",
  ORG_ADMIN: "admin",
};
