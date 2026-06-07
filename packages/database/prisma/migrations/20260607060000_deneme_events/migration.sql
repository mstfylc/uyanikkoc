-- Deneme etkinlikleri (koç) + kayıtlar (öğrenci) + üyelik planı: bellek modundaydı.

-- CreateTable: deneme etkinlikleri
CREATE TABLE "deneme_events" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examType" "ResultExamType" NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deneme_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "deneme_events_coachId_idx" ON "deneme_events"("coachId");

ALTER TABLE "deneme_events" ADD CONSTRAINT "deneme_events_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: deneme kayıtları
CREATE TABLE "deneme_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deneme_registrations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "deneme_registrations_eventId_studentId_key" ON "deneme_registrations"("eventId", "studentId");
CREATE INDEX "deneme_registrations_studentId_idx" ON "deneme_registrations"("studentId");

ALTER TABLE "deneme_registrations" ADD CONSTRAINT "deneme_registrations_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "deneme_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deneme_registrations" ADD CONSTRAINT "deneme_registrations_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: deneme üyelik planı (öğrenci başına)
CREATE TABLE "deneme_memberships" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    CONSTRAINT "deneme_memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "deneme_memberships_studentId_key" ON "deneme_memberships"("studentId");

ALTER TABLE "deneme_memberships" ADD CONSTRAINT "deneme_memberships_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
