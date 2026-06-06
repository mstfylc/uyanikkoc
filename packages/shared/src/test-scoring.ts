export type QuestionKind = "likert" | "yesno" | "scale" | "choice";

export type TestQuestion = {
  text: string;
  kind: QuestionKind;
  options?: string[];
};

export function answerScore(
  kind: QuestionKind,
  raw: number | boolean | null,
  q?: TestQuestion,
): number | null {
  if (raw === null || raw === undefined) return null;
  if (kind === "likert") return (raw as number) + 1;
  if (kind === "yesno") return raw ? 5 : 1;
  if (kind === "scale") return ((raw as number) / 10) * 4 + 1;
  if (kind === "choice") {
    const n = q?.options?.length ?? 1;
    return n > 1 ? ((raw as number) / (n - 1)) * 4 + 1 : 3;
  }
  return raw as number;
}

export function averageScore(scores: (number | null)[]): number {
  const vals = scores.filter((s): s is number => s !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}
