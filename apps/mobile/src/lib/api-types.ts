/* Mobil ↔ backend API sözleşmesi (handoff M1–M5 ile uyumlu).
 * Sunucu tarafı Zod şemaları packages/contracts'a eklendiğinde buradan türetilebilir. */
import type { Exam, Odev, OdevResult, ScheduleBlock, TrendPoint, Upcoming, Week } from "../types";

export type DevicePlatform = "ios" | "android";

export interface ApiUser {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  phone?: string;
}

/** /api/me bootstrap — öğrenciye özel özet (rol student ise). */
export interface MeStudent {
  grade: string;
  goal: string;
  coachName: string;
  streak: number;
  weekHours: number;
  totalNet: number;
}

export interface MeCounts {
  pendingOdev: number;
  unreadMessages: number;
}

export interface MeResponse {
  user: ApiUser;
  student?: MeStudent;
  counts: MeCounts;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: ApiUser;
}

export interface OtpRequestResponse {
  /** Yeniden gönderim için bekleme süresi (ms). */
  resendInMs: number;
}

// --- Domain (öğrenci) uçları ---
export interface OdevResponse {
  weeks: Week[];
  items: Odev[];
}

export interface OdevResultBody {
  id: string;
  result: OdevResult | null;
}

export interface ExamsResponse {
  exams: Exam[];
  trend: TrendPoint[];
  upcoming: Upcoming;
}

export interface ScheduleResponse {
  days: string[];
  daysFull: Record<string, string>;
  today: string;
  schedule: Record<string, ScheduleBlock[]>;
}
