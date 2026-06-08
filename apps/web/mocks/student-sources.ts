import { KAYNAK_CATALOG, kaynakLabel } from "@/lib/design/kaynak-catalog";
import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { DEMO_STUDENT_002_ID } from "@/mocks/roster";

export type SourceStatus = "beklemede" | "aktif" | "bitti";

export type StudentSourceItem = {
  name: string;
  status: SourceStatus;
  progress: number;
};

export type SelfStudyKind = "cozdum" | "calistim";

export type SelfStudyRecord = {
  id: string;
  studentId: string;
  book: string;
  kind: SelfStudyKind;
  soru: number;
  dogru: number | null;
  subject: string;
  date: number;
};

export type SourceActivity = {
  soru: number;
  acc: number | null;
  lastUsed: number | null;
  selfSoru: number;
  selfCount: number;
};

export type StudentSourceTracker = {
  items: StudentSourceItem[];
  selfStudy: SelfStudyRecord[];
  activity: Record<string, SourceActivity>;
};

const globalStore = globalThis as typeof globalThis & {
  __uyanikStudentSources?: Map<string, string[]>;
  __uyanikStudentSourceItems?: Map<string, StudentSourceItem[]>;
  __uyanikStudentSelfStudy?: Map<string, SelfStudyRecord[]>;
};

const byStudent: Map<string, string[]> =
  globalStore.__uyanikStudentSources ?? (globalStore.__uyanikStudentSources = new Map<string, string[]>());
const itemStore: Map<string, StudentSourceItem[]> =
  globalStore.__uyanikStudentSourceItems ??
  (globalStore.__uyanikStudentSourceItems = new Map<string, StudentSourceItem[]>());
const selfStudyStore: Map<string, SelfStudyRecord[]> =
  globalStore.__uyanikStudentSelfStudy ??
  (globalStore.__uyanikStudentSelfStudy = new Map<string, SelfStudyRecord[]>());

const seedLabels = [
  kaynakLabel(KAYNAK_CATALOG[0]!),
  kaynakLabel(KAYNAK_CATALOG.find((entry) => entry.s === "Türkçe") ?? KAYNAK_CATALOG[0]!),
  kaynakLabel(KAYNAK_CATALOG.find((entry) => entry.t === "konu") ?? KAYNAK_CATALOG[0]!),
];

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeItems(labels: string[]): StudentSourceItem[] {
  return labels.map((name, index) => ({
    name,
    status: index === 0 ? "aktif" : index === 1 ? "bitti" : "beklemede",
    progress: index === 0 ? 62 : index === 1 ? 100 : 0,
  }));
}

function syncLabels(studentId: string): void {
  byStudent.set(studentId, (itemStore.get(studentId) ?? []).map((item) => item.name));
}

function subjectOf(label: string): string {
  const entry = KAYNAK_CATALOG.find((item) => kaynakLabel(item) === label);
  return entry?.s ?? "Genel";
}

function demoItems(studentId: string): StudentSourceItem[] {
  if (studentId === DEMO_STUDENT_002_ID) {
    const lgs = [
      KAYNAK_CATALOG.find((entry) => entry.s === "Matematik" && entry.e.includes("LGS")),
      KAYNAK_CATALOG.find((entry) => entry.s === "Fen Bilimleri" && entry.e.includes("LGS")),
      KAYNAK_CATALOG.find((entry) => entry.s === "Türkçe" && entry.e.includes("LGS")),
    ]
      .filter(Boolean)
      .map((entry) => kaynakLabel(entry!));
    return normalizeItems(lgs.length ? lgs : seedLabels);
  }

  return normalizeItems(seedLabels);
}

function seedSelfStudy(studentId: string, items: StudentSourceItem[]): SelfStudyRecord[] {
  if (!items.length) return [];
  const now = Date.now();
  return [
    {
      id: `${studentId}_self_1`,
      studentId,
      book: items[0]!.name,
      kind: "cozdum",
      soru: 40,
      dogru: 31,
      subject: subjectOf(items[0]!.name),
      date: now - 2 * 86_400_000,
    },
    {
      id: `${studentId}_self_2`,
      studentId,
      book: items[1]?.name ?? items[0]!.name,
      kind: "calistim",
      soru: 0,
      dogru: null,
      subject: subjectOf(items[1]?.name ?? items[0]!.name),
      date: now - 4 * 86_400_000,
    },
  ];
}

function seedIfEmpty(studentId: string): void {
  if (itemStore.has(studentId)) return;

  if (studentId === DEMO_STUDENT_ID || studentId === DEMO_STUDENT_002_ID) {
    const items = demoItems(studentId);
    itemStore.set(studentId, items);
    selfStudyStore.set(studentId, seedSelfStudy(studentId, items));
    syncLabels(studentId);
    return;
  }

  itemStore.set(studentId, []);
  selfStudyStore.set(studentId, []);
  syncLabels(studentId);
}

export function resetStudentSourcesForTests(): void {
  byStudent.clear();
  itemStore.clear();
  selfStudyStore.clear();
}

export function listSources(studentId: string): string[] {
  seedIfEmpty(studentId);
  syncLabels(studentId);
  return [...(byStudent.get(studentId) ?? [])];
}

export function addSource(studentId: string, label: string): string[] {
  seedIfEmpty(studentId);
  const trimmed = label.trim();
  if (!trimmed) return listSources(studentId);
  const current = itemStore.get(studentId) ?? [];
  if (!current.some((item) => item.name === trimmed)) {
    itemStore.set(studentId, [...current, { name: trimmed, status: "beklemede", progress: 0 }]);
  }
  return listSources(studentId);
}

export function removeSource(studentId: string, label: string): string[] {
  seedIfEmpty(studentId);
  itemStore.set(
    studentId,
    (itemStore.get(studentId) ?? []).filter((item) => item.name !== label),
  );
  selfStudyStore.set(
    studentId,
    (selfStudyStore.get(studentId) ?? []).filter((item) => item.book !== label),
  );
  return listSources(studentId);
}

export function listSourceItems(studentId: string): StudentSourceItem[] {
  seedIfEmpty(studentId);
  return (itemStore.get(studentId) ?? []).map((item) => ({ ...item }));
}

export function updateSource(
  studentId: string,
  name: string,
  patch: Partial<Pick<StudentSourceItem, "status" | "progress">>,
): StudentSourceItem[] {
  seedIfEmpty(studentId);
  itemStore.set(
    studentId,
    (itemStore.get(studentId) ?? []).map((item) => {
      if (item.name !== name) return item;
      const progress =
        patch.progress == null
          ? patch.status === "bitti"
            ? 100
            : patch.status === "beklemede"
              ? 0
              : item.progress
          : clampProgress(patch.progress);
      const status =
        patch.status ??
        (progress >= 100 ? "bitti" : progress > 0 && item.status === "beklemede" ? "aktif" : item.status);
      return { ...item, status, progress };
    }),
  );
  syncLabels(studentId);
  return listSourceItems(studentId);
}

export function listSelfStudy(studentId: string): SelfStudyRecord[] {
  seedIfEmpty(studentId);
  return [...(selfStudyStore.get(studentId) ?? [])].sort((a, b) => b.date - a.date);
}

export function addSelfStudy(
  studentId: string,
  input: { book: string; kind: SelfStudyKind; soru?: number; dogru?: number | null; subject?: string },
): SelfStudyRecord[] {
  seedIfEmpty(studentId);
  const book = input.book.trim();
  if (!book) return listSelfStudy(studentId);
  if (!(itemStore.get(studentId) ?? []).some((item) => item.name === book)) {
    addSource(studentId, book);
  }

  const soru = Math.max(0, Math.round(input.soru ?? 0));
  const dogru = input.dogru == null ? null : Math.max(0, Math.min(soru, Math.round(input.dogru)));
  const record: SelfStudyRecord = {
    id: `self_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    studentId,
    book,
    kind: input.kind,
    soru: input.kind === "cozdum" ? soru : 0,
    dogru: input.kind === "cozdum" ? dogru : null,
    subject: input.subject?.trim() || subjectOf(book),
    date: Date.now(),
  };

  selfStudyStore.set(studentId, [record, ...(selfStudyStore.get(studentId) ?? [])]);
  updateSource(studentId, book, { status: "aktif" });
  return listSelfStudy(studentId);
}

export function removeSelfStudy(studentId: string, id: string): SelfStudyRecord[] {
  seedIfEmpty(studentId);
  selfStudyStore.set(
    studentId,
    (selfStudyStore.get(studentId) ?? []).filter((item) => item.id !== id),
  );
  return listSelfStudy(studentId);
}

export function sourceActivity(studentId: string, name: string): SourceActivity {
  const self = listSelfStudy(studentId).filter((item) => item.book === name);
  const selfSoru = self.reduce((sum, item) => sum + item.soru, 0);
  const withDogru = self.filter((item) => item.kind === "cozdum" && item.dogru != null);
  const dogru = withDogru.reduce((sum, item) => sum + (item.dogru ?? 0), 0);
  return {
    soru: selfSoru,
    acc: selfSoru > 0 && withDogru.length > 0 ? Math.round((dogru / selfSoru) * 100) : null,
    lastUsed: self[0]?.date ?? null,
    selfSoru,
    selfCount: self.length,
  };
}

export function getSourceTracker(studentId: string): StudentSourceTracker {
  const items = listSourceItems(studentId);
  const selfStudy = listSelfStudy(studentId);
  const activity: Record<string, SourceActivity> = {};
  for (const item of items) {
    activity[item.name] = sourceActivity(studentId, item.name);
  }
  return { items, selfStudy, activity };
}
