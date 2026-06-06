-- Motivation broadcast messages
CREATE TABLE "motivation_messages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "motivation_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "motivation_messages_studentId_idx" ON "motivation_messages"("studentId");

ALTER TABLE "motivation_messages" ADD CONSTRAINT "motivation_messages_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
