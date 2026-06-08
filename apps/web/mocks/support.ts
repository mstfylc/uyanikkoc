import type { CreateSupportTicketInput, SupportTicketRecord } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikSupportTickets?: SupportTicketRecord[];
};

const tickets = globalStore.__uyanikSupportTickets ?? (globalStore.__uyanikSupportTickets = []);

function nowIso(offsetHours = 0): string {
  return new Date(Date.now() - offsetHours * 60 * 60_000).toISOString();
}

function seedIfEmpty(): void {
  if (tickets.length > 0) {
    return;
  }

  tickets.push(
    {
      id: "DST-2401",
      userId: "user_student_001",
      role: "student",
      category: "teknik",
      message: "Online deneme optiginde cevaplarimi kaydederken emin olmak istiyorum.",
      status: "answered",
      reply: "Cevaplar kaydedildikten sonra Denemeler > Online Deneme sekmesinde inceleme acilir.",
      createdAt: nowIso(9),
    },
    {
      id: "DST-2402",
      userId: "user_coach_001",
      role: "coach",
      category: "oneri",
      message: "Randevu slotlarini telefon/online olarak ayirmak istiyorum.",
      status: "answered",
      reply: "Randevular > Musait Saatlerim bolumunde her slot icin gorusme tiplerini secebilirsiniz.",
      createdAt: nowIso(18),
    },
    {
      id: "DST-2403",
      userId: "user_parent_001",
      role: "parent",
      category: "hesap",
      message: "Haftalik gelisim raporunu nereden takip edecegim?",
      status: "open",
      reply: null,
      createdAt: nowIso(3),
    },
    {
      id: "DST-2404",
      userId: "user_branch_001",
      role: "branch",
      category: "diger",
      message: "Kurum yonetim paneli rapor ciktilari hakkinda bilgi istiyorum.",
      status: "answered",
      reply: "Yonetim > Raporlar ekranindan PDF/CSV rapor sablonlarini kullanabilirsiniz.",
      createdAt: nowIso(28),
    },
  );
}

export async function listTicketsForUser(userId: string): Promise<SupportTicketRecord[]> {
  seedIfEmpty();
  return tickets.filter((t) => t.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(input: CreateSupportTicketInput): Promise<SupportTicketRecord> {
  seedIfEmpty();
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
