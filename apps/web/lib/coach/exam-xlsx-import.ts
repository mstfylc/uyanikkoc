import type { CoachRosterEntry, CreateExamResultInput, ResultExamType } from "@uyanik/database";

export const CAT_OF: Record<string, string> = {
  TURKCE: "Turkce",
  TARIH: "Sosyal",
  COGRAFYA: "Sosyal",
  FELSEFE: "Sosyal",
  "DIN KULTURU": "Sosyal",
  MATEMATIK: "Matematik",
  FIZIK: "Fen",
  KIMYA: "Fen",
  BIYOLOJI: "Fen",
};

export const CAT_ORDER = ["Turkce", "Sosyal", "Matematik", "Fen"] as const;
export const CAT_COLOR: Record<string, string> = {
  Turkce: "#B26A12",
  Sosyal: "#A3582D",
  Matematik: "#534AB7",
  Fen: "#0F6E56",
};

export type DenemeSubjectDetail = {
  ders: string;
  cat: string;
  d: number;
  y: number;
  n: number;
};

export type DenemeStudentRow = {
  no: string;
  sube: string;
  numara: string;
  ad: string;
  alan: string;
  byCat: Record<string, { d: number; y: number; n: number }>;
  detail: DenemeSubjectDetail[];
  toplamNet: number;
  puan: number;
  rank: number | null;
};

export type DenemeXlsxResult = {
  name: string;
  subjects: string[];
  students: DenemeStudentRow[];
  importedAt: number;
};

async function inflate(bytes: Uint8Array): Promise<string> {
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  await writer.write(new Uint8Array(bytes));
  await writer.close();
  return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer());
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function colNum(ref: string): number {
  const match = ref.match(/^([A-Z]+)/);
  if (!match) {
    return 0;
  }
  let num = 0;
  for (const ch of match[1]) {
    num = num * 26 + (ch.charCodeAt(0) - 64);
  }
  return num;
}

function titleCase(value: string): string {
  return String(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/(^|\s|-)([a-zçğıöşü])/g, (match, prefix, char) => prefix + char.toLocaleUpperCase("tr-TR"));
}

function normalizeName(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function parseDenemeXlsx(arrayBuffer: ArrayBuffer): Promise<DenemeXlsxResult> {
  const buf = new Uint8Array(arrayBuffer);
  const u16 = (offset: number) => buf[offset] | (buf[offset + 1] << 8);
  const u32 = (offset: number) =>
    (buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24)) >>> 0;

  let index = 0;
  const files: Record<string, string> = {};

  while (index + 4 <= buf.length) {
    if (u32(index) !== 0x04034b50) {
      break;
    }
    const method = u16(index + 8);
    const compSize = u32(index + 18);
    const nameLen = u16(index + 26);
    const extraLen = u16(index + 28);
    const nameStart = index + 30;
    const name = new TextDecoder().decode(buf.slice(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    const comp = buf.slice(dataStart, dataStart + compSize);

    if (/sharedStrings\.xml$|sheet1\.xml$/.test(name)) {
      files[name] = method === 0 ? new TextDecoder().decode(comp) : await inflate(comp);
    }

    index = dataStart + compSize;
  }

  const ssXml = files["xl/sharedStrings.xml"] || "";
  const strings = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => {
    const parts = [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((item) => item[1]);
    return decodeEntities(parts.join(""));
  });

  const sheet = files["xl/worksheets/sheet1.xml"] || "";
  const rowsRaw = [...sheet.matchAll(/<row[^>]*?>([\s\S]*?)<\/row>/g)];
  const cellVal = (full: string) => {
    const type = (full.match(/ t="([^"]+)"/) || [])[1];
    const value = (full.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
    const inline = (full.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1];
    if (type === "s") {
      return strings[+value] ?? "";
    }
    if (inline != null && value == null) {
      return decodeEntities(inline);
    }
    return value != null ? value : "";
  };

  const grid = rowsRaw.map((row) => {
    const cells = [
      ...row[1].matchAll(/<c r="([A-Z]+\d+)"[^>]*\/>|<c r="([A-Z]+\d+)"[^>]*>([\s\S]*?)<\/c>/g),
    ];
    const record: Record<number, string> = {};
    for (const match of cells) {
      const ref = match[1] || match[2];
      record[colNum(ref)] = cellVal(match[0]);
    }
    return record;
  });

  const headerIndex = grid.findIndex((row) =>
    Object.values(row).some((value) => String(value).toUpperCase().includes("AD VE SOYAD")),
  );
  if (headerIndex < 0) {
    throw new Error("Beklenen format degil: 'AD VE SOYAD' basligi bulunamadi.");
  }

  const header = grid[headerIndex];
  const labelRow = grid[headerIndex - 1] || {};
  const findCol = (predicate: (value: string) => boolean) => {
    for (const column of Object.keys(header)) {
      if (predicate(String(header[+column]).toUpperCase())) {
        return +column;
      }
    }
    return -1;
  };

  const adCol = findCol((value) => value.includes("AD VE SOYAD"));
  const subeCol = findCol((value) => value.includes("UBE") && !value.includes("SUBE")) >= 0
    ? findCol((value) => value.includes("UBE"))
    : 2;
  const numaraCol = findCol((value) => value.includes("NUMARA"));
  const alanCol = findCol((value) => value === "ALAN");
  const puanCol = findCol((value) => value.includes("PUAN"));
  const genelCol = findCol((value) => value === "GENEL");

  const subjects: Array<{ name: string; dCol: number }> = [];
  let total: { dCol: number } | null = null;

  for (const column of Object.keys(header)
    .map(Number)
    .sort((left, right) => left - right)) {
    if (String(header[column]).toUpperCase() === "D" && column >= 6) {
      const label = String(labelRow[column] || "")
        .trim()
        .toUpperCase();
      if (label === "TOPLAM" || String(header[column + 2]).toUpperCase() === "NET") {
        total = { dCol: column };
      } else if (label) {
        subjects.push({ name: label, dCol: column });
      }
    }
  }

  const num = (value: unknown) => {
    const parsed = parseFloat(String(value).replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const students: DenemeStudentRow[] = [];
  for (let rowIndex = headerIndex + 1; rowIndex < grid.length; rowIndex += 1) {
    const row = grid[rowIndex];
    const ad = String(row[adCol] || "").trim();
    if (!ad) {
      continue;
    }

    const byCat: Record<string, { d: number; y: number; n: number }> = {};
    for (const category of CAT_ORDER) {
      byCat[category] = { d: 0, y: 0, n: 0 };
    }

    const detail: DenemeSubjectDetail[] = [];
    for (const subject of subjects) {
      const d = num(row[subject.dCol]);
      const y = num(row[subject.dCol + 1]);
      const n = num(row[subject.dCol + 2]);
      const cat = CAT_OF[subject.name] || subject.name;
      if (!byCat[cat]) {
        byCat[cat] = { d: 0, y: 0, n: 0 };
      }
      byCat[cat].d += d;
      byCat[cat].y += y;
      byCat[cat].n += n;
      detail.push({ ders: titleCase(subject.name), cat, d, y, n });
    }

    const toplamNet = total
      ? num(row[total.dCol + 2])
      : Object.values(byCat).reduce((sum, item) => sum + item.n, 0);

    students.push({
      no: String(row[1] || students.length + 1),
      sube: String(row[subeCol] || "").trim(),
      numara: String(row[numaraCol] || "").trim(),
      ad: titleCase(ad),
      alan: String(row[alanCol] || "").trim(),
      byCat,
      detail,
      toplamNet,
      puan: puanCol > 0 ? num(row[puanCol]) : 0,
      rank: genelCol > 0 ? parseInt(String(row[genelCol]), 10) || null : null,
    });
  }

  students.sort((left, right) => right.toplamNet - left.toplamNet);

  return {
    name: "TYT Denemesi",
    subjects: subjects.map((subject) => titleCase(subject.name)),
    students,
    importedAt: Date.now(),
  };
}

function resolveStudentId(studentName: string, roster: CoachRosterEntry[]): string | null {
  const normalized = normalizeName(studentName);
  const exact = roster.find((entry) => normalizeName(entry.displayName) === normalized);
  if (exact) {
    return exact.studentId;
  }

  const partial = roster.find((entry) => {
    const entryName = normalizeName(entry.displayName);
    return entryName.includes(normalized) || normalized.includes(entryName);
  });
  return partial?.studentId ?? null;
}

export function mapDenemeXlsxToImportFormat(
  parsed: DenemeXlsxResult,
  roster: CoachRosterEntry[],
  options?: {
    examType?: ResultExamType;
    label?: string;
    takenAt?: string;
  },
): CreateExamResultInput[] {
  const examType = options?.examType ?? "TYT";
  const label = options?.label?.trim() || parsed.name;
  const takenAt = options?.takenAt ?? new Date().toISOString();

  const exams: CreateExamResultInput[] = [];

  for (const student of parsed.students) {
    const studentId = resolveStudentId(student.ad, roster);
    if (!studentId || student.detail.length === 0) {
      continue;
    }

    exams.push({
      studentId,
      examType,
      label,
      takenAt,
      subjects: student.detail.map((item) => ({
        subjectName: item.ders,
        correct: item.d,
        wrong: item.y,
      })),
    });
  }

  return exams;
}
