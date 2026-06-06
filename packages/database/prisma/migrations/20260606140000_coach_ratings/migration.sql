-- Coach ratings — packages/database/prisma/migrations/20260606140000_coach_ratings
CREATE TABLE "coach_ratings" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coach_ratings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "coach_ratings_studentId_key" ON "coach_ratings"("studentId");
CREATE INDEX "coach_ratings_coachId_idx" ON "coach_ratings"("coachId");

ALTER TABLE "coach_ratings" ADD CONSTRAINT "coach_ratings_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coach_ratings" ADD CONSTRAINT "coach_ratings_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
