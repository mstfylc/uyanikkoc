export function calculateTopicCompletionRate(total: number, completed: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export const TOPIC_EXAM_TYPE_LABELS: Record<"TYT" | "AYT" | "LGS" | "GENEL", string> = {
  TYT: "TYT",
  AYT: "AYT",
  LGS: "LGS",
  GENEL: "Genel",
};
