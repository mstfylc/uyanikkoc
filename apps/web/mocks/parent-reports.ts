import type { ParentReportRecord } from "@uyanik/database";

import { DEMO_COACH_ID } from "@/lib/auth/demo-users";
import { DEMO_PARENT_ID, DEMO_STUDENT_ID } from "@/mocks/assignments";
import { DEMO_STUDENT_002_ID } from "@/mocks/roster";
import { pushParentNotification } from "@/mocks/notifications";

const globalStore = globalThis as typeof globalThis & {
  __uyanikParentReports?: ParentReportRecord[];
};

const reports = globalStore.__uyanikParentReports ?? (globalStore.__uyanikParentReports = [
  {
    id: "preport_1",
    coachId: DEMO_COACH_ID,
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    studentName: "Demo Ogrenci",
    parentName: "Demo Veli",
    week: "26 May - 1 Haz",
    completion: 72,
    netDelta: "+3.2",
    status: "approved",
    sentAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  },
  {
    id: "preport_0",
    coachId: DEMO_COACH_ID,
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    studentName: "Demo Ogrenci",
    parentName: "Demo Veli",
    week: "19 May - 25 May",
    completion: 68,
    netDelta: "+2.1",
    status: "approved",
    sentAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
  },
  {
    id: "preport_1_pending",
    coachId: DEMO_COACH_ID,
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    studentName: "Demo Ogrenci",
    parentName: "Demo Veli",
    week: "2 Haz - 8 Haz",
    completion: 74,
    netDelta: "+1.8",
    status: "pending",
    sentAt: null,
  },
  {
    id: "preport_2",
    coachId: DEMO_COACH_ID,
    studentId: DEMO_STUDENT_002_ID,
    parentId: "parent_002",
    studentName: "Demo Ogrenci 2",
    parentName: "Demo Veli 2",
    week: "26 May - 1 Haz",
    completion: 58,
    netDelta: "+1.4",
    status: "pending",
    sentAt: null,
  },
]);

export function listParentReports(): ParentReportRecord[] {
  return reports.map((report) => ({ ...report }));
}

export function listReportsForCoach(coachId: string): ParentReportRecord[] {
  return reports.filter((item) => item.coachId === coachId).map((report) => ({ ...report }));
}

/** Koç bir öğrenci+hafta için pending rapor üretir (varsa günceller). */
export function upsertPendingReport(input: {
  coachId: string;
  studentId: string;
  parentId: string | null;
  studentName: string;
  parentName: string;
  week: string;
  completion: number;
  netDelta: string;
}): ParentReportRecord {
  const existing = reports.find(
    (item) =>
      item.coachId === input.coachId &&
      item.studentId === input.studentId &&
      item.week === input.week,
  );
  if (existing) {
    existing.parentId = input.parentId ?? "";
    existing.studentName = input.studentName;
    existing.parentName = input.parentName;
    existing.completion = input.completion;
    existing.netDelta = input.netDelta;
    existing.status = "pending";
    existing.sentAt = null;
    return { ...existing };
  }
  const record: ParentReportRecord = {
    id: `preport_${Date.now()}_${input.studentId}`,
    coachId: input.coachId,
    studentId: input.studentId,
    parentId: input.parentId ?? "",
    studentName: input.studentName,
    parentName: input.parentName,
    week: input.week,
    completion: input.completion,
    netDelta: input.netDelta,
    status: "pending",
    sentAt: null,
  };
  reports.unshift(record);
  return { ...record };
}

export function findReportById(id: string): ParentReportRecord | null {
  const report = reports.find((item) => item.id === id);
  return report ? { ...report } : null;
}

export function approveParentReport(id: string): ParentReportRecord | null {
  const report = reports.find((item) => item.id === id);
  if (!report) {
    return null;
  }
  report.status = "approved";
  report.sentAt = new Date().toISOString();
  pushParentNotification(
    report.parentId,
    "Yeni gelisim raporu",
    `${report.studentName} · ${report.week} · %${report.completion} (${report.netDelta})`,
  );
  return { ...report };
}

export function approveAllParentReports(): ParentReportRecord[] {
  for (const report of reports) {
    if (report.status === "pending") {
      report.status = "approved";
      report.sentAt = new Date().toISOString();
      pushParentNotification(
        report.parentId,
        "Yeni gelisim raporu",
        `${report.studentName} · ${report.week} · %${report.completion} (${report.netDelta})`,
      );
    }
  }
  return listParentReports();
}

export function approveAllForCoach(coachId: string): ParentReportRecord[] {
  for (const report of reports) {
    if (report.coachId === coachId && report.status === "pending") {
      report.status = "approved";
      report.sentAt = new Date().toISOString();
      pushParentNotification(
        report.parentId,
        "Yeni gelisim raporu",
        `${report.studentName} · ${report.week} · %${report.completion} (${report.netDelta})`,
      );
    }
  }
  return listReportsForCoach(coachId);
}

export function listApprovedReportsForParent(parentId: string): ParentReportRecord[] {
  return reports.filter((item) => item.parentId === parentId && item.status === "approved");
}

export function resetParentReportsForTests() {
  reports.length = 0;
  reports.push(
    {
      id: "preport_1",
      coachId: DEMO_COACH_ID,
      studentId: DEMO_STUDENT_ID,
      parentId: DEMO_PARENT_ID,
      studentName: "Demo Ogrenci",
      parentName: "Demo Veli",
      week: "26 May - 1 Haz",
      completion: 72,
      netDelta: "+3.2",
      status: "pending",
      sentAt: null,
    },
    {
      id: "preport_2",
      coachId: DEMO_COACH_ID,
      studentId: DEMO_STUDENT_002_ID,
      parentId: "parent_002",
      studentName: "Demo Ogrenci 2",
      parentName: "Demo Veli 2",
      week: "26 May - 1 Haz",
      completion: 58,
      netDelta: "+1.4",
      status: "pending",
      sentAt: null,
    },
  );
}
