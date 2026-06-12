-- CreateEnum
CREATE TYPE "MistakeErrorType" AS ENUM ('bilgi', 'islem', 'sure', 'dikkat', 'yorum', 'unutma');

-- CreateEnum
CREATE TYPE "MistakeQuestionType" AS ENUM ('yeninesil', 'klasik', 'islem', 'yorum', 'grafik');

-- CreateEnum
CREATE TYPE "MistakeStatus" AS ENUM ('acik', 'tekrar', 'kapandi');

-- CreateTable
CREATE TABLE "mistakes" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT NOT NULL DEFAULT '',
    "errorType" "MistakeErrorType" NOT NULL DEFAULT 'islem',
    "source" TEXT NOT NULL DEFAULT '',
    "qType" "MistakeQuestionType" NOT NULL DEFAULT 'klasik',
    "note" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT,
    "status" "MistakeStatus" NOT NULL DEFAULT 'acik',
    "stage" INTEGER NOT NULL DEFAULT 0,
    "nextDue" TIMESTAMP(3),
    "sourceKind" TEXT,
    "sourceRefId" TEXT,
    "sourceLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistake_reviews" (
    "id" TEXT NOT NULL,
    "mistakeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mistake_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mistakes_studentId_status_idx" ON "mistakes"("studentId", "status");

-- CreateIndex
CREATE INDEX "mistakes_studentId_nextDue_idx" ON "mistakes"("studentId", "nextDue");

-- CreateIndex
CREATE INDEX "mistakes_studentId_createdAt_idx" ON "mistakes"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "mistake_reviews_mistakeId_idx" ON "mistake_reviews"("mistakeId");

-- CreateIndex
CREATE INDEX "mistake_reviews_studentId_reviewedAt_idx" ON "mistake_reviews"("studentId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake_reviews" ADD CONSTRAINT "mistake_reviews_mistakeId_fkey" FOREIGN KEY ("mistakeId") REFERENCES "mistakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
