# Latest Handoff

**Son tamamlanan faz:** BACKLOG PROMPT 18 — Deneme sonuçları (YKS alpha)  
**Son commit:** `2575599` — `feat: add exam results yks alpha`  
**Branch:** main  

## PROMPT 18 özeti

- Prisma: `ExamResult`, `ExamSubjectResult`, `ResultExamType` (TYT/AYT/LGS)
- Migration: `20260604190000_exam_results_yks`
- API: `GET /api/student/exams`, `GET /api/coach/exams`
- Dashboard: son net + trend kartları (öğrenci + koç)
- Seed: 2 TYT denemesi (yukarı trend)

## Durum

- Faz 2: 14 ✓ · 17 ✓ · **18 ✓** — sıradaki **16** (Yol-C: bildirim iskeleti)
- Yerel DB: `pnpm db:migrate && pnpm db:seed`

## Test özeti (P18)

db:generate ✓ · typecheck ✓ · unit 34 ✓

## Not

Net hesabı: `doğru - yanlış/4` (repository + seed). Bellek modu demo seed ile çalışır.
