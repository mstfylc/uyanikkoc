import type {
  AppointmentRecord,
  AppointmentSettingsRecord,
  AppointmentStatus,
  CoachReportSummary,
} from "@uyanik/database";
import { calculateCompletionRate } from "@uyanik/shared";

import * as memoryAppointments from "@/mocks/appointments";
import { listCoachStudents } from "@/mocks/roster";
import { getParentSummary } from "@/mocks/assignments";
import { listExamResultsForStudent } from "@/mocks/exams";
import { listSubjectsForStudent } from "@/mocks/topics";
import { buildTopicSummary } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";

export {
  APPOINTMENT_DAYS,
  APPOINTMENT_SLOTS,
} from "@/mocks/appointments";

export async function getCoachAppointmentSettings(coachId: string): Promise<AppointmentSettingsRecord> {
  return memoryAppointments.getAppointmentSettings(coachId);
}

export async function updateCoachAppointmentSettings(
  coachId: string,
  patch: Partial<Omit<AppointmentSettingsRecord, "coachId">>,
): Promise<AppointmentSettingsRecord> {
  return memoryAppointments.updateAppointmentSettings(coachId, patch);
}

export async function listCoachAppointments(coachId: string): Promise<AppointmentRecord[]> {
  return memoryAppointments.listAppointmentsForCoach(coachId);
}

export async function listStudentAppointments(studentId: string): Promise<AppointmentRecord[]> {
  return memoryAppointments.listAppointmentsForStudent(studentId);
}

export async function createStudentAppointment(input: {
  coachId: string;
  studentId: string;
  studentName: string;
  day: AppointmentRecord["day"];
  slot: string;
  mode: AppointmentRecord["mode"];
  topic: string;
}): Promise<AppointmentRecord> {
  const settings = memoryAppointments.getAppointmentSettings(input.coachId);
  const activeCount = memoryAppointments.countActiveAppointmentsForStudent(input.studentId);
  if (settings.weeklyLimit > 0 && activeCount >= settings.weeklyLimit) {
    throw new Error("Haftalik randevu limitine ulasildi.");
  }

  return memoryAppointments.createAppointment(input);
}

export async function setCoachAppointmentStatus(
  coachId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<AppointmentRecord | null> {
  const appointments = memoryAppointments.listAppointmentsForCoach(coachId);
  const match = appointments.find((item) => item.id === appointmentId);
  if (!match) {
    return null;
  }
  return memoryAppointments.setAppointmentStatus(appointmentId, status);
}

export async function buildCoachReportSummary(coachId: string): Promise<CoachReportSummary> {
  void shouldUseDatabase();
  const roster = listCoachStudents(coachId);
  const appointments = memoryAppointments.listAppointmentsForCoach(coachId);
  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;

  const students = roster.map((entry) => {
    const parentId = entry.studentId === "student_001" ? "parent_001" : "parent_002";
    const summary = getParentSummary(parentId);
    const exams = listExamResultsForStudent(entry.studentId);
    const topics = listSubjectsForStudent(entry.studentId);
    const topicSummary = buildTopicSummary(topics);

    return {
      studentId: entry.studentId,
      displayName: entry.displayName,
      latestNet: exams[0]?.totalNet ?? null,
      assignmentRate: calculateCompletionRate(summary.totalAssignments, summary.completedCount),
      topicRate: topicSummary.completionRate,
    };
  });

  const nets = students.map((item) => item.latestNet).filter((value): value is number => value != null);
  const avgExamNet =
    nets.length > 0 ? Number((nets.reduce((sum, value) => sum + value, 0) / nets.length).toFixed(2)) : null;
  const assignmentCompletionRate =
    students.length > 0
      ? Math.round(students.reduce((sum, item) => sum + item.assignmentRate, 0) / students.length)
      : 0;

  return {
    rosterCount: roster.length,
    avgExamNet,
    assignmentCompletionRate,
    pendingAppointments,
    students,
  };
}
