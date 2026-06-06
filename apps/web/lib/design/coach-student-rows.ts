import type { CoachRosterEntry, ExamResultRecord } from "@uyanik/database";
import {
  buildRulesBasedRiskBand,
  calculateCompletionRate,
  countOverdueAssignments,
  type RiskBand,
} from "@uyanik/shared";

export type CoachStudentRow = {
  studentId: string;
  displayName: string;
  email: string;
  completion: number;
  net: number | null;
  examTrend: number[];
  risk: RiskBand;
  lastActivity: string;
};

type AssignmentRow = {
  studentId: string;
  completed: boolean;
  status: string;
  dueDate: string | null;
  updatedAt: string;
};

export function buildCoachStudentRows(
  roster: CoachRosterEntry[],
  assignments: AssignmentRow[],
  exams: ExamResultRecord[],
): CoachStudentRow[] {
  return roster.map((student) => {
    const studentAssignments = assignments.filter((item) => item.studentId === student.studentId);
    const total = studentAssignments.length;
    const completed = studentAssignments.filter((item) => item.completed).length;
    const completion = calculateCompletionRate(total, completed);
    const overdue = countOverdueAssignments(studentAssignments);
    const risk = buildRulesBasedRiskBand(completion, overdue);
    const studentExams = exams
      .filter((item) => item.studentId === student.studentId)
      .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());
    const latestAssignment = studentAssignments
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    return {
      studentId: student.studentId,
      displayName: student.displayName,
      email: student.email,
      completion,
      net: studentExams[studentExams.length - 1]?.totalNet ?? null,
      examTrend: studentExams.map((exam) => exam.totalNet),
      risk,
      lastActivity: latestAssignment
        ? new Date(latestAssignment.updatedAt).toLocaleDateString("tr-TR")
        : "—",
    };
  });
}
