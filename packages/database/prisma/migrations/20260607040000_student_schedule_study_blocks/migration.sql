-- Çalışma Programı: okul ders programı grid'i + çalışma planı blokları.
-- Şimdiye dek yalnızca bellek modunda vardı (production'da uçuyordu).

-- CreateEnum
CREATE TYPE "StudyBlockStatus" AS ENUM ('todo', 'progress', 'done');

-- CreateTable: öğrenci okul ders programı (haftalık grid, JSON)
CREATE TABLE "student_schedules" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendsSchool" BOOLEAN NOT NULL DEFAULT false,
    "grid" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "student_schedules_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "student_schedules_studentId_key" ON "student_schedules"("studentId");

ALTER TABLE "student_schedules" ADD CONSTRAINT "student_schedules_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: çalışma planı blokları
CREATE TABLE "study_blocks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "StudyBlockStatus" NOT NULL DEFAULT 'todo',
    "source" TEXT,
    "correct" INTEGER,
    "wrong" INTEGER,
    "net" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "study_blocks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "study_blocks_studentId_idx" ON "study_blocks"("studentId");

ALTER TABLE "study_blocks" ADD CONSTRAINT "study_blocks_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
