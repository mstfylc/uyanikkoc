import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const DEMO_ORG_ID = "org_demo_001";
const DEMO_BRANCH_ID = "branch_demo_001";
const KAMPUS_KOC_ORG_ID = "akademi-yildiz";
const KAMPUS_KOC_BRANCH_ID = "ay-kadikoy";
const DEMO_PASSWORD_HASH = hashSync("uyanik123", 10);

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: { name: "Uyanık Demo Kurum" },
    create: { id: DEMO_ORG_ID, name: "Uyanık Demo Kurum" },
  });

  await prisma.branch.upsert({
    where: { id: DEMO_BRANCH_ID },
    update: { name: "Uyanık Demo Şube", organizationId: DEMO_ORG_ID },
    create: {
      id: DEMO_BRANCH_ID,
      name: "Uyanık Demo Şube",
      organizationId: DEMO_ORG_ID,
    },
  });

  await prisma.organization.upsert({
    where: { id: KAMPUS_KOC_ORG_ID },
    update: { name: "Kampüs Koç" },
    create: { id: KAMPUS_KOC_ORG_ID, name: "Kampüs Koç" },
  });

  await prisma.branch.upsert({
    where: { id: KAMPUS_KOC_BRANCH_ID },
    update: { name: "Kadikoy Subesi", organizationId: KAMPUS_KOC_ORG_ID },
    create: {
      id: KAMPUS_KOC_BRANCH_ID,
      name: "Kadikoy Subesi",
      organizationId: KAMPUS_KOC_ORG_ID,
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
      id: "user_student_002",
      email: "student2@uyanik.local",
      role: "STUDENT" as const,
      studentId: "student_002",
      parentId: "parent_002",
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
      id: "user_parent_002",
      email: "parent2@uyanik.local",
      role: "PARENT" as const,
      parentId: "parent_002",
    },
    {
      id: "user_branch_001",
      email: "branch@uyanik.local",
      role: "BRANCH_MANAGER" as const,
    },
    {
      id: "user_kampus_koc_owner",
      email: "incisel@kampuskoc.com",
      role: "BRANCH_MANAGER" as const,
      organizationId: KAMPUS_KOC_ORG_ID,
      branchId: KAMPUS_KOC_BRANCH_ID,
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
        organizationId: user.organizationId ?? DEMO_ORG_ID,
        branchId: user.branchId ?? DEMO_BRANCH_ID,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: user.role,
        organizationId: user.organizationId ?? DEMO_ORG_ID,
        branchId: user.branchId ?? DEMO_BRANCH_ID,
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

  await prisma.parentProfile.upsert({
    where: { id: "parent_002" },
    update: { userId: "user_parent_002" },
    create: { id: "parent_002", userId: "user_parent_002" },
  });

  await prisma.studentProfile.upsert({
    where: { id: "student_001" },
    update: { userId: "user_student_001", parentId: "parent_001" },
    create: { id: "student_001", userId: "user_student_001", parentId: "parent_001" },
  });

  await prisma.studentProfile.upsert({
    where: { id: "student_002" },
    update: { userId: "user_student_002", parentId: "parent_002" },
    create: { id: "student_002", userId: "user_student_002", parentId: "parent_002" },
  });

  for (const studentId of ["student_001", "student_002"] as const) {
    await prisma.coachStudent.upsert({
      where: {
        coachId_studentId: { coachId: "coach_001", studentId },
      },
      update: {},
      create: {
        id: `coach_student_${studentId}`,
        coachId: "coach_001",
        studentId,
      },
    });
  }

  const coachTaskSeed = [
    { id: "coach_task_001", text: "Mert'in haftalık programını revize et", studentId: "student_002", due: "Bugün", priority: "high" as const, done: false },
    { id: "coach_task_002", text: "Elif'in integral testini incele", studentId: "student_001", due: "Bugün", priority: "med" as const, done: false },
    { id: "coach_task_003", text: "Haftalik raporlari hazirla", studentId: null, due: "7 Haz", priority: "med" as const, done: false },
    { id: "coach_task_004", text: "Deneme #6 sonuclarini analiz et", studentId: null, due: "5 Haz", priority: "low" as const, done: true },
  ];
  for (const task of coachTaskSeed) {
    await prisma.coachTask.upsert({
      where: { id: task.id },
      update: { text: task.text, studentId: task.studentId, due: task.due, priority: task.priority, done: task.done },
      create: { ...task, coachId: "coach_001" },
    });
  }

  const announcementSeed = [
    { id: "coach_ann_001", title: "Pazar TYT Deneme #7", body: "8 Haziran Pazar 10:00'da TYT Genel Deneme #7 var. Erken uyuyun.", audience: "Tum ogrenciler", reach: 2 },
    { id: "coach_ann_002", title: "Deneme analizi hatirlatmasi", body: "Deneme sonrasi mutlaka yanlis analizi yapin.", audience: "Tum veliler", reach: 2 },
  ];
  for (const announcement of announcementSeed) {
    await prisma.coachAnnouncement.upsert({
      where: { id: announcement.id },
      update: { title: announcement.title, body: announcement.body, audience: announcement.audience, reach: announcement.reach },
      create: { ...announcement, coachId: "coach_001" },
    });
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  await prisma.assignment.upsert({
    where: { id: "assignment_seed_001" },
    update: {
      title: "Matematik tekrar ödevi",
      description: "Demo seed ödevi — DB-backed alpha",
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
      title: "Matematik tekrar ödevi",
      description: "Demo seed ödevi — DB-backed alpha",
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

  await seedExamResults();
  await seedFaz2Skeletons();
  await seedBillingPlans();
  await seedLicenses();

  console.log(
    "Seed completed: demo org, branch, users, profiles, assignment, topics, exams, notifications, messages, templates, billing plans, licenses",
  );
}

async function seedBillingPlans() {
  const plans = [
    {
      id: "standart",
      name: "Standart Koçluk",
      tagline: "Düzenli takip ve birebir koçluk",
      monthly: 1499,
      annual: 14990,
      popular: false,
      sortOrder: 0,
      features: [
        "Haftalık birebir koçluk görüşmesi",
        "Kişiye özel haftalık çalışma programı",
        "Ödev atama ve takibi",
        "Deneme analizi ve net takibi",
        "Konu takibi paneli",
      ],
    },
    {
      id: "plus",
      name: "Plus Koçluk",
      tagline: "Aileyle birlikte tam destek",
      monthly: 2299,
      annual: 22990,
      popular: true,
      sortOrder: 1,
      features: [
        "Standart paketteki her sey",
        "Veliye haftalik gelisim raporu",
        "Sinirsiz mesajlasma (koc + ogrenci)",
        "Motivasyon ve hedef takibi",
        "Onceliklendirilmis randevu",
      ],
    },
    {
      id: "vip",
      name: "VIP Koçluk",
      tagline: "Yoğun tempo, üst düzey mentorluk",
      monthly: 3499,
      annual: 34990,
      popular: false,
      sortOrder: 2,
      features: [
        "Plus paketteki her sey",
        "Haftada 2 birebir görüşme",
        "Kidemli mentor eslestirmesi",
        "Tercih ve kariyer danismanligi",
        "7/24 oncelikli destek hatti",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.billingPlan.upsert({ where: { id: plan.id }, update: plan, create: plan });
  }
}

async function seedLicenses() {
  const now = new Date();
  const inOneYear = new Date(now);
  inOneYear.setFullYear(inOneYear.getFullYear() + 1);
  const expiredAt = new Date(now);
  expiredAt.setDate(expiredAt.getDate() - 7);
  const canceledAt = new Date(now);
  canceledAt.setDate(canceledAt.getDate() - 2);

  const licenses = [
    {
      id: "license_demo_coach_active",
      ownerType: "coach" as const,
      ownerId: "coach_001",
      planId: "plus",
      status: "active" as const,
      expiresAt: inOneYear,
      canceledAt: null,
    },
    {
      id: "license_demo_org_active",
      ownerType: "organization" as const,
      ownerId: DEMO_ORG_ID,
      planId: "vip",
      status: "active" as const,
      expiresAt: inOneYear,
      canceledAt: null,
    },
    {
      id: "license_fixture_coach_canceled",
      ownerType: "coach" as const,
      ownerId: "coach_canceled_fixture",
      planId: "standart",
      status: "canceled" as const,
      expiresAt: inOneYear,
      canceledAt,
    },
    {
      id: "license_fixture_org_expired",
      ownerType: "organization" as const,
      ownerId: "org_expired_fixture",
      planId: "standart",
      status: "active" as const,
      expiresAt: expiredAt,
      canceledAt: null,
    },
  ];

  for (const license of licenses) {
    await prisma.license.upsert({
      where: { id: license.id },
      update: license,
      create: license,
    });
  }
}

async function seedFaz2Skeletons() {
  await prisma.notification.upsert({
    where: { sourceKey: "welcome:student_001" },
    update: {
      studentId: "student_001",
      parentId: null,
      title: "Hos geldin",
      body: "Uyanık Koç alpha bildirim iskeleti.",
      read: false,
    },
    create: {
      id: "notification_seed_001",
      studentId: "student_001",
      title: "Hos geldin",
      body: "Uyanık Koç alpha bildirim iskeleti.",
      sourceKey: "welcome:student_001",
    },
  });

  await prisma.messageThread.upsert({
    where: { id: "thread_seed_coach_student" },
    update: {
      coachId: "coach_001",
      studentId: "student_001",
      parentId: null,
      title: "Koç — Öğrenci",
    },
    create: {
      id: "thread_seed_coach_student",
      coachId: "coach_001",
      studentId: "student_001",
      title: "Koç — Öğrenci",
      messages: {
        create: [
          {
            senderRole: "COACH",
            body: "Merhaba, bu haftaki ödev planını birlikte gözden geçirelim.",
          },
          {
            senderRole: "STUDENT",
            body: "Tamam hocam, matematik ödevine başladım.",
          },
        ],
      },
    },
  });

  await prisma.assignmentTemplate.upsert({
    where: { id: "template_seed_001" },
    update: {
      coachId: "coach_001",
      title: "Matematik tekrar (sablon)",
      description: "Günlük matematik tekrar seti",
      type: "homework",
      priority: "medium",
      subject: "Matematik",
    },
    create: {
      id: "template_seed_001",
      coachId: "coach_001",
      title: "Matematik tekrar (sablon)",
      description: "Günlük matematik tekrar seti",
      type: "homework",
      priority: "medium",
      subject: "Matematik",
    },
  });
}

async function seedExamResults() {
  const olderTakenAt = new Date("2026-05-10T10:00:00.000Z");
  const newerTakenAt = new Date("2026-06-01T10:00:00.000Z");

  const examOneSubjects = [
    { subjectName: "Turkce", correct: 32, wrong: 6, net: 30.5 },
    { subjectName: "Matematik", correct: 18, wrong: 8, net: 16 },
    { subjectName: "Fen", correct: 12, wrong: 5, net: 10.75 },
    { subjectName: "Sosyal", correct: 14, wrong: 4, net: 13 },
  ];

  await prisma.examResult.upsert({
    where: { id: "exam_seed_tyt_1" },
    update: {
      studentId: "student_001",
      examType: "TYT",
      label: "TYT Deneme 1",
      takenAt: olderTakenAt,
      totalNet: 70.25,
    },
    create: {
      id: "exam_seed_tyt_1",
      studentId: "student_001",
      examType: "TYT",
      label: "TYT Deneme 1",
      takenAt: olderTakenAt,
      totalNet: 70.25,
      subjects: {
        create: examOneSubjects.map((subject, index) => ({
          id: `exam_seed_sub_1_${index + 1}`,
          ...subject,
        })),
      },
    },
  });

  const examTwoSubjects = [
    { subjectName: "Turkce", correct: 34, wrong: 5, net: 32.75 },
    { subjectName: "Matematik", correct: 20, wrong: 7, net: 18.25 },
    { subjectName: "Fen", correct: 13, wrong: 4, net: 12 },
    { subjectName: "Sosyal", correct: 15, wrong: 4, net: 14 },
  ];

  await prisma.examResult.upsert({
    where: { id: "exam_seed_tyt_2" },
    update: {
      studentId: "student_001",
      examType: "TYT",
      label: "TYT Deneme 2",
      takenAt: newerTakenAt,
      totalNet: 77,
    },
    create: {
      id: "exam_seed_tyt_2",
      studentId: "student_001",
      examType: "TYT",
      label: "TYT Deneme 2",
      takenAt: newerTakenAt,
      totalNet: 77,
      subjects: {
        create: examTwoSubjects.map((subject, index) => ({
          id: `exam_seed_sub_2_${index + 1}`,
          ...subject,
        })),
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
