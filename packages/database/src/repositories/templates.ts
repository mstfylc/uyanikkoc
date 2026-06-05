import { prisma } from "../client";
import type { AssignmentTemplateRecord, CreateAssignmentTemplateInput } from "../types";

function mapTemplate(template: {
  id: string;
  coachId: string;
  title: string;
  description: string | null;
  type: AssignmentTemplateRecord["type"];
  priority: AssignmentTemplateRecord["priority"];
  subject: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AssignmentTemplateRecord {
  return {
    id: template.id,
    coachId: template.coachId,
    title: template.title,
    description: template.description,
    type: template.type,
    priority: template.priority,
    subject: template.subject,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

export async function listTemplatesForCoach(coachId: string): Promise<AssignmentTemplateRecord[]> {
  const templates = await prisma.assignmentTemplate.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
  });

  return templates.map(mapTemplate);
}

export async function createTemplate(
  input: CreateAssignmentTemplateInput,
): Promise<AssignmentTemplateRecord> {
  const template = await prisma.assignmentTemplate.create({
    data: {
      coachId: input.coachId,
      title: input.title.trim(),
      description: input.description ?? null,
      type: input.type ?? "homework",
      priority: input.priority ?? "medium",
      subject: input.subject ?? null,
    },
  });

  return mapTemplate(template);
}
