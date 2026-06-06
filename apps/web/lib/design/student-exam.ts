import type { TopicExamType } from "@uyanik/database";

export type StudentExamKind = "YKS" | "LGS";
export type StudentExamTrack = "sayisal" | "sozel" | "ea" | "lgs";

export type StudentExamProfile = {
  kind: StudentExamKind;
  track: StudentExamTrack;
  label: string;
  subjects: readonly string[];
  defaultExamType: TopicExamType;
};

const YKS_SAYISAL = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Turkce"] as const;
const YKS_SOZEL = ["Turkce", "Edebiyat", "Tarih", "Cografya", "Felsefe"] as const;
const YKS_EA = ["Matematik", "Turkce", "Edebiyat", "Tarih", "Cografya"] as const;
const LGS = [
  "Matematik",
  "Turkce",
  "Fen Bilimleri",
  "T.C. Inkılap Tarihi",
  "Din Kulturu",
  "Ingilizce",
] as const;

/** Zip-18: ogrencinin sinav turu ve ders listesi (auth sub / demo e-posta). */
export function studentSinav(input?: {
  email?: string | null;
  studentId?: string | null;
}): StudentExamProfile {
  const email = input?.email?.toLowerCase() ?? "";

  if (email.includes("lgs") || input?.studentId === "student_lgs_001") {
    return {
      kind: "LGS",
      track: "lgs",
      label: "8. Sinif · LGS",
      subjects: LGS,
      defaultExamType: "LGS",
    };
  }

  if (email.includes("sozel")) {
    return {
      kind: "YKS",
      track: "sozel",
      label: "12. Sinif · Sozel",
      subjects: YKS_SOZEL,
      defaultExamType: "AYT",
    };
  }

  if (email.includes("ea")) {
    return {
      kind: "YKS",
      track: "ea",
      label: "12. Sinif · EA",
      subjects: YKS_EA,
      defaultExamType: "AYT",
    };
  }

  return {
    kind: "YKS",
    track: "sayisal",
    label: "11. Sinif · Sayisal",
    subjects: YKS_SAYISAL,
    defaultExamType: "TYT",
  };
}

export function filterSubjectsForStudentExam<T extends { examType: TopicExamType; name: string }>(
  subjects: T[],
  profile: StudentExamProfile,
): T[] {
  const allowedTypes =
    profile.kind === "LGS" ? new Set<TopicExamType>(["LGS", "GENEL"]) : new Set<TopicExamType>(["TYT", "AYT", "GENEL"]);

  return subjects.filter((subject) => allowedTypes.has(subject.examType));
}
