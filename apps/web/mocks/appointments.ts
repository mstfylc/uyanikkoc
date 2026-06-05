import type {
  AppointmentDay,
  AppointmentRecord,
  AppointmentSettingsRecord,
  AppointmentStatus,
} from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const APPOINTMENT_DAYS: AppointmentDay[] = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt"];
export const APPOINTMENT_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const globalStore = globalThis as typeof globalThis & {
  __uyanikAppointments?: AppointmentRecord[];
  __uyanikAppointmentSettings?: Record<string, AppointmentSettingsRecord>;
};

const appointments = globalStore.__uyanikAppointments ?? (globalStore.__uyanikAppointments = []);
const settingsByCoach =
  globalStore.__uyanikAppointmentSettings ?? (globalStore.__uyanikAppointmentSettings = {});

function nowIso(): string {
  return new Date().toISOString();
}

function defaultSettings(coachId: string): AppointmentSettingsRecord {
  return {
    coachId,
    weeklyLimit: 2,
    allowOnline: true,
    allowInPerson: true,
    availability: {
      Pzt: ["16:00", "17:00", "18:00"],
      Sal: ["17:00", "18:00", "19:00"],
      Car: ["16:00", "17:00"],
      Per: ["18:00", "19:00", "20:00"],
      Cum: ["16:00", "17:00", "18:00"],
      Cmt: ["10:00", "11:00", "13:00", "14:00"],
    },
  };
}

function seedIfEmpty() {
  if (appointments.length > 0) {
    return;
  }

  const timestamp = nowIso();
  appointments.push(
    {
      id: "appt_001",
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      studentName: "Demo Ogrenci",
      day: "Pzt",
      slot: "17:00",
      mode: "in_person",
      topic: "Turev konusunda zorlaniyorum",
      status: "approved",
      createdAt: timestamp,
    },
    {
      id: "appt_002",
      coachId: "coach_001",
      studentId: "student_002",
      studentName: "Demo Ogrenci 2",
      day: "Sal",
      slot: "18:00",
      mode: "online",
      topic: "AYT matematik strateji",
      status: "pending",
      createdAt: timestamp,
    },
  );
}

export function getAppointmentSettings(coachId: string): AppointmentSettingsRecord {
  if (!settingsByCoach[coachId]) {
    settingsByCoach[coachId] = defaultSettings(coachId);
  }
  return settingsByCoach[coachId];
}

export function updateAppointmentSettings(
  coachId: string,
  patch: Partial<Omit<AppointmentSettingsRecord, "coachId">>,
): AppointmentSettingsRecord {
  const current = getAppointmentSettings(coachId);
  settingsByCoach[coachId] = { ...current, ...patch, coachId };
  return settingsByCoach[coachId];
}

export function listAppointmentsForCoach(coachId: string): AppointmentRecord[] {
  seedIfEmpty();
  return appointments.filter((item) => item.coachId === coachId);
}

export function listAppointmentsForStudent(studentId: string): AppointmentRecord[] {
  seedIfEmpty();
  return appointments.filter((item) => item.studentId === studentId);
}

export function countActiveAppointmentsForStudent(studentId: string): number {
  return listAppointmentsForStudent(studentId).filter(
    (item) => item.status !== "rejected" && item.status !== "cancelled",
  ).length;
}

export function createAppointment(
  input: Omit<AppointmentRecord, "id" | "createdAt" | "status">,
): AppointmentRecord {
  seedIfEmpty();
  const record: AppointmentRecord = {
    ...input,
    id: `appt_${Date.now()}`,
    status: "pending",
    createdAt: nowIso(),
  };
  appointments.unshift(record);
  return record;
}

export function setAppointmentStatus(id: string, status: AppointmentStatus): AppointmentRecord | null {
  seedIfEmpty();
  const index = appointments.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }
  appointments[index] = { ...appointments[index], status };
  return appointments[index];
}
