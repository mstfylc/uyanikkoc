CREATE TABLE "coach_topic_targets" (
  "id" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "targets" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "coach_topic_targets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coach_topic_targets_coachId_studentId_key" ON "coach_topic_targets"("coachId", "studentId");
CREATE INDEX "coach_topic_targets_studentId_idx" ON "coach_topic_targets"("studentId");

ALTER TABLE "coach_topic_targets"
  ADD CONSTRAINT "coach_topic_targets_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coach_topic_targets"
  ADD CONSTRAINT "coach_topic_targets_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
