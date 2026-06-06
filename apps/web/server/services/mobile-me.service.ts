/** Mobil bootstrap (handoff M4) — /api/me için tek istekte profil + rol + sayaçlar.
 * Bellek modu: demo kullanıcıdan derlenir. DB modunda mevcut student/odev/mesaj
 * servislerinden aggregate edilecek (follow-up). */
import { findDemoUserById, toApiUser, type ApiUser } from "@/server/auth/mobile-tokens";
import { MobileAuthError } from "./mobile-auth.service";

export interface MeStudent {
  grade: string;
  goal: string;
  coachName: string;
  streak: number;
  weekHours: number;
  totalNet: number;
}

export interface MeResponse {
  user: ApiUser;
  student?: MeStudent;
  counts: { pendingOdev: number; unreadMessages: number };
}

export async function buildMe(userId: string): Promise<MeResponse> {
  const record = findDemoUserById(userId);
  if (!record) throw new MobileAuthError(404, "Kullanıcı bulunamadı", "user_not_found");
  const user = toApiUser(record);
  const isStudent = user.role === "student";

  return {
    user,
    student: isStudent
      ? {
          grade: "11. Sınıf · Sayısal",
          goal: "YKS 2026",
          coachName: "Dilek Emen",
          streak: 12,
          weekHours: 23.5,
          totalNet: 312,
        }
      : undefined,
    counts: { pendingOdev: isStudent ? 4 : 0, unreadMessages: 2 },
  };
}
