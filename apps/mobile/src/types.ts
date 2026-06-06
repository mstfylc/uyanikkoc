/* Uyanık Koç mobil — alan tipleri (öğrenci uygulaması). */

import type { IconName } from "./ui/icons";

export type ThemeMode = "light" | "dark";
export type TabId = "home" | "odevler" | "denemeler" | "program" | "profil";

export type OdevTypeKey = "soru" | "video" | "konu" | "test";
export type OdevStatus = "pending" | "done";

export interface OdevResult {
  d: number;
  y: number;
  b: number;
}

export interface Odev {
  id: string;
  week: string;
  subject: string;
  topic: string;
  types: OdevTypeKey[];
  count?: number;
  source: string;
  due: string;
  status: OdevStatus;
  note?: string;
  result?: OdevResult | null;
}

export interface OdevTypeMeta {
  label: string;
  icon: IconName;
  needsResult: boolean;
}

export interface Week {
  id: string;
  label: string;
  range: string;
}

export interface ExamPart {
  n: string;
  net: number;
  max: number;
}

export interface Exam {
  id: string;
  name: string;
  pub: string;
  type: string;
  date: string;
  net: number;
  rank: string;
  delta: string;
  parts: ExamPart[];
}

export interface TrendPoint {
  l: string;
  v: number;
}

export interface Upcoming {
  name: string;
  org: string;
  date: string;
  time: string;
}

export interface SubjectProgress {
  name: string;
  pct: number;
  net: string;
  trend: "up" | "down" | "flat";
}

export interface ScheduleBlock {
  t: string;
  e: string;
  subj: string;
  topic: string;
  type: string;
  done?: boolean;
}

export interface Achievement {
  name: string;
  icon: IconName;
  earned: boolean;
}

export interface Student {
  name: string;
  first: string;
  grade: string;
  goal: string;
  coach: string;
  streak: number;
  weekHours: number;
  net: number;
}
