-- Koç öğrenci notları: şimdiye dek yalnızca bellek modunda vardı (production'da
-- restart/instance değişiminde uçuyordu). Kalıcı tablo eklendi.

-- CreateEnum
CREATE TYPE "CoachNoteKind" AS ENUM ('meeting', 'warning', 'general');

-- CreateTable
CREATE TABLE "coach_student_notes" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "kind" "CoachNoteKind" NOT NULL DEFAULT 'general',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coach_student_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "coach_student_notes_coachId_studentId_idx" ON "coach_student_notes"("coachId", "studentId");
CREATE INDEX "coach_student_notes_studentId_idx" ON "coach_student_notes"("studentId");

ALTER TABLE "coach_student_notes" ADD CONSTRAINT "coach_student_notes_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coach_student_notes" ADD CONSTRAINT "coach_student_notes_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
