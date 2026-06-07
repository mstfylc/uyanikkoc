import type {
  AnnouncementTargets,
  CoachAnnouncementRecord,
  CreateCoachAnnouncementInput,
} from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryAnnouncements from "@/mocks/announcements";
import { listCoachRoster, resolveParentIdForStudent } from "@/server/services/roster.service";

async function repo() {
  const { announcementRepository } = await import("@uyanik/database");
  return announcementRepository;
}

/**
 * Hedef kitleyi gercek alicilara cozer. "veli" iceren kitleler velilere,
 * digerleri ogrencilere gider. (Risk/sinif filtreleri henuz modellenmedi;
 * bu kitleler tum kadroyu hedefler, etiket korunur.)
 */
async function resolveTargets(
  coachId: string,
  audience: string,
): Promise<AnnouncementTargets> {
  const roster = await listCoachRoster(coachId);
  const studentIds = roster.map((entry) => entry.studentId);

  if (audience.toLocaleLowerCase("tr").includes("veli")) {
    const parentIds = new Set<string>();
    for (const studentId of studentIds) {
      const parentId = await resolveParentIdForStudent(studentId);
      if (parentId) parentIds.add(parentId);
    }
    return { studentIds: [], parentIds: [...parentIds] };
  }

  return { studentIds, parentIds: [] };
}

export async function listAnnouncements(coachId: string): Promise<CoachAnnouncementRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listForCoach(coachId);
  return memoryAnnouncements.listForCoach(coachId);
}

export async function createAnnouncement(
  input: CreateCoachAnnouncementInput,
): Promise<CoachAnnouncementRecord> {
  const targets = await resolveTargets(input.coachId, input.audience);
  if (shouldUseDatabase()) return (await repo()).create(input, targets);
  return memoryAnnouncements.create(input, targets);
}
