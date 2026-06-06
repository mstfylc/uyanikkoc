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
} from "@uyanik/shared";

import * as memoryAppointments from "@/mocks/appointments";
import { listCoachStudents, resolveParentIdForStudent } from "@/mocks/roster";
import { getParentSummary, listAssignmentsForCoach } from "@/mocks/assignments";
import { listExamResultsForStudent, listExamResultsForStudents } from "@/mocks/exams";
import { listSubjectsForStudent } from "@/mocks/topics";
import { listParentReports } from "@/mocks/parent-reports";
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
  const coachAssignments = listAssignmentsForCoach(coachId);
  const allExams = listExamResultsForStudents(roster.map((entry) => entry.studentId));
  const parentReports = listParentReports();
  const pendingReports = parentReports.filter((item) => item.status === "pending").length;

  const students = roster.map((entry) => {
    const parentId = resolveParentIdForStudent(entry.studentId);
    const summary = parentId ? getParentSummary(parentId) : null;
    const exams = listExamResultsForStudent(entry.studentId).sort(
      (left, right) => new Date(left.takenAt).getTime() - new Date(right.takenAt).getTime(),
    );
    const topics = listSubjectsForStudent(entry.studentId);
    const topicSummary = buildTopicSummary(topics);
    const studentAssignments = coachAssignments.filter((item) => item.studentId === entry.studentId);
    const assignmentRate = summary
      ? calculateCompletionRate(summary.totalAssignments, summary.completedCount)
      : 0;
    const overdue = countOverdueAssignments(studentAssignments);
    const risk = buildRulesBasedRiskBand(assignmentRate, overdue);

    return {
      studentId: entry.studentId,
      displayName: entry.displayName,
      latestNet: exams[exams.length - 1]?.totalNet ?? null,
      assignmentRate,
      topicRate: topicSummary.completionRate,
      examTrend: exams.map((exam) => exam.totalNet),
      risk,
    };
  });

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
