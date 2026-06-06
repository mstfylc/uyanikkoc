// Türetilmiş veriler — saf seçiciler (UI + API paylaşır). apps/web/lib/admin/derive.ts
// Prototip kaynağı: admin/admin-data.jsx (platformMetrics) + admin/kurum.jsx (orgCoaches, orgStudents).

import { orgPlanById } from "./pricing";
import type { CoachFeedback, Org, PlatformMetrics, SoloCoach } from "./types";

export function platformMetrics(orgs: Org[], coaches: SoloCoach[]): PlatformMetrics {
  const orgStudents = orgs.reduce((a, o) => a + o.seats.used, 0);
  const coachStudents = coaches
    .filter((c) => c.status !== "canceled")
    .reduce((a, c) => a + c.seats.used, 0);
  const orgMrr = orgs
    .filter((o) => o.status === "active" || o.status === "expiring")
    .reduce((a, o) => a + o.feeMonthly, 0);
  const coachMrr = coaches
    .filter((c) => c.status === "active")
    .reduce((a, c) => a + c.feeMonthly, 0);
  const mrr = orgMrr + coachMrr;
  return {
    orgs: orgs.length,
    franchises: orgs.filter((o) => o.type === "franchise").length,
    activeCoaches: coaches.filter((c) => c.status === "active").length,
    totalCoaches: coaches.length,
    students: orgStudents + coachStudents,
    branches: orgs.reduce((a, o) => a + o.branches.length, 0),
    mrr,
    arr: mrr * 12,
    orgMrr,
    coachMrr,
    atRisk:
      orgs.filter((o) => o.status === "overdue" || o.status === "expiring").length +
      coaches.filter((c) => c.status === "overdue" || c.status === "suspended").length,
  };
}

// --- Deterministik koç / öğrenci üretimi (kurum içi listeler) ---
// Gerçek veritabanı bağlanınca bu fonksiyonlar Prisma sorgularıyla değiştirilir.

const COACH_NAMES = [
  "Aslı Korkmaz", "Tolga Şen", "Merve Yıldız", "Can Aydın", "Pelin Demir", "Onur Kaya",
  "Sıla Arslan", "Berk Yılmaz", "Ece Çelik", "Kaan Doğan", "Nazlı Aksu", "Emir Polat",
];
const STUDENT_FIRST = [
  "Elif", "Yusuf", "Zeynep", "Mert", "Defne", "Arda", "Ada", "Eymen",
  "Nehir", "Kuzey", "Asya", "Poyraz", "Mavi", "Ela", "Çınar", "Duru",
];
const STUDENT_LAST = [
  "Yılmaz", "Demir", "Kaya", "Şahin", "Çelik", "Aydın",
  "Arslan", "Doğan", "Kara", "Koç", "Aksoy", "Polat",
];
const GRADES = ["12. Sınıf", "11. Sınıf", "Mezun", "10. Sınıf"];

export type OrgCoach = {
  id: string;
  name: string;
  branch: string;
  branchId: string;
  students: number;
  rating: string;
  status: "active" | "trial";
  load: number;
};

export function orgCoaches(org: Org): OrgCoach[] {
  const out: OrgCoach[] = [];
  let ci = 0;
  org.branches.forEach((b) => {
    for (let i = 0; i < b.coaches; i++) {
      const name = COACH_NAMES[ci % COACH_NAMES.length];
      const students = Math.round(b.students / b.coaches) + (i % 2 ? 1 : -1);
      out.push({
        id: `${org.id}-c${ci}`,
        name,
        branch: b.name,
        branchId: b.id,
        students: Math.max(4, students),
        rating: (4.2 + ((ci * 7) % 8) / 10).toFixed(1),
        status: ci % 11 === 5 ? "trial" : "active",
        load: Math.min(100, 55 + ((ci * 13) % 45)),
      });
      ci++;
    }
  });
  return out;
}

export type OrgStudent = {
  id: string;
  name: string;
  grade: string;
  branch: string;
  coach: string;
  net: number;
  attend: number;
  status: "active" | "risk";
};

export function orgStudents(org: Org): OrgStudent[] {
  const out: OrgStudent[] = [];
  const coaches = orgCoaches(org);
  let si = 0;
  org.branches.forEach((b) => {
    for (let i = 0; i < b.students; i++) {
      const fn = STUDENT_FIRST[si % STUDENT_FIRST.length];
      const ln = STUDENT_LAST[(si * 3) % STUDENT_LAST.length];
      const branchCoaches = coaches.filter((c) => c.branchId === b.id);
      const coach = branchCoaches[i % Math.max(1, b.coaches)] || coaches[0];
      out.push({
        id: `${org.id}-s${si}`,
        name: `${fn} ${ln}`,
        grade: GRADES[si % GRADES.length],
        branch: b.name,
        coach: coach ? coach.name : "—",
        net: 60 + ((si * 11) % 70) + (si % 3) * 5,
        attend: 70 + ((si * 7) % 30),
        status: si % 17 === 3 ? "risk" : "active",
      });
      si++;
    }
  });
  return out;
}

export { orgPlanById };

// --- Deterministik geri bildirim üretimi (öğrenci/veli → koç) ---
const FEEDBACK_STUDENTS = [
  "Elif Yılmaz", "Yusuf Demir", "Zeynep Kaya", "Mert Şahin", "Defne Çelik",
  "Arda Aydın", "Ada Arslan", "Eymen Doğan", "Nehir Kara", "Asya Koç",
];
const FEEDBACK_PARENTS = [
  "Serkan Yılmaz (veli)", "Ayşe Demir (veli)", "Hakan Kaya (veli)",
  "Fatma Şahin (veli)", "Murat Çelik (veli)", "Gül Aydın (veli)",
];
const POSITIVE = [
  "Çocuğumun motivasyonu belirgin şekilde arttı, programı çok düzenli takip ediyor.",
  "Her hafta geri dönüş veriyor, deneme analizlerini sabırla anlatıyor.",
  "Zayıf konularımı tek tek çalıştırdı, netlerim yükseldi.",
  "Sorularıma hızlı cevap veriyor, kendimi yalnız hissetmiyorum.",
  "Hedef belirlememe yardımcı oldu, artık nasıl çalışacağımı biliyorum.",
  "İletişimi çok iyi, velilerle de düzenli paylaşım yapıyor.",
];
const MIXED = [
  "Genel olarak memnunuz ama randevu saatlerinde bazen aksama oluyor.",
  "İçerik iyi fakat ödev geri bildirimleri biraz gecikebiliyor.",
  "Daha sık birebir görüşme olsa çok iyi olur.",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** Bir org-koç için deterministik 2–4 geri bildirim üretir. */
export function seedCoachFeedback(orgId: string, coachId: string): CoachFeedback[] {
  const seed = hash(coachId);
  const count = 2 + (seed % 3); // 2..4
  const out: CoachFeedback[] = [];
  for (let i = 0; i < count; i++) {
    const k = hash(coachId + ":" + i);
    const isParent = k % 3 === 0;
    const rating = 5 - (k % 5 === 0 ? 2 : k % 4 === 0 ? 1 : 0); // çoğunlukla 5, bazen 4/3
    const comment =
      rating >= 5
        ? POSITIVE[k % POSITIVE.length]
        : rating === 4
        ? POSITIVE[(k + 2) % POSITIVE.length]
        : MIXED[k % MIXED.length];
    out.push({
      id: `${coachId}-fb${i}`,
      orgId,
      coachId,
      author: isParent
        ? FEEDBACK_PARENTS[k % FEEDBACK_PARENTS.length]
        : FEEDBACK_STUDENTS[k % FEEDBACK_STUDENTS.length],
      role: isParent ? "parent" : "student",
      rating,
      comment,
      date: Date.now() - ((k % 40) + i * 6) * 86_400_000,
    });
  }
  return out.sort((a, b) => b.date - a.date);
}

export function coachRatingAverage(items: CoachFeedback[]): number {
  if (items.length === 0) return 0;
  return Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10;
}
