import { prisma } from "../client";
import type {
  AppointmentDay,
  AppointmentMode,
  AppointmentRecord,
  AppointmentSettingsRecord,
  AppointmentStatus,
} from "../types";

const APPOINTMENT_DAYS: AppointmentDay[] = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt"];

function buildSlotModes(
  availability: Record<AppointmentDay, string[]>,
  modes: AppointmentMode[],
): Record<AppointmentDay, Record<string, AppointmentMode[]>> {
  const out = {} as Record<AppointmentDay, Record<string, AppointmentMode[]>>;
  for (const day of APPOINTMENT_DAYS) {
    out[day] = {};
    for (const slot of availability[day] ?? []) {
      out[day][slot] = [...modes];
    }
  }
  return out;
}

function defaultSettings(coachId: string): AppointmentSettingsRecord {
  const availability: Record<AppointmentDay, string[]> = {
    Pzt: ["16:00", "17:00", "18:00"],
    Sal: ["17:00", "18:00", "19:00"],
    Car: ["16:00", "17:00"],
    Per: ["18:00", "19:00", "20:00"],
    Cum: ["16:00", "17:00", "18:00"],
    Cmt: ["10:00", "11:00", "13:00", "14:00"],
  };
  const modes: AppointmentMode[] = ["online", "in_person", "phone"];
  return {
    coachId,
    weeklyLimit: 2,
    weeklyLimitStudent: 2,
    weeklyLimitParent: 1,
    allowOnline: true,
    allowInPerson: true,
    allowPhone: true,
    availability,
    slotModes: buildSlotModes(availability, modes),
  };
}

function displayNameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapSettings(row: {
  coachId: string;
  weeklyLimit: number;
  weeklyLimitStudent: number;
  weeklyLimitParent: number;
  allowOnline: boolean;
  allowInPerson: boolean;
  allowPhone: boolean;
  availability: unknown;
  slotModes: unknown;
}): AppointmentSettingsRecord {
  return {
    coachId: row.coachId,
    weeklyLimit: row.weeklyLimit,
    weeklyLimitStudent: row.weeklyLimitStudent,
    weeklyLimitParent: row.weeklyLimitParent,
    allowOnline: row.allowOnline,
    allowInPerson: row.allowInPerson,
    allowPhone: row.allowPhone,
    availability: row.availability as Record<AppointmentDay, string[]>,
    slotModes: row.slotModes as Record<AppointmentDay, Record<string, AppointmentMode[]>>,
  };
}

function mapAppointment(row: {
  id: string;
  coachId: string;
  studentId: string;
  day: AppointmentDay;
  slot: string;
  mode: AppointmentMode;
  topic: string;
  status: AppointmentStatus;
  createdAt: Date;
  student: { user: { email: string } };
}): AppointmentRecord {
  return {
    id: row.id,
    coachId: row.coachId,
    studentId: row.studentId,
    studentName: displayNameFromEmail(row.student.user.email),
    day: row.day,
    slot: row.slot,
    mode: row.mode,
    topic: row.topic,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAppointmentSettings(coachId: string): Promise<AppointmentSettingsRecord> {
  const row = await prisma.appointmentSettings.findUnique({ where: { coachId } });
  if (row) {
    return mapSettings(row);
  }

  const defaults = defaultSettings(coachId);
  const created = await prisma.appointmentSettings.create({
    data: {
      coachId,
      weeklyLimit: defaults.weeklyLimit,
      weeklyLimitStudent: defaults.weeklyLimitStudent,
      weeklyLimitParent: defaults.weeklyLimitParent,
      allowOnline: defaults.allowOnline,
      allowInPerson: defaults.allowInPerson,
      allowPhone: defaults.allowPhone,
      availability: defaults.availability,
      slotModes: defaults.slotModes,
    },
  });
  return mapSettings(created);
}

export async function updateAppointmentSettings(
  coachId: string,
  patch: Partial<Omit<AppointmentSettingsRecord, "coachId">>,
): Promise<AppointmentSettingsRecord> {
  const current = await getAppointmentSettings(coachId);
  const next = { ...current, ...patch, coachId };
  const row = await prisma.appointmentSettings.upsert({
    where: { coachId },
    create: {
      coachId,
      weeklyLimit: next.weeklyLimit,
      weeklyLimitStudent: next.weeklyLimitStudent,
      weeklyLimitParent: next.weeklyLimitParent,
      allowOnline: next.allowOnline,
      allowInPerson: next.allowInPerson,
      allowPhone: next.allowPhone,
      availability: next.availability,
      slotModes: next.slotModes,
    },
    update: {
      weeklyLimit: next.weeklyLimit,
      weeklyLimitStudent: next.weeklyLimitStudent,
      weeklyLimitParent: next.weeklyLimitParent,
      allowOnline: next.allowOnline,
      allowInPerson: next.allowInPerson,
      allowPhone: next.allowPhone,
      availability: next.availability,
      slotModes: next.slotModes,
    },
  });
  return mapSettings(row);
}

export async function listAppointmentsForCoach(coachId: string): Promise<AppointmentRecord[]> {
  const rows = await prisma.appointment.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
    include: { student: { include: { user: true } } },
  });
  return rows.map(mapAppointment);
}

export async function listAppointmentsForStudent(studentId: string): Promise<AppointmentRecord[]> {
  const rows = await prisma.appointment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: { student: { include: { user: true } } },
  });
  return rows.map(mapAppointment);
}

export async function countActiveAppointmentsForStudent(studentId: string): Promise<number> {
  return prisma.appointment.count({
    where: {
      studentId,
      status: { notIn: ["rejected", "cancelled"] },
    },
  });
}

export async function createAppointment(
  input: Omit<AppointmentRecord, "id" | "createdAt" | "status">,
): Promise<AppointmentRecord> {
  const row = await prisma.appointment.create({
    data: {
      coachId: input.coachId,
      studentId: input.studentId,
      day: input.day,
      slot: input.slot,
      mode: input.mode,
      topic: input.topic,
    },
    include: { student: { include: { user: true } } },
  });
  return mapAppointment(row);
}

export async function setAppointmentStatus(
  coachId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<AppointmentRecord | null> {
  const existing = await prisma.appointment.findFirst({ where: { id: appointmentId, coachId } });
  if (!existing) {
    return null;
  }

  const row = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: { student: { include: { user: true } } },
  });
  return mapAppointment(row);
}
