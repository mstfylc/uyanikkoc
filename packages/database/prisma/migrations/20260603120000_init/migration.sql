-- FAZ 4 initial schema

CREATE TYPE "DbRole" AS ENUM ('STUDENT', 'COACH', 'PARENT', 'BRANCH_MANAGER', 'ORG_ADMIN');

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "DbRole" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parent_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");
CREATE UNIQUE INDEX "coach_profiles_userId_key" ON "coach_profiles"("userId");
CREATE UNIQUE INDEX "parent_profiles_userId_key" ON "parent_profiles"("userId");
CREATE INDEX "branches_organizationId_idx" ON "branches"("organizationId");
CREATE INDEX "users_organizationId_branchId_idx" ON "users"("organizationId", "branchId");
CREATE INDEX "assignments_studentId_idx" ON "assignments"("studentId");
CREATE INDEX "assignments_parentId_idx" ON "assignments"("parentId");
CREATE INDEX "assignments_branchId_idx" ON "assignments"("branchId");

ALTER TABLE "branches" ADD CONSTRAINT "branches_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
