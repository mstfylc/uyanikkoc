CREATE TABLE "topic_study_sessions" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_study_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "topic_study_sessions_studentId_date_idx" ON "topic_study_sessions"("studentId", "date");
CREATE INDEX "topic_study_sessions_topicId_date_idx" ON "topic_study_sessions"("topicId", "date");

ALTER TABLE "topic_study_sessions"
ADD CONSTRAINT "topic_study_sessions_topicId_fkey"
FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "topic_study_sessions"
ADD CONSTRAINT "topic_study_sessions_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
