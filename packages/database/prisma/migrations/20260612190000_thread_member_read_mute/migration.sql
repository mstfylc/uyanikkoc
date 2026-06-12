ALTER TABLE "thread_members"
  ADD COLUMN "lastReadAt" TIMESTAMP(3),
  ADD COLUMN "muted" BOOLEAN NOT NULL DEFAULT false;
