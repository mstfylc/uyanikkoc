import type { CoachTaskRecord, CreateCoachTaskInput } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { DEMO_COACH_ID } from "@/mocks/messages";
import { DEMO_STUDENT_002_ID } from "@/mocks/roster";

const globalStore = globalThis as typeof globalThis & {
  __uyanikCoachTasks?: CoachTaskRecord[];
  __uyanikCoachTaskSeq?: number;
  __uyanikCoachTasksSeeded?: boolean;
};

const tasks = globalStore.__uyanikCoachTasks ?? (globalStore.__uyanikCoachTasks = []);
let seq = globalStore.__uyanikCoachTaskSeq ?? (globalStore.__uyanikCoachTaskSeq = 1);

function nextId(): string {
  const id = `ctask_${seq++}`;
  globalStore.__uyanikCoachTaskSeq = seq;
  return id;
}

function nowIso(offsetMinutes = 0): string {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
}

function seedIfEmpty(): void {
  if (globalStore.__uyanikCoachTasksSeeded) return;
  globalStore.__uyanikCoachTasksSeeded = true;
  tasks.push(
    {
      id: nextId(),
      coachId: DEMO_COACH_ID,
      studentId: DEMO_STUDENT_002_ID,
      text: "Mert'in haftalik programini revize et",
      due: "Bugun",
      done: false,
      priority: "high",
      createdAt: nowIso(20),
    },
    {
      id: nextId(),
      coachId: DEMO_COACH_ID,
      studentId: DEMO_STUDENT_ID,
      text: "Elif'in integral testini incele",
      due: "Bugun",
      done: false,
      priority: "med",
      createdAt: nowIso(120),
    },
    {
      id: nextId(),
      coachId: DEMO_COACH_ID,
      studentId: null,
      text: "Haftalik raporlari hazirla",
      due: "7 Haz",
      done: false,
      priority: "med",
      createdAt: nowIso(300),
    },
    {
      id: nextId(),
      coachId: DEMO_COACH_ID,
      studentId: null,
      text: "Deneme #6 sonuclarini analiz et",
      due: "5 Haz",
      done: true,
      priority: "low",
      createdAt: nowIso(1500),
    },
  );
}

export function listForCoach(coachId: string): CoachTaskRecord[] {
  seedIfEmpty();
  return tasks
    .filter((task) => task.coachId === coachId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function create(input: CreateCoachTaskInput): CoachTaskRecord {
  seedIfEmpty();
  const task: CoachTaskRecord = {
    id: nextId(),
    coachId: input.coachId,
    studentId: input.studentId ?? null,
    text: input.text,
    due: input.due ?? null,
    done: false,
    priority: input.priority ?? "med",
    createdAt: nowIso(),
  };
  tasks.unshift(task);
  return task;
}

export function setDone(coachId: string, id: string, done: boolean): CoachTaskRecord | null {
  seedIfEmpty();
  const task = tasks.find((item) => item.id === id && item.coachId === coachId);
  if (!task) return null;
  task.done = done;
  return task;
}

export function remove(coachId: string, id: string): boolean {
  seedIfEmpty();
  const index = tasks.findIndex((item) => item.id === id && item.coachId === coachId);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

export function resetCoachTasksForTests(): void {
  tasks.length = 0;
  globalStore.__uyanikCoachTasksSeeded = false;
  globalStore.__uyanikCoachTaskSeq = 1;
  seq = 1;
}
