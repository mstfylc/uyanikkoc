import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "apps/web/fixtures/books_clean.json");
const outPath = path.join(root, "apps/web/lib/design/kaynak-catalog-data.ts");

const SUBJECT_RULES = [
  ["Fen Bilimleri", /fen bilimleri|fen\s+soru|fen sb/i],
  ["T.C. İnkılap Tarihi", /ink[ıi]lap|atat[üu]rk/i],
  ["Din Kültürü", /din k[üu]lt[üu]r[üu]|dkab/i],
  ["İngilizce", /ingilizce|ing\b|ydt/i],
  ["Türkçe", /t[üu]rk[çc]e|paragraf|dil bilgisi/i],
  ["Matematik", /matematik|mat\b|problem|problemler/i],
  ["Geometri", /geometri|[üu][çc]gen|[çc]ember|analitik/i],
  ["Fizik", /fizik/i],
  ["Kimya", /kimya/i],
  ["Biyoloji", /biyoloji/i],
  ["Tarih", /tarih/i],
  ["Coğrafya", /co[ğg]rafya/i],
  ["Edebiyat", /edebiyat|t[üu]rk dili/i],
  ["Felsefe", /felsefe/i],
  ["Sosyal Bilgiler", /sosyal/i],
  ["Deneme", /deneme/i],
];

function inferSubject(title) {
  for (const [subject, rule] of SUBJECT_RULES) {
    if (rule.test(title)) return subject;
  }
  return "Genel";
}

function inferType(title) {
  if (/video|[çc][öo]z[üu]ml[üu]|dijital/i.test(title)) return "video";
  if (/deneme|bran[şs]/i.test(title)) return "deneme";
  if (/f[öo]y|fasik[üu]l|mod[üu]l|yaprak/i.test(title)) return "foy";
  if (/konu anlat|ders anlat|[öo]zet|defter/i.test(title)) return "konu";
  return "soru";
}

function inferExam(book, title) {
  const raw = String(book.examType ?? "").toUpperCase();
  if (raw === "TYT" || raw === "AYT" || raw === "LGS") return [raw];
  if (/\bTYT\b/i.test(title)) return ["TYT"];
  if (/\bAYT\b/i.test(title)) return ["AYT"];
  const grade = Number(book.grade);
  if (grade >= 5 && grade <= 8) return ["LGS"];
  if (/\b[5-8]\.?\s*SINIF|\b[5-8]\.?\s*SNF/i.test(title)) return ["LGS"];
  return ["YKS"];
}

function numberOrUndefined(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

const books = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const payload = books
  .filter((book) => book && book.active !== false && String(book.title ?? "").trim())
  .map((book) => {
    const title = String(book.title).trim();
    const entry = {
      n: title,
      p: String(book.publisher ?? "YAYINEVİ BELİRTİLMEMİŞ").trim() || "YAYINEVİ BELİRTİLMEMİŞ",
      s: inferSubject(title),
      t: inferType(title),
      e: inferExam(book, title),
    };
    const grade = numberOrUndefined(book.grade);
    const questionCount = numberOrUndefined(book.questionCount);
    if (grade !== undefined) entry.g = grade;
    if (questionCount !== undefined) entry.q = questionCount;
    if (book.isbn) entry.isbn = String(book.isbn);
    return entry;
  })
  .sort((left, right) =>
    left.s.localeCompare(right.s, "tr-TR") ||
    left.p.localeCompare(right.p, "tr-TR") ||
    left.n.localeCompare(right.n, "tr-TR"),
  );

const json = JSON.stringify(payload);
const out = `/* Auto-synced from books_clean.json - do not edit by hand. */
export type KaynakTypeKey = "soru" | "konu" | "deneme" | "foy" | "video";
export type KaynakExamGroup = "YKS" | "LGS";
export type KaynakCatalogSeed = {
  n: string;
  p: string;
  s: string;
  t: KaynakTypeKey;
  e: string[];
  g?: number;
  q?: number;
  isbn?: string;
};

export const KAYNAK_CATALOG_SEED = JSON.parse(${JSON.stringify(json)}) as KaynakCatalogSeed[];
`;

fs.writeFileSync(outPath, out);
console.log(`Wrote ${payload.length} entries from ${inputPath} to ${outPath}`);
