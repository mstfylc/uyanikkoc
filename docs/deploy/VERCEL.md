# Vercel — Preview / Demo Kurulumu

Production canlı trafik **self-host** (`DEPLOYMENT_DECISION.md`). Vercel yalnızca **preview, demo ve PR önizleme** içindir.

## Güncel durum (2026-06-05)

| Kontrol | Durum |
|---------|--------|
| Production URL | `https://uyanikkoc.vercel.app` |
| `main` @ GitHub | `1831e36` (login fix + review follow-up merge'lü) |
| `/api/health` | `{ "status":"ok", "database":"memory", "authSecret":"ok" }` |
| Demo login | `student@uyanik.local` / `uyanik123` |

**PR merge gerekmez** — `2faf8e1` (auth fix) ve `91cd19b`…`1831e36` (review follow-up) zaten `main`'de; push sonrası Vercel Production otomatik deploy alır.

Env zaten **Production** kapsamında tanımlıysa (`authSecret: "ok"`) yeni `AUTH_SECRET` üretip değiştirmeyin; gereksiz oturum kırılması olur.

---

## 0. Sorun giderme (404 / login)

### Dashboard (404 alıyorsanız)

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

> **KRİTİK — env kapsamı (en sık login hatası sebebi):** `main`'e push edince Vercel **Production** deployment üretir. Yalnızca **Preview** kapsamına eklenen değişkenler Production'a **uygulanmaz**; `AUTH_SECRET` eksik kalır ve demo login "E-posta veya şifre hatalı" verip login sayfasında kalır. Bu yüzden aşağıdaki değişkenleri **Production** (ve Preview) kapsamında — en kolayı **All Environments** — ekleyin.

Vercel → Project → Settings → Environment Variables → **Production + Preview** (en kolayı: **All Environments**):

| Değişken | Değer |
|----------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` çıktısı |
| `NEXTAUTH_SECRET` | aynı değer |
| `AUTH_URL` | `https://uyanikkoc.vercel.app` (slash yok) |
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
| Demo login çalışmıyor (login sayfasında kalıyor) | Env değişkenleri **Production** kapsamında mı? Özellikle `AUTH_SECRET` + `DEMO_AUTH_ALLOW_IN_MEMORY=true`. Ekleyip **Redeploy** edin |
| 404 NOT_FOUND | Output Directory boş; Root Directory `apps/web`; Framework Next.js |
| 401 Unauthorized | Deployment Protection kapatın veya Vercel SSO ile giriş yapın |
| İkonlar eksik | `public/assets/metronic/vendors/keenicons/` lisanslı; repoda yok |
| Build fail | Root Directory `apps/web` + monorepo include açık mı kontrol edin |

## 5. Sağlık kontrolü

Deploy sonrası: `GET https://uyanikkoc.vercel.app/api/health`

Beklenen (demo modu):

```json
{ "status": "ok", "database": "memory", "authSecret": "ok" }
```

`authSecret: "missing"` → `AUTH_SECRET` Production kapsamında yok; aşağıdaki env tablosunu **All Environments** ile ekleyip redeploy edin.

Doğrulama (PowerShell):

```powershell
Invoke-WebRequest -Uri "https://uyanikkoc.vercel.app/api/health" -UseBasicParsing
```

200 dönmeli. 404 ise Dashboard ayarları (Root Directory / Output Directory) hâlâ yanlış demektir.
