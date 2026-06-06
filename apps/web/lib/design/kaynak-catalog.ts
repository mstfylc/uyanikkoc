import {
  KAYNAK_CATALOG_SEED,
  type KaynakCatalogSeed,
  type KaynakExamGroup,
  type KaynakTypeKey,
} from "@/lib/design/kaynak-catalog-data";

export type { KaynakCatalogSeed, KaynakExamGroup, KaynakTypeKey };

export type KaynakCatalogEntry = KaynakCatalogSeed & {
  id: string;
  exam: KaynakExamGroup;
};

export type KaynakTypeMeta = {
  label: string;
  short: string;
  icon: string;
  tone: "primary" | "info" | "warning" | "muted" | "success";
};

export const KAYNAK_TUR: Record<KaynakTypeKey, KaynakTypeMeta> = {
  soru: { label: "Soru Bankasi", short: "Soru B.", icon: "ki-notepad", tone: "primary" },
  konu: { label: "Konu Anlatimli", short: "Konu", icon: "ki-book-open", tone: "info" },
  deneme: { label: "Deneme", short: "Deneme", icon: "ki-chart-simple", tone: "warning" },
  foy: { label: "Foy / Fasikul", short: "Foy", icon: "ki-notepad-edit", tone: "muted" },
  video: { label: "Dijital / Video", short: "Dijital", icon: "ki-technology-2", tone: "success" },
};

export const KAYNAK_CATALOG: KaynakCatalogEntry[] = KAYNAK_CATALOG_SEED.map((entry, index) => ({
  ...entry,
  id: `kk${index}`,
  exam: entry.e.includes("LGS") ? "LGS" : "YKS",
}));

export const KAYNAK_DERSLER: Record<"YKS" | "LGS", string[]> = (() => {
  const yks = new Set<string>();
  const lgs = new Set<string>();
  for (const entry of KAYNAK_CATALOG) {
    if (entry.exam === "LGS") lgs.add(entry.s);
    else yks.add(entry.s);
  }
  const sort = (items: Set<string>) => [...items].sort((a, b) => a.localeCompare(b, "tr-TR"));
  return { YKS: sort(yks), LGS: sort(lgs) };
})();

export const KAYNAK_DEFAULTS = [
  "Konu Anlatim Foyu",
  "Soru Bankasi",
  "Deneme / Brans Denemesi",
  "Video Ders",
];

export function kaynakLabel(entry: Pick<KaynakCatalogEntry, "p" | "n">): string {
  return `${entry.p} ${entry.n}`;
}

export function katalogByLabel(label: string): KaynakCatalogEntry | null {
  return KAYNAK_CATALOG.find((entry) => kaynakLabel(entry) === label) ?? null;
}

export type KatalogFilter = {
  exam?: "Tumu" | KaynakExamGroup;
  subject?: string;
  pub?: string;
  type?: KaynakTypeKey | "Tumu";
  q?: string;
};

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR");
}

export function katalogList(filter: KatalogFilter = {}): KaynakCatalogEntry[] {
  const exam = filter.exam ?? "Tumu";
  const subject = filter.subject ?? "Tumu";
  const pub = filter.pub ?? "Tumu";
  const type = filter.type ?? "Tumu";
  const query = normalize(filter.q?.trim() ?? "");

  return KAYNAK_CATALOG.filter((entry) => {
    if (exam !== "Tumu" && entry.exam !== exam) return false;
    if (subject !== "Tumu" && entry.s !== subject) return false;
    if (pub !== "Tumu" && entry.p !== pub) return false;
    if (type !== "Tumu" && entry.t !== type) return false;
    if (query && !normalize(kaynakLabel(entry)).includes(query)) return false;
    return true;
  });
}

export function katalogPublishers(filter: Pick<KatalogFilter, "exam" | "subject"> = {}): string[] {
  const exam = filter.exam ?? "Tumu";
  const subject = filter.subject ?? "Tumu";
  const set = new Set<string>();

  for (const entry of KAYNAK_CATALOG) {
    if (exam !== "Tumu" && entry.exam !== exam) continue;
    if (subject !== "Tumu" && entry.s !== subject) continue;
    set.add(entry.p);
  }

  return [...set].sort((left, right) => left.localeCompare(right, "tr-TR"));
}

export const KAYNAK_HAVUZU: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const entry of KAYNAK_CATALOG) {
    if (entry.s === "Deneme") continue;
    map[entry.s] ??= [];
    map[entry.s].push(kaynakLabel(entry));
  }
  return map;
})();

export function sourcesForSubject(subject: string): string[] {
  return KAYNAK_HAVUZU[subject] ?? KAYNAK_DEFAULTS;
}

export function catalogSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    Matematik: "#534AB7",
    Geometri: "#534AB7",
    Fizik: "#2F6BD6",
    Kimya: "#0F6E56",
    Biyoloji: "#3A9D6A",
    "Türkçe": "#B26A12",
    "T.C. İnkılap Tarihi": "#A3582D",
    "Din Kültürü": "#A3582D",
    "Fen Bilimleri": "#0F6E56",
    İngilizce: "#2F6BD6",
    Deneme: "#534AB7",
  };
  return colors[subject] ?? "var(--primary)";
}
