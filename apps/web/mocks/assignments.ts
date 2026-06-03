export type Assignment = {
  id: string;
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  createdAt: string;
  completed: boolean;
  completedAt: string | null;
};

export type ParentSummary = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
  assignments: Assignment[];
};

export const DEMO_ORG_ID = "org_demo_001";
export const DEMO_BRANCH_ID = "branch_demo_001";
export const DEMO_STUDENT_ID = "student_001";
export const DEMO_PARENT_ID = "parent_001";

const globalStore = globalThis as typeof globalThis & {
  __uyanikAssignments?: Assignment[];
};

const assignments = globalStore.__uyanikAssignments ?? (globalStore.__uyanikAssignments = []);

export function createAssignment(input: {
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId?: string;
}): Assignment {
  const assignment: Assignment = {
    id: `assignment_${assignments.length + 1}`,
    title: input.title,
    coachId: input.coachId,
    studentId: input.studentId,
    parentId: input.parentId,
    branchId: input.branchId ?? DEMO_BRANCH_ID,
    createdAt: new Date().toISOString(),
    completed: false,
    completedAt: null,
  };

  assignments.push(assignment);
  return assignment;
}

export function listAssignmentsForStudent(studentId: string): Assignment[] {
  return assignments.filter((assignment) => assignment.studentId === studentId);
}

export function listAssignmentsForCoach(coachId: string): Assignment[] {
  return assignments.filter((assignment) => assignment.coachId === coachId);
}

export function listAssignmentsForParent(parentId: string): Assignment[] {
  return assignments.filter((assignment) => assignment.parentId === parentId);
}

export function completeAssignment(assignmentId: string, studentId: string): Assignment | null {
  const assignment = assignments.find(
    (item) => item.id === assignmentId && item.studentId === studentId,
  );

  if (!assignment) {
    return null;
  }

  assignment.completed = true;
  assignment.completedAt = new Date().toISOString();
  return assignment;
}

export function getParentSummary(parentId: string): ParentSummary {
  const parentAssignments = listAssignmentsForParent(parentId);
  const completedCount = parentAssignments.filter((assignment) => assignment.completed).length;

  return {
    totalAssignments: parentAssignments.length,
    completedCount,
    pendingCount: parentAssignments.length - completedCount,
    assignments: parentAssignments,
  };
}

export function resetAssignmentsForTests(): void {
  assignments.length = 0;
}
