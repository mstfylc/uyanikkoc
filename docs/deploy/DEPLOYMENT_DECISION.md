# Uyanık Koç — Deployment Kararı

Bu belge production ve preview ortamları için **değişmez** dağıtım kararlarını özetler. Kod veya Vercel config bu fazda değiştirilmez; yalnızca karar kaydı tutulur.

## Özet

| Ortam | Platform | Amaç |
|-------|----------|------|
| **Production** | Kendi sunucu (self-host) | Canlı koç–öğrenci–veli uygulaması |
| **Preview / demo** | Vercel (veya statik landing) | PR önizleme, demo, pazarlama landing |
| **CRM** | Ayrı sunucu + ayrı PostgreSQL | Bu repodan tamamen izole |

---

## Production — Kendi sunucu

**Karar:** Production trafiği `uyanikkoc.com` (veya eşdeğer domain) için **tek tenant, self-hosted** Node.js sürecidir. Vercel production hedefi **değildir**.

### Bileşenler (ayrı disk / servis)

1. **App** — `apps/web` Next.js (`next start` veya PM2/systemd). Monorepo kökünden build: `pnpm db:generate && pnpm --filter @uyanik/web build`.
2. **DB** — PostgreSQL (Supabase veya kendi PG). `DATABASE_URL` zorunlu; `DEMO_AUTH_ALLOW_IN_MEMORY=false`.
3. **Upload** — `KOC_UPLOAD_DIR` (ödev/dosya; CRM upload alanından ayrı).
4. **Log** — `KOC_LOG_DIR` (uygulama logları; CRM loglarından ayrı).

### Zorunlu env (production)

Bkz. `apps/web/.env.production.example`:

- `DATABASE_URL` — gerçek PostgreSQL
- `AUTH_SECRET` / `NEXTAUTH_SECRET`
- `AUTH_URL` / `NEXTAUTH_URL` — canlı site URL (sonunda `/` yok)
- `DEMO_AUTH_ALLOW_IN_MEMORY=false`
- `SINGLE_BRANCH_MODE=true`
- `AI_COACH_ENABLED=false`

### Operasyon

- Migration: `pnpm db:migrate` (deploy öncesi/sonrası).
- Seed: yalnızca ilk kurulum / staging; production’da dikkatli.
- Metronic: lisanslı asset’ler repoda yok; sunucuda `apps/web/public/assets/metronic/` manuel veya güvenli pipeline ile kopyalanır.
- Sağlık: `GET /api/health` (ileride DB durumu genişletilebilir).

### Yönetim paneli erişimi — path, subdomain DEĞİL

**Karar:** Yönetim paneli ana domain üzerinde **path** ile sunulur:
`https://uyanikkoc.com/yonetim`. Ayrı bir alt alan adı (`yonetim.uyanikkoc.com`)
**açılmaz** — ek DNS/sertifika/cookie izolasyonu gerektirmez, tek Next.js
süreci tüm rolleri (öğrenci/koç/veli + Super Admin/Kurum) aynı origin'de servis eder.

- `/yonetim/*` App Router route'udur; ek reverse-proxy kuralı gerekmez.
- `/admin` ve `/branch` legacy yolları `next.config.mjs` ile `/yonetim`'e redirect edilir.
- Super Admin (ORG_ADMIN) tüm yönetim ekranlarına erişir; Kurum yöneticisi
  (BRANCH_MANAGER) platform/franchise ekranlarından kısıtlanır (bkz. `lib/rbac.ts`).
- Auth cookie'leri aynı origin'de paylaşıldığından `AUTH_URL=https://uyanikkoc.com`
  yeterlidir; rol bazlı erişim middleware + `rbac.ts` ile yapılır.

### Neden self-host?

- Kalıcı upload/log yolları ve tek sunucu politikası
- CRM ile kaynak paylaşımı yok
- Demo-memory production yasağı ile uyumlu gerçek DB auth

---

## Vercel — Preview / demo / landing

**Karar:** Vercel yalnızca **önizleme, iç demo veya landing** içindir; production veritabanı veya upload hacmi bağlanmaz.

### Önerilen proje ayarları (Dashboard)

`apps/web/.env.production.example` içindeki notlarla uyumlu:

| Ayar | Değer |
|------|--------|
| Root Directory | `apps/web` |
| Include source outside root | **Enabled** (monorepo) |
| Framework | Next.js |
| Install Command (override) | `cd ../.. && pnpm install` |
| Build Command (override) | `cd ../.. && pnpm db:generate && pnpm --filter @uyanik/web build` |
| Output Directory | **Boş bırak** (Next.js varsayılanı) |

### Bilinen risk — 404

`Output Directory` = `apps/web/.next` gibi **statik çıktı** modu kullanılırsa site 404 verebilir. Next.js server uygulaması için output override **kullanılmamalı**.

`vercel.json` ile `rootDirectory` denemesi geçmişte anında hata üretmişti. Bu repoda yalnızca **`apps/web/vercel.json`** vardır ve **sadece** monorepo `installCommand`'ı (`cd ../.. && pnpm install`) içerir; `rootDirectory`, `buildCommand`, `framework`, `outputDirectory` **kullanılmaz** — bunlar Dashboard üzerinden ayarlanır.

### Vercel env (preview)

- `DEMO_AUTH_ALLOW_IN_MEMORY=true` kabul edilebilir (demo PR).
- Production secret’ları preview’a kopyalanmaz.
- `DATABASE_URL` preview’da opsiyonel; DB testi staging self-host’ta yapılır.

---

## CRM izolasyonu

| Konu | Uyanık Koç | CRM |
|------|------------|-----|
| Sunucu | Kendi VM / container | Ayrı host |
| Veritabanı | `DATABASE_URL` (bu repo Prisma) | `CRM_DATABASE_URL` — **kullanılmaz** |
| Upload | `KOC_UPLOAD_DIR` | CRM upload root |
| Log | `KOC_LOG_DIR` | CRM log root |
| Kod | `uyanik` monorepo | Bu repoya dosya eklenmez |

Entegrasyon (ileride): yalnızca `CrmLink` bridge ve readonly alanlar; bu fazda yok.

---

## CI ile ilişki

GitHub Actions (`.github/workflows/ci.yml`): install → `db:generate` → typecheck → lint → unit test. E2E ayrı/manuel.

Deploy pipeline (ileride): production self-host’ta CI artefact veya sunucuda build; Vercel yalnızca preview job.

---

## Karar özeti (tek cümle)

**Production = self-host + ayrı PG/upload/log; Vercel = preview/demo; CRM = hiçbir zaman bu app ile aynı DB/upload/log değil.**

---

## Sonraki adımlar (kod dışı)

1. Vercel Dashboard’da Root Directory ve Build Command doğrula; Output Directory temizle.
2. Production sunucuda `.env` + `pnpm db:migrate` + Metronic asset kopyası.
3. Domain DNS → production reverse proxy (nginx/caddy) → `next start -p 3010`.

Config değişikliği gerektiğinde ayrı PR ve `RISK_REPORT` ile ele alınır; bu belge tek başına config değiştirmez.
