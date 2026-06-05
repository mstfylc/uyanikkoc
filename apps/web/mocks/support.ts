import type { SupportTicketRecord } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikSupportTickets?: SupportTicketRecord[];
};

const tickets = globalStore.__uyanikSupportTickets ?? (globalStore.__uyanikSupportTickets = []);

function nowIso(): string {
  return new Date().toISOString();
}

export function listSupportTickets(userId: string): SupportTicketRecord[] {
  return tickets.filter((item) => item.userId === userId);
}

export function createSupportTicket(input: {
  userId: string;
  role: string;
  subject: string;
  message: string;
}): SupportTicketRecord {
  const record: SupportTicketRecord = {
    id: `support_${Date.now()}`,
    userId: input.userId,
    role: input.role,
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "open",
    createdAt: nowIso(),
  };
  tickets.unshift(record);
  return record;
}
