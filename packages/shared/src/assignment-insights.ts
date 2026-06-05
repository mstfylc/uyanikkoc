import type { RiskBand } from "./index";

export type AssignmentInsightItem = {
  title?: string;
  dueDate: string | null;
  status: string;
  completed: boolean;
  priority?: string;
};

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function scoreToRiskBand(score: number): RiskBand {
  if (score >= 75) return "excellent";
  if (score >= 50) return "normal";
  if (score >= 25) return "attention";
  return "critical";
}

export function calculateCompletionRate(total: number, completed: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export function isAssignmentOpen(item: AssignmentInsightItem): boolean {
  return !item.completed && item.status !== "completed" && item.status !== "cancelled";
}

export function countOverdueAssignments(
  items: AssignmentInsightItem[],
  now = new Date(),
): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return items.filter((item) => {
    if (!isAssignmentOpen(item) || !item.dueDate) {
      return false;
    }

    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
}

export function buildRulesBasedRiskBand(
  completionRate: number,
  overdueCount: number,
): RiskBand {
  const penalty = overdueCount * 15;
  const score = Math.max(0, Math.min(100, completionRate - penalty));
  return scoreToRiskBand(score);
}

export function buildCoachSuggestion(
  completionRate: number,
  overdueCount: number,
  pendingCount: number,
): string {
  if (pendingCount === 0) {
    return "Tum odevler tamamlandi. Yeni hedefler veya tekrar odevleri planlayabilirsiniz.";
  }

  if (overdueCount > 0) {
    return `${overdueCount} gecikmis odev var. Oncelikle bunlari kapatmayi ve veli bilgilendirmesini oneriyoruz.`;
  }

  if (completionRate < 50) {
    return "Tamamlama orani dusuk. Haftalik plan gozden gecirilmeli ve yuksek oncelikli odevler belirlenmeli.";
  }

  if (completionRate < 80) {
    return "Ilerleme orta duzeyde. Bekleyen odevler icin son tarih hatirlatmasi yapilabilir.";
  }

  return "Ilerleme guclu. Mevcut tempoyu korumak icin duzenli takip yeterli.";
}

export function buildParentWeeklyComment(
  completionRate: number,
  overdueCount: number,
  pendingCount: number,
  extras?: {
    topicCompletionRate?: number;
    latestExamNet?: number | null;
    examTrend?: "up" | "down" | "flat";
  },
): string {
  const parts: string[] = [];

  if (pendingCount === 0) {
    parts.push("Tum odevler tamamlandi. Harika bir hafta!");
  } else if (overdueCount > 0) {
    parts.push(`${overdueCount} gecikmis odev var. Bu hafta odak noktasi tamamlama olmali.`);
  } else if (completionRate >= 80) {
    parts.push("Ilerleme guclu. Kalan odevler icin duzenli calisma surdurulebilir.");
  } else if (completionRate >= 50) {
    parts.push("Orta duzey ilerleme. Hafta sonuna kadar bekleyen odevler tamamlanmali.");
  } else {
    parts.push("Ilerleme dusuk. Haftalik plan gozden gecirilmeli ve oncelikli odevler belirlenmeli.");
  }

  if (extras?.topicCompletionRate !== undefined) {
    parts.push(`Konu tamamlama: %${extras.topicCompletionRate}.`);
  }

  if (extras?.latestExamNet != null) {
    const trendLabel =
      extras.examTrend === "up" ? "yukari" : extras.examTrend === "down" ? "asagi" : "sabit";
    parts.push(`Son deneme net: ${extras.latestExamNet.toFixed(1)} (${trendLabel} trend).`);
  }

  return parts.join(" ");
}

export function buildStudentPriorityAssignment(
  items: AssignmentInsightItem[],
  now = new Date(),
): AssignmentInsightItem | null {
  const openItems = items.filter(isAssignmentOpen);
  if (openItems.length === 0) {
    return null;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const sorted = [...openItems].sort((left, right) => {
    const leftPriority = PRIORITY_WEIGHT[left.priority ?? "medium"] ?? 2;
    const rightPriority = PRIORITY_WEIGHT[right.priority ?? "medium"] ?? 2;
    if (leftPriority !== rightPriority) {
      return rightPriority - leftPriority;
    }

    const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return leftDue - rightDue;
  });

  return sorted[0] ?? null;
}

export const RISK_BAND_LABELS: Record<RiskBand, string> = {
  excellent: "Mukemmel",
  normal: "Normal",
  attention: "Dikkat",
  critical: "Kritik",
};
