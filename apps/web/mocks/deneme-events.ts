import { DEMO_COACH_ID } from "@/lib/auth/demo-users";
import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { DEMO_STUDENT_002_ID, resolveCoachIdForStudent } from "@/mocks/roster";
import type { DenemeMembershipId } from "@/lib/design/deneme-plans";

export type DenemeExamType = "TYT" | "AYT" | "LGS";
export type DenemeParticipationMode = "yuzyuze" | "online";
export type DenemePaymentKind = "paket" | "odendi";

export type DenemeEvent = {
  id: string;
  coachId: string;
  name: string;
  examType: DenemeExamType;
  date: string;
  time: string;
  place: string;
  questionCount: number;
  price: number;
};

export type DenemeRegistration = {
  eventId: string;
  studentId: string;
  payment: DenemePaymentKind;
  mode: DenemeParticipationMode;
  registeredAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __uyanikDenemeEvents?: DenemeEvent[];
  __uyanikDenemeRegs?: DenemeRegistration[];
  __uyanikDenemeMembers?: Record<string, DenemeMembershipId | null>;
};

const events = globalStore.__uyanikDenemeEvents ?? (globalStore.__uyanikDenemeEvents = []);
const registrations =
  globalStore.__uyanikDenemeRegs ?? (globalStore.__uyanikDenemeRegs = []);
const members =
  globalStore.__uyanikDenemeMembers ?? (globalStore.__uyanikDenemeMembers = {});

function seedIfEmpty() {
  if (events.length > 0) return;

  events.push(
    {
      id: "ev1",
      coachId: DEMO_COACH_ID,
      name: "TYT Genel Deneme #8",
      examType: "TYT",
      date: "14 Haz 2026",
      time: "10:00",
      place: "Kampüs Koç · Kadıköy",
      questionCount: 120,
      price: 150,
    },
    {
      id: "ev2",
      coachId: DEMO_COACH_ID,
      name: "AYT Sayısal Deneme #4",
      examType: "AYT",
      date: "21 Haz 2026",
      time: "10:00",
      place: "Kampüs Koç · Kadıköy",
      questionCount: 80,
      price: 150,
    },
    {
      id: "ev3",
      coachId: DEMO_COACH_ID,
      name: "LGS Genel Deneme #6",
      examType: "LGS",
      date: "22 Haz 2026",
      time: "10:00",
      place: "Online / Kargo",
      questionCount: 90,
      price: 120,
    },
    {
      id: "ev4",
      coachId: DEMO_COACH_ID,
      name: "TYT Kamp Denemesi",
      examType: "TYT",
      date: "28 Haz 2026",
      time: "13:30",
      place: "Online / Kargo",
      questionCount: 120,
      price: 120,
    },
  );

  members[DEMO_STUDENT_ID] = "yuzyuze";
  members[DEMO_STUDENT_002_ID] = "kargo";

  const now = Date.now();
  registrations.push(
    { eventId: "ev1", studentId: DEMO_STUDENT_ID, payment: "paket", mode: "yuzyuze", registeredAt: now - 2 * 86_400_000 },
    { eventId: "ev2", studentId: DEMO_STUDENT_ID, payment: "paket", mode: "yuzyuze", registeredAt: now - 86_400_000 },
    { eventId: "ev4", studentId: DEMO_STUDENT_002_ID, payment: "paket", mode: "online", registeredAt: now - 86_400_000 },
  );
}

export function listDenemeEventsForCoach(coachId: string): DenemeEvent[] {
  seedIfEmpty();
  return events.filter((e) => e.coachId === coachId);
}

export function listDenemeEventsForStudent(studentId: string): DenemeEvent[] {
  seedIfEmpty();
  const coachId = resolveCoachIdForStudent(studentId);
  if (!coachId) return [];
  return listDenemeEventsForCoach(coachId);
}

export function getStudentDenemeMembership(studentId: string): DenemeMembershipId | null {
  seedIfEmpty();
  return members[studentId] ?? null;
}

export function setStudentDenemeMembership(studentId: string, planId: DenemeMembershipId | null): DenemeMembershipId | null {
  seedIfEmpty();
  if (planId) {
    members[studentId] = planId;
  } else {
    delete members[studentId];
  }
  return planId;
}

export function listRegistrationsForEvent(eventId: string): DenemeRegistration[] {
  seedIfEmpty();
  return registrations.filter((r) => r.eventId === eventId);
}

export function listRegistrationsForStudent(studentId: string): DenemeRegistration[] {
  seedIfEmpty();
  return registrations.filter((r) => r.studentId === studentId);
}

export function isRegistered(eventId: string, studentId: string): boolean {
  seedIfEmpty();
  return registrations.some((r) => r.eventId === eventId && r.studentId === studentId);
}

export function registerDenemeEvent(eventId: string, studentId: string): DenemeRegistration {
  seedIfEmpty();
  const event = events.find((e) => e.id === eventId);
  if (!event) throw new Error("Deneme bulunamadı");

  const membership = getStudentDenemeMembership(studentId);
  const mode: DenemeParticipationMode = membership === "kargo" ? "online" : "yuzyuze";
  const payment: DenemePaymentKind = membership ? "paket" : "odendi";

  const existing = registrations.findIndex((r) => r.eventId === eventId && r.studentId === studentId);
  const record: DenemeRegistration = {
    eventId,
    studentId,
    payment,
    mode,
    registeredAt: Date.now(),
  };

  if (existing >= 0) {
    registrations[existing] = record;
  } else {
    registrations.push(record);
  }
  return record;
}

export function unregisterDenemeEvent(eventId: string, studentId: string): void {
  seedIfEmpty();
  const idx = registrations.findIndex((r) => r.eventId === eventId && r.studentId === studentId);
  if (idx >= 0) registrations.splice(idx, 1);
}

export function createDenemeEvent(
  coachId: string,
  input: {
    name: string;
    examType: DenemeExamType;
    date: string;
    time: string;
    place: string;
    questionCount: number;
    price: number;
  },
): DenemeEvent {
  seedIfEmpty();
  const event: DenemeEvent = {
    id: `ev_${Date.now()}`,
    coachId,
    name: input.name.trim(),
    examType: input.examType,
    date: input.date.trim(),
    time: input.time.trim(),
    place: input.place.trim(),
    questionCount: input.questionCount,
    price: input.price,
  };
  events.push(event);
  return event;
}

export function removeDenemeEvent(coachId: string, eventId: string): boolean {
  seedIfEmpty();
  const idx = events.findIndex((e) => e.id === eventId && e.coachId === coachId);
  if (idx < 0) return false;
  events.splice(idx, 1);
  for (let i = registrations.length - 1; i >= 0; i -= 1) {
    if (registrations[i].eventId === eventId) registrations.splice(i, 1);
  }
  return true;
}

export function enrichCoachDenemeEvents(coachId: string) {
  seedIfEmpty();
  return listDenemeEventsForCoach(coachId).map((event) => {
    const regs = listRegistrationsForEvent(event.id);
    return {
      ...event,
      registrationCount: regs.length,
      registrations: regs,
    };
  });
}
