-- User soft delete guard: no data is removed by this migration.
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deleted');

ALTER TABLE "users"
  ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active',
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletedById" TEXT,
  ADD COLUMN "deleteReason" TEXT,
  ADD COLUMN "restoreUntil" TIMESTAMP(3);

CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_userId_fkey";
ALTER TABLE "student_profiles"
  ADD CONSTRAINT "student_profiles_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coach_profiles" DROP CONSTRAINT "coach_profiles_userId_fkey";
ALTER TABLE "coach_profiles"
  ADD CONSTRAINT "coach_profiles_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "parent_profiles" DROP CONSTRAINT "parent_profiles_userId_fkey";
ALTER TABLE "parent_profiles"
  ADD CONSTRAINT "parent_profiles_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
