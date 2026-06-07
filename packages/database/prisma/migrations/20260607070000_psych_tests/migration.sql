-- Psikolojik test atamaları + koç özel testleri: bellek modundaydı.
-- (Statik TEST_CATALOG kodda kalır; yalnızca atamalar ve özel testler kalıcı.)

-- CreateEnum
CREATE TYPE "TestAssignmentStatus" AS ENUM ('sent', 'completed');

-- CreateTable: koç özel testleri (sorular/bantlar JSONB)
CREATE TABLE "custom_psych_tests" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "bands" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "custom_psych_tests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "custom_psych_tests_coachId_idx" ON "custom_psych_tests"("coachId");

ALTER TABLE "custom_psych_tests" ADD CONSTRAINT "custom_psych_tests_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: test atamaları
CREATE TABLE "test_assignments" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" "TestAssignmentStatus" NOT NULL DEFAULT 'sent',
    "score" DOUBLE PRECISION,
    "band" TEXT,
    "bandTone" TEXT,
    "coachNote" TEXT NOT NULL DEFAULT '',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "test_assignments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "test_assignments_coachId_idx" ON "test_assignments"("coachId");
CREATE INDEX "test_assignments_studentId_idx" ON "test_assignments"("studentId");

ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
