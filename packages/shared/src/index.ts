export type RiskBand = "excellent" | "normal" | "attention" | "critical";

export type ExamTrack = "TYT" | "SAYISAL" | "SOZEL" | "EA" | "DIL";

export const subjectsByTrack: Record<ExamTrack, readonly string[]> = {
  TYT: ["Türkçe", "Matematik", "Fen", "Sosyal"],
  SAYISAL: ["Matematik", "Fizik", "Kimya", "Biyoloji"],
  SOZEL: ["Edebiyat", "Tarih", "Coğrafya", "Felsefe"],
  EA: ["Matematik", "Edebiyat", "Tarih", "Coğrafya"],
  DIL: ["Yabancı Dil"],
};

export const appBoundaries = {
  maxDailyExams: 5,
  maxStreakDays: 365,
  minRiskScore: 0,
  maxRiskScore: 100,
} as const;

export function calculateNet(correct: number, wrong: number): number {
  return correct - wrong / 4;
}

export type ExamResult = {
  correct: number;
  wrong: number;
};

export function calculateTotalNet(results: ExamResult[]): number {
  return results.reduce((total, result) => total + calculateNet(result.correct, result.wrong), 0);
}

export function getRiskBand(score: number): RiskBand {
  if (score >= 75) return "excellent";
  if (score >= 50) return "normal";
  if (score >= 25) return "attention";
  return "critical";
}

export type RiskScoreInput = {
  activity: number;
  assignments: number;
  academic: number;
  streak: number;
  communication: number;
};

export function calculateRiskScore(input: RiskScoreInput): { score: number; band: RiskBand } {
  const score = Math.round(
    (input.activity +
      input.assignments +
      input.academic +
      input.streak +
      input.communication) /
      5,
  );

  return { score, band: getRiskBand(score) };
}

export function calculateStreak(dates: string[], today: string): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates)].sort();
  const todayIndex = uniqueDates.indexOf(today);
  if (todayIndex === -1) return 0;

  let streak = 1;
  for (let index = todayIndex; index > 0; index -= 1) {
    const current = new Date(uniqueDates[index]!);
    const previous = new Date(uniqueDates[index - 1]!);
    const diffDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays !== 1) break;
    streak += 1;
  }

  return streak;
}

export {
  calculateTopicCompletionRate,
  TOPIC_EXAM_TYPE_LABELS,
} from "./topic-insights";

export {
  buildExamTrendSummaryFromRecords,
  describeExamTrend,
  formatExamNet,
  RESULT_EXAM_TYPE_LABELS,
} from "./exam-insights";

export {
  buildCoachSuggestion,
  buildParentWeeklyComment,
  buildRulesBasedRiskBand,
  buildStudentPriorityAssignment,
  calculateCompletionRate,
  countOverdueAssignments,
  isAssignmentOpen,
  RISK_BAND_LABELS,
  type AssignmentInsightItem,
} from "./assignment-insights";

export {
  INSTALLMENT_OPTIONS,
  annualSavingAmount,
  annualSavingMonths,
  computeInstallmentTotal,
  formatTRY,
  installmentOption,
  planMonthlyEquivalent,
  planPrice,
} from "./billing";
export type { BillingCycle, InstallmentOption, PlanPricing } from "./billing";
export { gradeOptik, optikNetCoef } from "./optik";
export type { OptikExamType, OptikResult } from "./optik";
export { buildReportDetail } from "./report-insights";
export type { ReportDetail } from "./report-insights";
export { allowedModes, slotSupportsMode, weeklyLimitFor } from "./appointments";
export type { Availability, SharedAppointmentMode } from "./appointments";
export { answerScore, averageScore } from "./test-scoring";
export type { QuestionKind, TestQuestion } from "./test-scoring";
