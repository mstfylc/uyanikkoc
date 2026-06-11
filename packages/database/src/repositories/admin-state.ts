import type { Prisma } from "@prisma/client";

import { prisma } from "../client";

const ADMIN_STATE_ID = "default";

export async function getAdminState(): Promise<unknown | null> {
  const row = await prisma.adminState.findUnique({ where: { id: ADMIN_STATE_ID } });
  return row?.snapshot ?? null;
}

export async function saveAdminState(snapshot: unknown): Promise<unknown> {
  const json = snapshot as Prisma.InputJsonValue;
  const row = await prisma.adminState.upsert({
    where: { id: ADMIN_STATE_ID },
    create: { id: ADMIN_STATE_ID, snapshot: json },
    update: { snapshot: json },
  });
  return row.snapshot;
}

export async function updateOrganizationName(input: {
  organizationId: string;
  name: string;
}): Promise<void> {
  await prisma.organization.update({
    where: { id: input.organizationId },
    data: { name: input.name },
  });
}
