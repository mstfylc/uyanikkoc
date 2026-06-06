import type { ParentReportRecord } from "@uyanik/database";

import { DEMO_PARENT_ID } from "@/mocks/assignments";
import { pushParentNotification } from "@/mocks/notifications";

const globalStore = globalThis as typeof globalThis & {
  __uyanikParentReports?: ParentReportRecord[];
};

const reports = globalStore.__uyanikParentReports ?? (globalStore.__uyanikParentReports = [
  {
    id: "preport_1",
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

export function listApprovedReportsForParent(parentId: string): ParentReportRecord[] {
  return reports.filter((item) => item.parentId === parentId && item.status === "approved");
}

export function resetParentReportsForTests() {
  reports.length = 0;
  reports.push(
    {
      id: "preport_1",
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
