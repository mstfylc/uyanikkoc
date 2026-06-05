# Vercel — Preview / Demo Kurulumu

Production canlı trafik **self-host** (`DEPLOYMENT_DECISION.md`). Vercel yalnızca **preview, demo ve PR önizleme** içindir.

## 1. GitHub bağlantısı

1. [vercel.com/new](https://vercel.com/new) → Import `mstfylc/uyanikkoc`
2. **Root Directory:** `apps/web`
3. **Include source files outside of the Root Directory:** Enabled (monorepo)
4. **Framework:** Next.js (otomatik)
5. **Output Directory:** boş bırakın (`.next` override etmeyin — 404 riski)

`apps/web/vercel.json` install/build komutlarını monorepo köküne yönlendirir; Dashboard’da ayrıca override gerekmez.

## 2. Ortam değişkenleri (Preview / Demo)

Vercel → Project → Settings → Environment Variables → **Preview** (ve isteğe bağlı Development):

| Değişken | Değer |
|----------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` çıktısı |
| `NEXTAUTH_SECRET` | aynı değer |
| `AUTH_URL` | `https://<proje-adiniz>.vercel.app` (slash yok) |
| `NEXTAUTH_URL` | aynı URL |
| `DEMO_AUTH_ALLOW_IN_MEMORY` | `true` |
| `SINGLE_BRANCH_MODE` | `true` |
| `AI_COACH_ENABLED` | `false` |

Preview’da `DATABASE_URL` **gerekmez** — demo kullanıcılar bellek modunda çalışır (`coach@uyanik.local` / `uyanik123`).

Production ortamına Vercel’de gerçek DB bağlamak proje kararına aykırıdır; canlı için self-host kullanın.

## 3. Deploy

- Git push → otomatik Preview deploy
- veya CLI: `cd apps/web && npx vercel` (ilk seferde login)

## 4. Bilinen konular

| Konu | Çözüm |
|------|--------|
| 404 | Output Directory boş olmalı |
| İkonlar eksik | `public/assets/metronic/vendors/keenicons/` lisanslı; repoda yok — lokal kopyalayıp commit veya Vercel’e manuel yükle |
| Build fail | Logs’da `pnpm db:generate` hatası → Root Directory `apps/web` ve monorepo include açık mı kontrol edin |

## 5. Sağlık kontrolü

Deploy sonrası: `GET https://<url>/api/health` → `{ "status": "ok", "database": "memory" }` (preview demo modu).
