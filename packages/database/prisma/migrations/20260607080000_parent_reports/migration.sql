-- Veli gelişim raporları: koç gerçek veriden üretir (pending) → onaylar → veli görür.
-- Şimdiye dek yalnızca bellek modunda hardcoded fixture'lardı.

-- CreateEnum
CREATE TYPE "ParentReportStatus" AS ENUM ('pending', 'approved');

-- CreateTable
CREATE TABLE "parent_reports" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "completion" INTEGER NOT NULL,
    "netDelta" TEXT NOT NULL,
    "status" "ParentReportStatus" NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "parent_reports_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "parent_reports_coachId_studentId_week_key" ON "parent_reports"("coachId", "studentId", "week");
CREATE INDEX "parent_reports_coachId_idx" ON "parent_reports"("coachId");
CREATE INDEX "parent_reports_parentId_idx" ON "parent_reports"("parentId");

ALTER TABLE "parent_reports" ADD CONSTRAINT "parent_reports_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_reports" ADD CONSTRAINT "parent_reports_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
