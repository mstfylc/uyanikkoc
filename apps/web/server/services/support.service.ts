import type { CreateSupportTicketInput, SupportTicketRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memorySupport from "@/mocks/support";

async function repo() {
  const { supportRepository } = await import("@uyanik/database");
  return supportRepository;
}

export async function listMyTickets(userId: string): Promise<SupportTicketRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listTicketsForUser(userId);
  return memorySupport.listTicketsForUser(userId);
}

export async function createTicket(input: CreateSupportTicketInput): Promise<SupportTicketRecord> {
  if (shouldUseDatabase()) return (await repo()).createTicket(input);
  return memorySupport.createTicket(input);
}

export async function closeTicket(userId: string, ticketId: string): Promise<SupportTicketRecord | null> {
  if (shouldUseDatabase()) return (await repo()).closeTicket(userId, ticketId);
  return memorySupport.closeTicket(userId, ticketId);
}
