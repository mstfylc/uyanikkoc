# Uyanik Koc — Odeme ve Abonelik modulu

Kaynak: `uyanikkoc (2).zip` handoff paketi.

## Mimari

`route.ts (withApiAuth)` → `server/services/billing.service.ts` → `repositories/billing.ts` veya `mocks/billing.ts`

Demo ortaminda `shouldUseDatabase()` false oldugunda in-memory mock store kullanilir.

## API rotalari

| Route | Method | Rol | Aciklama |
|-------|--------|-----|----------|
| `/api/billing/plans` | GET | student, parent, coach | Paket listesi |
| `/api/billing/subscription` | GET | student, parent | Aktif abonelik + plan |
| `/api/billing/subscription` | POST | student, parent | Abone ol / yenile |
| `/api/billing/subscription` | PATCH | student, parent | autoRenew / cancel / resume |
| `/api/billing/invoices` | GET | student, parent | Makbuz gecmisi |
| `/api/billing/payment-methods` | GET/POST/PATCH/DELETE | student, parent | Kart yonetimi |

## DB migration

```bash
pnpm --filter @uyanik/database prisma generate
pnpm --filter @uyanik/database prisma migrate deploy
pnpm --filter @uyanik/database prisma db seed
```

## Sonraki adim

UI ekranlari: `/student/billing`, `/parent/billing`, Ayarlar > Odeme & Planlar sekmesi.
