# Latest Handoff

**Son tamamlanan faz:** PROMPT 04 — Assignment alpha veri modeli  
**Commits:** _(pending)_  
**Branch:** main  

## Durum

- Assignment alpha alanları: description, type, priority, status, subject, dueDate, updatedAt
- Additive migration `20260604040000_assignment_alpha_fields` (veri kaybı yok)
- Mock + DB repository + API uyumlu; title-only POST çalışıyor
- Unit test: 15/15 (3 yeni assignment testi)

## Sonraki faz

**PROMPT 05** — Koç ödev formu alpha (**onay bekleniyor**)

## Not

Supabase/production'da `pnpm db:migrate` ile yeni migration uygulanmalı.
