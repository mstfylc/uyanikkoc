import type { DenemeEvent, DenemeRegistration } from "@uyanik/database";

import type { DenemeMembershipId } from "@/lib/design/deneme-plans";
import { shouldUseDatabase } from "@/lib/data/env";
import * as memory from "@/mocks/deneme-events";
import { listCoachRoster } from "@/server/services/roster.service";

export type {
  DenemeEvent,
  DenemeExamType,
  DenemeParticipationMode,
  DenemePaymentKind,
  DenemeRegistration,
} from "@/mocks/deneme-events";

async function repo() {
  const { denemeRepository } = await import("@uyanik/database");
  return denemeRepository;
}

export async function listDenemeEventsForCoach(coachId: string): Promise<DenemeEvent[]> {
  if (shouldUseDatabase()) return (await repo()).listDenemeEventsForCoach(coachId);
  return memory.listDenemeEventsForCoach(coachId);
}

export async function listDenemeEventsForStudent(studentId: string): Promise<DenemeEvent[]> {
  if (shouldUseDatabase()) return (await repo()).listDenemeEventsForStudent(studentId);
  return memory.listDenemeEventsForStudent(studentId);
}

export async function getStudentDenemeMembership(
  studentId: string,
): Promise<DenemeMembershipId | null> {
  if (shouldUseDatabase()) {
    return (await (await repo()).getStudentDenemeMembership(studentId)) as DenemeMembershipId | null;
  }
  return memory.getStudentDenemeMembership(studentId);
}

export async function setStudentDenemeMembership(
  studentId: string,
  planId: DenemeMembershipId | null,
): Promise<DenemeMembershipId | null> {
  if (shouldUseDatabase()) {
    return (await (await repo()).setStudentDenemeMembership(studentId, planId)) as
      | DenemeMembershipId
      | null;
  }
  return memory.setStudentDenemeMembership(studentId, planId);
}

export async function listRegistrationsForStudent(
  studentId: string,
): Promise<DenemeRegistration[]> {
  if (shouldUseDatabase()) return (await repo()).listRegistrationsForStudent(studentId);
  return memory.listRegistrationsForStudent(studentId);
}

export async function isRegistered(eventId: string, studentId: string): Promise<boolean> {
  if (shouldUseDatabase()) return (await repo()).isRegistered(eventId, studentId);
  return memory.isRegistered(eventId, studentId);
}

export async function registerDenemeEvent(
  eventId: string,
  studentId: string,
): Promise<DenemeRegistration> {
  if (shouldUseDatabase()) return (await repo()).registerDenemeEvent(eventId, studentId);
  return memory.registerDenemeEvent(eventId, studentId);
}

export async function unregisterDenemeEvent(eventId: string, studentId: string): Promise<void> {
  if (shouldUseDatabase()) return (await repo()).unregisterDenemeEvent(eventId, studentId);
  return memory.unregisterDenemeEvent(eventId, studentId);
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
  if (shouldUseDatabase()) return (await repo()).createDenemeEvent(coachId, input);
  return memory.createDenemeEvent(coachId, input);
}

export async function removeDenemeEvent(coachId: string, eventId: string): Promise<boolean> {
  if (shouldUseDatabase()) return (await repo()).removeDenemeEvent(coachId, eventId);
  return memory.removeDenemeEvent(coachId, eventId);
}

export async function enrichCoachDenemeEvents(coachId: string) {
  if (shouldUseDatabase()) return (await repo()).enrichCoachDenemeEvents(coachId);
  return memory.enrichCoachDenemeEvents(coachId);
}

export async function getStudentDenemeContext(studentId: string) {
  const [events, membership, registrations] = await Promise.all([
    listDenemeEventsForStudent(studentId),
    getStudentDenemeMembership(studentId),
    listRegistrationsForStudent(studentId),
  ]);
  return { events, membership, registrations };
}

export async function getCoachDenemeContext(coachId: string) {
  const [events, students] = await Promise.all([
    enrichCoachDenemeEvents(coachId),
    listCoachRoster(coachId),
  ]);
  return { events, students };
}
