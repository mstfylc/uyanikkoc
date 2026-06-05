const SUBJECT_COLORS: Record<string, string> = {
  Matematik: "#534AB7",
  Fizik: "#2F6BD6",
  Kimya: "#0F6E56",
  Biyoloji: "#3A9D6A",
  Turkce: "#B26A12",
  Tarih: "#A3582D",
};

export function subjectColor(name: string): string {
  return SUBJECT_COLORS[name] ?? "var(--primary)";
}
