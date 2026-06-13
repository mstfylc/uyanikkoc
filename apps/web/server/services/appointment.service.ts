import type {
  AppointmentRecord,
  AppointmentSettingsRecord,
  AppointmentStatus,
  CoachReportSummary,
} from "@uyanik/database";
import {
  buildRulesBasedRiskBand,
  calculateCompletionRate,
  countOverdueAssignments,
  RISK_BAND_LABELS,
  slotSupportsMode,
  weeklyLimitFor,
} from "@uyanik/shared";

import * as memoryAppointments from "@/mocks/appointments";
import { listCoachStudents } from "@/mocks/roster";
import { listAssignmentsForCoach } from "@/mocks/assignments";
import { listExamResultsForStudents } from "@/mocks/exams";
import { listSubjectsForStudent } from "@/mocks/topics";
import { buildTopicSummary } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import { listReportsForCoach } from "@/server/services/report.service";

export {
  APPOINTMENT_DAYS,
  APPOINTMENT_SLOTS,
} from "@/mocks/appointments";

export async function getCoachAppointmentSettings(coachId: string): Promise<AppointmentSettingsRecord> {
  if (shouldUseDatabase()) {
    const { appointmentRepository } = await import("@uyanik/database");
    return appointmentRepository.getAppointmentSettings(coachId);
  }

  return memoryAppointments.getAppointmentSettings(coachId);
}

export async function updateCoachAppointmentSettings(
  coachId: string,
  patch: Partial<Omit<AppointmentSettingsRecord, "coachId">>,
): Promise<AppointmentSettingsRecord> {
  if (shouldUseDatabase()) {
    const { appointmentRepository } = await import("@uyanik/database");
    return appointmentRepository.updateAppointmentSettings(coachId, patch);
  }

  return memoryAppointments.updateAppointmentSettings(coachId, patch);
}

export async function listCoachAppointments(coachId: string): Promise<AppointmentRecord[]> {
  if (shouldUseDatabase()) {
    const { appointmentRepository } = await import("@uyanik/database");
    return appointmentRepository.listAppointmentsForCoach(coachId);
  }

  return memoryAppointments.listAppointmentsForCoach(coachId);
}

export async function listStudentAppointments(studentId: string): Promise<AppointmentRecord[]> {
  if (shouldUseDatabase()) {
    const { appointmentRepository } = await import("@uyanik/database");
    return appointmentRepository.listAppointmentsForStudent(studentId);
  }

  return memoryAppointments.listAppointmentsForStudent(studentId);
}

export async function createStudentAppointment(
  input: {
    coachId: string;
    studentId: string;
    studentName: string;
    day: AppointmentRecord["day"];
    slot: string;
    mode: AppointmentRecord["mode"];
    topic: string;
    requesterRole?: AppointmentRecord["requesterRole"];
  },
  role: "student" | "parent" = "student",
): Promise<AppointmentRecord> {
  const settings = await getCoachAppointmentSettings(input.coachId);
  const activeCount = shouldUseDatabase()
    ? await (await import("@uyanik/database")).appointmentRepository.countActiveAppointmentsForStudentByRequester(
        input.studentId,
        role,
      )
    : memoryAppointments.countActiveAppointmentsForStudentByRequester(input.studentId, role);
  const limit = weeklyLimitFor(role, settings);
  if (limit > 0 && activeCount >= limit) {
    throw new Error("Haftalik randevu limitine ulasildi.");
  }
  if (!slotSupportsMode(settings.slotModes, input.day, input.slot, input.mode)) {
    throw new Error("Secilen slot bu gorunme tipini desteklemiyor.");
  }

  if (shouldUseDatabase()) {
    const { appointmentRepository } = await import("@uyanik/database");
    return appointmentRepository.createAppointment({ ...input, requesterRole: input.requesterRole ?? role });
  }

  return memoryAppointments.createAppointment({ ...input, requesterRole: input.requesterRole ?? role });
}

export async function setCoachAppointmentStatus(
  coachId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<AppointmentRecord | null> {
  if (shouldUseDatabase()) {
    const { appointmentRepository } = await import("@uyanik/database");
    return appointmentRepository.setAppointmentStatus(coachId, appointmentId, status);
  }

  const appointments = memoryAppointments.listAppointmentsForCoach(coachId);
  const match = appointments.find((item) => item.id === appointmentId);
  if (!match) {
    return null;
  }
  return memoryAppointments.setAppointmentStatus(appointmentId, status);
}

export async function buildCoachReportSummary(coachId: string): Promise<CoachReportSummary> {
  const useDb = shouldUseDatabase();
  const roster = useDb
    ? await (await import("@uyanik/database")).rosterRepository.listCoachStudents(coachId)
    : listCoachStudents(coachId);
  const appointments = useDb
    ? await (await import("@uyanik/database")).appointmentRepository.listAppointmentsForCoach(coachId)
    : memoryAppointments.listAppointmentsForCoach(coachId);
  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;
  const coachAssignments = useDb
    ? await (await import("@uyanik/database")).assignmentRepository.listAssignmentsForCoach(coachId)
    : listAssignmentsForCoach(coachId);
  const allExams = useDb
    ? await (await import("@uyanik/database")).examRepository.listExamResultsForStudents(roster.map((entry) => entry.studentId))
    : listExamResultsForStudents(roster.map((entry) => entry.studentId));
  const parentReports = await listReportsForCoach(coachId);
  const pendingReports = parentReports.filter((item) => item.status === "pending").length;

  const students = roster.map((entry) => {
    const studentAssignments = coachAssignments.filter((item) => item.studentId === entry.studentId);
    const overdue = countOverdueAssignments(studentAssignments);
    const studentExams = allExams
      .filter((exam) => exam.studentId === entry.studentId)
      .sort((left, right) => new Date(left.takenAt).getTime() - new Date(right.takenAt).getTime());
    const completedCount = studentAssignments.filter((assignment) => assignment.completed || assignment.status === "completed").length;
    const assignmentRate = calculateCompletionRate(studentAssignments.length, completedCount);
    const risk = buildRulesBasedRiskBand(assignmentRate, overdue);

    return {
      studentId: entry.studentId,
      displayName: entry.displayName,
      latestNet: studentExams[studentExams.length - 1]?.totalNet ?? null,
      assignmentRate,
      topicRate: 0,
      examTrend: studentExams.map((exam) => exam.totalNet),
      risk,
    };
  });

  if (useDb) {
    const { topicRepository } = await import("@uyanik/database");
    for (const student of students) {
      const topics = await topicRepository.listSubjectsForStudent(student.studentId);
      student.topicRate = buildTopicSummary(topics).completionRate;
    }
  } else {
    for (const student of students) {
      student.topicRate = buildTopicSummary(listSubjectsForStudent(student.studentId)).completionRate;
    }
  }

  const nets = students.map((item) => item.latestNet).filter((value): value is number => value != null);
  const avgExamNet =
    nets.length > 0 ? Number((nets.reduce((sum, value) => sum + value, 0) / nets.length).toFixed(2)) : null;
  const assignmentCompletionRate =
    students.length > 0
      ? Math.round(students.reduce((sum, item) => sum + item.assignmentRate, 0) / students.length)
      : 0;

  const sessionMap = new Map<string, number[]>();
  for (const exam of allExams) {
    const key = exam.takenAt.slice(0, 10);
    const bucket = sessionMap.get(key) ?? [];
    bucket.push(exam.totalNet);
    sessionMap.set(key, bucket);
  }
  const classNetTrend = [...sessionMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, values]) => Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10);
  const classNetGain =
    classNetTrend.length > 1 ? Number((classNetTrend[classNetTrend.length - 1] - classNetTrend[0]).toFixed(1)) : 0;

  const weekCompletion = [
    { label: "Pzt", value: 62 },
    { label: "Sal", value: 71 },
    { label: "Car", value: 68 },
    { label: "Per", value: 74 },
    { label: "Cum", value: 79 },
    { label: "Cmt", value: 55 },
    { label: "Paz", value: 48 },
  ];

  const riskBands: Array<{ band: CoachReportSummary["students"][number]["risk"]; tone: string }> = [
    { band: "excellent", tone: "success" },
    { band: "normal", tone: "primary" },
    { band: "attention", tone: "warning" },
    { band: "critical", tone: "danger" },
  ];
  const riskDistribution = riskBands.map(({ band, tone }) => ({
    band,
    label: RISK_BAND_LABELS[band],
    count: students.filter((student) => student.risk === band).length,
    tone,
  }));

  return {
    rosterCount: roster.length,
    avgExamNet,
    assignmentCompletionRate,
    pendingAppointments,
    pendingReports,
    classNetTrend,
    classNetGain,
    atRiskCount: students.filter((student) => student.risk === "attention" || student.risk === "critical").length,
    weekCompletion,
    riskDistribution,
    parentReports,
    students,
  };
}
