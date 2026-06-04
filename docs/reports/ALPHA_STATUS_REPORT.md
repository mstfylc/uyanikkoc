# Uyanık Koç — Alpha Durum Raporu

**Tarih:** 2026-06-04  
**Kapsam:** Sprint 1 (PROMPT 00–13) + Faz 2 backlog planı  
**Kod değişikliği:** Bu rapor salt okunur özet; uygulama kodu içermez.

---

## Tamamlananlar (Sprint 1)

| Alan | Durum |
|------|--------|
| Repo guardrails | README, AGENTS.md, `.gitignore`, tsbuildinfo temizliği |
| Production memory guard | `assertProductionMemoryPolicy`, `withApiAuth` |
| Testler | Unit (web 15, shared 13), E2E 10, CI workflow |
| Assignment alpha | Prisma alanları, API, koç formu, öğrenci/veli görünüm |
| Rules-v1 | Risk/öneri helper’ları, dashboard kartları |
| DB-backed alpha | Seed + `db:verify-alpha`, docker-compose.dev.yml |
| Branch/Admin shell | AppLayout + minimal dashboard |
| Deploy kararı | `docs/deploy/DEPLOYMENT_DECISION.md` |
| Faz 2 plan | `docs/cursor/CURSOR_NEXT_BACKLOG.md` (Yol-C sırası) |

### Dikey akış (demo)

Koç ödev oluşturur → öğrenci listeler/tamamlar → veli özet görür. Bellek modu (`DEMO_AUTH_ALLOW_IN_MEMORY=true`) veya PostgreSQL (`false` + `DATABASE_URL`) ile çalışır.

### Roller

student, coach, parent, branch, admin — login + RBAC path koruması. AI Koç yalnızca **Yakında** yüzeyi (`AI_COACH_ENABLED=false`).

---

## Riskler

| Risk | Önem | Not |
|------|------|-----|
| Vercel preview 404 | Orta | Output Directory statik modu; Dashboard ayarı — bkz. deploy doc |
| Metronic repoda yok | Orta | Build öncesi lokal asset kopyası gerekli |
| Production DB | Düşük (çözüldü) | Self-host + migrate/seed prosedürü dokümante |
| CRM sızıntısı | Düşük | Ayrı DB/env politikası AGENTS + deploy doc |
| E2E CI dışı | Düşük | Playwright manuel / ayrı job |

---

## Test durumu

| Komut | Son bilinen |
|-------|-------------|
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm test:unit` | ✓ (28 test: web 15 + shared 13) |
| `pnpm --filter @uyanik/web test:e2e` | ✓ (10 senaryo) |
| `pnpm db:verify-alpha` | ✓ (DATABASE_URL + migrate + seed ile) |
| GitHub Actions CI | install, generate, typecheck, lint, unit |

---

## DB-backed alpha

- Prisma: Organization, Branch, User, profiller, Assignment (alpha alanları)
- Auth: `resolveUserByEmail` → DB veya demo-memory (`shouldUseDatabase`)
- Doğrulama: `packages/database/scripts/verify-alpha-flow.ts`
- Yerel PG: `docker compose -f docker-compose.dev.yml up -d`

---

## Mobil / worker

| Paket | Durum |
|-------|--------|
| `apps/mobile` | Placeholder — kod yazılmıyor |
| `apps/worker` | Placeholder — Faz 2 backlog 26’da iskelet planı |

---

## AI Koç

- Canlı OpenAI entegrasyonu **yok**
- `/student/ai-coach`, sidebar, `/api/ai-coach` placeholder (503 when disabled)
- Backlog 28 ertelendi

---

## Sonraki 5 öncelik (Faz 2 — Yol-C)

1. **BACKLOG 14** — Koç öğrenci roster  
2. **BACKLOG 17** — Kullanıcı tanımlı konu takibi (YKS öncelik)  
3. **BACKLOG 18** — Deneme sonuçları (TYT/AYT, calculateNet)  
4. **BACKLOG 16 / 15** — Bildirim + mesaj iskeleti  
5. **BACKLOG 29** — Kapatılabilir motivasyon/streak (17, 18, 16 sonrası)

**Ertelenen:** franchise UI (23), ödeme (24), mobil (25), AI canlı (28), sprint 1 opsiyonelleri (10, 12, 13 tamamlandı / 10 branch shell yapıldı).

---

## Sprint kapanış notu

Sprint 1 hedefi — **Auth + RBAC + DB-backed koç→öğrenci→veli alpha** — tamamlandı. Yeni feature başlatmadan önce `CURSOR_NEXT_BACKLOG.md` sırasındaki **PROMPT 14** ile Faz 2’ye geçilir.
