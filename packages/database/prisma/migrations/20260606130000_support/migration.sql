-- Support tickets — mstfylc/uyanikkoc
-- packages/database/prisma/migrations/20260606130000_support/migration.sql

CREATE TYPE "SupportCategory" AS ENUM ('teknik', 'oneri', 'hesap', 'diger');
CREATE TYPE "SupportStatus" AS ENUM ('open', 'answered', 'closed');

CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "DbRole" NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "SupportStatus" NOT NULL DEFAULT 'open',
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
