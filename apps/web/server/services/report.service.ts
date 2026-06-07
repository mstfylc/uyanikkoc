import { buildReportDetail } from "@uyanik/shared";
import type { ExamResultRecord, ParentReportRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryReports from "@/mocks/parent-reports";
import { listStudentExams } from "@/server/services/exam.service";
import { listCoachRoster, resolveParentIdForStudent } from "@/server/services/roster.service";
import { listStudentTopics } from "@/server/services/topic.service";

export type ParentReportWithDetail = ParentReportRecord & {
  detail: ReturnType<typeof buildReportDetail>;
  note?: string | null;
};

async function repo() {
  const { parentReportRepository } = await import("@uyanik/database");
  return parentReportRepository;
}

function withDetail(report: ParentReportRecord, note?: string | null): ParentReportWithDetail {
  return {
    ...report,
    detail: buildReportDetail({
      completion: report.completion,
      net: report.netDelta,
      studentName: report.studentName,
    }),
    note: note ?? null,
  };
}

const TR_MONTHS = [
  "Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara",
];

/** İçinde bulunulan haftanın (Pzt–Paz) etiketi, ör. "9 Haz - 15 Haz". */
function currentWeekLabel(now = new Date()): string {
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (date: Date) => `${date.getDate()} ${TR_MONTHS[date.getMonth()]}`;
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

/** Son iki denemenin net farkı, ör. "+3.2" / "-1.5" / "0.0". */
function formatNetDelta(exams: ExamResultRecord[]): string {
  const sorted = [...exams].sort(
    (left, right) => new Date(left.takenAt).getTime() - new Date(right.takenAt).getTime(),
  );
  if (sorted.length < 2) return "0.0";
  const delta = sorted[sorted.length - 1].totalNet - sorted[sorted.length - 2].totalNet;
  const rounded = Math.round(delta * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}`;
}

/**
 * Koçun tüm öğrencileri için içinde bulunulan haftaya ait gelişim raporunu
 * gerçek veriden (konu tamamlama % + son denemelerin net değişimi) üretir.
 * Raporlar pending olarak oluşturulur; koç onaylayınca veliye görünür.
 */
export async function generateWeeklyReports(coachId: string): Promise<number> {
  const roster = await listCoachRoster(coachId);
  const week = currentWeekLabel();
  const useDb = shouldUseDatabase();
  const source = useDb ? await repo() : memoryReports;

  let created = 0;
  for (const entry of roster) {
    const [topics, examData, parentId] = await Promise.all([
      listStudentTopics(entry.studentId),
      listStudentExams(entry.studentId),
      resolveParentIdForStudent(entry.studentId),
    ]);

    await source.upsertPendingReport({
      coachId,
      studentId: entry.studentId,
      parentId: parentId ?? null,
      studentName: entry.displayName,
      parentName: `${entry.displayName} velisi`,
      week,
      completion: topics.summary.completionRate,
      netDelta: formatNetDelta(examData.exams),
    });
    created += 1;
  }
  return created;
}

export async function listReportsForCoach(coachId: string): Promise<ParentReportRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listReportsForCoach(coachId);
  return memoryReports.listReportsForCoach(coachId);
}

export async function approveReport(
  coachId: string,
  reportId: string,
  note = "",
): Promise<ParentReportWithDetail | null> {
  if (shouldUseDatabase()) {
    const r = await repo();
    const existing = await r.findReportById(reportId);
    if (!existing || existing.coachId !== coachId) return null;
    const approved = await r.approveReport(reportId);
    return approved ? withDetail(approved, note || null) : null;
  }
  const existing = memoryReports.findReportById(reportId);
  if (!existing || existing.coachId !== coachId) return null;
  const approved = memoryReports.approveParentReport(reportId);
  return approved ? withDetail(approved, note || null) : null;
}

export async function approveAllReportsForCoach(coachId: string): Promise<ParentReportRecord[]> {
  if (shouldUseDatabase()) return (await repo()).approveAllForCoach(coachId);
  return memoryReports.approveAllForCoach(coachId);
}

export async function listApprovedReportsForParent(
  parentId: string,
): Promise<ParentReportWithDetail[]> {
  const reports = shouldUseDatabase()
    ? await (await repo()).listApprovedReportsForParent(parentId)
    : memoryReports.listApprovedReportsForParent(parentId);
  return reports.map((report) => withDetail(report));
}
