CREATE TABLE "student_sources" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "student_sources_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_sources_studentId_label_key" ON "student_sources"("studentId", "label");
CREATE INDEX "student_sources_studentId_idx" ON "student_sources"("studentId");

ALTER TABLE "student_sources"
  ADD CONSTRAINT "student_sources_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
