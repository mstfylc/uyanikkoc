import { afterEach, describe, expect, it, vi } from "vitest";

type MockAssignment = {
  id: string;
  title: string;
  description: string | null;
  type: "practice";
  priority: "medium";
  status: "pending" | "completed";
  subject: string | null;
  dueDate: string | null;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  completedAt: string | null;
  result?: { correct: number; wrong: number; blank: number; net: number } | null;
};

const assignments = new Map<string, MockAssignment[]>([
  [
    "student_a",
    [
      {
        id: "odev_a",
        title: "Paragraf 30 soru",
        description: "Bilgi Sarmal",
        type: "practice",
        priority: "medium",
        status: "pending",
        subject: "Turkce",
        dueDate: "2026-06-10T00:00:00.000Z",
        coachId: "coach",
        studentId: "student_a",
        parentId: "parent",
        branchId: "branch",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
        completed: false,
        completedAt: null,
        result: null,
      },
    ],
  ],
  [
    "student_b",
    [
      {
        id: "odev_b",
        title: "Turev 40 soru",
        description: "Apotemi",
        type: "practice",
        priority: "medium",
        status: "pending",
        subject: "Matematik",
        dueDate: "2026-06-11T00:00:00.000Z",
        coachId: "coach",
        studentId: "student_b",
        parentId: "parent",
        branchId: "branch",
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
        completed: false,
        completedAt: null,
        result: null,
      },
    ],
  ],
]);

vi.mock("@/server/services/assignment.service", () => ({
  listStudentAssignments: vi.fn((studentId: string) => Promise.resolve(assignments.get(studentId) ?? [])),
  submitStudentAssignmentResult: vi.fn(
    (assignmentId: string, studentId: string, input: { correct: number; wrong: number; blank: number }) => {
      const own = assignments.get(studentId)?.find((assignment) => assignment.id === assignmentId);
      if (!own) return Promise.resolve(null);
      own.completed = true;
      own.status = "completed";
      own.result = { correct: input.correct, wrong: input.wrong, blank: input.blank, net: input.correct - input.wrong / 4 };
      return Promise.resolve({ assignment: own, result: own.result });
    },
  ),
}));

vi.mock("@/server/services/exam.service", () => ({
  listStudentExams: vi.fn(() => Promise.resolve({ exams: [], summary: { latestNet: null, previousNet: null, trend: "flat", examType: null, takenAt: null, examCount: 0 } })),
}));

vi.mock("@/server/services/schedule.service", () => ({
  getStudentStudyPlan: vi.fn(() => Promise.resolve([])),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("mobile student DB mapping", () => {
  it("scopes mobile assignments by student id and keeps result writes isolated", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://mobile-student-test");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    const { getOdev, saveOdevResult } = await import("@/server/services/mobile-student.service");

    const aBefore = await getOdev("student_a");
    const bBefore = await getOdev("student_b");

    expect(aBefore.items.map((item) => item.id)).toEqual(["odev_a"]);
    expect(bBefore.items.map((item) => item.id)).toEqual(["odev_b"]);

    const saved = await saveOdevResult("student_a", "odev_a", { d: 25, y: 4, b: 1 });
    expect(saved).toMatchObject({ id: "odev_a", result: { d: 25, y: 4, b: 1 }, status: "done" });

    const bAfter = await getOdev("student_b");
    expect(bAfter.items[0]).toMatchObject({ id: "odev_b", result: null, status: "pending" });
    await expect(saveOdevResult("student_b", "odev_a", { d: 1, y: 1, b: 1 })).resolves.toBeNull();
  });
});
