export type SharedAppointmentMode = "online" | "in_person" | "phone";
export type Availability = Record<string, Record<string, SharedAppointmentMode[]>>;

export function allowedModes(s: {
  allowOnline?: boolean;
  allowInPerson?: boolean;
  allowPhone?: boolean;
}): SharedAppointmentMode[] {
  const out: SharedAppointmentMode[] = [];
  if (s.allowOnline) out.push("online");
  if (s.allowInPerson) out.push("in_person");
  if (s.allowPhone) out.push("phone");
  return out;
}

export function slotSupportsMode(
  avail: Availability,
  day: string,
  slot: string,
  mode: SharedAppointmentMode,
): boolean {
  return (avail?.[day]?.[slot] ?? []).includes(mode);
}

export function weeklyLimitFor(
  role: "student" | "parent",
  s: { weeklyLimitStudent?: number; weeklyLimitParent?: number; weeklyLimit?: number },
): number {
  if (role === "parent") return s.weeklyLimitParent ?? 1;
  return s.weeklyLimitStudent ?? s.weeklyLimit ?? 2;
}
