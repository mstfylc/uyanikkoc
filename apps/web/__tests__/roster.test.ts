import { describe, expect, it } from "vitest";

import {
  coachHasStudent,
  listCoachStudents,
  resolveParentIdForStudent,
} from "@/mocks/roster";

describe("coach roster mock store", () => {
  it("coach_001 iki demo ogrenci listeler", () => {
    const roster = listCoachStudents("coach_001");
    expect(roster).toHaveLength(2);
    expect(roster.map((entry) => entry.studentId)).toEqual(["student_001", "student_002"]);
  });

  it("coachHasStudent roster disindaki ogrenciyi reddeder", () => {
    expect(coachHasStudent("coach_001", "student_001")).toBe(true);
    expect(coachHasStudent("coach_001", "student_999")).toBe(false);
  });

  it("resolveParentIdForStudent ogrenci velisini doner", () => {
    expect(resolveParentIdForStudent("student_001")).toBe("parent_001");
    expect(resolveParentIdForStudent("student_002")).toBe("parent_002");
  });
});
