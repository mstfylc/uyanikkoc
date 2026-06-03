import { prisma } from "../client";
import type { AssignmentRecord, ParentSummaryRecord } from "../types";

function mapAssignment(assignment: {
  id: string;
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
}): AssignmentRecord {
  return {
    id: assignment.id,
    title: assignment.title,
    coachId: assignment.coachId,
    studentId: assignment.studentId,
    parentId: assignment.parentId,
    branchId: assignment.branchId,
    createdAt: assignment.createdAt.toISOString(),
    completed: assignment.completed,
    completedAt: assignment.completedAt?.toISOString() ?? null,
  };
}

export async function createAssignment(input: {
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
}): Promise<AssignmentRecord> {
  const assignment = await prisma.assignment.create({
    data: {
      title: input.title,
      coachId: input.coachId,
      studentId: input.studentId,
      parentId: input.parentId,
      branchId: input.branchId,
    },
  });

  return mapAssignment(assignment);
}

export async function listAssignmentsForStudent(studentId: string): Promise<AssignmentRecord[]> {
  const assignments = await prisma.assignment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  return assignments.map(mapAssignment);
}

export async function listAssignmentsForCoach(coachId: string): Promise<AssignmentRecord[]> {
  const assignments = await prisma.assignment.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
  });

  return assignments.map(mapAssignment);
}

export async function completeAssignment(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentRecord | null> {
  const existing = await prisma.assignment.findFirst({
    where: { id: assignmentId, studentId },
  });

  if (!existing) {
    return null;
  }

  const assignment = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });

  return mapAssignment(assignment);
}

export async function getParentSummary(parentId: string): Promise<ParentSummaryRecord> {
  const assignments = await prisma.assignment.findMany({
    where: { parentId },
    orderBy: { createdAt: "desc" },
  });

  const mapped = assignments.map(mapAssignment);
  const completedCount = mapped.filter((a) => a.completed).length;

  return {
    totalAssignments: mapped.length,
    completedCount,
    pendingCount: mapped.length - completedCount,
    assignments: mapped,
  };
}
