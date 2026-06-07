-- Coach productivity: personal task list + bulk announcements

-- CreateEnum
CREATE TYPE "CoachTaskPriority" AS ENUM ('high', 'med', 'low');

-- CreateTable: coach personal tasks (todo list)
CREATE TABLE "coach_tasks" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT,
    "text" TEXT NOT NULL,
    "due" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "priority" "CoachTaskPriority" NOT NULL DEFAULT 'med',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coach_tasks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "coach_tasks_coachId_idx" ON "coach_tasks"("coachId");
CREATE INDEX "coach_tasks_studentId_idx" ON "coach_tasks"("studentId");

ALTER TABLE "coach_tasks" ADD CONSTRAINT "coach_tasks_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coach_tasks" ADD CONSTRAINT "coach_tasks_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: coach bulk announcements (broadcast to an audience)
CREATE TABLE "coach_announcements" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coach_announcements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "coach_announcements_coachId_idx" ON "coach_announcements"("coachId");

ALTER TABLE "coach_announcements" ADD CONSTRAINT "coach_announcements_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
