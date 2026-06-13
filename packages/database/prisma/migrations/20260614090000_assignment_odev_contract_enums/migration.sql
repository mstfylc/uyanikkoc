-- Align assignment storage with web-v6.0 odev contracts.
-- Existing rows are normalized before required enum constraints are applied.

CREATE TYPE "AssignmentWeek" AS ENUM ('w0', 'w1', 'w2', 'w3');
CREATE TYPE "OdevType" AS ENUM ('soru', 'video', 'konu', 'test');

UPDATE "assignments"
SET "week" = 'w0'
WHERE "week" NOT IN ('w0', 'w1', 'w2', 'w3');

ALTER TABLE "assignments" ALTER COLUMN "week" DROP DEFAULT;
ALTER TABLE "assignments"
  ALTER COLUMN "week" TYPE "AssignmentWeek"
  USING "week"::"AssignmentWeek";
ALTER TABLE "assignments" ALTER COLUMN "week" SET DEFAULT 'w0';

UPDATE "assignments"
SET "topic" = ''
WHERE "topic" IS NULL;

ALTER TABLE "assignments" ALTER COLUMN "topic" SET DEFAULT '';
ALTER TABLE "assignments" ALTER COLUMN "topic" SET NOT NULL;

UPDATE "assignments"
SET "odevType" = 'soru'
WHERE "odevType" IS NULL OR "odevType" NOT IN ('soru', 'video', 'konu', 'test');

ALTER TABLE "assignments" ALTER COLUMN "odevType" DROP DEFAULT;
ALTER TABLE "assignments"
  ALTER COLUMN "odevType" TYPE "OdevType"
  USING "odevType"::"OdevType";
ALTER TABLE "assignments" ALTER COLUMN "odevType" SET DEFAULT 'soru';
ALTER TABLE "assignments" ALTER COLUMN "odevType" SET NOT NULL;
