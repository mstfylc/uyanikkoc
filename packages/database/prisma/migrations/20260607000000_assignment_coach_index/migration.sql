-- Assignment.coachId üzerinde index: listAssignmentsForCoach() coachId ile
-- filtreliyor; index olmadan full table scan oluşuyordu.

-- CreateIndex
CREATE INDEX "assignments_coachId_idx" ON "assignments"("coachId");
