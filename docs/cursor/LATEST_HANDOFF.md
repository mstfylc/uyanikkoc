# Latest Handoff

**Son tamamlanan faz:** BACKLOG PROMPT 14 — Koç öğrenci roster (alpha)  
**Son commit:** `8fd1f00` — `feat: add coach student roster alpha`  
**Branch:** main  

## Bu faz (P14 roster)

- `CoachStudent` modeli + migration `20260604220000_coach_student_roster`
- `GET /api/coach/students` — koç roster listesi
- Ödev/deneme formlarında öğrenci seçimi (dropdown)
- `/coach/students` roster sayfası + detay linkleri
- Seed: `student_002`, `parent_002`, iki koç–öğrenci bağlantısı

## Önceki faz (Yol-C tamamlandı)

16→15→19→20→21→29→22→26→27 (`6b3dac2`)

## Migration

Yerel: `pnpm db:migrate && pnpm db:seed`

## Test özeti

typecheck ✓ · unit 41 ✓ · e2e 10 ✓
