# Android APK / AAB Üretimi — Uyanık Koç Mobil

> Bu repo'da APK **derlenmiş halde tutulmaz**; aşağıdaki tek komutla üretilir.
> Sandbox'ta Android SDK olmadığı için CI/sandbox APK üretemez — aşağıdaki
> adımlar senin makinende veya EAS bulutunda çalışır.

## Yol A — EAS Build (önerilen, makinende Android SDK gerekmez)
Ön koşul: ücretsiz Expo hesabı.

```bash
cd apps/mobile
npm i -g eas-cli            # veya: npx eas-cli@latest
eas login                  # Expo hesabınla giriş
eas build -p android --profile preview
```
- `preview` profili **kurulabilir .apk** üretir (eas.json'da `buildType: "apk"`).
- Build bulutta koşar; bitince indirme linki + QR verir, telefona doğrudan kurulur.
- Play Store için: `eas build -p android --profile production` → **.aab** üretir.

## Yol B — Yerel build (makinende Android SDK + JDK 17+ varsa)
```bash
cd apps/mobile
pnpm install
npx expo prebuild -p android         # native android/ projesini üretir
cd android
./gradlew assembleRelease            # APK: android/app/build/outputs/apk/release/
```

## Yapılandırma (hazır)
- `app.json`: paket `com.uyanik.mobile`, sürüm `1.0.0`, ikon/splash (#534AB7) ✓
- `eas.json`: `preview`→APK, `production`→AAB ✓
- Backend: `app.json > extra.apiUrl = https://uyanikkoc.vercel.app`
  (APK bu adrese bağlanır — backend'in canlı olduğundan emin ol).

## İmzalama
- EAS ilk build'de imzalama anahtarını otomatik üretir/yönetir (sorar).
- Yerel build için kendi keystore'unu `android/app` altında tanımlamalısın.
