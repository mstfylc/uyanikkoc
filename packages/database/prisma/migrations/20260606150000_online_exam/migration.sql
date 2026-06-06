-- Online exams + optik submissions
-- packages/database/prisma/migrations/20260606150000_online_exam/migration.sql

CREATE TABLE "online_exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "examType" "ResultExamType" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "answerKey" TEXT[],
    "cargoStatus" TEXT NOT NULL DEFAULT 'kargoda',
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "online_exams_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "online_exams_branchId_idx" ON "online_exams"("branchId");

CREATE TABLE "optik_submissions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answers" TEXT[],
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "blank" INTEGER NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "optik_submissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "optik_submissions_examId_studentId_key" ON "optik_submissions"("examId", "studentId");
CREATE INDEX "optik_submissions_studentId_idx" ON "optik_submissions"("studentId");

ALTER TABLE "online_exams" ADD CONSTRAINT "online_exams_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "optik_submissions" ADD CONSTRAINT "optik_submissions_examId_fkey"
  FOREIGN KEY ("examId") REFERENCES "online_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "optik_submissions" ADD CONSTRAINT "optik_submissions_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
