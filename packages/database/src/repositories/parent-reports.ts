import { prisma } from "../client";
import type { ParentReportRecord, ParentReportStatus } from "../types";

function map(r: {
  id: string;
  coachId: string;
  studentId: string;
  parentId: string | null;
  studentName: string;
  parentName: string;
  week: string;
  completion: number;
  netDelta: string;
  status: ParentReportStatus;
  sentAt: Date | null;
}): ParentReportRecord {
  return {
    id: r.id,
    coachId: r.coachId,
    studentId: r.studentId,
    parentId: r.parentId ?? "",
    studentName: r.studentName,
    parentName: r.parentName,
    week: r.week,
    completion: r.completion,
    netDelta: r.netDelta,
    status: r.status,
    sentAt: r.sentAt?.toISOString() ?? null,
  };
}

/** Koç bir öğrenci+hafta için pending rapor üretir (varsa günceller). */
export async function upsertPendingReport(input: {
  coachId: string;
  studentId: string;
  parentId: string | null;
  studentName: string;
  parentName: string;
  week: string;
  completion: number;
  netDelta: string;
}): Promise<ParentReportRecord> {
  const row = await prisma.parentReport.upsert({
    where: {
      coachId_studentId_week: {
        coachId: input.coachId,
        studentId: input.studentId,
        week: input.week,
      },
    },
    create: {
      coachId: input.coachId,
      studentId: input.studentId,
      parentId: input.parentId,
      studentName: input.studentName,
      parentName: input.parentName,
      week: input.week,
      completion: input.completion,
      netDelta: input.netDelta,
    },
    update: {
      parentId: input.parentId,
      studentName: input.studentName,
      parentName: input.parentName,
      completion: input.completion,
      netDelta: input.netDelta,
      status: "pending",
      sentAt: null,
    },
  });
  return map(row);
}

export async function listReportsForCoach(coachId: string): Promise<ParentReportRecord[]> {
  const rows = await prisma.parentReport.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(map);
}

export async function findReportById(id: string): Promise<ParentReportRecord | null> {
  const row = await prisma.parentReport.findUnique({ where: { id } });
  return row ? map(row) : null;
}

export async function approveReport(id: string): Promise<ParentReportRecord | null> {
  const existing = await prisma.parentReport.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.parentReport.update({
    where: { id },
    data: { status: "approved", sentAt: new Date() },
  });
  return map(row);
}

export async function approveAllForCoach(coachId: string): Promise<ParentReportRecord[]> {
  await prisma.parentReport.updateMany({
    where: { coachId, status: "pending" },
    data: { status: "approved", sentAt: new Date() },
  });
  return listReportsForCoach(coachId);
}

export async function listApprovedReportsForParent(
  parentId: string,
): Promise<ParentReportRecord[]> {
  const rows = await prisma.parentReport.findMany({
    where: { parentId, status: "approved" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(map);
}
