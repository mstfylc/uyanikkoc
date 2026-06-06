import type { ParentReportRecord } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikParentReports?: ParentReportRecord[];
};

const reports = globalStore.__uyanikParentReports ?? (globalStore.__uyanikParentReports = [
  {
    id: "preport_1",
    studentName: "Demo Ogrenci",
    parentName: "Demo Veli",
    week: "26 May - 1 Haz",
    completion: 72,
    netDelta: "+3.2",
    status: "pending",
  },
  {
    id: "preport_2",
    studentName: "Demo Ogrenci 2",
    parentName: "Demo Veli 2",
    week: "26 May - 1 Haz",
    completion: 58,
    netDelta: "+1.4",
    status: "pending",
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
  return { ...report };
}

export function approveAllParentReports(): ParentReportRecord[] {
  for (const report of reports) {
    report.status = "approved";
  }
  return listParentReports();
}

export function resetParentReportsForTests() {
  reports.length = 0;
  reports.push(
    {
      id: "preport_1",
      studentName: "Demo Ogrenci",
      parentName: "Demo Veli",
      week: "26 May - 1 Haz",
      completion: 72,
      netDelta: "+3.2",
      status: "pending",
    },
    {
      id: "preport_2",
      studentName: "Demo Ogrenci 2",
      parentName: "Demo Veli 2",
      week: "26 May - 1 Haz",
      completion: 58,
      netDelta: "+1.4",
      status: "pending",
    },
  );
}
