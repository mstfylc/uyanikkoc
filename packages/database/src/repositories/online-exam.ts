import { gradeOptik } from "@uyanik/shared";
import { prisma } from "../client";
import type {
  CreateOnlineExamInput,
  OnlineExamRecord,
  OptikSubmissionRecord,
  SubmitOptikInput,
} from "../types";

function mapExam(e: {
  id: string; title: string; publisher: string; examType: "TYT" | "AYT" | "LGS";
  questionCount: number; cargoStatus: string; branchId: string; createdAt: Date;
}): OnlineExamRecord {
  return {
    id: e.id, title: e.title, publisher: e.publisher, examType: e.examType,
    questionCount: e.questionCount, cargoStatus: e.cargoStatus, branchId: e.branchId,
    createdAt: e.createdAt.toISOString(),
  };
}

function mapSub(s: {
  id: string; examId: string; studentId: string; answers: string[];
  correct: number; wrong: number; blank: number; net: number; createdAt: Date;
}): OptikSubmissionRecord {
  return {
    id: s.id, examId: s.examId, studentId: s.studentId, answers: s.answers,
    correct: s.correct, wrong: s.wrong, blank: s.blank, net: s.net,
    createdAt: s.createdAt.toISOString(),
  };
}

export async function listExamsForStudent(branchId: string, studentId: string, examTypes: ("TYT" | "AYT" | "LGS")[]): Promise<OnlineExamRecord[]> {
  const exams = await prisma.onlineExam.findMany({
    where: { branchId, examType: { in: examTypes } },
    orderBy: { createdAt: "desc" },
  });
  const subs = await prisma.optikSubmission.findMany({ where: { studentId, examId: { in: exams.map((e) => e.id) } } });
  const byExam = new Map(subs.map((s) => [s.examId, mapSub(s)]));
  return exams.map((e) => ({ ...mapExam(e), submission: byExam.get(e.id) ?? null }));
}

export async function createExam(input: CreateOnlineExamInput): Promise<OnlineExamRecord> {
  const created = await prisma.onlineExam.create({
    data: {
      title: input.title, publisher: input.publisher, examType: input.examType,
      questionCount: input.questionCount, answerKey: input.answerKey, branchId: input.branchId,
      cargoStatus: input.cargoStatus ?? "kargoda",
    },
  });
  return mapExam(created);
}

export async function submitOptik(input: SubmitOptikInput): Promise<OptikSubmissionRecord> {
  const exam = await prisma.onlineExam.findUnique({ where: { id: input.examId } });
  if (!exam) throw new Error("EXAM_NOT_FOUND");
  const normalized = input.answers.map((a) => a ?? "");
  const { correct, wrong, blank, net } = gradeOptik(normalized, exam.answerKey, exam.examType);
  const sub = await prisma.optikSubmission.upsert({
    where: { examId_studentId: { examId: input.examId, studentId: input.studentId } },
    update: { answers: normalized, correct, wrong, blank, net },
    create: { examId: input.examId, studentId: input.studentId, answers: normalized, correct, wrong, blank, net },
  });
  return mapSub(sub);
}
