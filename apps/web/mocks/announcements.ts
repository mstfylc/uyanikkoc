import type {
  AnnouncementTargets,
  CoachAnnouncementRecord,
  CreateCoachAnnouncementInput,
} from "@uyanik/database";

import { DEMO_COACH_ID } from "@/mocks/messages";
import { pushParentNotification, pushStudentNotification } from "@/mocks/notifications";

const globalStore = globalThis as typeof globalThis & {
  __uyanikAnnouncements?: CoachAnnouncementRecord[];
  __uyanikAnnouncementSeq?: number;
  __uyanikAnnouncementsSeeded?: boolean;
};

const announcements =
  globalStore.__uyanikAnnouncements ?? (globalStore.__uyanikAnnouncements = []);
let seq = globalStore.__uyanikAnnouncementSeq ?? (globalStore.__uyanikAnnouncementSeq = 1);

function nextId(): string {
  const id = `ann_${seq++}`;
  globalStore.__uyanikAnnouncementSeq = seq;
  return id;
}

function nowIso(offsetMinutes = 0): string {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
}

function seedIfEmpty(): void {
  if (globalStore.__uyanikAnnouncementsSeeded) return;
  globalStore.__uyanikAnnouncementsSeeded = true;
  announcements.push(
    {
      id: nextId(),
      coachId: DEMO_COACH_ID,
      title: "Pazar TYT Deneme #7",
      body: "8 Haziran Pazar 10:00'da TYT Genel Deneme #7 var. Erken uyuyun.",
      audience: "Tum ogrenciler",
      reach: 2,
      createdAt: nowIso(800),
    },
    {
      id: nextId(),
      coachId: DEMO_COACH_ID,
      title: "Deneme analizi hatirlatmasi",
      body: "Deneme sonrasi mutlaka yanlis analizi yapin; bos biraktiklarinizi da gozden gecirin.",
      audience: "Tum veliler",
      reach: 2,
      createdAt: nowIso(2880),
    },
  );
}

export function listForCoach(coachId: string): CoachAnnouncementRecord[] {
  seedIfEmpty();
  return announcements
    .filter((item) => item.coachId === coachId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function create(
  input: CreateCoachAnnouncementInput,
  targets: AnnouncementTargets,
): CoachAnnouncementRecord {
  seedIfEmpty();
  for (const studentId of targets.studentIds) {
    pushStudentNotification(studentId, input.title, input.body);
  }
  for (const parentId of targets.parentIds) {
    pushParentNotification(parentId, input.title, input.body);
  }
  const record: CoachAnnouncementRecord = {
    id: nextId(),
    coachId: input.coachId,
    title: input.title,
    body: input.body,
    audience: input.audience,
    reach: targets.studentIds.length + targets.parentIds.length,
    createdAt: nowIso(),
  };
  announcements.unshift(record);
  return record;
}

export function resetAnnouncementsForTests(): void {
  announcements.length = 0;
  globalStore.__uyanikAnnouncementsSeeded = false;
  globalStore.__uyanikAnnouncementSeq = 1;
  seq = 1;
}
