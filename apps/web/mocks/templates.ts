import type {
  AssignmentTemplateRecord,
  CreateAssignmentTemplateInput,
} from "@uyanik/database";

import { DEMO_COACH_ID } from "@/mocks/messages";

export { DEMO_COACH_ID };

const globalStore = globalThis as typeof globalThis & {
  __uyanikTemplates?: AssignmentTemplateRecord[];
};

const templates = globalStore.__uyanikTemplates ?? (globalStore.__uyanikTemplates = []);

function nowIso(): string {
  return new Date().toISOString();
}

function seedIfEmpty() {
  if (templates.length > 0) {
    return;
  }

  const timestamp = nowIso();
  templates.push(
    {
      id: "template_mat_tekrar",
      coachId: DEMO_COACH_ID,
      title: "Matematik tekrar ödevi",
      description: "Haftalık tekrar soruları",
      type: "homework",
      priority: "medium",
      subject: "Matematik",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "template_deneme_analiz",
      coachId: DEMO_COACH_ID,
      title: "Deneme analizi",
      description: "Son denemedeki yanlış soruları çöz",
      type: "exam_prep",
      priority: "high",
      subject: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  );
}

export function resetTemplatesForTests(): void {
  templates.length = 0;
}

export function listForCoach(coachId: string): AssignmentTemplateRecord[] {
  seedIfEmpty();
  return templates
    .filter((template) => template.coachId === coachId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function createTemplate(input: CreateAssignmentTemplateInput): AssignmentTemplateRecord {
  const timestamp = nowIso();
  const template: AssignmentTemplateRecord = {
    id: `template_${templates.length + 1}`,
    coachId: input.coachId,
    title: input.title.trim(),
    description: input.description ?? null,
    type: input.type ?? "homework",
    priority: input.priority ?? "medium",
    subject: input.subject ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  templates.push(template);
  return template;
}
