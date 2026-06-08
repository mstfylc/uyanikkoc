import { shouldUseDatabase } from "@/lib/data/env";
import * as memorySources from "@/mocks/student-sources";
import type {
  SelfStudyKind,
  SelfStudyRecord,
  SourceStatus,
  StudentSourceItem,
  StudentSourceTracker,
} from "@/mocks/student-sources";

function trackerFromLabels(labels: string[]): StudentSourceTracker {
  const items: StudentSourceItem[] = labels.map((name) => ({
    name,
    status: "beklemede",
    progress: 0,
  }));
  return {
    items,
    selfStudy: [],
    activity: Object.fromEntries(
      items.map((item) => [
        item.name,
        { soru: 0, acc: null, lastUsed: null, selfSoru: 0, selfCount: 0 },
      ]),
    ),
  };
}

export async function listStudentSources(studentId: string): Promise<string[]> {
  if (shouldUseDatabase()) {
    const { studentSourcesRepository } = await import("@uyanik/database");
    return studentSourcesRepository.listSources(studentId);
  }
  return memorySources.listSources(studentId);
}

export async function addStudentSource(studentId: string, label: string): Promise<string[]> {
  if (shouldUseDatabase()) {
    const { studentSourcesRepository } = await import("@uyanik/database");
    return studentSourcesRepository.addSource(studentId, label);
  }

  return memorySources.addSource(studentId, label);
}

export async function removeStudentSource(studentId: string, label: string): Promise<string[]> {
  if (shouldUseDatabase()) {
    const { studentSourcesRepository } = await import("@uyanik/database");
    return studentSourcesRepository.removeSource(studentId, label);
  }

  return memorySources.removeSource(studentId, label);
}

export async function getStudentSourceTracker(studentId: string): Promise<StudentSourceTracker> {
  if (shouldUseDatabase()) {
    const sources = await listStudentSources(studentId);
    return trackerFromLabels(sources);
  }

  return memorySources.getSourceTracker(studentId);
}

export async function updateStudentSource(
  studentId: string,
  name: string,
  patch: { status?: SourceStatus; progress?: number },
): Promise<StudentSourceTracker> {
  if (shouldUseDatabase()) {
    if (patch.status || patch.progress != null) {
      // Rich source metadata needs a future DB migration. Keep the label contract intact in production.
      await addStudentSource(studentId, name);
    }
    return getStudentSourceTracker(studentId);
  }

  memorySources.updateSource(studentId, name, patch);
  return memorySources.getSourceTracker(studentId);
}

export async function addStudentSelfStudy(
  studentId: string,
  input: { book: string; kind: SelfStudyKind; soru?: number; dogru?: number | null; subject?: string },
): Promise<{ tracker: StudentSourceTracker; selfStudy: SelfStudyRecord[] }> {
  if (shouldUseDatabase()) {
    await addStudentSource(studentId, input.book);
    const tracker = await getStudentSourceTracker(studentId);
    return { tracker, selfStudy: [] };
  }

  const selfStudy = memorySources.addSelfStudy(studentId, input);
  return { tracker: memorySources.getSourceTracker(studentId), selfStudy };
}

export async function removeStudentSelfStudy(
  studentId: string,
  id: string,
): Promise<{ tracker: StudentSourceTracker; selfStudy: SelfStudyRecord[] }> {
  if (shouldUseDatabase()) {
    const tracker = await getStudentSourceTracker(studentId);
    return { tracker, selfStudy: [] };
  }

  const selfStudy = memorySources.removeSelfStudy(studentId, id);
  return { tracker: memorySources.getSourceTracker(studentId), selfStudy };
}
