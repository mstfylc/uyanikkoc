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

export async function listCoachExams(branchId: string): Promise<OnlineExamRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listExamsForBranch(branchId);
  return memoryOnline.listExamsForBranch(branchId);
}

export async function submitOptik(input: SubmitOptikInput): Promise<OptikSubmissionRecord> {
  const submission = shouldUseDatabase() ? await (await repo()).submitOptik(input) : await memoryOnline.submitOptik(input);
  const review = await getOptikReview(input.examId, input.studentId);
  if (review) {
    const { ingestOptikSubmissionMistakes } = await import("@/server/services/mistake.service");
    await ingestOptikSubmissionMistakes({
      studentId: input.studentId,
      examId: input.examId,
      examType: review.examType,
      examTitle: review.examTitle,
      answers: review.submission.answers,
      answerKey: review.answerKey,
    });
  }
  return submission;
}

export async function getOptikReview(
  examId: string,
  studentId: string,
): Promise<{
  submission: OptikSubmissionRecord;
  answerKey: string[];
  examTitle: string;
  examType: "TYT" | "AYT" | "LGS";
} | null> {
  if (shouldUseDatabase()) return (await repo()).getSubmissionReview(examId, studentId);
  return memoryOnline.getSubmissionReview(examId, studentId);
}

export async function createExam(input: CreateOnlineExamInput): Promise<OnlineExamRecord> {
  if (shouldUseDatabase()) return (await repo()).createExam(input);
  return memoryOnline.createExam(input);
}
