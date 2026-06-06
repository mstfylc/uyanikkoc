import * as memory from "@/mocks/deneme-events";
import { listCoachStudents } from "@/mocks/roster";

export type {
  DenemeEvent,
  DenemeExamType,
  DenemeParticipationMode,
  DenemePaymentKind,
  DenemeRegistration,
} from "@/mocks/deneme-events";

export {
  createDenemeEvent,
  enrichCoachDenemeEvents,
  getStudentDenemeMembership,
  isRegistered,
  listDenemeEventsForCoach,
  listDenemeEventsForStudent,
  listRegistrationsForStudent,
  registerDenemeEvent,
  removeDenemeEvent,
  setStudentDenemeMembership,
  unregisterDenemeEvent,
} from "@/mocks/deneme-events";

export async function getStudentDenemeContext(studentId: string) {
  const events = memory.listDenemeEventsForStudent(studentId);
  const membership = memory.getStudentDenemeMembership(studentId);
  const registrations = memory.listRegistrationsForStudent(studentId);
  return { events, membership, registrations };
}

export async function getCoachDenemeContext(coachId: string) {
  const events = memory.enrichCoachDenemeEvents(coachId);
  const students = listCoachStudents(coachId);
  return { events, students };
}
