/**
 * Mobil token oturumu — paylaşılan sır/eşleme yardımcıları.
 * NextAuth cookie oturumuna paraleldir; ona dokunmaz.
 */
import { dbRoleToAppRole } from "@uyanik/tokens";
import type { AuthRole } from "@uyanik/shared/token";
import type { AuthUserRecord } from "@uyanik/database";
import { demoUsers, type DemoUser } from "@/lib/auth/demo-users";

/** Access JWT imzalama sırrı. Production'da zorunlu; dev/bellek modunda fallback. */
export function accessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_ACCESS_SECRET is required in production");
  }
  return "dev-access-secret-change-me";
}

/** OTP hash pepper'ı. Production'da zorunlu; dev/bellek modunda fallback. */
export function otpPepper(): string {
  const pepper = process.env.OTP_PEPPER?.trim();
  if (pepper) return pepper;
  if (process.env.NODE_ENV === "production") {
    throw new Error("OTP_PEPPER is required in production");
  }
  return "dev-otp-pepper-change-me";
}

/** Mobil API'nin döndürdüğü kullanıcı özeti. */
export interface ApiUser {
  id: string;
  name: string;
  role: AuthRole;
  avatarInitials: string;
  phone?: string;
}

/** Demo kullanıcılar için okunur isimler (bellek modu). */
const DEMO_NAMES: Record<string, string> = {
  user_student_001: "Elif Yıldız",
  user_student_002: "Kerem Demir",
  user_coach_001: "Dilek Emen",
  user_parent_001: "Ayşe Yıldız",
  user_branch_001: "Şube Yöneticisi",
  user_admin_001: "Sistem Yöneticisi",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function nameFor(id: string, email: string): string {
  return DEMO_NAMES[id] ?? email.split("@")[0];
}

export function toApiUser(record: AuthUserRecord, phone?: string): ApiUser {
  const name = nameFor(record.id, record.email);
  return {
    id: record.id,
    name,
    role: dbRoleToAppRole[record.role],
    avatarInitials: initialsOf(name),
    phone,
  };
}

export function mapDemoUser(user: DemoUser): AuthUserRecord {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    studentId: user.studentId ?? null,
    coachId: user.coachId ?? null,
    parentId: user.parentId ?? null,
  };
}

export function findDemoUserById(id: string): AuthUserRecord | null {
  const u = demoUsers.find((d) => d.id === id);
  return u ? mapDemoUser(u) : null;
}

/** Bellek modunda telefonla giren her kullanıcı demo öğrenciye eşlenir. */
export function demoStudentRecord(): AuthUserRecord {
  const student = demoUsers.find((d) => d.role === "STUDENT");
  if (!student) throw new Error("Demo student user missing");
  return mapDemoUser(student);
}
