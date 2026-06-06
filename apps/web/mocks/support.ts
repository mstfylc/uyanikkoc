import type { CreateSupportTicketInput, SupportTicketRecord } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikSupportTickets?: SupportTicketRecord[];
};

const tickets = globalStore.__uyanikSupportTickets ?? (globalStore.__uyanikSupportTickets = []);

export async function listTicketsForUser(userId: string): Promise<SupportTicketRecord[]> {
  return tickets.filter((t) => t.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(input: CreateSupportTicketInput): Promise<SupportTicketRecord> {
  const rec: SupportTicketRecord = {
    id: `DST-${Math.floor(2100 + Math.random() * 800)}`,
    userId: input.userId,
    role: input.role,
    category: input.category,
    message: input.message,
    status: "open",
    reply: null,
    createdAt: new Date().toISOString(),
  };
  tickets.unshift(rec);
  return rec;
}

export async function closeTicket(userId: string, ticketId: string): Promise<SupportTicketRecord | null> {
  const t = tickets.find((x) => x.id === ticketId && x.userId === userId);
  if (!t) return null;
  t.status = "closed";
  return t;
}
