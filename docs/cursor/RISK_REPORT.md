# Risk Report — Faz 2 kapanış

**Tarih:** 2026-06-05  
**Faz:** Backlog 16–22, 26–27, 29  
**Durum:** Additive migration `20260604210000_faz2_skeletons` — yerel/CI için `pnpm db:migrate` gerekir.

---

# Risk Report — BACKLOG PROMPT 18

**Tarih:** 2026-06-04  
**Faz:** Deneme sonuçları (YKS alpha)  
**Durum:** Additive migration — yerel/CI DB için `pnpm db:migrate` gerekir.

---

# Risk Report — BACKLOG PROMPT 17

**Tarih:** 2026-06-04  
**Faz:** Kullanıcı tanımlı konu takibi  
**Durum:** Additive migration — yerel/CI DB için `pnpm db:migrate` gerekir.

---

# Risk Report — BACKLOG PROMPT 14

**Tarih:** 2026-06-03  
**Faz:** Assignment service layer (refactor only)  
**Durum:** Risk yok — davranış değişmedi; yeni tablo/endpoint/dependency yok.

---

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
