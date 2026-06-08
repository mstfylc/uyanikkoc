import { gradeOptik } from "@uyanik/shared";
import type {
  CreateOnlineExamInput,
  OnlineExamRecord,
  OptikSubmissionRecord,
  SubmitOptikInput,
} from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

type StoredExam = Omit<OnlineExamRecord, "submission"> & { answerKey: string[] };

const globalStore = globalThis as typeof globalThis & {
  __uyanikOnlineExams?: StoredExam[];
  __uyanikOptikSubs?: Map<string, OptikSubmissionRecord>;
  __uyanikOnlineSeq?: number;
};

const exams = globalStore.__uyanikOnlineExams ?? (globalStore.__uyanikOnlineExams = [
  {
    id: "oe1",
    title: "TYT Genel Deneme #7",
    publisher: "Uyanik Yayinlari",
    examType: "TYT",
    questionCount: 20,
    cargoStatus: "kargoda",
    branchId: "*",
    createdAt: new Date().toISOString(),
    answerKey: Array.from({ length: 20 }, (_, i) => ["A", "B", "C", "D", "E"][i % 5]!),
  },
  {
    id: "oe2",
    title: "AYT Matematik Brans",
    publisher: "Apotemi",
    examType: "AYT",
    questionCount: 15,
    cargoStatus: "teslim edildi",
    branchId: "*",
    createdAt: new Date().toISOString(),
    answerKey: Array.from({ length: 15 }, (_, i) => ["A", "B", "C", "D", "E"][(i + 2) % 5]!),
  },
  {
    id: "oe3",
    title: "LGS Genel Deneme #4",
    publisher: "Nartest",
    examType: "LGS",
    questionCount: 20,
    cargoStatus: "kargoda",
    branchId: "*",
    createdAt: new Date().toISOString(),
    answerKey: Array.from({ length: 20 }, (_, i) => ["A", "B", "C", "D"][(i + 1) % 4]!),
  },
]);
const subs = globalStore.__uyanikOptikSubs ?? (globalStore.__uyanikOptikSubs = new Map());
let seq = globalStore.__uyanikOnlineSeq ?? (globalStore.__uyanikOnlineSeq = 1);

const k = (examId: string, studentId: string) => `${examId}|${studentId}`;

function seedSubmissionsIfEmpty(studentId: string): void {
  if (subs.size > 0 || studentId !== DEMO_STUDENT_ID) {
    return;
  }

  const exam = exams.find((item) => item.id === "oe1");
  if (!exam) {
    return;
  }

  const answers = exam.answerKey.map((answer, index) => (index % 6 === 0 ? "E" : answer));
  const graded = gradeOptik(answers, exam.answerKey, exam.examType);
  subs.set(k(exam.id, studentId), {
    id: `os_${seq++}`,
    examId: exam.id,
    studentId,
    answers,
    ...graded,
    createdAt: new Date(Date.now() - 36 * 60 * 60_000).toISOString(),
  });
  globalStore.__uyanikOnlineSeq = seq;
}

export async function listExamsForStudent(
  _branchId: string,
  studentId: string,
  examTypes: ("TYT" | "AYT" | "LGS")[],
): Promise<OnlineExamRecord[]> {
  seedSubmissionsIfEmpty(studentId);
  return exams.filter((e) => examTypes.includes(e.examType)).map((e) => {
    const { answerKey, ...rest } = e;
    void answerKey;
    return { ...rest, submission: subs.get(k(e.id, studentId)) ?? null };
  });
}

export async function createExam(input: CreateOnlineExamInput): Promise<OnlineExamRecord> {
  const rec: StoredExam = {
    id: `oe_${seq++}`,
    title: input.title,
    publisher: input.publisher,
    examType: input.examType,
    questionCount: input.questionCount,
    cargoStatus: input.cargoStatus ?? "kargoda",
    branchId: input.branchId,
    createdAt: new Date().toISOString(),
    answerKey: input.answerKey,
  };
  exams.unshift(rec);
  const { answerKey, ...rest } = rec;
  void answerKey;
  return { ...rest, submission: null };
}

export async function submitOptik(input: SubmitOptikInput): Promise<OptikSubmissionRecord> {
  const exam = exams.find((e) => e.id === input.examId);
  if (!exam) throw new Error("EXAM_NOT_FOUND");
  const normalized = input.answers.map((a) => a ?? "");
  const g = gradeOptik(normalized, exam.answerKey, exam.examType);
  const rec: OptikSubmissionRecord = {
    id: `os_${seq++}`,
    examId: input.examId,
    studentId: input.studentId,
    answers: normalized,
    ...g,
    createdAt: new Date().toISOString(),
  };
  subs.set(k(input.examId, input.studentId), rec);
  return rec;
}

export async function getSubmissionReview(
  examId: string,
  studentId: string,
): Promise<{ submission: OptikSubmissionRecord; answerKey: string[] } | null> {
  seedSubmissionsIfEmpty(studentId);
  const exam = exams.find((e) => e.id === examId);
  const submission = subs.get(k(examId, studentId));
  if (!exam || !submission) return null;
  return { submission, answerKey: exam.answerKey };
}
