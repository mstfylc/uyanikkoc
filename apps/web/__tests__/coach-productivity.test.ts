import { beforeEach, describe, expect, it } from "vitest";

import {
  create as createTask,
  listForCoach as listTasks,
  remove as removeTask,
  resetCoachTasksForTests,
  setDone as setTaskDone,
} from "@/mocks/coach-tasks";
import {
  create as createAnnouncement,
  listForCoach as listAnnouncements,
  resetAnnouncementsForTests,
} from "@/mocks/announcements";
import { DEMO_COACH_ID } from "@/mocks/messages";

beforeEach(() => {
  resetCoachTasksForTests();
  resetAnnouncementsForTests();
});

describe("coach task mock store", () => {
  it("seed verisi koca ait gorevleri listeler", () => {
    const tasks = listTasks(DEMO_COACH_ID);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((task) => task.coachId === DEMO_COACH_ID)).toBe(true);
  });

  it("baska kocun gorevini gostermez", () => {
    expect(listTasks("coach_999")).toHaveLength(0);
  });

  it("gorev olusturur, tamamlar ve siler", () => {
    const created = createTask({ coachId: DEMO_COACH_ID, text: "Veli ara", priority: "high" });
    expect(created.done).toBe(false);
    expect(created.priority).toBe("high");

    const toggled = setTaskDone(DEMO_COACH_ID, created.id, true);
    expect(toggled?.done).toBe(true);

    expect(removeTask(DEMO_COACH_ID, created.id)).toBe(true);
    expect(listTasks(DEMO_COACH_ID).some((task) => task.id === created.id)).toBe(false);
  });

  it("yetkisiz koc gorevi degistiremez", () => {
    const created = createTask({ coachId: DEMO_COACH_ID, text: "Rapor hazirla" });
    expect(setTaskDone("coach_999", created.id, true)).toBeNull();
    expect(removeTask("coach_999", created.id)).toBe(false);
  });
});

describe("coach announcement mock store", () => {
  it("duyuru olusturur ve erisimi hedef sayisi kadar olur", () => {
    const announcement = createAnnouncement(
      { coachId: DEMO_COACH_ID, title: "Pazar denemesi", body: "10:00'da baslıyor", audience: "Tum ogrenciler" },
      { studentIds: ["student_001", "student_002"], parentIds: [] },
    );
    expect(announcement.reach).toBe(2);
    expect(announcement.audience).toBe("Tum ogrenciler");
    expect(listAnnouncements(DEMO_COACH_ID)[0].id).toBe(announcement.id);
  });

  it("veli kitlesinde erisim veli sayisini sayar", () => {
    const announcement = createAnnouncement(
      { coachId: DEMO_COACH_ID, title: "Veli bilgilendirme", body: "Rapor yayinlandi", audience: "Tum veliler" },
      { studentIds: [], parentIds: ["parent_001"] },
    );
    expect(announcement.reach).toBe(1);
  });
});
