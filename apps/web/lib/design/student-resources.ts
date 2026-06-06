/** Ders bazinda onerilen kaynaklar (design KAYNAKLAR havuzu). */
const STUDENT_RESOURCES: Record<string, string[]> = {
  Turkce: ["Hiz ve Renk Paragraf", "Bilgi Sarmali", "Ari Paragraf"],
  Matematik: ["Mikro Mat", "Bilgi Sarmali (BS)"],
  Geometri: ["Antrenmanlarla Geo 1"],
  Fizik: ["Bilgi Sarmali", "Paraf", "ENS"],
  Kimya: ["Hiz ve Renk", "Bilgi Sarmali", "Orbital"],
  Biyoloji: ["Bilgi Sarmali", "Biyotik", "Aydin"],
  "Fen Bilimleri": ["Hiz ve Renk", "Tonguc", "3D"],
  "T.C. Inklap Tarihi": ["Tonguc", "Bilgi Sarmali"],
  "Din Kulturu": ["Tonguc", "Aydin"],
  Ingilizce: ["Tonguc", "Rehber"],
};

const DEFAULT_RESOURCES = ["Bilgi Sarmali", "Tonguc", "3D"];

export const STUDENT_RESOURCE_SUBJECTS = Object.keys(STUDENT_RESOURCES);

export function getStudentResources(subject: string): string[] {
  return STUDENT_RESOURCES[subject] ?? DEFAULT_RESOURCES;
}
