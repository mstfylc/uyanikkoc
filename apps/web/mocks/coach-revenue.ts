import type { BillingCycle } from "@uyanik/database";

export type CoachRevenueSubscriber = {
  studentName: string;
  parentName: string;
  planId: string;
  cycle: BillingCycle;
  status: "paid" | "pending" | "failed";
  nextDays: number;
  monthlyAmount: number;
};

export type CoachRevenueTrend = {
  month: string;
  value: number;
};

export type CoachRevenueView = {
  subscribers: CoachRevenueSubscriber[];
  trend: CoachRevenueTrend[];
  platformFee: number;
  studentCapacity: number;
};

const SUBSCRIBERS: CoachRevenueSubscriber[] = [
  { studentName: "Elif Yildiz", parentName: "Ayse Yildiz", planId: "plus", cycle: "annual", status: "paid", nextDays: 279, monthlyAmount: 1916 },
  { studentName: "Mert Demir", parentName: "Hakan Demir", planId: "standart", cycle: "monthly", status: "paid", nextDays: 12, monthlyAmount: 1499 },
  { studentName: "Zeynep Kaya", parentName: "Sevgi Kaya", planId: "plus", cycle: "monthly", status: "pending", nextDays: 2, monthlyAmount: 2299 },
  { studentName: "Can Aydin", parentName: "Murat Aydin", planId: "vip", cycle: "annual", status: "paid", nextDays: 154, monthlyAmount: 2916 },
  { studentName: "Ece Sahin", parentName: "Deniz Sahin", planId: "standart", cycle: "monthly", status: "failed", nextDays: -3, monthlyAmount: 1499 },
  { studentName: "Burak Celik", parentName: "Asli Celik", planId: "plus", cycle: "monthly", status: "paid", nextDays: 19, monthlyAmount: 2299 },
  { studentName: "Selin Arslan", parentName: "Tulay Arslan", planId: "standart", cycle: "annual", status: "paid", nextDays: 88, monthlyAmount: 1249 },
  { studentName: "Kaan Yilmaz", parentName: "Erol Yilmaz", planId: "vip", cycle: "monthly", status: "pending", nextDays: 1, monthlyAmount: 3499 },
];

const TREND: CoachRevenueTrend[] = [
  { month: "Eki", value: 38200 },
  { month: "Kas", value: 41600 },
  { month: "Ara", value: 44900 },
  { month: "Oca", value: 47300 },
  { month: "Sub", value: 49100 },
  { month: "Mar", value: 52800 },
];

export async function getCoachRevenueView(): Promise<CoachRevenueView> {
  return {
    subscribers: SUBSCRIBERS,
    trend: TREND,
    platformFee: 4990,
    studentCapacity: 50,
  };
}
