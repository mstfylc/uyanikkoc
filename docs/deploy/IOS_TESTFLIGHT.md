# iOS — TestFlight & App Store (EAS Build)

`apps/mobile` (Expo SDK 52) için iOS yayın akışı. Build, Expo'nun bulut macOS
altyapısında (**EAS Build**) yapılır; kendi Mac'inize gerek yok. CI workflow:
`.github/workflows/ios-eas.yml`.

## Ön koşullar

- ✅ **Apple Developer Program** üyeliği (aktif)
- **Expo hesabı** (ücretsiz) — https://expo.dev
- Bundle identifier: `com.uyanik.mobile` (app.json'da ayarlı)

## Tek seferlik kurulum

> Bu adımlar yerel makinede bir kez yapılır; bazıları interaktif Apple girişi ister.

1. **EAS CLI + giriş**
   ```bash
   npm i -g eas-cli
   eas login
   ```

2. **Projeyi EAS'e bağla** — `extra.eas.projectId` + `owner` üretir, **commit'le**:
   ```bash
   cd apps/mobile
   eas init
   git add app.json && git commit -m "chore(mobile): link EAS project"
   ```

3. **App Store Connect'te uygulama kaydı** (https://appstoreconnect.apple.com → Apps → +):
   - Platform iOS, bundle id `com.uyanik.mobile`, bir uygulama adı seç.
   - Oluşunca **App ID (ascAppId)** numarasını not al.
   - **Team ID**: https://developer.apple.com/account → Membership → Team ID.

4. **`eas.json` submit alanını doldur** (`apps/mobile/eas.json`):
   ```json
   "submit": { "production": { "ios": {
     "appleId": "apple-id@eposta.com",
     "ascAppId": "1234567890",
     "appleTeamId": "ABCDE12345"
   }}}
   ```
   Commit'le.

5. **iOS imzalama kimlikleri** (Distribution Certificate + Provisioning Profile) — ilk
   build'i bir kez interaktif çalıştır; EAS otomatik üretip saklar:
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```
   Apple girişini yapıp EAS'in kimlikleri üretmesine izin ver. Bundan sonra CI
   `--non-interactive` ile sorunsuz çalışır.

## GitHub secret'ları

`Settings → Secrets and variables → Actions`:

| Secret | Nereden |
|--------|---------|
| `EXPO_TOKEN` | https://expo.dev/accounts/[hesap]/settings/access-tokens |
| `EXPO_APPLE_APP_SPECIFIC_PASSWORD` | https://appleid.apple.com → Oturum aç & Güvenlik → Uygulamaya özel şifre (yalnızca TestFlight submit için) |

## Build + TestFlight (CI ile)

GitHub → **Actions → iOS (EAS Build) → Run workflow**:
- `profile`: `production`
- `submit`: `true`  → build biter bitmez TestFlight'a gönderir.

Submit'ten sonra App Store Connect → TestFlight'ta build "Processing" (~5–15 dk) →
ardından **Internal Testing**'e test kullanıcısı ekleyip davet gönderebilirsin.

> Sadece build (submit'siz) istiyorsan `submit: false` bırak; .ipa linki EAS
> panelinde (expo.dev) ve workflow logunda görünür.

## Yerel alternatif (CI olmadan)

```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest
```

## Build profilleri (`eas.json`)

| Profil | Dağıtım | Kullanım |
|--------|---------|----------|
| `development` | internal + dev client | Geliştirme (Expo Dev Client) |
| `preview` | internal (ad-hoc) | Kayıtlı cihazlara doğrudan `.ipa` (TestFlight'sız hızlı test) |
| `production` | store | TestFlight + App Store; `autoIncrement` build numarası |

---

## App Store (public yayın) — Faz 2 checklist

TestFlight çalıştıktan sonra public yayın için kapatılması gerekenler:

- [ ] **Gizlilik politikası URL'si** (hesap/login olan uygulamada zorunlu)
- [ ] **Uygulama içi hesap silme** akışı (App Store kuralı 5.1.1(v))
- [ ] **App Privacy** beyanı (veri toplama "nutrition label")
- [ ] Ekran görüntüleri (6.7" + 6.5"), açıklama, anahtar kelimeler, destek URL'si
- [ ] **DB-backed production backend** — şu an `uyanikkoc.vercel.app` demo/bellek
      modunda; reviewer için kalıcı veri gerekir
- [ ] Reviewer demo hesabı notu (`student@uyanik.local` / `uyanik123`)
- [ ] Uygulama olgunluğu: en azından dürüst bir öğrenci akışı (minimum işlevsellik, 4.2)
