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
| Mobil | `apps/mobile` Expo ogrenci uygulamasi — tasarim: `.design-import/mobile/`; native token API web'de (`/api/auth/*`, `/api/mobile/*`) |
| Metronic | v9 Tailwind Demo1; lisanslı asset'leri repoya commit etme |

## Çalışma biçimi

- Faz planı: `docs/cursor/CURSOR_PROMPT_LIST.md` — yalnızca istenen prompt uygulanır
- Faz başına max 8–10 dosya değişikliği; aşılırsa `RISK REPORT` ver ve dur
- Mock/memory veri yalnızca `apps/web/mocks/` veya `apps/web/fixtures/` altında
- Test/typecheck geçmeden commit atma
- Generated dosyalar commit etme: `.next`, `.turbo`, `node_modules`, `*.tsbuildinfo`

## Mobil çalışma kuralları (`apps/mobile`)

Öğrenci mobil uygulaması. Tasarım kaynağı: prototip "Uyanık Koç — Mobil Uygulama"
(Giriş, Ana Sayfa, Ödevler, Denemeler, Program, Profil).

- **Teknoloji:** Expo + React Native + **TypeScript** (`expo-router`). Tek kod tabanı (iOS/Android).
- **Ortak mantık:** `packages/shared` (net/streak/telefon/otp/token), `packages/contracts` (Zod)
  ve `packages/tokens` `workspace:*` ile yeniden kullanılır — kopyalama yok.
- **Mimari:** ekran → hook/data → API client (Bearer + 401→refresh). Sorgu/iş mantığı
  component'e gömülmez.
- **Mock/fixture yeri:** yalnızca `apps/mobile/src/mocks/` veya test doubles. `lib/memory|fake|demo` yasak
  (web kuralıyla simetrik).
- **Oturum:** native token oturumu (`withMobileAuth`, access+refresh) web NextAuth cookie
  oturumuna **paralel**dir — NextAuth'a dokunma.
- **Sınırlar web ile aynı:** AI Koç kapalı, CRM izolasyonu, tek şube modu, marka her yerde "Uyanık Koç".
- **Native klasörler:** `ios/` ve `android/` `.gitignore`'da; `expo prebuild` ile üretilir.
- Test/typecheck/lint geçmeden commit yok.

## Test komutları

```bash
pnpm typecheck
pnpm test:unit
pnpm --filter @uyanik/web test:e2e
pnpm --filter @uyanik/mobile typecheck    # mobil
```

## Demo (geliştirme)

- `DEMO_AUTH_ALLOW_IN_MEMORY=true` + `DATABASE_URL` yok → bellek modu (dev only)
- Demo şifre: `uyanik123`
