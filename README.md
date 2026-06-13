# Uyanık Koç

Uyanık Kütüphane ekosisteminin koç–öğrenci–veli web uygulaması. pnpm monorepo; ana uygulama `apps/web` (Next.js 15 + NextAuth + Prisma).

## Gereksinimler

- Node.js 20+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Kurulum

```bash
pnpm install
cp .env.example .env.local
pnpm db:generate
pnpm dev:web
```

Uygulama: http://localhost:3010

## Demo kullanıcılar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Koç | coach@uyanik.local | uyanik123 |
| Öğrenci | student@uyanik.local | uyanik123 |
| Veli | parent@uyanik.local | uyanik123 |
| Şube | branch@uyanik.local | uyanik123 |
| Admin | admin@uyanik.local | uyanik123 |

## Komutlar

```bash
pnpm typecheck      # Tüm paketler
pnpm test:unit      # Unit testler
pnpm test:e2e       # Playwright (apps/web)
pnpm db:migrate     # Prisma migrate
pnpm db:seed        # Demo veri
```

## Monorepo yapısı

```
apps/web       → Next.js App Router (ana geliştirme)
apps/mobile    → Placeholder
apps/worker    → Placeholder
packages/*     → shared, database, contracts, tokens, ui-web, config
```

## Önemli notlar

- CRM ayrı sunucu/DB — bu repoda CRM kodu yok.
- Metronic asset'leri lisanslı; `apps/web/public/assets/metronic/` gitignore'da, lokal kopyalanır.
- Production'da `DEMO_AUTH_ALLOW_IN_MEMORY=false` zorunlu (bkz. `AGENTS.md`).
- Production runtime `DATABASE_URL` pooled endpoint olmalıdır (Neon host `-pooler` içerir); Prisma migrate/backup için direct/unpooled URL kullanılır.
- Staging kapasite kontrolleri için opsiyonel k6 scriptleri `scripts/load/` altındadır.
- Cursor faz planı: `docs/cursor/CURSOR_PROMPT_LIST.md`
