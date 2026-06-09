-- CreateEnum
CREATE TYPE "LicenseOwnerType" AS ENUM ('coach', 'organization');

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "ownerType" "LicenseOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "licenses_ownerType_ownerId_idx" ON "licenses"("ownerType", "ownerId");

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_planId_fkey" FOREIGN KEY ("planId") REFERENCES "billing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
