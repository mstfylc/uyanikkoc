# @uyanik/mobile — Uyanık Koç Öğrenci Mobil Uygulaması

Capacitor + React + Vite + TypeScript. Web Metronic'inden bağımsız `uk-m` tasarım
sistemini (light + dark) kullanır. Geliştirme kuralları: kökteki `AGENTS.md` →
"Mobil çalışma kuralları".

## Ekranlar (prototip paritesi)
Giriş (telefon OTP / e-posta) · Ana Sayfa · Ödevler (Sonuç Gir sheet) ·
Denemeler (trend + detay) · Program · Profil.

## Komutlar
```bash
pnpm --filter @uyanik/mobile dev         # Vite dev server (http://localhost:3020)
pnpm --filter @uyanik/mobile build       # web derlemesi → dist/
pnpm --filter @uyanik/mobile typecheck
pnpm --filter @uyanik/mobile lint
```

## Veri modu
Varsayılan **mock açık** — uygulama backend olmadan tek başına çalışır (iç-süreç
`src/mocks/mockApi`). Gerçek backend'e (apps/web) bağlanmak için:
```bash
# apps/web ayakta (pnpm --filter @uyanik/web dev, :3010)
VITE_USE_MOCK=false VITE_API_BASE=http://localhost:3010 pnpm --filter @uyanik/mobile dev
```
OTP kodu bellek modunda gerçek SMS yerine **web sunucu loglarına** yazılır.

## Yapı
```
src/
  App.tsx            uygulama kabuğu (auth kapısı + tab navigasyon)
  main.tsx           giriş noktası
  styles/uk-m.css    tasarım sistemi (prototipten birebir)
  styles/base.css    tam ekran kabuk
  ui/                MIcon, UKMark, TabBar, icons
  screens/           Login, Home, Odev*, Denemeler, Program, Profil
  mocks/             öğrenci mock verisi (YALNIZCA burada)
  lib/               net hesabı vb. (Login diliminde apiClient/tokens eklenecek)
```

## Durum
- **Dilim 0 ✅** İskele + `uk-m` tasarım sistemi + 6 ekran (mock veri).
- **Dilim 1 ✅** Veri katmanı: `apiClient` (Bearer + 401→refresh), `tokens`
  (Capacitor Preferences), `session` context. Login gerçek OTP/e-posta akışına bağlı.
- **Dilim 2 ✅** `/api/me` bootstrap → Ana Sayfa + Profil canlı `me` verisini kullanır.
- **Backend ✅** apps/web'de M1–M5 token uçları (bellek modu) — uçtan uca doğrulandı.
- **Push (M3) kısmi** `lib/push.ts` + `/api/devices` hazır; native plugin
  (`@capacitor/push-notifications`) native build aşamasında eklenecek.

### Kalan işler (follow-up)
- Domain ekranları (Ödevler/Denemeler/Program) hâlâ tipli mock veri kullanıyor;
  `apiClient` üzerinden gerçek student uçlarına bağlanacak.
- Backend DB kalıcılığı: `OtpChallenge`/`RefreshToken`/`DeviceToken` prisma
  modelleri + repository (şu an `shouldUseDatabase()` iken 501).
- Native build: `cap add ios/android`, APNs/FCM, deep-link.

## Native (sonra)
```bash
pnpm --filter @uyanik/mobile build
pnpm --filter @uyanik/mobile cap:add:ios      # ios/ üretir (gitignore'da)
pnpm --filter @uyanik/mobile cap:sync
```
