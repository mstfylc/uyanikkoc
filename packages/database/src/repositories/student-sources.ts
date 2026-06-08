import { prisma } from "../client";

function normalize(label: string): string {
  return label.trim().replace(/\s+/g, " ").slice(0, 120);
}

export async function listSources(studentId: string): Promise<string[]> {
  const rows = await prisma.studentSource.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
    select: { label: true },
  });
  return rows.map((row) => row.label);
}

export async function addSource(studentId: string, label: string): Promise<string[]> {
  const normalized = normalize(label);
  if (!normalized) {
    return listSources(studentId);
  }

  await prisma.studentSource.upsert({
    where: { studentId_label: { studentId, label: normalized } },
    create: { studentId, label: normalized },
    update: {},
  });

  return listSources(studentId);
}

export async function removeSource(studentId: string, label: string): Promise<string[]> {
  const normalized = normalize(label);
  if (!normalized) {
    return listSources(studentId);
  }

  await prisma.studentSource.deleteMany({
    where: { studentId, label: normalized },
  });

  return listSources(studentId);
}
