import { afterEach, describe, expect, it } from "vitest";

import {
  completeAssignment,
  createAssignment,
  resetAssignmentsForTests,
} from "@/mocks/assignments";

afterEach(() => {
  resetAssignmentsForTests();
});

describe("assignment alpha mock store", () => {
  it("title-only create varsayılan alpha alanlarıyla kaydeder", () => {
    const assignment = createAssignment({
      title: "Matematik tekrar",
      coachId: "coach_001",
      studentId: "student_001",
      parentId: "parent_001",
      branchId: "branch_demo_001",
    });

    expect(assignment.title).toBe("Matematik tekrar");
    expect(assignment.description).toBeNull();
    expect(assignment.type).toBe("homework");
    expect(assignment.priority).toBe("medium");
    expect(assignment.status).toBe("pending");
    expect(assignment.subject).toBeNull();
    expect(assignment.dueDate).toBeNull();
    expect(assignment.updatedAt).toBeTruthy();
  });

  it("opsiyonel alpha alanları create ile set edilir", () => {
    const assignment = createAssignment({
      title: "Deneme analizi",
      coachId: "coach_001",
      studentId: "student_001",
      parentId: "parent_001",
      branchId: "branch_demo_001",
      description: "TYT paragraf",
      type: "exam_prep",
      priority: "high",
      subject: "Türkçe",
      dueDate: "2026-06-10T12:00:00.000Z",
    });

    expect(assignment.description).toBe("TYT paragraf");
    expect(assignment.type).toBe("exam_prep");
    expect(assignment.priority).toBe("high");
    expect(assignment.subject).toBe("Türkçe");
    expect(assignment.dueDate).toBe("2026-06-10T12:00:00.000Z");
  });

  it("completeAssignment status ve completed alanlarını günceller", () => {
    const created = createAssignment({
      title: "Fizik soruları",
      coachId: "coach_001",
      studentId: "student_001",
      parentId: "parent_001",
      branchId: "branch_demo_001",
    });

    const completed = completeAssignment(created.id, "student_001");
    expect(completed?.status).toBe("completed");
    expect(completed?.completed).toBe(true);
    expect(completed?.completedAt).toBeTruthy();
    expect(completed?.updatedAt).toBeTruthy();
  });
});
