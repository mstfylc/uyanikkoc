-- CreateTable
CREATE TABLE "coach_students" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_students_coachId_idx" ON "coach_students"("coachId");

-- CreateIndex
CREATE INDEX "coach_students_studentId_idx" ON "coach_students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_students_coachId_studentId_key" ON "coach_students"("coachId", "studentId");

-- AddForeignKey
ALTER TABLE "coach_students" ADD CONSTRAINT "coach_students_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_students" ADD CONSTRAINT "coach_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
