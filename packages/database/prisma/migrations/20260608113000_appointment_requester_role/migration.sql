CREATE TYPE "AppointmentRequesterRole" AS ENUM ('student', 'parent');

ALTER TABLE "appointments"
  ADD COLUMN "requesterRole" "AppointmentRequesterRole" NOT NULL DEFAULT 'student';
