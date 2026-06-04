/**
 * DB-backed alpha flow verification.
 * Requires DATABASE_URL and applied migrations + seed.
 */
import { compareSync } from "bcryptjs";

import * as assignmentRepository from "../src/repositories/assignments";
import * as authRepository from "../src/repositories/auth";

const DEMO_STUDENT_ID = "student_001";
const DEMO_COACH_ID = "coach_001";
const DEMO_PARENT_ID = "parent_001";
const DEMO_BRANCH_ID = "branch_demo_001";

async function main() {
  const coach = await authRepository.findUserByEmail("coach@uyanik.local");
  const student = await authRepository.findUserByEmail("student@uyanik.local");
  const parent = await authRepository.findUserByEmail("parent@uyanik.local");

  if (!coach || !student || !parent) {
    throw new Error("Demo users missing after seed");
  }

  if (!compareSync("uyanik123", coach.passwordHash)) {
    throw new Error("Coach password hash mismatch");
  }

  const seeded = await assignmentRepository.listAssignmentsForCoach(DEMO_COACH_ID);
  const seedAssignment = seeded.find((item) => item.id === "assignment_seed_001");
  if (!seedAssignment) {
    throw new Error("Seed assignment missing");
  }

  const created = await assignmentRepository.createAssignment({
    title: "Verify alpha flow assignment",
    coachId: DEMO_COACH_ID,
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    branchId: DEMO_BRANCH_ID,
    type: "practice",
    priority: "high",
    subject: "Matematik",
  });

  const studentList = await assignmentRepository.listAssignmentsForStudent(DEMO_STUDENT_ID);
  if (!studentList.some((item) => item.id === created.id)) {
    throw new Error("Created assignment not visible to student");
  }

  const completed = await assignmentRepository.completeAssignment(created.id, DEMO_STUDENT_ID);
  if (!completed || completed.status !== "completed" || !completed.completed) {
    throw new Error("Assignment completion did not persist");
  }

  const summary = await assignmentRepository.getParentSummary(DEMO_PARENT_ID);
  if (summary.totalAssignments < 1 || summary.completedCount < 1) {
    throw new Error("Parent summary did not reflect completed assignment");
  }

  console.log("DB-backed alpha flow verified");
  console.log(
    JSON.stringify({
      coachId: coach.coachId,
      studentId: student.studentId,
      parentId: parent.parentId,
      totalAssignments: summary.totalAssignments,
      completedCount: summary.completedCount,
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
