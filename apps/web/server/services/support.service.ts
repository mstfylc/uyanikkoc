import type { SupportTicketRecord } from "@uyanik/database";

import * as memorySupport from "@/mocks/support";

export async function listUserSupportTickets(userId: string): Promise<SupportTicketRecord[]> {
  return memorySupport.listSupportTickets(userId);
}

export async function createUserSupportTicket(input: {
  userId: string;
  role: string;
  subject: string;
  message: string;
}): Promise<SupportTicketRecord> {
  return memorySupport.createSupportTicket(input);
}
