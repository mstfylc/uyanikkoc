import { prisma } from "../client";
import type {
  AnnouncementTargets,
  CoachAnnouncementRecord,
  CreateCoachAnnouncementInput,
} from "../types";

type Row = {
  id: string;
  coachId: string;
  title: string;
  body: string;
  audience: string;
  reach: number;
  createdAt: Date;
};

function map(a: Row): CoachAnnouncementRecord {
  return {
    id: a.id,
    coachId: a.coachId,
    title: a.title,
    body: a.body,
    audience: a.audience,
    reach: a.reach,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function listForCoach(coachId: string): Promise<CoachAnnouncementRecord[]> {
  const rows = await prisma.coachAnnouncement.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(map);
}

/**
 * Duyuruyu kaydeder ve hedef öğrenci/velilere bildirim olarak iletir.
 * `reach`, gerçekten oluşturulan bildirim sayısıdır.
 */
export async function create(
  input: CreateCoachAnnouncementInput,
  targets: AnnouncementTargets,
): Promise<CoachAnnouncementRecord> {
  const reach = targets.studentIds.length + targets.parentIds.length;
  const [announcement] = await prisma.$transaction([
    prisma.coachAnnouncement.create({
      data: {
        coachId: input.coachId,
        title: input.title,
        body: input.body,
        audience: input.audience,
        reach,
      },
    }),
    prisma.notification.createMany({
      data: [
        ...targets.studentIds.map((studentId) => ({
          studentId,
          title: input.title,
          body: input.body,
        })),
        ...targets.parentIds.map((parentId) => ({
          parentId,
          title: input.title,
          body: input.body,
        })),
      ],
    }),
  ]);
  return map(announcement);
}
