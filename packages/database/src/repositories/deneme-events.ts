import { prisma } from "../client";
import type {
  DenemeEvent,
  DenemeParticipationMode,
  DenemePaymentKind,
  DenemeRegistration,
} from "../types";
import { resolveCoachIdForStudent } from "./roster";

function mapEvent(e: {
  id: string;
  coachId: string;
  name: string;
  examType: "TYT" | "AYT" | "LGS";
  date: string;
  time: string;
  place: string;
  questionCount: number;
  price: number;
}): DenemeEvent {
  return {
    id: e.id,
    coachId: e.coachId,
    name: e.name,
    examType: e.examType,
    date: e.date,
    time: e.time,
    place: e.place,
    questionCount: e.questionCount,
    price: e.price,
  };
}

function mapReg(r: {
  eventId: string;
  studentId: string;
  payment: string;
  mode: string;
  registeredAt: Date;
}): DenemeRegistration {
  return {
    eventId: r.eventId,
    studentId: r.studentId,
    payment: r.payment as DenemePaymentKind,
    mode: r.mode as DenemeParticipationMode,
    registeredAt: r.registeredAt.getTime(),
  };
}

export async function listDenemeEventsForCoach(coachId: string): Promise<DenemeEvent[]> {
  const rows = await prisma.denemeEvent.findMany({
    where: { coachId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapEvent);
}

export async function listDenemeEventsForStudent(studentId: string): Promise<DenemeEvent[]> {
  const coachId = await resolveCoachIdForStudent(studentId);
  if (!coachId) return [];
  return listDenemeEventsForCoach(coachId);
}

export async function getStudentDenemeMembership(studentId: string): Promise<string | null> {
  const row = await prisma.denemeMembership.findUnique({ where: { studentId } });
  return row?.planId ?? null;
}

export async function setStudentDenemeMembership(
  studentId: string,
  planId: string | null,
): Promise<string | null> {
  if (planId) {
    await prisma.denemeMembership.upsert({
      where: { studentId },
      create: { studentId, planId },
      update: { planId },
    });
  } else {
    await prisma.denemeMembership.deleteMany({ where: { studentId } });
  }
  return planId;
}

export async function listRegistrationsForEvent(eventId: string): Promise<DenemeRegistration[]> {
  const rows = await prisma.denemeRegistration.findMany({ where: { eventId } });
  return rows.map(mapReg);
}

export async function listRegistrationsForStudent(studentId: string): Promise<DenemeRegistration[]> {
  const rows = await prisma.denemeRegistration.findMany({ where: { studentId } });
  return rows.map(mapReg);
}

export async function isRegistered(eventId: string, studentId: string): Promise<boolean> {
  const row = await prisma.denemeRegistration.findUnique({
    where: { eventId_studentId: { eventId, studentId } },
  });
  return Boolean(row);
}

export async function registerDenemeEvent(
  eventId: string,
  studentId: string,
): Promise<DenemeRegistration> {
  const event = await prisma.denemeEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Deneme bulunamadı");

  const membership = await getStudentDenemeMembership(studentId);
  const mode: DenemeParticipationMode = membership === "kargo" ? "online" : "yuzyuze";
  const payment: DenemePaymentKind = membership ? "paket" : "odendi";

  const row = await prisma.denemeRegistration.upsert({
    where: { eventId_studentId: { eventId, studentId } },
    create: { eventId, studentId, payment, mode },
    update: { payment, mode, registeredAt: new Date() },
  });
  return mapReg(row);
}

export async function unregisterDenemeEvent(eventId: string, studentId: string): Promise<void> {
  await prisma.denemeRegistration.deleteMany({ where: { eventId, studentId } });
}

export async function createDenemeEvent(
  coachId: string,
  input: {
    name: string;
    examType: "TYT" | "AYT" | "LGS";
    date: string;
    time: string;
    place: string;
    questionCount: number;
    price: number;
  },
): Promise<DenemeEvent> {
  const row = await prisma.denemeEvent.create({
    data: {
      coachId,
      name: input.name.trim(),
      examType: input.examType,
      date: input.date.trim(),
      time: input.time.trim(),
      place: input.place.trim(),
      questionCount: input.questionCount,
      price: input.price,
    },
  });
  return mapEvent(row);
}

export async function removeDenemeEvent(coachId: string, eventId: string): Promise<boolean> {
  const result = await prisma.denemeEvent.deleteMany({ where: { id: eventId, coachId } });
  return result.count > 0;
}

export async function enrichCoachDenemeEvents(coachId: string): Promise<
  Array<DenemeEvent & { registrationCount: number; registrations: DenemeRegistration[] }>
> {
  const rows = await prisma.denemeEvent.findMany({
    where: { coachId },
    orderBy: { createdAt: "asc" },
    include: { registrations: true },
  });
  return rows.map((event) => {
    const registrations = event.registrations.map(mapReg);
    return { ...mapEvent(event), registrationCount: registrations.length, registrations };
  });
}
