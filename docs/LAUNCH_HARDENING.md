# Launch Hardening Checklist

Production öncesi tamamlanması gereken maddeler. Bu belge yalnızca kontrol listesidir; implementasyon ayrı PR/fazlarda yapılır.

## Veritabanı ve ortam

- Memory → PostgreSQL geçişi
  - `DEMO_AUTH_ALLOW_IN_MEMORY=false`
  - `DATABASE_URL` (gerçek PostgreSQL bağlantısı)
  - Migration ve seed stratejisi (production'da dikkatli seed)
  - Upload/log yolları: `KOC_UPLOAD_DIR`, `KOC_LOG_DIR`

## Admin ve yönetim

- Admin servisleri DB'ye taşı veya production'da kapat
  - Bellek/mock tabanlı admin snapshot/mutate endpoint'leri
  - Super Admin / Kurum ekranlarının gerçek veri kaynağı doğrulaması

## API güvenliği

- Middleware: her `/api/*` route'unun `withApiAuth` (veya eşdeğer guard) kullandığını denetle
  - Public istisnalar: `/api/health`, `/api/auth/*`, mobil auth giriş uçları
  - Rol bazlı erişim (`lib/rbac.ts`) ile uyum

## Bağımlılıklar

- next-auth beta → stable sürüm
- Dependency audit (öncelik: next-auth; vitest/tar dev-only, düşük)

## HTTP güvenlik başlıkları

- CSP header'ı ekle ve Metronic ile tune et
  - Mevcut: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
  - Metronic asset/script kaynakları CSP'de whitelist edilmeli

## Mobil

- Mobil auth: tek token modeline indir (mobil fazında)
  - Bearer access+refresh ile web NextAuth cookie paralelliği netleştir
  - Eski/paralel auth yollarını kaldır

## Referans

- Deployment kararı: `docs/deploy/DEPLOYMENT_DECISION.md`
- Production env örneği: `apps/web/.env.production.example`
- Değişmez kurallar: `AGENTS.md`
