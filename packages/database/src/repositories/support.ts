import { prisma } from "../client";
import type {
  CreateSupportTicketInput,
  SupportTicketRecord,
} from "../types";

function ticketId(): string {
  return `DST-${Math.floor(2100 + Math.random() * 800)}`;
}

function mapTicket(t: {
  id: string; userId: string; role: string; category: "teknik" | "oneri" | "hesap" | "diger";
  message: string; status: "open" | "answered" | "closed"; reply: string | null; createdAt: Date;
}): SupportTicketRecord {
  return {
    id: t.id, userId: t.userId, role: t.role, category: t.category, message: t.message,
    status: t.status, reply: t.reply, createdAt: t.createdAt.toISOString(),
  };
}

export async function listTicketsForUser(userId: string): Promise<SupportTicketRecord[]> {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return tickets.map((t) => mapTicket({ ...t, role: t.role as unknown as string }));
}

export async function createTicket(input: CreateSupportTicketInput): Promise<SupportTicketRecord> {
  const created = await prisma.supportTicket.create({
    data: {
      id: ticketId(), userId: input.userId, role: input.role as never,
      category: input.category, message: input.message, status: "open",
    },
  });
  return mapTicket({ ...created, role: created.role as unknown as string });
}

export async function closeTicket(userId: string, ticketId: string): Promise<SupportTicketRecord | null> {
  const existing = await prisma.supportTicket.findFirst({ where: { id: ticketId, userId } });
  if (!existing) return null;
  const updated = await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "closed" } });
  return mapTicket({ ...updated, role: updated.role as unknown as string });
}
