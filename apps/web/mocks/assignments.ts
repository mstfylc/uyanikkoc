import type {
  AssignmentCreateInput,
  AssignmentPriority,
  AssignmentRecord,
  AssignmentStatus,
  AssignmentType,
} from "@uyanik/database";

export type Assignment = AssignmentRecord;

export type ParentSummary = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
  assignments: Assignment[];
  topicCompletionRate: number;
  topicCompletedCount: number;
  topicTotalCount: number;
  latestExamNet: number | null;
  latestExamType: import("@uyanik/database").ResultExamType | null;
  examTrend: "up" | "down" | "flat";
};

export const DEMO_ORG_ID = "org_demo_001";
export const DEMO_BRANCH_ID = "branch_demo_001";
export const DEMO_STUDENT_ID = "student_001";
export const DEMO_PARENT_ID = "parent_001";

const globalStore = globalThis as typeof globalThis & {
  __uyanikAssignments?: Assignment[];
};

const assignments = globalStore.__uyanikAssignments ?? (globalStore.__uyanikAssignments = []);

function nowIso(): string {
  return new Date().toISOString();
}

function daysFromNow(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function seedIfEmpty(): void {
  if (assignments.length > 0) {
    return;
  }

  const timestamp = nowIso();
  assignments.push(
    {
      id: "assignment_demo_001",
      title: "Turev kurallari - 40 soru",
      description: "Apotemi fasikulunden zincir ve carpim kuralini bitir.",
      type: "homework",
      priority: "high",
      status: "pending",
      subject: "Matematik",
      dueDate: daysFromNow(1, 20),
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      parentId: DEMO_PARENT_ID,
      branchId: DEMO_BRANCH_ID,
      createdAt: timestamp,
      updatedAt: timestamp,
      completed: false,
      completedAt: null,
    },
    {
      id: "assignment_demo_002",
      title: "Paragraf hız çalışması",
      description: "Bilgi Sarmal Paragraf kitabından süre tutarak 30 soru.",
      type: "homework",
      priority: "medium",
      status: "completed",
      subject: "Türkçe",
      dueDate: daysFromNow(-2, 18),
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      parentId: DEMO_PARENT_ID,
      branchId: DEMO_BRANCH_ID,
      createdAt: daysFromNow(-4, 10),
      updatedAt: daysFromNow(-1, 19),
      completed: true,
      completedAt: daysFromNow(-1, 19),
    },
    {
      id: "assignment_demo_003",
      title: "TYT deneme yanlış analizi",
      description: "Son denemedeki matematik ve fen yanlışlarını deftere işle.",
      type: "exam_prep",
      priority: "high",
      status: "pending",
      subject: "Genel",
      dueDate: daysFromNow(3, 21),
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      parentId: DEMO_PARENT_ID,
      branchId: DEMO_BRANCH_ID,
      createdAt: daysFromNow(-1, 9),
      updatedAt: daysFromNow(-1, 9),
      completed: false,
      completedAt: null,
    },
    {
      id: "assignment_demo_004",
      title: "Fonksiyonlar karma tekrar",
      description: "Kazanımı kapatmak için 25 karma soru.",
      type: "homework",
      priority: "medium",
      status: "completed",
      subject: "Matematik",
      dueDate: daysFromNow(-9, 19),
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      parentId: DEMO_PARENT_ID,
      branchId: DEMO_BRANCH_ID,
      createdAt: daysFromNow(-12, 10),
      updatedAt: daysFromNow(-9, 20),
      completed: true,
      completedAt: daysFromNow(-9, 20),
    },
    {
      id: "assignment_demo_005",
      title: "Mert - AYT geometri tarama",
      description: "Ucgen ve dortgen problemleri icin 35 soru.",
      type: "homework",
      priority: "medium",
      status: "pending",
      subject: "Geometri",
      dueDate: daysFromNow(2, 18),
      coachId: "coach_001",
      studentId: "student_002",
      parentId: "parent_002",
      branchId: DEMO_BRANCH_ID,
      createdAt: daysFromNow(-2, 11),
      updatedAt: daysFromNow(-2, 11),
      completed: false,
      completedAt: null,
    },
    {
      id: "assignment_demo_006",
      title: "Mert - Kimya mol kavrami",
      description: "Konu ozeti + 20 soru.",
      type: "reading",
      priority: "low",
      status: "completed",
      subject: "Kimya",
      dueDate: daysFromNow(-5, 18),
      coachId: "coach_001",
      studentId: "student_002",
      parentId: "parent_002",
      branchId: DEMO_BRANCH_ID,
      createdAt: daysFromNow(-7, 10),
      updatedAt: daysFromNow(-5, 19),
      completed: true,
      completedAt: daysFromNow(-5, 19),
    },
  );

  assignmentResults.assignment_demo_002 = { correct: 24, wrong: 4, blank: 2, net: 23 };
  assignmentResults.assignment_demo_004 = { correct: 21, wrong: 3, blank: 1, net: 20.25 };
  assignmentResults.assignment_demo_006 = { correct: 17, wrong: 2, blank: 1, net: 16.5 };
}

export function createAssignment(input: AssignmentCreateInput): Assignment {
  const timestamp = nowIso();
  const assignment: Assignment = {
    id: `assignment_${assignments.length + 1}`,
    title: input.title,
    description: input.description ?? null,
    type: input.type ?? "homework",
    priority: input.priority ?? "medium",
    status: "pending",
    subject: input.subject ?? null,
    dueDate: input.dueDate ?? null,
    coachId: input.coachId,
    studentId: input.studentId,
    parentId: input.parentId,
    branchId: input.branchId ?? DEMO_BRANCH_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    completed: false,
    completedAt: null,
  };

  assignments.push(assignment);
  return assignment;
}

export function listAssignmentsForStudent(studentId: string): Assignment[] {
  seedIfEmpty();
  return assignments.filter((assignment) => assignment.studentId === studentId);
}

export function listAssignmentsForCoach(coachId: string): Assignment[] {
  seedIfEmpty();
  return assignments.filter((assignment) => assignment.coachId === coachId);
}

export function listAssignmentsForParent(parentId: string): Assignment[] {
  seedIfEmpty();
  return assignments.filter((assignment) => assignment.parentId === parentId);
}

export function completeAssignment(assignmentId: string, studentId: string): Assignment | null {
  const assignment = assignments.find(
    (item) => item.id === assignmentId && item.studentId === studentId,
  );

  if (!assignment) {
    return null;
  }

  assignment.status = "completed";
  assignment.completed = true;
  assignment.completedAt = nowIso();
  assignment.updatedAt = nowIso();
  return assignment;
}

export type AssignmentResultRecord = {
  correct: number;
  wrong: number;
  blank: number;
  net: number;
};

const resultStore = globalStore as typeof globalStore & {
  __uyanikAssignmentResults?: Record<string, AssignmentResultRecord>;
};

const assignmentResults =
  resultStore.__uyanikAssignmentResults ?? (resultStore.__uyanikAssignmentResults = {});

export function getAssignmentResult(assignmentId: string): AssignmentResultRecord | null {
  return assignmentResults[assignmentId] ?? null;
}

export function submitAssignmentResult(
  assignmentId: string,
  studentId: string,
  input: { correct: number; wrong: number; blank: number },
): { assignment: Assignment; result: AssignmentResultRecord } | null {
  const assignment = completeAssignment(assignmentId, studentId);
  if (!assignment) {
    return null;
  }

  const net = input.correct - input.wrong / 4;
  const result: AssignmentResultRecord = {
    correct: input.correct,
    wrong: input.wrong,
    blank: input.blank,
    net: +net.toFixed(2),
  };
  assignmentResults[assignmentId] = result;
  return { assignment, result };
}

export function getParentSummary(parentId: string): ParentSummary {
  seedIfEmpty();
  const parentAssignments = listAssignmentsForParent(parentId);
  const completedCount = parentAssignments.filter(
    (assignment) => assignment.status === "completed" || assignment.completed,
  ).length;

  return {
    totalAssignments: parentAssignments.length,
    completedCount,
    pendingCount: parentAssignments.length - completedCount,
    assignments: parentAssignments,
    topicCompletionRate: 0,
    topicCompletedCount: 0,
    topicTotalCount: 0,
    latestExamNet: null,
    latestExamType: null,
    examTrend: "flat",
  };
}

export function resetAssignmentsForTests(): void {
  assignments.length = 0;
}

export type { AssignmentCreateInput, AssignmentPriority, AssignmentStatus, AssignmentType };
