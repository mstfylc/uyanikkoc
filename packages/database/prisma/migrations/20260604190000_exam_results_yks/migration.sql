-- CreateEnum
CREATE TYPE "ResultExamType" AS ENUM ('TYT', 'AYT', 'LGS');

-- CreateTable
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examType" "ResultExamType" NOT NULL,
    "label" TEXT,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "totalNet" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_subject_results" (
    "id" TEXT NOT NULL,
    "examResultId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "exam_subject_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_results_studentId_idx" ON "exam_results"("studentId");

-- CreateIndex
CREATE INDEX "exam_results_takenAt_idx" ON "exam_results"("takenAt");

-- CreateIndex
CREATE INDEX "exam_subject_results_examResultId_idx" ON "exam_subject_results"("examResultId");

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_subject_results" ADD CONSTRAINT "exam_subject_results_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "exam_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
