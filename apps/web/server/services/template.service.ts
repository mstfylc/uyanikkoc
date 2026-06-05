import type {
  AssignmentTemplateRecord,
  CreateAssignmentTemplateInput,
} from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryTemplates from "@/mocks/templates";

export async function listCoachTemplates(coachId: string): Promise<AssignmentTemplateRecord[]> {
  if (shouldUseDatabase()) {
    const { templateRepository } = await import("@uyanik/database");
    return templateRepository.listTemplatesForCoach(coachId);
  }

  return memoryTemplates.listForCoach(coachId);
}

export async function createCoachTemplate(
  input: CreateAssignmentTemplateInput,
): Promise<AssignmentTemplateRecord> {
  if (shouldUseDatabase()) {
    const { templateRepository } = await import("@uyanik/database");
    return templateRepository.createTemplate(input);
  }

  return memoryTemplates.createTemplate(input);
}
