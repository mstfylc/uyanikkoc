import { prisma } from "../client";
import type {
  AssignmentCreateInput,
  AssignmentRecord,
  ParentSummaryRecord,
} from "../types";

function mapAssignment(assignment: {
  id: string;
  title: string;
  description: string | null;
  week: AssignmentRecord["week"];
  topic: string;
  source: string;
  count: number;
  odevType: AssignmentRecord["odevType"];
  odevTypes: string[];
  note: string;
  type: AssignmentRecord["type"];
  priority: AssignmentRecord["priority"];
  status: AssignmentRecord["status"];
  subject: string | null;
  dueDate: Date | null;
  assignedAt: Date | null;
  smart: boolean;
  overdueAlert: boolean;
  quality: boolean;
  feedback: string | null;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  completedAt: Date | null;
  student?: {
    user: {
      name: string | null;
      email: string;
    };
  };
  result?: {
    correct: number;
    wrong: number;
    blank: number;
    net: number;
  } | null;
}): AssignmentRecord {
  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    studentName: assignment.student?.user.name ?? assignment.student?.user.email ?? undefined,
    week: assignment.week,
    topic: assignment.topic,
    source: assignment.source,
    count: assignment.count,
    odevType: assignment.odevType,
    odevTypes: assignment.odevTypes,
    note: assignment.note,
    type: assignment.type,
    priority: assignment.priority,
    status: assignment.status,
    subject: assignment.subject,
    dueDate: assignment.dueDate?.toISOString() ?? null,
    assignedAt: assignment.assignedAt?.toISOString() ?? null,
    smart: assignment.smart,
    overdueAlert: assignment.overdueAlert,
    quality: assignment.quality,
    feedback: assignment.feedback,
    coachId: assignment.coachId,
    studentId: assignment.studentId,
    parentId: assignment.parentId,
    branchId: assignment.branchId,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    completed: assignment.completed,
    completedAt: assignment.completedAt?.toISOString() ?? null,
    result: assignment.result
      ? {
          correct: assignment.result.correct,
          wrong: assignment.result.wrong,
          blank: assignment.result.blank,
          net: assignment.result.net,
        }
      : null,
  };
}

export async function createAssignment(input: AssignmentCreateInput): Promise<AssignmentRecord> {
  const assignment = await prisma.assignment.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      week: input.week ?? "w0",
      topic: input.topic ?? "",
      source: input.source ?? "",
      count: input.count ?? 0,
      odevType: input.odevType ?? "soru",
      odevTypes: input.odevTypes ?? [],
      note: input.note ?? "",
      type: input.type ?? "homework",
      priority: input.priority ?? "medium",
      subject: input.subject ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      assignedAt: input.assignedAt ? new Date(input.assignedAt) : new Date(),
      smart: input.smart ?? false,
      overdueAlert: input.overdueAlert ?? false,
      quality: input.quality ?? false,
      feedback: input.feedback ?? null,
      coachId: input.coachId,
      studentId: input.studentId,
      parentId: input.parentId,
      branchId: input.branchId,
    },
    include: { result: true, student: { include: { user: { select: { name: true, email: true } } } } },
  });

  return mapAssignment(assignment);
}

export async function listAssignmentsForStudent(studentId: string): Promise<AssignmentRecord[]> {
  const assignments = await prisma.assignment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: { result: true, student: { include: { user: { select: { name: true, email: true } } } } },
  });

  return assignments.map(mapAssignment);
}

export async function listAssignmentsForCoach(coachId: string): Promise<AssignmentRecord[]> {
  const assignments = await prisma.assignment.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
    include: { result: true, student: { include: { user: { select: { name: true, email: true } } } } },
  });

  return assignments.map(mapAssignment);
}

export async function completeAssignment(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentRecord | null> {
  const existing = await prisma.assignment.findFirst({
    where: { id: assignmentId, studentId },
    include: { result: true, student: { include: { user: { select: { name: true, email: true } } } } },
  });

  if (!existing || existing.status === "completed") {
    return existing ? mapAssignment(existing) : null;
  }

  const assignment = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      status: "completed",
      completed: true,
      completedAt: new Date(),
    },
    include: { result: true, student: { include: { user: { select: { name: true, email: true } } } } },
  });

  return mapAssignment(assignment);
}

export async function submitAssignmentResult(
  assignmentId: string,
  studentId: string,
  input: { correct: number; wrong: number; blank: number },
): Promise<AssignmentRecord | null> {
  const existing = await prisma.assignment.findFirst({
    where: { id: assignmentId, studentId },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const net = input.correct - input.wrong / 4;
  const assignment = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      status: "completed",
      completed: true,
      completedAt: new Date(),
      result: {
        upsert: {
          create: {
            studentId,
            correct: input.correct,
            wrong: input.wrong,
            blank: input.blank,
            net,
          },
          update: {
            correct: input.correct,
            wrong: input.wrong,
            blank: input.blank,
            net,
          },
        },
      },
    },
    include: { result: true, student: { include: { user: { select: { name: true, email: true } } } } },
  });

  return mapAssignment(assignment);
}

export async function getParentSummary(parentId: string): Promise<ParentSummaryRecord> {
  const assignments = await prisma.assignment.findMany({
    where: { parentId },
    orderBy: { createdAt: "desc" },
    include: { result: true },
  });

  const mapped = assignments.map(mapAssignment);
  const completedCount = mapped.filter((a) => a.status === "completed" || a.completed).length;

  return {
    totalAssignments: mapped.length,
    completedCount,
    pendingCount: mapped.length - completedCount,
    assignments: mapped,
    topicCompletionRate: 0,
    topicCompletedCount: 0,
    topicTotalCount: 0,
    latestExamNet: null,
    latestExamType: null,
    examTrend: "flat",
  };
}
