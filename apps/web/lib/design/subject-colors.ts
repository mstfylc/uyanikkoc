const SUBJECT_COLORS: Record<string, string> = {
  Matematik: "#534AB7",
  Fizik: "#2F6BD6",
  Kimya: "#0F6E56",
  Biyoloji: "#3A9D6A",
  Türkçe: "#B26A12",
  Turkce: "#B26A12",
  Tarih: "#A3582D",
};

export function subjectColor(name: string): string {
  return SUBJECT_COLORS[name] ?? "var(--primary)";
}

const SUBJECT_LABELS: Record<string, string> = {
  Turkce: "Türkçe",
  Cografya: "Coğrafya",
  "Din Kulturu": "Din Kültürü",
  Ingilizce: "İngilizce",
};

export function displaySubjectName(name: string | null | undefined): string {
  if (!name) {
    return "Genel";
  }
  return SUBJECT_LABELS[name] ?? name;
}
