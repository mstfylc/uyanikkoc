CREATE TYPE "AppointmentMode" AS ENUM ('online', 'in_person', 'phone');
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE "AppointmentDay" AS ENUM ('Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt');

CREATE TABLE "appointment_settings" (
  "id" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "weeklyLimit" INTEGER NOT NULL DEFAULT 2,
  "weeklyLimitStudent" INTEGER NOT NULL DEFAULT 2,
  "weeklyLimitParent" INTEGER NOT NULL DEFAULT 1,
  "allowOnline" BOOLEAN NOT NULL DEFAULT true,
  "allowInPerson" BOOLEAN NOT NULL DEFAULT true,
  "allowPhone" BOOLEAN NOT NULL DEFAULT true,
  "availability" JSONB NOT NULL,
  "slotModes" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "appointment_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appointments" (
  "id" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "day" "AppointmentDay" NOT NULL,
  "slot" TEXT NOT NULL,
  "mode" "AppointmentMode" NOT NULL,
  "topic" TEXT NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "appointment_settings_coachId_key" ON "appointment_settings"("coachId");
CREATE INDEX "appointments_coachId_idx" ON "appointments"("coachId");
CREATE INDEX "appointments_studentId_idx" ON "appointments"("studentId");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

ALTER TABLE "appointment_settings"
  ADD CONSTRAINT "appointment_settings_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
