import { KAYNAK_HAVUZU, KAYNAK_DEFAULTS as CATALOG_DEFAULTS, sourcesForSubject } from "@/lib/design/kaynak-catalog";

/** Ders bazinda onerilen kaynaklar (zip-10 KAYNAK_HAVUZU). */
export const STUDENT_RESOURCE_SUBJECTS = Object.keys(KAYNAK_HAVUZU);

export function getStudentResources(subject: string): string[] {
  return sourcesForSubject(subject).slice(0, 6);
}

export { KAYNAK_HAVUZU, CATALOG_DEFAULTS as KAYNAK_DEFAULTS };
