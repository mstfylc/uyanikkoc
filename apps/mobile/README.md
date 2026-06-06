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
**Dilim 0 (bu commit):** İskele + tasarım sistemi + 6 ekran mock veriyle statik
çalışıyor. Giriş şimdilik simülasyon.

**Sıradaki:** Login dilimi — `apiClient` (Bearer + 401→refresh) + Capacitor
Preferences token saklama + gerçek `/api/auth/otp/*` uçları (handoff M1+M2).

## Native (sonra)
```bash
pnpm --filter @uyanik/mobile build
pnpm --filter @uyanik/mobile cap:add:ios      # ios/ üretir (gitignore'da)
pnpm --filter @uyanik/mobile cap:sync
```
