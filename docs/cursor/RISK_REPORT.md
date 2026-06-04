# Risk Report — PROMPT 09

**Tarih:** 2026-06-04  
**Faz:** PROMPT 09 — DB-backed alpha dogrulama  
**Durum:** COZULDU

## Onceki blokaj

DATABASE_URL yoktu; yerel Postgres docker-compose ile saglandi.

## Cozum

- `docker-compose.dev.yml` + `.env.example` guncellendi
- Seed FK sirasi duzeltildi (parent once, student sonra)
- `db:verify-alpha` scripti auth/assignment/summary akisini dogruladi

## Yerel calistirma

```bash
docker compose -f docker-compose.dev.yml up -d
pnpm db:migrate && pnpm db:seed && pnpm db:verify-alpha
```
