import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const DEMO_ORG_ID = "org_demo_001";
const DEMO_BRANCH_ID = "branch_demo_001";
const KAMPUS_KOC_ORG_ID = "akademi-yildiz";
const KAMPUS_KOC_BRANCH_ID = "ay-kadikoy";
const DEMO_PASSWORD_HASH = hashSync("uyanik123", 10);

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_RICH_ONLY === "1") {
    await seedRichDemoData();
    console.log("Rich demo seed completed: assignments, topics, mistakes, schedule, exams, messages, notifications, reports, billing, support");
    return;
  }

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
    { id: "coach_task_003", text: "Haftalık raporları hazırla", studentId: null, due: "7 Haz", priority: "med" as const, done: false },
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
    { id: "coach_ann_001", title: "Pazar TYT Deneme #7", body: "8 Haziran Pazar 10:00'da TYT Genel Deneme #7 var. Erken uyuyun.", audience: "Tüm öğrenciler", reach: 2 },
    { id: "coach_ann_002", title: "Deneme analizi hatırlatması", body: "Deneme sonrası mutlaka yanlış analizi yapın.", audience: "Tüm veliler", reach: 2 },
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
      name: "Matematik",
    },
    create: {
      id: "subject_seed_tyt_mat",
      studentId: "student_001",
      examType: "TYT",
      name: "Matematik",
    },
  });

  await prisma.topic.upsert({
    where: { id: "topic_seed_tyt_1" },
    update: {
      subjectId: sampleSubject.id,
      studentId: "student_001",
          name: "Temel Kavramlar",
    },
    create: {
      id: "topic_seed_tyt_1",
      subjectId: sampleSubject.id,
      studentId: "student_001",
          name: "Temel Kavramlar",
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
          name: "Problemler",
    },
    create: {
      id: "topic_seed_tyt_2",
      subjectId: sampleSubject.id,
      studentId: "student_001",
          name: "Problemler",
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
  await seedRichDemoData();

  console.log(
    "Seed completed: demo org, branch, users, profiles, assignments, topics, exams, mistakes, schedule, messages, notifications, billing, reports, tests, licenses",
  );
}

function daysFromNow(days: number, hour = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function daysAgo(days: number, hour = 10): Date {
  return daysFromNow(-days, hour);
}

function stableId(input: string): string {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash.toString(36);
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
        "Veliye haftalık gelişim raporu",
        "Sınırsız mesajlaşma (koç + öğrenci)",
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
        "Kıdemli mentor eşleştirmesi",
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
    { subjectName: "Türkçe", correct: 32, wrong: 6, net: 30.5 },
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
    { subjectName: "Türkçe", correct: 34, wrong: 5, net: 32.75 },
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

async function seedRichDemoData() {
  await seedRichAssignments();
  await seedRichTopics();
  await seedRichSourcesAndSchedule();
  await seedRichMistakes();
  await seedRichExamsAndOptik();
  await seedRichCoachAndParentFlows();
  await seedRichBillingAndSupport();
}

async function seedRichAssignments() {
  const assignments = [
    {
      id: "assignment_demo_rich_001",
      title: "Problemler karma tekrar",
      description: "Hız ve Renk Problemler kitabından süre tutarak 40 soru.",
      type: "practice" as const,
      priority: "high" as const,
      status: "pending" as const,
      subject: "Matematik",
      dueDate: daysFromNow(1, 20),
      studentId: "student_001",
      parentId: "parent_001",
      completed: false,
      result: null,
    },
    {
      id: "assignment_demo_rich_002",
      title: "Paragraf hız çalışması",
      description: "Bilgi Sarmal Paragraf kitabından süre tutarak 30 soru.",
      type: "practice" as const,
      priority: "medium" as const,
      status: "completed" as const,
      subject: "Türkçe",
      dueDate: daysAgo(2, 18),
      studentId: "student_001",
      parentId: "parent_001",
      completed: true,
      result: { correct: 24, wrong: 4, blank: 2, net: 23 },
    },
    {
      id: "assignment_demo_rich_003",
      title: "TYT deneme yanlış analizi",
      description: "Son denemedeki matematik ve fen yanlışlarını deftere işle.",
      type: "exam_prep" as const,
      priority: "high" as const,
      status: "pending" as const,
      subject: "Genel",
      dueDate: daysFromNow(3, 19),
      studentId: "student_001",
      parentId: "parent_001",
      completed: false,
      result: null,
    },
    {
      id: "assignment_demo_rich_004",
      title: "LGS fen mini deneme",
      description: "Mert için 20 soruluk fen taraması.",
      type: "exam_prep" as const,
      priority: "medium" as const,
      status: "completed" as const,
      subject: "Fen Bilimleri",
      dueDate: daysAgo(1, 19),
      studentId: "student_002",
      parentId: "parent_002",
      completed: true,
      result: { correct: 17, wrong: 2, blank: 1, net: 16.5 },
    },
  ];

  for (const assignment of assignments) {
    await prisma.assignment.upsert({
      where: { id: assignment.id },
      update: {
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,
        status: assignment.status,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        coachId: "coach_001",
        studentId: assignment.studentId,
        parentId: assignment.parentId,
        branchId: DEMO_BRANCH_ID,
        completed: assignment.completed,
        completedAt: assignment.completed ? assignment.dueDate : null,
      },
      create: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        priority: assignment.priority,
        status: assignment.status,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        coachId: "coach_001",
        studentId: assignment.studentId,
        parentId: assignment.parentId,
        branchId: DEMO_BRANCH_ID,
        completed: assignment.completed,
        completedAt: assignment.completed ? assignment.dueDate : null,
      },
    });

    if (assignment.result) {
      await prisma.assignmentResult.upsert({
        where: { assignmentId: assignment.id },
        update: { studentId: assignment.studentId, ...assignment.result },
        create: { id: `result_${assignment.id}`, assignmentId: assignment.id, studentId: assignment.studentId, ...assignment.result },
      });
    }
  }
}

async function seedRichTopics() {
  const subjects = [
    { id: "subject_demo_001_tyt_tr", studentId: "student_001", examType: "TYT" as const, name: "Türkçe" },
    { id: "subject_demo_001_ayt_fizik", studentId: "student_001", examType: "AYT" as const, name: "Fizik" },
    { id: "subject_demo_002_lgs_mat", studentId: "student_002", examType: "LGS" as const, name: "Matematik" },
    { id: "subject_demo_002_lgs_fen", studentId: "student_002", examType: "LGS" as const, name: "Fen Bilimleri" },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({ where: { id: subject.id }, update: subject, create: subject });
  }

  const topics = [
    { id: "topic_demo_001_paragraf", subjectId: "subject_demo_001_tyt_tr", studentId: "student_001", name: "Paragraf", completed: true, inProgress: false, sources: ["Hız ve Renk Paragraf"] },
    { id: "topic_demo_001_sozcuk", subjectId: "subject_demo_001_tyt_tr", studentId: "student_001", name: "Sözcükte Anlam", completed: false, inProgress: true, sources: ["Bilgi Sarmal Paragraf"] },
    { id: "topic_demo_001_elektrik", subjectId: "subject_demo_001_ayt_fizik", studentId: "student_001", name: "Elektrik", completed: false, inProgress: true, sources: ["3D AYT Fizik Soru Bankası"] },
    { id: "topic_demo_002_oran", subjectId: "subject_demo_002_lgs_mat", studentId: "student_002", name: "Oran Orantı", completed: true, inProgress: false, sources: ["LGS Matematik Soru Bankası"] },
    { id: "topic_demo_002_madde", subjectId: "subject_demo_002_lgs_fen", studentId: "student_002", name: "Madde ve Isı", completed: false, inProgress: true, sources: ["LGS Fen Bilimleri"] },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: { subjectId: topic.subjectId, studentId: topic.studentId, name: topic.name },
      create: { id: topic.id, subjectId: topic.subjectId, studentId: topic.studentId, name: topic.name },
    });
    await prisma.topicProgress.upsert({
      where: { topicId: topic.id },
      update: {
        studentId: topic.studentId,
        completed: topic.completed,
        inProgress: topic.inProgress,
        completedSources: topic.sources,
        completedAt: topic.completed ? daysAgo(3) : null,
      },
      create: {
        id: `progress_${topic.id}`,
        topicId: topic.id,
        studentId: topic.studentId,
        completed: topic.completed,
        inProgress: topic.inProgress,
        completedSources: topic.sources,
        completedAt: topic.completed ? daysAgo(3) : null,
      },
    });
  }

  const sessions = [
    { id: "topic_session_demo_001_1", topicId: "topic_seed_tyt_1", studentId: "student_001", date: daysAgo(5), questionCount: 80, correctCount: 58 },
    { id: "topic_session_demo_001_2", topicId: "topic_seed_tyt_2", studentId: "student_001", date: daysAgo(2), questionCount: 65, correctCount: 41 },
    { id: "topic_session_demo_001_3", topicId: "topic_demo_001_paragraf", studentId: "student_001", date: daysAgo(1), questionCount: 40, correctCount: 31 },
    { id: "topic_session_demo_002_1", topicId: "topic_demo_002_madde", studentId: "student_002", date: daysAgo(1), questionCount: 35, correctCount: 25 },
  ];
  for (const session of sessions) {
    await prisma.topicStudySession.upsert({ where: { id: session.id }, update: session, create: session });
  }

  await prisma.coachTopicTarget.upsert({
    where: { coachId_studentId: { coachId: "coach_001", studentId: "student_001" } },
    update: { targets: { Matematik: 260, Türkçe: 135, Fizik: 150, Kimya: 120 } },
    create: { id: "coach_target_student_001", coachId: "coach_001", studentId: "student_001", targets: { Matematik: 260, Türkçe: 135, Fizik: 150, Kimya: 120 } },
  });
}

async function seedRichSourcesAndSchedule() {
  const sources = [
    ["student_001", "3D YAYINLARI 3D AYT Biyoloji Soru Bankası"],
    ["student_001", "3D YAYINLARI 3D TYT MATEMATİK SORU BANKASI"],
    ["student_001", "Hız ve Renk Paragraf Soru Bankası"],
    ["student_002", "LGS Matematik Soru Bankası"],
    ["student_002", "LGS Fen Bilimleri Soru Bankası"],
  ] as const;
  for (const [studentId, label] of sources) {
    await prisma.studentSource.upsert({
      where: { studentId_label: { studentId, label } },
      update: {},
      create: { id: `source_${studentId}_${stableId(label)}`, studentId, label },
    });
  }

  await prisma.studentSchedule.upsert({
    where: { studentId: "student_001" },
    update: {
      attendsSchool: true,
      grid: {
        Pzt: ["Matematik", "Matematik", "Fizik", "Türkçe", "Kimya", "Beden", "", ""],
        Sal: ["Türkçe", "Biyoloji", "Biyoloji", "Matematik", "Tarih", "Din", "", ""],
        Car: ["Fizik", "Fizik", "Matematik", "Kimya", "Türkçe", "İngilizce", "", ""],
        Per: ["Kimya", "Matematik", "Türkçe", "Biyoloji", "Coğrafya", "Rehberlik", "", ""],
        Cum: ["Matematik", "Türkçe", "Fizik", "Edebiyat", "Beden", "", "", ""],
      },
    },
    create: {
      id: "schedule_student_001",
      studentId: "student_001",
      attendsSchool: true,
      grid: {
        Pzt: ["Matematik", "Matematik", "Fizik", "Türkçe", "Kimya", "Beden", "", ""],
        Sal: ["Türkçe", "Biyoloji", "Biyoloji", "Matematik", "Tarih", "Din", "", ""],
        Car: ["Fizik", "Fizik", "Matematik", "Kimya", "Türkçe", "İngilizce", "", ""],
        Per: ["Kimya", "Matematik", "Türkçe", "Biyoloji", "Coğrafya", "Rehberlik", "", ""],
        Cum: ["Matematik", "Türkçe", "Fizik", "Edebiyat", "Beden", "", "", ""],
      },
    },
  });

  const blocks = [
    { id: "study_block_demo_001", studentId: "student_001", day: "Pzt", time: "17:00", subject: "Matematik", topic: "Problemler", type: "Soru", status: "progress" as const, source: "3D YAYINLARI 3D TYT MATEMATİK SORU BANKASI", correct: 31, wrong: 9, net: 28.75 },
    { id: "study_block_demo_002", studentId: "student_001", day: "Car", time: "19:00", subject: "Fizik", topic: "Elektrik", type: "Konu", status: "todo" as const, source: null, correct: null, wrong: null, net: null },
    { id: "study_block_demo_003", studentId: "student_001", day: "Cmt", time: "11:00", subject: "Türkçe", topic: "Paragraf", type: "Soru", status: "done" as const, source: "Hız ve Renk Paragraf Soru Bankası", correct: 24, wrong: 4, net: 23 },
    { id: "study_block_demo_004", studentId: "student_002", day: "Sal", time: "18:00", subject: "Fen Bilimleri", topic: "Madde ve Isı", type: "Soru", status: "todo" as const, source: "LGS Fen Bilimleri Soru Bankası", correct: null, wrong: null, net: null },
  ];
  for (const block of blocks) {
    await prisma.studyBlock.upsert({ where: { id: block.id }, update: block, create: block });
  }
}

async function seedRichMistakes() {
  const mistakes = [
    { id: "mistake_demo_001", studentId: "student_001", subject: "Matematik", topic: "Problemler", subtopic: "Yaş problemi", errorType: "islem" as const, source: "TYT Deneme 2", qType: "yeninesil" as const, note: "Denklem kurarken yaş farkını ters yazdı.", status: "tekrar" as const, stage: 1, nextDue: daysFromNow(0, 20), sourceKind: "exam_result", sourceRefId: "exam_seed_tyt_2", sourceLabel: "TYT Deneme 2" },
    { id: "mistake_demo_002", studentId: "student_001", subject: "Fizik", topic: "Kuvvet ve Newton", subtopic: "Sürtünme", errorType: "dikkat" as const, source: "Ödev", qType: "klasik" as const, note: "Birim dönüşümünü atladı.", status: "tekrar" as const, stage: 2, nextDue: daysFromNow(0, 19), sourceKind: "assignment_result", sourceRefId: "assignment_demo_rich_002", sourceLabel: "Paragraf hız çalışması" },
    { id: "mistake_demo_003", studentId: "student_001", subject: "Türkçe", topic: "Paragraf", subtopic: "Ana düşünce", errorType: "sure" as const, source: "Paragraf kitabı", qType: "yorum" as const, note: "Süre baskısında seçenek eleme eksik.", status: "acik" as const, stage: 0, nextDue: daysFromNow(2, 18), sourceKind: "manual", sourceRefId: null, sourceLabel: "Manuel" },
    { id: "mistake_demo_004", studentId: "student_002", subject: "Fen Bilimleri", topic: "Madde ve Isı", subtopic: "Hal değişimi", errorType: "bilgi" as const, source: "LGS mini deneme", qType: "grafik" as const, note: "Grafik yorumunda ısı-sıcaklık ayrımı karıştı.", status: "acik" as const, stage: 0, nextDue: daysFromNow(1, 18), sourceKind: "exam_result", sourceRefId: "exam_demo_lgs_1", sourceLabel: "LGS Mini Deneme" },
  ];

  for (const mistake of mistakes) {
    await prisma.mistake.upsert({ where: { id: mistake.id }, update: mistake, create: mistake });
  }

  await prisma.mistakeReview.upsert({
    where: { id: "mistake_review_demo_001" },
    update: { mistakeId: "mistake_demo_002", studentId: "student_001", stage: 1, reviewedAt: daysAgo(2, 21) },
    create: { id: "mistake_review_demo_001", mistakeId: "mistake_demo_002", studentId: "student_001", stage: 1, reviewedAt: daysAgo(2, 21) },
  });
}

async function seedRichExamsAndOptik() {
  const examSpecs = [
    {
      id: "exam_demo_tyt_3",
      studentId: "student_001",
      examType: "TYT" as const,
      label: "TYT Deneme 3",
      takenAt: daysAgo(9),
      totalNet: 82.5,
      subjects: [
        { subjectName: "Türkçe", correct: 35, wrong: 4, net: 34 },
        { subjectName: "Matematik", correct: 22, wrong: 7, net: 20.25 },
        { subjectName: "Fen", correct: 14, wrong: 3, net: 13.25 },
        { subjectName: "Sosyal", correct: 16, wrong: 4, net: 15 },
      ],
    },
    {
      id: "exam_demo_lgs_1",
      studentId: "student_002",
      examType: "LGS" as const,
      label: "LGS Mini Deneme",
      takenAt: daysAgo(4),
      totalNet: 64.25,
      subjects: [
        { subjectName: "Matematik", correct: 14, wrong: 4, net: 13 },
        { subjectName: "Fen Bilimleri", correct: 16, wrong: 3, net: 15.25 },
        { subjectName: "Türkçe", correct: 17, wrong: 2, net: 16.5 },
        { subjectName: "İngilizce", correct: 10, wrong: 0, net: 10 },
      ],
    },
  ];

  for (const exam of examSpecs) {
    await prisma.examResult.upsert({
      where: { id: exam.id },
      update: { studentId: exam.studentId, examType: exam.examType, label: exam.label, takenAt: exam.takenAt, totalNet: exam.totalNet },
      create: { id: exam.id, studentId: exam.studentId, examType: exam.examType, label: exam.label, takenAt: exam.takenAt, totalNet: exam.totalNet },
    });
    for (const [index, subject] of exam.subjects.entries()) {
      await prisma.examSubjectResult.upsert({
        where: { id: `${exam.id}_subject_${index + 1}` },
        update: { examResultId: exam.id, ...subject },
        create: { id: `${exam.id}_subject_${index + 1}`, examResultId: exam.id, ...subject },
      });
    }
  }

  await prisma.onlineExam.upsert({
    where: { id: "online_exam_demo_001" },
    update: {
      title: "TYT Online Deneme #8",
      publisher: "Kampüs Koç",
      examType: "TYT",
      questionCount: 20,
      answerKey: ["A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E"],
      cargoStatus: "teslim",
      branchId: DEMO_BRANCH_ID,
    },
    create: {
      id: "online_exam_demo_001",
      title: "TYT Online Deneme #8",
      publisher: "Kampüs Koç",
      examType: "TYT",
      questionCount: 20,
      answerKey: ["A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E"],
      cargoStatus: "teslim",
      branchId: DEMO_BRANCH_ID,
    },
  });
  await prisma.optikSubmission.upsert({
    where: { examId_studentId: { examId: "online_exam_demo_001", studentId: "student_001" } },
    update: {
      answers: ["A", "B", "C", "D", "", "A", "C", "C", "D", "E", "A", "B", "D", "D", "E", "A", "B", "", "D", "A"],
      correct: 15,
      wrong: 3,
      blank: 2,
      net: 14.25,
    },
    create: {
      id: "optik_submission_demo_001",
      examId: "online_exam_demo_001",
      studentId: "student_001",
      answers: ["A", "B", "C", "D", "", "A", "C", "C", "D", "E", "A", "B", "D", "D", "E", "A", "B", "", "D", "A"],
      correct: 15,
      wrong: 3,
      blank: 2,
      net: 14.25,
    },
  });
}

async function seedRichCoachAndParentFlows() {
  await prisma.appointmentSettings.upsert({
    where: { coachId: "coach_001" },
    update: {
      weeklyLimit: 4,
      weeklyLimitStudent: 2,
      weeklyLimitParent: 1,
      allowOnline: true,
      allowInPerson: true,
      allowPhone: true,
      availability: { Pzt: ["17:00", "18:00"], Sal: ["16:00"], Car: ["17:00"], Per: ["18:00"], Cum: ["16:00"], Cmt: ["11:00"] },
      slotModes: { "Pzt-17:00": ["online", "in_person"], "Sal-16:00": ["online"], "Cmt-11:00": ["phone"] },
    },
    create: {
      id: "appointment_settings_demo_001",
      coachId: "coach_001",
      weeklyLimit: 4,
      weeklyLimitStudent: 2,
      weeklyLimitParent: 1,
      allowOnline: true,
      allowInPerson: true,
      allowPhone: true,
      availability: { Pzt: ["17:00", "18:00"], Sal: ["16:00"], Car: ["17:00"], Per: ["18:00"], Cum: ["16:00"], Cmt: ["11:00"] },
      slotModes: { "Pzt-17:00": ["online", "in_person"], "Sal-16:00": ["online"], "Cmt-11:00": ["phone"] },
    },
  });

  const appointments = [
    { id: "appointment_demo_001", coachId: "coach_001", studentId: "student_001", day: "Pzt" as const, slot: "17:00", mode: "online" as const, topic: "Haftalık program kontrolü", requesterRole: "student" as const, status: "approved" as const },
    { id: "appointment_demo_002", coachId: "coach_001", studentId: "student_002", day: "Sal" as const, slot: "16:00", mode: "phone" as const, topic: "Veli bilgilendirme", requesterRole: "parent" as const, status: "pending" as const },
  ];
  for (const appointment of appointments) {
    await prisma.appointment.upsert({ where: { id: appointment.id }, update: appointment, create: appointment });
  }

  const threads = [
    { id: "thread_seed_coach_parent", coachId: "coach_001", studentId: null, parentId: "parent_001", kind: "dm" as const, name: null, title: "Koç — Veli" },
    { id: "thread_seed_group_demo", coachId: "coach_001", studentId: null, parentId: null, kind: "group" as const, name: "TYT Takip Grubu", title: "TYT Takip Grubu" },
  ];
  for (const thread of threads) {
    await prisma.messageThread.upsert({ where: { id: thread.id }, update: thread, create: thread });
  }

  const messages = [
    { id: "message_demo_parent_001", threadId: "thread_seed_coach_parent", senderRole: "COACH" as const, body: "Elif bu hafta paragraf hızında iyi ilerledi." },
    { id: "message_demo_parent_002", threadId: "thread_seed_coach_parent", senderRole: "PARENT" as const, body: "Teşekkürler, deneme analizini akşam kontrol edeceğiz." },
    { id: "message_demo_group_001", threadId: "thread_seed_group_demo", senderRole: "COACH" as const, body: "Hafta sonu deneme sonrası yanlış defteri güncellenecek." },
  ];
  for (const message of messages) {
    await prisma.message.upsert({ where: { id: message.id }, update: message, create: message });
  }

  const members = [
    { threadId: "thread_seed_coach_student", userId: "user_coach_001", muted: false, lastReadAt: daysAgo(1) },
    { threadId: "thread_seed_coach_student", userId: "user_student_001", muted: false, lastReadAt: daysAgo(2) },
    { threadId: "thread_seed_coach_parent", userId: "user_coach_001", muted: false, lastReadAt: daysAgo(1) },
    { threadId: "thread_seed_coach_parent", userId: "user_parent_001", muted: true, lastReadAt: daysAgo(3) },
    { threadId: "thread_seed_group_demo", userId: "user_student_001", muted: false, lastReadAt: null },
    { threadId: "thread_seed_group_demo", userId: "user_parent_001", muted: false, lastReadAt: null },
  ];
  for (const member of members) {
    await prisma.threadMember.upsert({
      where: { threadId_userId: { threadId: member.threadId, userId: member.userId } },
      update: { muted: member.muted, lastReadAt: member.lastReadAt },
      create: { id: `member_${member.threadId}_${member.userId}`, ...member },
    });
  }

  const notifications = [
    { id: "notification_demo_student_assignment", studentId: "student_001", parentId: null, coachId: null, title: "Yeni ödev", body: "Problemler karma tekrar ödevi atandı.", read: false, sourceKey: "demo:student:new-assignment" },
    { id: "notification_demo_student_mistake", studentId: "student_001", parentId: null, coachId: null, title: "Yanlış tekrarı", body: "Bugün 2 yanlış tekrar bekliyor.", read: false, sourceKey: "demo:student:mistake-review" },
    { id: "notification_demo_coach_risk", studentId: null, parentId: null, coachId: "coach_001", title: "Risk altında öğrenci", body: "Mert Demir 2 gündür program bloğu tamamlamadı.", read: false, sourceKey: "demo:coach:risk" },
    { id: "notification_demo_parent_report", studentId: null, parentId: "parent_001", coachId: null, title: "Haftalık gelişim raporu", body: "Elif için yeni veli raporu onay bekliyor.", read: false, sourceKey: "demo:parent:report" },
  ];
  for (const notification of notifications) {
    await prisma.notification.upsert({ where: { sourceKey: notification.sourceKey }, update: notification, create: notification });
  }

  await prisma.coachStudentNote.upsert({
    where: { id: "coach_note_demo_001" },
    update: { coachId: "coach_001", studentId: "student_001", text: "Deneme kaygısı var, sınav öncesi nefes egzersizi önerildi.", kind: "warning", pinned: true },
    create: { id: "coach_note_demo_001", coachId: "coach_001", studentId: "student_001", text: "Deneme kaygısı var, sınav öncesi nefes egzersizi önerildi.", kind: "warning", pinned: true },
  });

  await prisma.motivationMessage.upsert({
    where: { id: "motivation_message_demo_001" },
    update: { studentId: "student_001", coachId: "coach_001", body: "Bugün kısa ama net bir tekrar yap; problemler için 25 soru yeterli." },
    create: { id: "motivation_message_demo_001", studentId: "student_001", coachId: "coach_001", body: "Bugün kısa ama net bir tekrar yap; problemler için 25 soru yeterli." },
  });

  await prisma.coachRating.upsert({
    where: { studentId: "student_001" },
    update: { coachId: "coach_001", stars: 5, comment: "Program ve deneme analizi çok yardımcı oluyor." },
    create: { id: "coach_rating_demo_001", studentId: "student_001", coachId: "coach_001", stars: 5, comment: "Program ve deneme analizi çok yardımcı oluyor." },
  });

  const reports = [
    { id: "parent_report_demo_001", coachId: "coach_001", studentId: "student_001", parentId: "parent_001", studentName: "Elif Yıldız", parentName: "Ayşe Yıldız", week: "3-9 Haziran", completion: 72, netDelta: "+6.8", status: "pending" as const, sentAt: null },
    { id: "parent_report_demo_002", coachId: "coach_001", studentId: "student_002", parentId: "parent_002", studentName: "Mert Demir", parentName: "Selin Demir", week: "3-9 Haziran", completion: 61, netDelta: "+3.1", status: "approved" as const, sentAt: daysAgo(1) },
  ];
  for (const report of reports) {
    await prisma.parentReport.upsert({
      where: { coachId_studentId_week: { coachId: report.coachId, studentId: report.studentId, week: report.week } },
      update: report,
      create: report,
    });
  }

  await prisma.customPsychTest.upsert({
    where: { id: "custom_test_demo_001" },
    update: {
      coachId: "coach_001",
      name: "Deneme Kaygısı Mini Test",
      icon: "ki-information-2",
      tone: "warning",
      description: "Sınav öncesi kaygı düzeyini hızlı ölçer.",
      questions: [{ text: "Deneme öncesi gerilirim.", kind: "likert" }, { text: "Süre baskısı beni etkiler.", kind: "likert" }],
      bands: [[0, 2, "Düşük", "success"], [2, 3.5, "Orta", "warning"], [3.5, 5, "Yüksek", "danger"]],
    },
    create: {
      id: "custom_test_demo_001",
      coachId: "coach_001",
      name: "Deneme Kaygısı Mini Test",
      icon: "ki-information-2",
      tone: "warning",
      description: "Sınav öncesi kaygı düzeyini hızlı ölçer.",
      questions: [{ text: "Deneme öncesi gerilirim.", kind: "likert" }, { text: "Süre baskısı beni etkiler.", kind: "likert" }],
      bands: [[0, 2, "Düşük", "success"], [2, 3.5, "Orta", "warning"], [3.5, 5, "Yüksek", "danger"]],
    },
  });

  await prisma.testAssignment.upsert({
    where: { id: "test_assignment_demo_001" },
    update: { coachId: "coach_001", studentId: "student_001", studentName: "Elif Yıldız", testId: "custom_test_demo_001", status: "completed", score: 3.4, band: "Orta", bandTone: "warning", coachNote: "Sınav öncesi rutin planlandı.", sentAt: daysAgo(5), completedAt: daysAgo(4) },
    create: { id: "test_assignment_demo_001", coachId: "coach_001", studentId: "student_001", studentName: "Elif Yıldız", testId: "custom_test_demo_001", status: "completed", score: 3.4, band: "Orta", bandTone: "warning", coachNote: "Sınav öncesi rutin planlandı.", sentAt: daysAgo(5), completedAt: daysAgo(4) },
  });
}

async function seedRichBillingAndSupport() {
  await prisma.paymentMethod.upsert({
    where: { id: "payment_method_demo_parent_001" },
    update: { userId: "user_parent_001", brand: "visa", last4: "4242", holder: "Ayşe Yıldız", expMonth: 12, expYear: 2029, isDefault: true },
    create: { id: "payment_method_demo_parent_001", userId: "user_parent_001", brand: "visa", last4: "4242", holder: "Ayşe Yıldız", expMonth: 12, expYear: 2029, isDefault: true },
  });

  await prisma.subscription.upsert({
    where: { id: "subscription_demo_parent_001" },
    update: { payerUserId: "user_parent_001", studentId: "student_001", planId: "plus", cycle: "monthly", status: "active", autoRenew: true, renewsAt: daysFromNow(18), paymentMethodId: "payment_method_demo_parent_001" },
    create: { id: "subscription_demo_parent_001", payerUserId: "user_parent_001", studentId: "student_001", planId: "plus", cycle: "monthly", status: "active", autoRenew: true, renewsAt: daysFromNow(18), paymentMethodId: "payment_method_demo_parent_001" },
  });

  const invoices = [
    { id: "invoice_demo_parent_001_paid", subscriptionId: "subscription_demo_parent_001", payerUserId: "user_parent_001", planId: "plus", cycle: "monthly" as const, amount: 2299, status: "paid" as const, installments: 1, methodLabel: "Visa •4242", paymentMethodId: "payment_method_demo_parent_001", issuedAt: daysAgo(12) },
    { id: "invoice_demo_parent_001_pending", subscriptionId: "subscription_demo_parent_001", payerUserId: "user_parent_001", planId: "plus", cycle: "monthly" as const, amount: 2299, status: "pending" as const, installments: 1, methodLabel: "Visa •4242", paymentMethodId: "payment_method_demo_parent_001", issuedAt: daysFromNow(18) },
  ];
  for (const invoice of invoices) {
    await prisma.invoice.upsert({ where: { id: invoice.id }, update: invoice, create: invoice });
  }

  const tickets = [
    { id: "support_ticket_demo_student", userId: "user_student_001", role: "STUDENT" as const, category: "teknik" as const, message: "Optik form sonucumu yanlış defterinde görebiliyor muyum?", status: "answered" as const, reply: "Evet, yanlış ve boşlar otomatik deftere düşer." },
    { id: "support_ticket_demo_parent", userId: "user_parent_001", role: "PARENT" as const, category: "hesap" as const, message: "Haftalık gelişim raporunu nereden takip edeceğim?", status: "open" as const, reply: null },
  ];
  for (const ticket of tickets) {
    await prisma.supportTicket.upsert({ where: { id: ticket.id }, update: ticket, create: ticket });
  }

  const events = [
    { id: "deneme_event_demo_001", coachId: "coach_001", name: "TYT Genel Deneme #8", examType: "TYT" as const, date: "14 Haz 2026", time: "10:00", place: "Kampüs Koç · Kadıköy", questionCount: 120, price: 0 },
    { id: "deneme_event_demo_002", coachId: "coach_001", name: "AYT Sayısal Deneme #4", examType: "AYT" as const, date: "21 Haz 2026", time: "10:00", place: "Online", questionCount: 80, price: 0 },
  ];
  for (const event of events) {
    await prisma.denemeEvent.upsert({ where: { id: event.id }, update: event, create: event });
  }
  await prisma.denemeRegistration.upsert({
    where: { eventId_studentId: { eventId: "deneme_event_demo_001", studentId: "student_001" } },
    update: { payment: "paket", mode: "yuzyuze", registeredAt: daysAgo(2) },
    create: { id: "deneme_registration_demo_001", eventId: "deneme_event_demo_001", studentId: "student_001", payment: "paket", mode: "yuzyuze", registeredAt: daysAgo(2) },
  });
  await prisma.denemeMembership.upsert({
    where: { studentId: "student_001" },
    update: { planId: "yuzyuze-deneme-paketi" },
    create: { id: "deneme_membership_demo_001", studentId: "student_001", planId: "yuzyuze-deneme-paketi" },
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
