CREATE TABLE "admin_states" (
  "id" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_states_pkey" PRIMARY KEY ("id")
);
