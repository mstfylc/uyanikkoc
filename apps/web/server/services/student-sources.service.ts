import { shouldUseDatabase } from "@/lib/data/env";
import * as memorySources from "@/mocks/student-sources";

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
