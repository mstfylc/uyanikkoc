// packages/shared/src/optik.ts — optik form puanlama (saf fonksiyon)
export type OptikExamType = "TYT" | "AYT" | "LGS";

/** Yanlış götürme katsayısı: TYT/AYT 4 yanlış = 1 net, LGS 3 yanlış = 1 net. */
export function optikNetCoef(examType: OptikExamType): number {
  return examType === "LGS" ? 3 : 4;
}

export type OptikResult = { correct: number; wrong: number; blank: number; net: number };

/** answers ve key aynı uzunlukta; boş = "" / null / undefined. */
export function gradeOptik(
  answers: (string | null | undefined)[],
  key: string[],
  examType: OptikExamType,
): OptikResult {
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  key.forEach((k, i) => {
    const a = answers[i];
    if (!a) blank += 1;
    else if (a === k) correct += 1;
    else wrong += 1;
  });
  const net = Math.max(0, correct - wrong / optikNetCoef(examType));
  return { correct, wrong, blank, net: Math.round(net * 100) / 100 };
}
