-- CreateIndex
CREATE INDEX "assignments_student_status_idx" ON "assignments"("studentId", "status");

-- CreateIndex
CREATE INDEX "exam_results_student_taken_idx" ON "exam_results"("studentId", "takenAt");

-- CreateIndex
CREATE INDEX "notifications_student_read_created_idx" ON "notifications"("studentId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "messages_thread_created_idx" ON "messages"("threadId", "createdAt");
