# AGENTS — Uyanık Koç

Codex / Cursor agent'ları bu repoda çalışırken aşağıdaki kurallara uyar.

## Kimlik

- Uygulama adı: **Uyanık Koç** (kullanıcıya görünen her yerde)
- Ana marka: Uyanık Kütüphane

## Değişmez kararlar

| Konu | Karar |
|------|-------|
| CRM | Ayrı sunucu, ayrı DB — CRM dosyalarına, env'ine, upload/log alanlarına **dokunma** |
| AI Koç | `AI_COACH_ENABLED=false` — OpenAI/canlı AI entegrasyonu yazma; yalnızca **Yakında** yüzeyi |
| Production memory | Demo-memory store production'da **yasak**; `DEMO_AUTH_ALLOW_IN_MEMORY=false` zorunlu |
| Ekran şişmesi | Yeni ekran/CRUD ekleme; önce mevcut koç→öğrenci→veli dikey akışı güçlendir |
| Auth | NextAuth/Auth.js — alternatif JWT sistemi ekleme |
| DB | Prisma + PostgreSQL; sorgu doğrudan component'e yazılmaz |
| Mobil | `apps/mobile` Expo ogrenci uygulamasi — tasarim: `.design-import/mobile/` |
| Metronic | v9 Tailwind Demo1; lisanslı asset'leri repoya commit etme |

## Çalışma biçimi

- Faz planı: `docs/cursor/CURSOR_PROMPT_LIST.md` — yalnızca istenen prompt uygulanır
- Faz başına max 8–10 dosya değişikliği; aşılırsa `RISK REPORT` ver ve dur
- Mock/memory veri yalnızca `apps/web/mocks/` veya `apps/web/fixtures/` altında
- Test/typecheck geçmeden commit atma
- Generated dosyalar commit etme: `.next`, `.turbo`, `node_modules`, `*.tsbuildinfo`

## Test komutları

```bash
pnpm typecheck
pnpm test:unit
pnpm --filter @uyanik/web test:e2e
```

## Demo (geliştirme)

- `DEMO_AUTH_ALLOW_IN_MEMORY=true` + `DATABASE_URL` yok → bellek modu (dev only)
- Demo şifre: `uyanik123`
