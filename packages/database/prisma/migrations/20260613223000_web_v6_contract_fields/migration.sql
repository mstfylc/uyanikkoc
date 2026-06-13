-- Additive fields for web-v6.0 data contracts. Existing UI/API shapes remain supported.

ALTER TABLE "users" ADD COLUMN "name" TEXT;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

ALTER TABLE "assignments" ADD COLUMN "week" TEXT NOT NULL DEFAULT 'w0';
ALTER TABLE "assignments" ADD COLUMN "topic" TEXT;
ALTER TABLE "assignments" ADD COLUMN "source" TEXT NOT NULL DEFAULT '';
ALTER TABLE "assignments" ADD COLUMN "count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "assignments" ADD COLUMN "odevType" TEXT;
ALTER TABLE "assignments" ADD COLUMN "odevTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "assignments" ADD COLUMN "note" TEXT NOT NULL DEFAULT '';
ALTER TABLE "assignments" ADD COLUMN "assignedAt" TIMESTAMP(3);
ALTER TABLE "assignments" ADD COLUMN "smart" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "assignments" ADD COLUMN "overdueAlert" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "assignments" ADD COLUMN "quality" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "assignments" ADD COLUMN "feedback" TEXT;

ALTER TABLE "notifications" ADD COLUMN "icon" TEXT;
ALTER TABLE "notifications" ADD COLUMN "tone" TEXT;
ALTER TABLE "notifications" ADD COLUMN "page" TEXT;
