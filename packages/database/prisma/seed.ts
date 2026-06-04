import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const DEMO_ORG_ID = "org_demo_001";
const DEMO_BRANCH_ID = "branch_demo_001";
const DEMO_PASSWORD_HASH = hashSync("uyanik123", 10);

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: { name: "Uyanik Demo Org" },
    create: { id: DEMO_ORG_ID, name: "Uyanik Demo Org" },
  });

  await prisma.branch.upsert({
    where: { id: DEMO_BRANCH_ID },
    update: { name: "Uyanik Demo Branch", organizationId: DEMO_ORG_ID },
    create: {
      id: DEMO_BRANCH_ID,
      name: "Uyanik Demo Branch",
      organizationId: DEMO_ORG_ID,
    },
  });

  const users = [
    {
      id: "user_student_001",
      email: "student@uyanik.local",
      role: "STUDENT" as const,
      studentId: "student_001",
      parentId: "parent_001",
    },
    {
      id: "user_coach_001",
      email: "coach@uyanik.local",
      role: "COACH" as const,
      coachId: "coach_001",
    },
    {
      id: "user_parent_001",
      email: "parent@uyanik.local",
      role: "PARENT" as const,
      parentId: "parent_001",
    },
    {
      id: "user_branch_001",
      email: "branch@uyanik.local",
      role: "BRANCH_MANAGER" as const,
    },
    {
      id: "user_admin_001",
      email: "admin@uyanik.local",
      role: "ORG_ADMIN" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: user.role,
        organizationId: DEMO_ORG_ID,
        branchId: DEMO_BRANCH_ID,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: user.role,
        organizationId: DEMO_ORG_ID,
        branchId: DEMO_BRANCH_ID,
      },
    });
  }

  await prisma.coachProfile.upsert({
    where: { id: "coach_001" },
    update: { userId: "user_coach_001" },
    create: { id: "coach_001", userId: "user_coach_001" },
  });

  await prisma.parentProfile.upsert({
    where: { id: "parent_001" },
    update: { userId: "user_parent_001" },
    create: { id: "parent_001", userId: "user_parent_001" },
  });

  await prisma.studentProfile.upsert({
    where: { id: "student_001" },
    update: { userId: "user_student_001", parentId: "parent_001" },
    create: { id: "student_001", userId: "user_student_001", parentId: "parent_001" },
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  await prisma.assignment.upsert({
    where: { id: "assignment_seed_001" },
    update: {
      title: "Matematik tekrar odevi",
      description: "Demo seed odevi — DB-backed alpha",
      type: "homework",
      priority: "medium",
      status: "pending",
      subject: "Matematik",
      dueDate,
      coachId: "coach_001",
      studentId: "student_001",
      parentId: "parent_001",
      branchId: DEMO_BRANCH_ID,
      completed: false,
      completedAt: null,
    },
    create: {
      id: "assignment_seed_001",
      title: "Matematik tekrar odevi",
      description: "Demo seed odevi — DB-backed alpha",
      type: "homework",
      priority: "medium",
      status: "pending",
      subject: "Matematik",
      dueDate,
      coachId: "coach_001",
      studentId: "student_001",
      parentId: "parent_001",
      branchId: DEMO_BRANCH_ID,
    },
  });

  const sampleSubject = await prisma.subject.upsert({
    where: { id: "subject_seed_tyt_mat" },
    update: {
      studentId: "student_001",
      examType: "TYT",
      name: "Matematik (ornek — silinebilir)",
    },
    create: {
      id: "subject_seed_tyt_mat",
      studentId: "student_001",
      examType: "TYT",
      name: "Matematik (ornek — silinebilir)",
    },
  });

  await prisma.topic.upsert({
    where: { id: "topic_seed_tyt_1" },
    update: {
      subjectId: sampleSubject.id,
      studentId: "student_001",
      name: "Temel kavramlar (ornek)",
    },
    create: {
      id: "topic_seed_tyt_1",
      subjectId: sampleSubject.id,
      studentId: "student_001",
      name: "Temel kavramlar (ornek)",
      progress: {
        create: {
          studentId: "student_001",
          completed: true,
          completedAt: new Date(),
        },
      },
    },
  });

  await prisma.topic.upsert({
    where: { id: "topic_seed_tyt_2" },
    update: {
      subjectId: sampleSubject.id,
      studentId: "student_001",
      name: "Problemler (ornek)",
    },
    create: {
      id: "topic_seed_tyt_2",
      subjectId: sampleSubject.id,
      studentId: "student_001",
      name: "Problemler (ornek)",
      progress: {
        create: {
          studentId: "student_001",
          completed: false,
        },
      },
    },
  });

  console.log("Seed completed: demo org, branch, users, profiles, assignment, sample topics");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
