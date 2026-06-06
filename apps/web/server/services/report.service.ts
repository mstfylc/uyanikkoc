import { buildReportDetail } from "@uyanik/shared";
import type { ParentReportRecord } from "@uyanik/database";

import * as memoryReports from "@/mocks/parent-reports";

export type ParentReportWithDetail = ParentReportRecord & {
  detail: ReturnType<typeof buildReportDetail>;
  note?: string | null;
};

export async function approveReport(reportId: string, note = ""): Promise<ParentReportWithDetail | null> {
  const report = memoryReports.approveParentReport(reportId);
  if (!report) return null;
  return {
    ...report,
    detail: buildReportDetail({
      completion: report.completion,
      net: report.netDelta,
      studentName: report.studentName,
    }),
    note: note || null,
  };
}

export async function listApprovedReportsForParent(parentId: string): Promise<ParentReportWithDetail[]> {
  return memoryReports.listApprovedReportsForParent(parentId).map((report) => ({
    ...report,
    detail: buildReportDetail({
      completion: report.completion,
      net: report.netDelta,
      studentName: report.studentName,
    }),
  }));
}
