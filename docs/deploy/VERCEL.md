# Vercel — Preview / Demo Kurulumu

Production canlı trafik **self-host** (`DEPLOYMENT_DECISION.md`). Vercel yalnızca **preview, demo ve PR önizleme** içindir.

## 0. Acil — 404 NOT_FOUND teşhisi (2026-06-05)

Vercel CLI ile doğrulanan **mevcut yanlış ayarlar**:

| Ayar | Şu an (yanlış) | Olması gereken |
|------|----------------|----------------|
| Root Directory | `.` (repo kökü) | `apps/web` |
| Framework | **Other** | **Next.js** |
| Output Directory | `apps/web/.next` | **boş** |
| Build Command | `pnpm --filter @uyanik/web build` | **boş** (package.json `build` script kullanılır) |

`Output Directory = apps/web/.next` → Vercel `.next` klasörünü statik site sanır, Next.js server route'ları deploy edilmez → **tüm URL'ler 404 NOT_FOUND**.

Build log'u başarılı görünse bile `inspect` çıktısında `Builds: . [0ms]` satırı varsa serverless route yok demektir.

**Ek:** Deployment Protection (SSO) açık → `uyanikkoc-uyanik.vercel.app` **401** döner (giriş gerekir). Demo için kapatın veya Vercel hesabıyla giriş yapın.

**Doğru demo URL (ayarlar düzeldikten sonra):** `https://uyanikkoc-uyanik.vercel.app/login`

`https://uyanikkoc.vercel.app` kısa alias bazen 404 verebilir; team URL'sini kullanın.

### Dashboard düzeltme (2 dk)

1. [vercel.com](https://vercel.com) → **uyanikkoc** → **Settings** → **General**
2. **Root Directory** → `apps/web` → Save
3. **Include source files outside of the Root Directory** → **Enabled**
4. **Framework Preset** → **Next.js**
5. **Build Command** → override'ı **sil / boş bırak**
6. **Output Directory** → override'ı **sil / boş bırak** (kritik)
7. **Install Command** → boş bırakın (`apps/web/vercel.json` halleder)
8. **Deployments** → son commit → **Redeploy**

### Deployment Protection (demo için)

**Settings** → **Deployment Protection** → **Standard Protection / Vercel Authentication** → Preview/Production için **Off** (veya yalnızca Production'da açık bırakın).

---

## 1. GitHub bağlantısı

1. [vercel.com/new](https://vercel.com/new) → Import `mstfylc/uyanikkoc`
2. **Root Directory:** `apps/web`
3. **Include source files outside of the Root Directory:** Enabled (monorepo)
4. **Framework:** Next.js (otomatik)
5. **Build Command:** boş ( `apps/web/package.json` → `pnpm --filter @uyanik/database generate && next build` )
6. **Install Command:** boş (`vercel.json` → `cd ../.. && pnpm install`)
7. **Output Directory:** **boş**

`apps/web/vercel.json` yalnızca monorepo `installCommand` içerir. **`buildCommand`, `framework`, `outputDirectory` ve repo kökünde `rootDirectory` kullanmayın** — Dashboard ile çakışır.

## 2. Ortam değişkenleri (Preview / Demo)

Vercel → Project → Settings → Environment Variables → **Preview** (ve isteğe bağlı Development):

| Değişken | Değer |
|----------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` çıktısı |
| `NEXTAUTH_SECRET` | aynı değer |
| `AUTH_URL` | `https://uyanikkoc-uyanik.vercel.app` (slash yok) |
| `NEXTAUTH_URL` | aynı URL |
| `DEMO_AUTH_ALLOW_IN_MEMORY` | `true` |
| `SINGLE_BRANCH_MODE` | `true` |
| `AI_COACH_ENABLED` | `false` |

Preview'da `DATABASE_URL` **gerekmez** — demo kullanıcılar bellek modunda çalışır (`coach@uyanik.local` / `uyanik123`).

Production ortamına Vercel'de gerçek DB bağlamak proje kararına aykırıdır; canlı için self-host kullanın.

## 3. Deploy

- Git push → otomatik Preview deploy
- veya CLI: `cd apps/web && npx vercel` (ilk seferde login)

## 4. Bilinen konular

| Konu | Çözüm |
|------|--------|
| 404 NOT_FOUND | Output Directory boş; Root Directory `apps/web`; Framework Next.js |
| 401 Unauthorized | Deployment Protection kapatın veya Vercel SSO ile giriş yapın |
| İkonlar eksik | `public/assets/metronic/vendors/keenicons/` lisanslı; repoda yok |
| Build fail | Root Directory `apps/web` + monorepo include açık mı kontrol edin |

## 5. Sağlık kontrolü

Deploy sonrası: `GET https://uyanikkoc-uyanik.vercel.app/api/health` → `{ "status": "ok", "database": "memory" }` (preview demo modu).

Doğrulama komutu (PowerShell):

```powershell
Invoke-WebRequest -Uri "https://uyanikkoc-uyanik.vercel.app/api/health" -UseBasicParsing
```

200 dönmeli; 404 ise Dashboard ayarları hâlâ yanlış demektir.
