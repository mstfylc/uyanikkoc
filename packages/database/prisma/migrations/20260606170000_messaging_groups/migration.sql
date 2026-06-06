-- Message groups
CREATE TYPE "ThreadKind" AS ENUM ('dm', 'group');

ALTER TABLE "message_threads" ADD COLUMN "kind" "ThreadKind" NOT NULL DEFAULT 'dm';
ALTER TABLE "message_threads" ADD COLUMN "name" TEXT;

CREATE TABLE "thread_members" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "thread_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "thread_members_threadId_userId_key" ON "thread_members"("threadId", "userId");
CREATE INDEX "thread_members_userId_idx" ON "thread_members"("userId");

ALTER TABLE "thread_members" ADD CONSTRAINT "thread_members_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
