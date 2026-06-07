-- Koç müfredatı (ders → konu grupları): şimdiye dek yalnızca bellek modundaydı.

-- CreateTable
CREATE TABLE "coach_curriculums" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "examType" "TopicExamType" NOT NULL DEFAULT 'TYT',
    "subjects" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coach_curriculums_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "coach_curriculums_coachId_key" ON "coach_curriculums"("coachId");

ALTER TABLE "coach_curriculums" ADD CONSTRAINT "coach_curriculums_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
