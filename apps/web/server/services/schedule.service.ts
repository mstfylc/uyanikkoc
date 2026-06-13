import type { SchoolScheduleRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memorySchedule from "@/mocks/schedule";
import * as memoryStudyPlan from "@/mocks/study-plan";

export { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
export type { StudyBlockRecord } from "@/mocks/study-plan";

export type StudentAgendaItem = {
  id: string;
  kind: "assignment" | "exam" | "appointment" | "mistake" | "study";
  title: string;
  meta: string;
  href: string;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  when: string | null;
};

export type StudentAgenda = {
  items: StudentAgendaItem[];
  counts: {
    assignments: number;
    exams: number;
    appointments: number;
    mistakes: number;
    study: number;
  };
};

async function repo() {
  const { scheduleRepository } = await import("@uyanik/database");
  return scheduleRepository;
}

export async function getStudentSchedule(studentId: string): Promise<SchoolScheduleRecord> {
  if (shouldUseDatabase()) return (await repo()).getSchoolSchedule(studentId);
  return memorySchedule.getSchoolSchedule(studentId);
}

export async function getStudentStudyPlan(studentId: string) {
  if (shouldUseDatabase()) return (await repo()).getStudyPlan(studentId);
  return memoryStudyPlan.getStudyPlan(studentId);
}

export async function advanceStudentStudyBlock(
  studentId: string,
  blockId: string,
  action: "start" | "finish" | "reset",
) {
  if (shouldUseDatabase()) return (await repo()).advanceStudyBlock(studentId, blockId, action);
  return memoryStudyPlan.advanceStudyBlock(studentId, blockId, action);
}

export async function toggleStudentStudyBlock(studentId: string, blockId: string) {
  if (shouldUseDatabase()) return (await repo()).toggleStudyBlock(studentId, blockId);
  return memoryStudyPlan.toggleStudyBlock(studentId, blockId);
}

export async function addStudentStudyBlock(
  studentId: string,
  input: {
    day: string;
    time: string;
    subject: string;
    topic: string;
    type: string;
    source?: string;
    correct?: number;
    wrong?: number;
  },
) {
  if (shouldUseDatabase()) return (await repo()).addStudyBlock(studentId, input);
  return memoryStudyPlan.addStudyBlock(studentId, input);
}

export async function updateStudentSchedule(
  studentId: string,
  patch: Partial<Pick<SchoolScheduleRecord, "attendsSchool" | "grid">>,
): Promise<SchoolScheduleRecord> {
  if (shouldUseDatabase()) return (await repo()).updateSchoolSchedule(studentId, patch);
  return memorySchedule.updateSchoolSchedule(studentId, patch);
}

export async function setStudentScheduleCell(
  studentId: string,
  day: string,
  period: number,
  value: string,
): Promise<SchoolScheduleRecord> {
  if (shouldUseDatabase()) return (await repo()).setScheduleCell(studentId, day, period, value);
  return memorySchedule.setScheduleCell(studentId, day, period, value);
}

function ymd(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

function isOpenAssignment(item: { completed: boolean; status: string }): boolean {
  return !item.completed && item.status !== "completed" && item.status !== "cancelled";
}

export async function getStudentAgenda(studentId: string): Promise<StudentAgenda> {
  const [
    assignments,
    examsResult,
    appointments,
    mistakes,
    studyPlan,
  ] = await Promise.all([
    import("@/server/services/assignment.service").then((mod) => mod.listStudentAssignments(studentId)),
    import("@/server/services/exam.service").then((mod) => mod.listStudentExams(studentId)),
    import("@/server/services/appointment.service").then((mod) => mod.listStudentAppointments(studentId)),
    import("@/server/services/mistake.service").then((mod) => mod.listStudentMistakes(studentId)),
    getStudentStudyPlan(studentId),
  ]);

  const dueMistakes = mistakes.filter((item) => item.status !== "kapandi" && item.nextDue);
  const items: StudentAgendaItem[] = [
    ...assignments
      .filter(isOpenAssignment)
      .slice(0, 4)
      .map((assignment) => ({
        id: `assignment:${assignment.id}`,
        kind: "assignment" as const,
        title: assignment.title,
        meta: assignment.subject ?? "Odev",
        href: "/student/assignments",
        tone: assignment.priority === "high" ? "danger" as const : "warning" as const,
        when: ymd(assignment.dueDate),
      })),
    ...dueMistakes.slice(0, 3).map((mistake) => ({
      id: `mistake:${mistake.id}`,
      kind: "mistake" as const,
      title: mistake.topic ?? mistake.subject,
      meta: "Yanlış Defteri tekrar",
      href: "/student/mistakes",
      tone: "danger" as const,
      when: mistake.nextDue,
    })),
    ...appointments
      .filter((appointment) => appointment.status === "approved" || appointment.status === "pending")
      .slice(0, 2)
      .map((appointment) => ({
        id: `appointment:${appointment.id}`,
        kind: "appointment" as const,
        title: appointment.topic ?? "Koc gorusmesi",
        meta: `${appointment.day} ${appointment.slot}`,
        href: "/student/appointments",
        tone: appointment.status === "approved" ? "success" as const : "info" as const,
        when: null,
      })),
    ...examsResult.exams.slice(0, 2).map((exam) => ({
      id: `exam:${exam.id}`,
      kind: "exam" as const,
      title: exam.label ?? `${exam.examType} deneme`,
      meta: `${exam.totalNet} net`,
      href: "/student/exams",
      tone: "primary" as const,
      when: ymd(exam.takenAt),
    })),
    ...studyPlan.slice(0, 3).map((block) => ({
      id: `study:${block.id}`,
      kind: "study" as const,
      title: block.topic,
      meta: `${block.day} ${block.time} - ${block.subject}`,
      href: "/student/schedule",
      tone: block.status === "done" ? "success" as const : "warning" as const,
      when: null,
    })),
  ];

  return {
    items: items.slice(0, 10),
    counts: {
      assignments: assignments.filter(isOpenAssignment).length,
      exams: examsResult.exams.length,
      appointments: appointments.filter((item) => item.status === "approved" || item.status === "pending").length,
      mistakes: dueMistakes.length,
      study: studyPlan.length,
    },
  };
}
