ALTER TABLE "notifications" ADD COLUMN "coachId" TEXT;

CREATE INDEX "notifications_coachId_idx" ON "notifications"("coachId");

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
