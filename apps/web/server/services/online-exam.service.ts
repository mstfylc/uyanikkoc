import type {
  CreateOnlineExamInput,
  OnlineExamRecord,
  OptikSubmissionRecord,
  SubmitOptikInput,
} from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryOnline from "@/mocks/online-exam";

async function repo() {
  const { onlineExamRepository } = await import("@uyanik/database");
  return onlineExamRepository;
}

export async function listStudentExams(
  branchId: string,
  studentId: string,
  examTypes: ("TYT" | "AYT" | "LGS")[],
): Promise<OnlineExamRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listExamsForStudent(branchId, studentId, examTypes);
  return memoryOnline.listExamsForStudent(branchId, studentId, examTypes);
}

export async function submitOptik(input: SubmitOptikInput): Promise<OptikSubmissionRecord> {
  if (shouldUseDatabase()) return (await repo()).submitOptik(input);
  return memoryOnline.submitOptik(input);
}

export async function createExam(input: CreateOnlineExamInput): Promise<OnlineExamRecord> {
  if (shouldUseDatabase()) return (await repo()).createExam(input);
  return memoryOnline.createExam(input);
}
