-- AlterTable: additive assignment alpha fields (non-destructive)

CREATE TYPE "AssignmentType" AS ENUM ('homework', 'exam_prep', 'reading', 'practice', 'other');
CREATE TYPE "AssignmentPriority" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

ALTER TABLE "assignments"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "type" "AssignmentType" NOT NULL DEFAULT 'homework',
  ADD COLUMN "priority" "AssignmentPriority" NOT NULL DEFAULT 'medium',
  ADD COLUMN "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN "subject" TEXT,
  ADD COLUMN "dueDate" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "assignments"
SET
  "status" = 'completed',
  "updatedAt" = COALESCE("completedAt", "createdAt")
WHERE "completed" = true;

CREATE INDEX "assignments_status_idx" ON "assignments"("status");
